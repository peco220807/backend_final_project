require('dotenv').config();

const express = require('express');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const { connectDB } = require('./src/config/db');
const { sessionMiddleware } = require('./src/config/session');
const { notFound, errorHandler } = require('./src/middleware/error');

const authRoutes = require('./src/routes/authRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const contactRoutes = require('./src/routes/contactRoutes');

const { seedAdmin } = require('./src/seed/seedAdmin');
const { seedProducts } = require('./src/seed/seedProducts');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

app.use(cookieParser());
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware());

app.use(express.static(path.join(__dirname, 'public')));

function sendView(name) {
  return (req, res) => res.sendFile(path.join(__dirname, 'views', name));
}
app.get('/', sendView('index.html'));
app.get('/shop', sendView('shop.html'));
app.get('/about', sendView('about.html'));
app.get('/contact', sendView('contact.html'));
app.get('/cart', sendView('cart.html'));
app.get('/orders', sendView('orders.html'));
app.get('/admin', sendView('admin.html'));
app.get('/login', sendView('login.html'));
app.get('/register', sendView('register.html'));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDB();
  await seedAdmin();
  await seedProducts();

  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`DesireStore running on http://localhost:${port}`));
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
