const express = require('express');
const mysql = require('mysql');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;

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
