const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const connectMongo = require('connect-mongo');
const MongoStore = connectMongo.default || connectMongo;
const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const csrf = require('csurf');
const morgan = require('morgan');
const env = require('./config/env');
const requestId = require('./middlewares/requestId');
const { globalLimiter } = require('./middlewares/rateLimiters');
const webRoutes = require('./routes/web');
const authRoutes = require('./routes/authRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const taskRoutes = require('./routes/taskRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const toolRoutes = require('./routes/toolRoutes');
const contactRoutes = require('./routes/contactRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

if (env.nodeEnv === 'production') {
  app.set('trust proxy', 1);
}

app.disable('x-powered-by');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use(requestId);
app.use(globalLimiter);
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://cdnjs.cloudflare.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://api.emailjs.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);

// app.use(
//   cors({
//     origin: env.corsOrigin,
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
//   })
// );

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

const store = MongoStore.create({
  mongoUrl: env.mongoUri,
  collectionName: "sessions",
  crypto:{
    secret: env.sessionSecret
  },
  touchAfter: 24 * 3600
});

store.on('error', (error) => {
  console.error('Error in MONGO SESSION STORE', error);
});

app.use(
  session({
    store,
    name: 'sid',
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: env.cookieSecure || env.nodeEnv === 'production',
      sameSite: 'lax'
    }
  })
);
console.log('Session store configured with MongoDB (collection: sessions)');

app.use('/public', express.static(path.join(__dirname, '../public'), { maxAge: '7d' }));

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/favicon.png'));
});

// Serve service worker at root level
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.sendFile(path.join(__dirname, '../public/sw.js'));
});

app.use(
  csrf({
    cookie: {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'strict'
    }
  })
);
app.get('/ping', (req, res) => {
  res.send("Server is running");
  });
app.use('/', webRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/contact', contactRoutes);


app.use(notFound);
app.use(errorHandler);

module.exports = app;