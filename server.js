const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const dbFile = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbFile);

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function initDatabase() {
  await run(`PRAGMA foreign_keys = ON`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,
    password TEXT,
    name TEXT,
    surname TEXT,
    role TEXT,
    joinDate TEXT,
    status TEXT,
    shoppingCart TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    category TEXT,
    price TEXT,
    stock INTEGER,
    sales INTEGER,
    status TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    name TEXT PRIMARY KEY
  )`);

  await run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer TEXT,
    product TEXT,
    date TEXT,
    amount TEXT,
    status TEXT
  )`);

  const defaultAdmin = await get(`SELECT email FROM users WHERE email = ?`, ['admin@gmail.com']);
  if (!defaultAdmin) {
    await run(`INSERT INTO users (email, password, name, surname, role, joinDate, status, shoppingCart) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['admin@gmail.com', 'admin123', 'admin', 'admin', 'admin', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 'Active', JSON.stringify([])]);
  }
}

function safeUserRow(row) {
  if (!row) return null;
  return {
    email: row.email,
    name: row.name,
    surname: row.surname,
    role: row.role,
    joinDate: row.joinDate,
    status: row.status,
    shoppingCart: row.shoppingCart ? JSON.parse(row.shoppingCart) : []
  };
}

app.post('/api/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await get('SELECT email FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    await run(`INSERT INTO users (email, password, name, surname, role, joinDate, status, shoppingCart) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, password, firstname, lastname, 'customer', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 'Active', JSON.stringify([])]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create user.' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await get('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json(safeUserRow(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await all('SELECT * FROM products ORDER BY id');
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch products.' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    if (!name || !category || !price || stock === undefined) {
      return res.status(400).json({ error: 'Missing product fields.' });
    }

    const existing = await get('SELECT id FROM products WHERE name = ?', [name]);
    if (existing) {
      return res.status(409).json({ error: 'Product name already exists.' });
    }

    const rowCount = await get('SELECT COUNT(*) AS count FROM products');
    const newId = `#PRD-${String((rowCount.count || 0) + 1).padStart(3, '0')}`;
    const status = Number(stock) === 0 ? 'Out of Stock' : Number(stock) < 50 ? 'Low Stock' : 'Active';

    await run('INSERT INTO products (id, name, category, price, stock, sales, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [newId, name, category, price, Number(stock), 0, status]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create product.' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, stock, sales, status } = req.body;
    const existing = await get('SELECT id FROM products WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    const newStatus = status || (Number(stock) === 0 ? 'Out of Stock' : Number(stock) < 50 ? 'Low Stock' : 'Active');
    await run(`UPDATE products SET name = ?, category = ?, price = ?, stock = ?, sales = ?, status = ? WHERE id = ?`,
      [name, category, price, Number(stock), Number(sales), newStatus, id]);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update product.' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete product.' });
  }
});

app.get('/api/categories', async (req, res) => {
  try {
    const categories = await all('SELECT name FROM categories ORDER BY name');
    res.json(categories.map(row => row.name));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch categories.' });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required.' });

    await run('INSERT OR IGNORE INTO categories (name) VALUES (?)', [name]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save category.' });
  }
});

