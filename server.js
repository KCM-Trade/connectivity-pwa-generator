require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Token encryption function
function generateToken() {
  const algorithm = 'aes-256-cbc';
  const secretKey = process.env.TOKEN_SECRET_KEY;
  const document = process.env.TOKEN_DOCUMENT;
  
  if (!secretKey || !document) {
    throw new Error('TOKEN_SECRET_KEY and TOKEN_DOCUMENT must be set in .env');
  }
  
  // Create a 32-byte key from the secret key
  const key = crypto.createHash('sha256').update(secretKey).digest();
  
  // Create cipher with IV
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  
  // Encrypt the document
  let encrypted = cipher.update(document, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Combine IV and encrypted data
  const token = iv.toString('hex') + ':' + encrypted;
  
  return token;
}

// 生成token
app.post('/api/generateToken', async (req, res) => {
  try {
    const token = generateToken();
    
    // 儲存token到資料庫
    const [result] = await pool.query(
      'INSERT INTO tokens (token, enabled) VALUES (?, ?)',
      [token, 'true']
    );
    
    // 取得所有 PWA URLs
    const [pwaUrls] = await pool.query(
      'SELECT * FROM urls WHERE type = ? AND status = "enable"',
      ['pwa']
    );
    
    res.json({ 
      success: true, 
      token: token,
      id: result.insertId,
      pwaUrls: pwaUrls
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`PWA URL Generator running at http://localhost:${port}`);
});

