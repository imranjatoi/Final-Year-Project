require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cron = require('node-cron');

const app = express();

// ── Database connection ───────────────────────────────────────
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

// ── View engine ───────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Middleware ────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(morgan('dev'));
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })); // Security headers

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));
app.use(flash());

// ── Global template variables ─────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  next();
});

// ── Routes ────────────────────────────────────────────────────
app.use('/',          require('./routes/index'));
app.use('/auth',      require('./routes/auth'));
app.use('/plants',    require('./routes/plants'));
app.use('/orders',    require('./routes/orders'));
app.use('/reviews',   require('./routes/reviews'));
app.use('/care',      require('./routes/care'));
app.use('/seller',    require('./routes/seller'));
app.use('/admin',     require('./routes/admin'));

// ── 404 handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: '404 – Page Not Found' });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { title: 'Error', message: err.message });
});

// ── Cron: daily plant care reminders ─────────────────────────
const reminderJob = require('./controllers/careController').sendDailyReminders;
cron.schedule('0 8 * * *', () => {
  console.log('🌿 Running daily plant care reminders...');
  reminderJob();
});

// ── Start server ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🌱 Baghban server running at http://localhost:${PORT}`);
});
