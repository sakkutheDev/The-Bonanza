const express = require('express');
const mysql = require('mysql');
const path = require('path');
const dotenv = require('dotenv');
const multer = require('multer');
const fs = require('fs'); 

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;

app.use(express.json()); // To parse JSON bodies

// Database connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'thebonanza'
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process with a failure code
  }
  console.log('Connected to the database.');
});

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the specific Login_Page.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Login_Page.html'));
});

// Fetch categories
app.get('/categories', (req, res) => {
  queryDatabase('SELECT * FROM category')
    .then(results => res.json(results))
    .catch(err => {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Error fetching categories' });
    });
});

// Endpoint to add a new category
app.post('/add-category', (req, res) => {
  const { cat_name } = req.body;

  if (!cat_name) {
    return res.status(400).json({ message: 'Category name is required' });
  }

  const query = 'INSERT INTO category (cat_name) VALUES (?)';
  connection.query(query, [cat_name], (err, result) => {
    if (err) {
      console.error('Error inserting category:', err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
    res.status(200).json({ message: 'Category added successfully' });
  });
});

// Fetch menu items
app.get('/menu_items', (req, res) => {
  queryDatabase('SELECT * FROM menu_item')
    .then(results => res.json(results))
    .catch(err => {
      console.error('Error fetching menu items:', err);
      res.status(500).json({ error: 'Error fetching menu items' });
    });
});

// Fetch today's orders
app.get('/today_orders', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const sql = `
    SELECT ib.*, ii.menu_item_id, ii.quantity, mi.item_name
    FROM invoice_bill ib
    LEFT JOIN invoice_item ii ON ib.id = ii.invoice_id
    LEFT JOIN menu_item mi ON ii.menu_item_id = mi.id
    WHERE DATE(ib.date_time) = ?
  `;

  connection.query(sql, [today], (err, results) => {
    if (err) {
      console.error('Error fetching today\'s orders:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    const orders = formatOrders(results);
    res.json({ success: true, orders });
  });
});

// Fetch yesterday's orders
app.get('/yesterday_orders', (req, res) => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const sql = `
    SELECT ib.*, ii.menu_item_id, ii.quantity, mi.item_name
    FROM invoice_bill ib
    LEFT JOIN invoice_item ii ON ib.id = ii.invoice_id
    LEFT JOIN menu_item mi ON ii.menu_item_id = mi.id
    WHERE DATE(ib.date_time) = ?
  `;

  connection.query(sql, [yesterday], (err, results) => {
    if (err) {
      console.error('Error fetching yesterday\'s orders:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    const orders = formatOrders(results);
    res.json({ success: true, orders });
  });
});

// Function to format orders
function formatOrders(results) {
  const orders = {};
  results.forEach(row => {
    if (!orders[row.id]) {
      orders[row.id] = {
        id: row.id,
        date_time: row.date_time,
        bill_no: row.bill_no,
        payment_type_id: row.payment_type_id,
        discount: row.discount,
        total_amount: row.total_amount,
        order_type_id: row.order_type_id,
        items: []
      };
    }
    if (row.menu_item_id) {
      orders[row.id].items.push({
        menu_item_id: row.menu_item_id,
        name: row.item_name,
        quantity: row.quantity
      });
    }
  });
  return Object.values(orders);
}

// Function to query the database with promises
function queryDatabase(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
}

// Fetch today's canceled orders
app.get('/today_canceled_orders', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const sql = 'SELECT * FROM cancelled_order WHERE DATE(created_at) = ? AND order_cancelled = 1';

  connection.query(sql, [today], (err, results) => {
    if (err) {
      console.error('Error fetching today\'s canceled orders:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, cancelledOrders: results });
  });
});

// Fetch yesterday's canceled orders
app.get('/yesterday_canceled_orders', (req, res) => {
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const sql = 'SELECT * FROM cancelled_order WHERE DATE(created_at) = ? AND order_cancelled = 1';

  connection.query(sql, [yesterday], (err, results) => {
    if (err) {
      console.error('Error fetching yesterday\'s canceled orders:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }
    res.json({ success: true, cancelledOrders: results });
  });
});

// Delete order by ID and update canceled_order table
app.delete('/delete_order/:id', (req, res) => {
  const orderId = req.params.id;

  // Get the total amount of the order to be canceled
  const getOrderQuery = 'SELECT total_amount FROM invoice_bill WHERE id = ?';
  connection.query(getOrderQuery, [orderId], (err, orderResults) => {
    if (err) {
      console.error('Error fetching order details:', err);
      return res.status(500).json({ success: false, error: 'Error fetching order details' });
    }

    if (orderResults.length === 0) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const totalAmount = orderResults[0].total_amount;

    // First, delete related invoice_item entries
    const deleteInvoiceItemsQuery = 'DELETE FROM invoice_item WHERE invoice_id = ?';
    connection.query(deleteInvoiceItemsQuery, [orderId], (err, results) => {
      if (err) {
        console.error('Error deleting invoice items:', err);
        return res.status(500).json({ success: false, error: 'Error deleting invoice items' });
      }

      // Once invoice items are deleted, delete the invoice_bill entry
      const deleteInvoiceBillQuery = 'DELETE FROM invoice_bill WHERE id = ?';
      connection.query(deleteInvoiceBillQuery, [orderId], (err, results) => {
        if (err) {
          console.error('Error deleting invoice bill:', err);
          return res.status(500).json({ success: false, error: 'Error deleting invoice bill' });
        }

        // Update the canceled_order table
        const updateCanceledOrderQuery = `
          INSERT INTO cancelled_order (order_cancelled, total_count, total_amount)
          VALUES (TRUE, 1, ?)
          ON DUPLICATE KEY UPDATE total_count = total_count + 1, total_amount = total_amount + VALUES(total_amount)
        `;
        connection.query(updateCanceledOrderQuery, [totalAmount], (err, results) => {
          if (err) {
            console.error('Error updating canceled order:', err);
            return res.status(500).json({ success: false, error: 'Error updating canceled order' });
          }

          res.json({ success: true, message: `Order with ID ${orderId} canceled successfully` });
        });
      });
    });
  });
});

// Route to fetch category ID
app.post('/get-category-id', (req, res) => {
  const categoryName = req.body.categoryName;

  if (!categoryName) {
    return res.status(400).json({ success: false, message: 'Category name is required.' });
  }

  const sql = 'SELECT cat_id FROM category WHERE cat_name = ?';
  connection.query(sql, [categoryName], (err, results) => {
    if (err) {
      console.error('Error fetching category ID:', err);
      return res.status(500).json({ success: false, message: 'Error fetching category ID.' });
    }

    if (results.length > 0) {
      const categoryId = results[0].cat_id;
      res.status(200).json({ success: true, categoryId });
    } else {
      res.status(404).json({ success: false, message: 'Category not found.' });
    }
  });
});


// Route to save menu item
app.post('/add-menu-item', upload.single('itemImage'), (req, res) => {
  const categoryId = req.body.categoryId;
  const itemName = req.body.itemName;
  const itemPrice = req.body.itemPrice;
  const itemImage = req.file;

  if (!categoryId || !itemName || !itemPrice || !itemImage) {
    return res.status(400).json({ success: false, message: 'Category ID, item name, price, and image are required.' });
  }

  const imagePath = path.join('uploads', itemImage.filename);

  const newItem = {
    cat_id: categoryId,
    item_name: itemName,
    item_price: itemPrice,
    item_img: imagePath // Save the file path in the database
  };

  const sql = 'INSERT INTO menu_item (cat_id, item_name, item_price, item_img) VALUES (?, ?, ?, ?)';
  const values = [newItem.cat_id, newItem.item_name, newItem.item_price, newItem.item_img];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error saving menu item:', err);
      return res.status(500).json({ success: false, message: 'Error saving menu item.' });
    }
    res.status(200).json({ success: true, message: 'Menu item saved successfully.' });
  });
});

// Save invoice (unchanged from your original code)
app.post('/save_invoice', (req, res) => {
  const invoiceData = req.body;
  const { date_time, bill_no, payment_type_id, discount, total_amount, order_type_id, items } = invoiceData;

  connection.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ success: false, error: 'Error starting transaction' });
    }

    const insertInvoiceBillQuery = 'INSERT INTO invoice_bill (date_time, bill_no, payment_type_id, discount, total_amount, order_type_id) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(insertInvoiceBillQuery, [date_time, bill_no, payment_type_id, discount, total_amount, order_type_id], (err, results) => {
      if (err) {
        return connection.rollback(() => {
          console.error('Error inserting invoice bill:', err);
          res.status(500).json({ success: false, error: 'Error inserting invoice bill' });
        });
      }

      const invoiceId = results.insertId;

      const insertInvoiceItemQuery = 'INSERT INTO invoice_item (invoice_id, menu_item_id, quantity) VALUES ?';
      const invoiceItemsData = items.map(item => [invoiceId, item.menu_item_id, item.quantity]);

      connection.query(insertInvoiceItemQuery, [invoiceItemsData], (err, results) => {
        if (err) {
          return connection.rollback(() => {
            console.error('Error inserting invoice items:', err);
            res.status(500).json({ success: false, error: 'Error inserting invoice items' });
          });
        }

        connection.commit(err => {
          if (err) {
            return connection.rollback(() => {
              console.error('Error committing transaction:', err);
              res.status(500).json({ success: false, error: 'Error committing transaction' });
            });
          }

          res.json({ success: true, message: 'Invoice saved successfully' });
        });
      });
    });
  });
});


