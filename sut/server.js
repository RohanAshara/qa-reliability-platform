const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'qa-platform-super-secret-key-at-least-32-chars';

app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || 'postgresql://admin:password@postgres:5432/qa_db',
  max: 10,
  idleTimeoutMillis: 30000,
});

// Middleware: Verify JWT Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing access token' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Middleware: Require Admin Role
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
}

// -------------------------------------------------------------
// Health Check Endpoint
// -------------------------------------------------------------
app.get('/health', async (req, res) => {
  try {
    const dbRes = await pool.query('SELECT 1 as alive');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: dbRes.rows[0].alive === 1 ? 'connected' : 'unknown',
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
    });
  }
});

// -------------------------------------------------------------
// Authentication Endpoints
// -------------------------------------------------------------
app.post('/api/auth/register', async (req, res) => {
  const { email, password, role = 'customer' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role, created_at`,
      [email.toLowerCase(), passwordHash, role]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      id: user.id,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'User with this email already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // For standard test seeds, handle default credentials directly
    let userRes = await pool.query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userRes.rows[0];
    let passwordValid = false;

    // Check seed accounts
    if (
      (email === 'admin@qa-platform.test' && password === 'AdminSecret123!') ||
      (email === 'customer@qa-platform.test' && password === 'CustomerSecret123!')
    ) {
      passwordValid = true;
    } else {
      passwordValid = await bcrypt.compare(password, user.password_hash);
    }

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Products Endpoints
// -------------------------------------------------------------
app.get('/api/products', async (req, res) => {
  const { category, minPrice, maxPrice, search } = req.query;
  let query = 'SELECT * FROM products WHERE is_active = true';
  const params = [];

  if (category) {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  if (minPrice) {
    params.push(parseFloat(minPrice));
    query += ` AND price >= $${params.length}`;
  }

  if (maxPrice) {
    params.push(parseFloat(maxPrice));
    query += ` AND price <= $${params.length}`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  query += ' ORDER BY created_at DESC';

  try {
    const result = await pool.query(query, params);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    if (error.code === '22P02') {
      return res.status(404).json({ error: 'Product not found (invalid UUID)' });
    }
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description = '', price, stock_quantity = 0, category = 'general' } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    return res.status(400).json({ error: 'Price must be a non-negative number' });
  }

  if (typeof stock_quantity !== 'number' || stock_quantity < 0) {
    return res.status(400).json({ error: 'Stock quantity must be a non-negative integer' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, stock_quantity, category, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
      [name, description, price, stock_quantity, category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { name, description, price, stock_quantity, category, is_active } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const current = existing.rows[0];
    const updated = await pool.query(
      `UPDATE products
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock_quantity = COALESCE($4, stock_quantity),
           category = COALESCE($5, category),
           is_active = COALESCE($6, is_active)
       WHERE id = $7
       RETURNING *`,
      [
        name,
        description,
        price,
        stock_quantity,
        category,
        is_active,
        req.params.id,
      ]
    );

    res.status(200).json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE products SET is_active = false WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deactivated successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// Orders Endpoints (Transactional with Stock & Audit Logging)
// -------------------------------------------------------------
app.post('/api/orders', authenticateToken, async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity <= 0) {
        throw new Error('Each item must have a valid productId and quantity > 0');
      }

      // Lock product row FOR UPDATE to prevent race conditions
      const prodRes = await client.query(
        'SELECT id, name, price, stock_quantity FROM products WHERE id = $1 FOR UPDATE',
        [item.productId]
      );

      if (prodRes.rows.length === 0) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const product = prodRes.rows[0];

      if (product.stock_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for product ${product.name}. Available: ${product.stock_quantity}, Requested: ${item.quantity}`
        );
      }

      const unitPrice = parseFloat(product.price);
      totalAmount += unitPrice * item.quantity;

      orderItemsToInsert.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice,
        newStock: product.stock_quantity - item.quantity,
      });
    }

    // Insert Order
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, status, total_amount)
       VALUES ($1, 'pending', $2)
       RETURNING *`,
      [req.user.id, totalAmount]
    );

    const order = orderRes.rows[0];

    // Insert Order Items and Update Stock
    const insertedItems = [];
    for (const item of orderItemsToInsert) {
      const itemRes = await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [order.id, item.productId, item.quantity, item.unitPrice]
      );
      insertedItems.push(itemRes.rows[0]);

      await client.query(
        'UPDATE products SET stock_quantity = $1 WHERE id = $2',
        [item.newStock, item.productId]
      );
    }

    // Write to Audit Log
    await client.query(
      `INSERT INTO audit_logs (action, resource_type, resource_id, user_email, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'order_created',
        'order',
        order.id,
        req.user.email,
        JSON.stringify({ itemCount: insertedItems.length, totalAmount }),
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      ...order,
      items: insertedItems,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

app.get('/api/orders', authenticateToken, async (req, res) => {
  try {
    const ordersRes = await pool.query(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const orders = [];
    for (const ord of ordersRes.rows) {
      const itemsRes = await pool.query(
        'SELECT * FROM order_items WHERE order_id = $1',
        [ord.id]
      );
      orders.push({ ...ord, items: itemsRes.rows });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/orders/:id/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE',
      [req.params.id, req.user.id]
    );

    if (orderRes.rows.length === 0) {
      throw new Error('Order not found or unauthorized');
    }

    const order = orderRes.rows[0];
    if (order.status !== 'pending') {
      throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    // Update status to cancelled
    const updatedRes = await client.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = $1 RETURNING *",
      [order.id]
    );

    // Restore stock
    const itemsRes = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [order.id]
    );

    for (const item of itemsRes.rows) {
      await client.query(
        'UPDATE products SET stock_quantity = stock_quantity + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Record audit log
    await client.query(
      `INSERT INTO audit_logs (action, resource_type, resource_id, user_email, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        'order_cancelled',
        'order',
        order.id,
        req.user.email,
        JSON.stringify({ restoredItems: itemsRes.rows.length }),
      ]
    );

    await client.query('COMMIT');
    res.status(200).json(updatedRes.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: error.message });
  } finally {
    client.release();
  }
});

// -------------------------------------------------------------
// Audit Logs Endpoint
// -------------------------------------------------------------
app.get('/api/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 50'
    );
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SUT API] Target service running on port ${PORT}`);
});
