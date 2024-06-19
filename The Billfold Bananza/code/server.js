const express = require('express');
const mysql = require('mysql');
const path = require('path');
const dotenv = require('dotenv');

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

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// Serve the specific Menu_Page.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Menu_Page.html'));
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

// Fetch menu items
app.get('/menu_items', (req, res) => {
  queryDatabase('SELECT * FROM menu_item')
    .then(results => res.json(results))
    .catch(err => {
      console.error('Error fetching menu items:', err);
      res.status(500).json({ error: 'Error fetching menu items' });
    });
});

// Fetch orders with associated items
app.get('/get_orders', (req, res) => {
  const sql = `
    SELECT ib.*, ii.menu_item_id, ii.quantity, mi.item_name
    FROM invoice_bill ib
    LEFT JOIN invoice_item ii ON ib.id = ii.invoice_id
    LEFT JOIN menu_item mi ON ii.menu_item_id = mi.id
  `;

  connection.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching orders:', err);
      return res.status(500).json({ success: false, error: 'Database error' });
    }

    // Organize orders with items into a structured format
    const orders = results.reduce((acc, row) => {
      const orderId = row.id;
      if (!acc[orderId]) {
        acc[orderId] = {
          id: orderId,
          date_time: row.date_time,
          bill_no: row.bill_no,
          payment_type_id: row.payment_type_id,
          discount: row.discount,
          cgst: row.cgst,
          sgst: row.sgst,
          total_amount: row.total_amount,
          order_type_id: row.order_type_id,
          items: []
        };
      }

      if (row.menu_item_id) {
        acc[orderId].items.push({
          id: row.menu_item_id,
          name: row.item_name,
          quantity: row.quantity
        });
      }

      return acc;
    }, {});

    res.json({ success: true, orders: Object.values(orders) });
  });
});

// Delete order by ID
app.delete('/delete_order/:id', (req, res) => {
  const orderId = req.params.id;

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

      res.json({ success: true, message: `Order with ID ${orderId} deleted successfully` });
    });
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

          res.json({ success: true });
        });
      });
    });
  });
});

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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