app.get('/menu_items_with_category', (req, res) => {
  const sql = `
      SELECT mi.*, c.cat_name 
      FROM menu_item mi 
      JOIN category c ON mi.cat_id = c.cat_id
  `;
  connection.query(sql, (err, results) => {
      if (err) {
          console.error('Error fetching menu items with categories:', err);
          return res.status(500).json({ error: 'Error fetching menu items with categories' });
      }
      res.json(results);
  });
});

app.patch('/update_menu_status/:id', (req, res) => {
  const itemId = req.params.id;
  const { onmenu_offmenu } = req.body;

  const sql = 'UPDATE menu_item SET onmenu_offmenu = ? WHERE id = ?';
  connection.query(sql, [onmenu_offmenu, itemId], (err, result) => {
      if (err) {
          console.error('Error updating menu status:', err);
          return res.status(500).json({ success: false, message: 'Error updating menu status.' });
      }
      res.json({ success: true, message: 'Menu status updated successfully.' });
  });
});

app.post('/update_menu_item', upload.single('itemImage'), (req, res) => {
  const itemId = req.body.itemId;
  const itemName = req.body.itemName;
  const itemPrice = req.body.itemPrice;
  const itemImage = req.file;

  let sql = 'UPDATE menu_item SET item_name = ?, item_price = ?';
  const values = [itemName, itemPrice];

  if (itemImage) {
      const imagePath = path.join('uploads', itemImage.filename);
      sql += ', item_img = ?';
      values.push(imagePath);
  }

  sql += ' WHERE id = ?';
  values.push(itemId);

  connection.query(sql, values, (err, result) => {
      if (err) {
          console.error('Error updating menu item:', err);
          return res.status(500).json({ success: false, message: 'Error updating menu item.' });
      }
      res.json({ success: true, message: 'Menu item updated successfully.' });
  });
});

