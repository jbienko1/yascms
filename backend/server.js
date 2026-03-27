const path = require('path');
const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { initDb } = require('./db');

const faqRoutes = require('./routes/faq');
const blogRoutes = require('./routes/blog');
const kbRoutes = require('./routes/kb');
const homeRoutes = require('./routes/home');
const authRoutes = require('./routes/auth');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60
    }
  })
);

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.use('/api', faqRoutes.publicRouter);
app.use('/api', blogRoutes.publicRouter);
app.use('/api', kbRoutes.publicRouter);
app.use('/api', homeRoutes.publicRouter);

app.use('/api/admin', authRoutes);
app.use('/api/admin', requireAuth, faqRoutes.adminRouter);
app.use('/api/admin', requireAuth, blogRoutes.adminRouter);
app.use('/api/admin', requireAuth, kbRoutes.adminRouter);

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB init error', err);
    process.exit(1);
  });

