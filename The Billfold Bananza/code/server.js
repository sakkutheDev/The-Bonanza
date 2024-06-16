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
    return;
  }
  console.log('Connected to the database.');
});

// Serve static files from the 'code' directory
app.use(express.static(path.join(__dirname,)));

// Serve the specific Menu_Page.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname,  'Menu_Page.html'));
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

// Save invoice
app.post('/save_invoice', (req, res) => {
  const invoiceData = req.body;
  const { date_time, bill_no, payment_type_id, discount, total_amount, order_type_id, items } = invoiceData;

  connection.beginTransaction(err => {
    if (err) {
      console.error('Error starting transaction:', err);
      return res.status(500).json({ success: false, error: 'Error starting transaction' });
    }

    // Insert invoice bill
    const insertInvoiceBillQuery = 'INSERT INTO invoice_bill (date_time, bill_no, payment_type_id, discount, cgst, sgst, total_amount, order_type_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    connection.query(insertInvoiceBillQuery, [date_time, bill_no, payment_type_id, discount, total_amount, order_type_id], (err, results) => {
      if (err) {
        connection.rollback(() => {
          console.error('Error inserting invoice bill:', err);
          return res.status(500).json({ success: false, error: 'Error inserting invoice bill' });
        });
      }

      const invoiceId = results.insertId;

      // Insert invoice items
      const insertInvoiceItemQuery = 'INSERT INTO invoice_item (invoice_id, menu_item_id, quantity) VALUES ?';
      const invoiceItemsData = items.map(item => [invoiceId, item.menu_item_id, item.quantity]);

      connection.query(insertInvoiceItemQuery, [invoiceItemsData], (err, results) => {
        if (err) {
          connection.rollback(() => {
            console.error('Error inserting invoice items:', err);
            return res.status(500).json({ success: false, error: 'Error inserting invoice items' });
          });
        }

        connection.commit(err => {
          if (err) {
            connection.rollback(() => {
              console.error('Error committing transaction:', err);
              return res.status(500).json({ success: false, error: 'Error committing transaction' });
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
