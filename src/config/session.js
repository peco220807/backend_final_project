const session = require('express-session');
const MongoStore = require('connect-mongo');

function sessionMiddleware() {
  const uri = process.env.MONGODB_URI;
  const secret = process.env.SESSION_SECRET;
  const ttlDays = Number(process.env.SESSION_TTL_DAYS || 7);

  if (!uri) throw new Error('MONGODB_URI is missing');
  if (!secret) throw new Error('SESSION_SECRET is missing');

  return session({
    name: 'desire.sid',
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: ttlDays * 24 * 60 * 60 * 1000
    },
    store: MongoStore.create({
      mongoUrl: uri,
      dbName: process.env.MONGODB_DB || 'desirestore',
      ttl: ttlDays * 24 * 60 * 60
    })
  });
}

module.exports = { sessionMiddleware };