app.delete('/delete_menu_item/:id', (req, res) => {
  const itemId = req.params.id;

  const deleteInvoiceItemsQuery = 'DELETE FROM invoice_item WHERE menu_item_id = ?';
  connection.query(deleteInvoiceItemsQuery, [itemId], (err, result) => {
      if (err) {
          console.error('Error deleting related invoice items:', err);
          return res.status(500).json({ success: false, message: 'Error deleting related invoice items.' });
      }

      const deleteMenuItemQuery = 'DELETE FROM menu_item WHERE id = ?';
      connection.query(deleteMenuItemQuery, [itemId], (err, result) => {
          if (err) {
              console.error('Error deleting menu item:', err);
              return res.status(500).json({ success: false, message: 'Error deleting menu item.' });
          }

          res.json({ success: true, message: 'Menu item deleted successfully.' });
      });
  });
});

// Fetch profile details
app.get('/get-profile', (req, res) => {
  const sql = 'SELECT * FROM profile LIMIT 1'; // Assuming there's only one profile record

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ success: false, message: 'Error fetching profile' });
    }

    if (results.length > 0) {
      res.json({ success: true, profile: results[0] });
    } else {
      res.json({ success: false, message: 'Profile not found' });
    }
  });
});
// Update profile
app.post('/update-profile', upload.single('restaurant_image'), (req, res) => {
  const { restaurant_name, restaurant_address, restaurant_number } = req.body;
  let restaurant_image = null;

  if (req.file) {
    restaurant_image = path.join('uploads', req.file.filename);
  }

  const sql = restaurant_image
    ? 'UPDATE profile SET restaurant_name = ?, restaurant_address = ?, restaurant_number = ?, restaurant_image = ? WHERE id = 1'
    : 'UPDATE profile SET restaurant_name = ?, restaurant_address = ?, restaurant_number = ? WHERE id = 1';

  const values = restaurant_image
    ? [restaurant_name, restaurant_address, restaurant_number, restaurant_image]
    : [restaurant_name, restaurant_address, restaurant_number];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ success: false, message: 'Error updating profile' });
    }

    res.json({ success: true, message: 'Profile updated successfully', profile: { restaurant_name, restaurant_address, restaurant_number, restaurant_image } });
  });
});



// Error handling middleware (if needed)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