app.delete('/api/categories/:name', async (req, res) => {
  try {
    const { name } = req.params;
    await run('DELETE FROM categories WHERE name = ?', [name]);
    await run('DELETE FROM products WHERE category = ?', [name]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete category.' });
  }
});

app.get('/api/customers', async (req, res) => {
  try {
    const customers = await all('SELECT * FROM users WHERE role = ?', ['customer']);
    res.json(customers.map(row => safeUserRow(row)));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch customers.' });
  }
});

app.delete('/api/customers/:email', async (req, res) => {
  try {
    const { email } = req.params;
    await run('DELETE FROM users WHERE email = ?', [email]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete customer.' });
  }
});

app.put('/api/users/:email', async (req, res) => {
  try {
    const oldEmail = req.params.email;
    const { email, name, surname, password, status, shoppingCart } = req.body;
    const existing = await get('SELECT email FROM users WHERE email = ?', [oldEmail]);
    if (!existing) return res.status(404).json({ error: 'User not found.' });

    if (email && email !== oldEmail) {
      const collision = await get('SELECT email FROM users WHERE email = ?', [email]);
      if (collision) return res.status(409).json({ error: 'Email already in use.' });
    }

    await run(`UPDATE users SET email = ?, name = ?, surname = ?, password = ?, status = ?, shoppingCart = ? WHERE email = ?`,
      [email || oldEmail, name, surname, password, status, JSON.stringify(shoppingCart || []), oldEmail]);

    const updated = await get('SELECT * FROM users WHERE email = ?', [email || oldEmail]);
    res.json(safeUserRow(updated));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update user.' });
  }
});

app.put('/api/users/:email/cart', async (req, res) => {
  try {
    const { email } = req.params;
    const { cart } = req.body;
    if (!Array.isArray(cart)) return res.status(400).json({ error: 'Cart must be an array.' });

    await run('UPDATE users SET shoppingCart = ? WHERE email = ?', [JSON.stringify(cart), email]);
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    res.json(safeUserRow(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not save cart.' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await all('SELECT * FROM orders ORDER BY date DESC, id DESC');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch orders.' });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { id, customer, product, date, amount, status } = req.body;
    if (!id || !customer || !product || !date || !amount) {
      return res.status(400).json({ error: 'Missing order fields.' });
    }

    await run(`INSERT INTO orders (id, customer, product, date, amount, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, customer, product, date, amount, status || 'Delivered']);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create order.' });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not update order.' });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not delete order.' });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { customerEmail, customerName, customerSurname, cart, totalAmount } = req.body;
    if (!customerEmail || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Missing checkout data.' });
    }

    const orderCount = await get('SELECT COUNT(*) AS count FROM orders');
    const newOrderId = `#ORD-${String((orderCount.count || 0) + 1).padStart(5, '0')}`;
    const orderDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const customerNameDisplay = `${customerName || ''} ${customerSurname || ''}`.trim() || customerEmail;
    const productSummary = cart.map(item => `${item.name} × ${item.quantity}`).join(', ');
    const orderAmount = `$${Number(totalAmount).toFixed(2)}`;

    const transaction = async () => {
      await run('BEGIN TRANSACTION');
      await run('INSERT INTO orders (id, customer, product, date, amount, status) VALUES (?, ?, ?, ?, ?, ?)', [newOrderId, customerNameDisplay, productSummary, orderDate, orderAmount, 'Delivered']);

      for (const item of cart) {
        const product = await get('SELECT * FROM products WHERE name = ?', [item.name]);
        if (!product) continue;

        const newStock = Math.max(0, product.stock - item.quantity);
        const newStatus = newStock === 0 ? 'Out of Stock' : newStock < 50 ? 'Low Stock' : 'Active';
        await run('UPDATE products SET stock = ?, status = ? WHERE id = ?', [newStock, newStatus, product.id]);
      }

      await run('UPDATE users SET shoppingCart = ? WHERE email = ?', [JSON.stringify([]), customerEmail]);
      await run('COMMIT');
    };

    await transaction();
    res.json({ success: true, order: { id: newOrderId, customer: customerNameDisplay, product: productSummary, date: orderDate, amount: orderAmount, status: 'Completed' } });
  } catch (error) {
    console.error(error);
    await run('ROLLBACK');
    res.status(500).json({ error: 'Checkout failed.' });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(safeUserRow(user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not fetch user.' });
  }
});

app.post('/api/customers', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Customer name and email are required.' });
    const [firstName, lastName] = name.split(' ');
    const password = 'customer123';
    await run('INSERT INTO users (email, password, name, surname, role, joinDate, status, shoppingCart) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, password, firstName || name, lastName || '', 'customer', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 'Active', JSON.stringify([])]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Could not create customer.' });
  }
});

const PORT = process.env.PORT || 3000;
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
});
