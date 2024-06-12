const express = require('express');
const mysql = require('mysql');
const app = express();

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345', // Add your MySQL root password if you have one
  database: 'thebonanza'
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL Connected...');
});

// Middleware to parse JSON bodies
app.use(express.json());

// Example route to fetch data from a table called 'items'
app.get('/api/items', (req, res) => {
  let sql = 'SELECT * FROM thebonanza'; // Replace 'items' with your actual table name
  db.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
