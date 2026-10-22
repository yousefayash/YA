
"use strict";

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const { Pool } = require("pg");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();
const port = Number(process.env.PORT || 3000);

const hasDatabase = Boolean(process.env.DATABASE_URL);

const pool = hasDatabase
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL)
        ? { rejectUnauthorized: false }
        : false
    })
  : null;

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  (process.env.NODE_ENV === "production" ? "" : "programing");

const sessionSecret =
  process.env.SESSION_SECRET ||
  (process.env.NODE_ENV === "production"
    ? ""
    : crypto.randomBytes(48).toString("hex"));

if (!sessionSecret || sessionSecret.length < 32) {
  console.error("Set SESSION_SECRET to a random secret of at least 32 characters.");
  process.exit(1);
}

if (!ADMIN_PASSWORD) {
  console.error("Set ADMIN_PASSWORD in your production host environment.");
  process.exit(1);
}

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "20kb", type: "application/json" }));

app.use(
  session({
    ...(hasDatabase
      ? {
          store: new PgSession({
            pool,
            tableName: "portfolio_sessions",
            createTableIfMissing: true
          })
        }
      : {}),
    name: "ya_portfolio_admin",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many sign-in attempts. Try again in 15 minutes."
  }
});

const messageLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many messages sent. Please wait before trying again."
  }
});

const adminOnly = (req, res, next) =>
  req.session && req.session.isAdmin
    ? next()
    : res.status(401).json({ error: "Please sign in again." });

function safeEqual(a, b) {
  const aa = Buffer.from(String(a));
  const bb = Buffer.from(String(b));

  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

const localMessagesFile = path.join(__dirname, "data", "messages.json");

function readLocalMessages() {
  try {
    return JSON.parse(fs.readFileSync(localMessagesFile, "utf8"));
  } catch (_) {
    return [];
  }
}

function writeLocalMessages(messages) {
  fs.mkdirSync(path.dirname(localMessagesFile), { recursive: true });
  fs.writeFileSync(
    localMessagesFile,
    JSON.stringify(messages, null, 2)
  );
}

async function initDb() {
  if (!hasDatabase) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("DATABASE_URL is required in production.");
    }

    writeLocalMessages(readLocalMessages());
    console.log("Using local data/messages.json storage.");
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS portfolio_messages (
      id BIGSERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(254) NOT NULL,
      subject VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

/* Homepage */
app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* Admin page */
app.get("/admin.html", (_req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

/* Health check */
app.get("/api/health", async (_req, res) => {
  try {
    if (hasDatabase) {
      await pool.query("SELECT 1");
    }

    res.json({
      ok: true,
      database: hasDatabase ? "postgresql" : "local-json"
    });
  } catch (error) {
    console.error("Health check failed:", error.message);

    res.status(503).json({
      ok: false,
      database: "unavailable"
    });
  }
});

/* Contact form */
app.post("/api/messages", messageLimiter, async (req, res) => {
  const name =
    typeof req.body.name === "string" ? req.body.name.trim() : "";

  const email =
    typeof req.body.email === "string" ? req.body.email.trim() : "";

  const subject =
    typeof req.body.subject === "string" ? req.body.subject.trim() : "";

  const message =
    typeof req.body.message === "string" ? req.body.message.trim() : "";

  if (
    name.length < 2 ||
    name.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ||
    email.length > 254 ||
    subject.length < 3 ||
    subject.length > 180 ||
    message.length < 10 ||
    message.length > 5000
  ) {
    return res.status(400).json({
      error: "Please check the form fields and try again."
    });
  }

  try {
    if (hasDatabase) {
      await pool.query(
        `INSERT INTO portfolio_messages
          (name, email, subject, message)
         VALUES ($1, $2, $3, $4)`,
        [name, email, subject, message]
      );
    } else {
      const messages = readLocalMessages();

      messages.unshift({
        id: Date.now(),
        name,
        email,
        subject,
        message,
        created_at: new Date().toISOString()
      });

      writeLocalMessages(messages);
    }

    res.status(201).json({ ok: true });
  } catch (error) {
    console.error("Message save failed:", error.message);

    res.status(503).json({
      error: "Your message could not be saved right now. Please try again later."
    });
  }
});

/* Admin login */
app.post("/api/admin/login", loginLimiter, (req, res, next) => {
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: "Incorrect password." });
  }

  req.session.regenerate((error) => {
    if (error) return next(error);

    req.session.isAdmin = true;

    req.session.save((saveError) => {
      if (saveError) return next(saveError);

      res.json({ ok: true });
    });
  });
});

/* Admin logout */
app.post("/api/admin/logout", (req, res, next) => {
  req.session.destroy((error) => {
    if (error) return next(error);

    res.clearCookie("ya_portfolio_admin", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });

    res.json({ ok: true });
  });
});

/* Load messages */
app.get("/api/admin/messages", adminOnly, async (_req, res) => {
  try {
    if (!hasDatabase) {
      return res.json(
        readLocalMessages()
          .slice(0, 500)
          .map((message) => ({
            id: message.id,
            name: message.name,
            email: message.email,
            subject: message.subject,
            message: message.message,
            createdAt: message.created_at
          }))
      );
    }

    const result = await pool.query(`
      SELECT id, name, email, subject, message, created_at
      FROM portfolio_messages
      ORDER BY created_at DESC
      LIMIT 500
    `);

    res.json(
      result.rows.map((message) => ({
        id: message.id,
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        createdAt: message.created_at
      }))
    );
  } catch (error) {
    console.error("Messages load failed:", error.message);

    res.status(500).json({
      error: "Could not load messages."
    });
  }
});

/* Delete message */
app.delete("/api/admin/messages/:id", adminOnly, async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) {
    return res.status(400).json({ error: "Invalid message id." });
  }

  try {
    if (!hasDatabase) {
      const messages = readLocalMessages();

      const remaining = messages.filter(
        (message) => String(message.id) !== req.params.id
      );

      if (remaining.length === messages.length) {
        return res.status(404).json({ error: "Message not found." });
      }

      writeLocalMessages(remaining);

      return res.json({ ok: true });
    }

    const result = await pool.query(
      "DELETE FROM portfolio_messages WHERE id = $1",
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: "Message not found." });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Message delete failed:", error.message);

    res.status(500).json({
      error: "Could not delete message."
    });
  }
});

/* Static files: CSS, JavaScript, images, and other pages */
app.use(
  express.static(__dirname, {
    index: "index.html",
    etag: true,
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
  })
);

/* Not found */
app.use((req, res) => {
  res.status(404).send("Not Found");
});

/* Error handler */
app.use((error, _req, res, _next) => {
  console.error("Request error:", error.message);

  res.status(500).json({
    error: "Something went wrong. Please try again."
  });
});

initDb()
  .then(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Portfolio server listening on ${port}`);
    });
  })
  .catch((error) => {
    console.error("Startup failed:", error.message);
    process.exit(1);
  });
