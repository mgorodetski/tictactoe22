const express = require('express');
// const cors = require('cors')
const path = require('path');
const app = express();
const PORT = 8000;

// app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://imasdk.googleapis.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,application/xml');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname, '/style.css'));
});

app.get('/script.js', function(req, res) {
  res.sendFile(path.join(__dirname, '/script.js'));
});

app.get('/ads', function(req, res) {
  res.contentType('application/xml');
  res.sendFile(path.join(__dirname, '/ad.xml'));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
