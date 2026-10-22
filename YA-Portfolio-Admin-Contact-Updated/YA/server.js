"use strict";
require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const {
    Pool
} = require("pg");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const app = express();
const port = Number(process.env.PORT || 3000);
const hasDatabase = Boolean(process.env.DATABASE_URL);
const pool = hasDatabase ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: !/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? {
        rejectUnauthorized: false
    } : false
}) : null;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "YA";
// For local development, generate a temporary session secret automatically.
// Production deployments must provide a persistent SESSION_SECRET.
const sessionSecret = process.env.SESSION_SECRET || (process.env.NODE_ENV === "production" ? "" : crypto.randomBytes(48).toString("hex"));
if (sessionSecret.length < 32) {
    console.error("Set SESSION_SECRET to a random secret of at least 32 characters in your production host environment.");
    process.exit(1);
}
app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(express.json({
    limit: "20kb",
    type: "application/json"
}));
app.use(session({
    ...(hasDatabase ? {
        store: new PgSession({
            pool,
            tableName: "portfolio_sessions",
            createTableIfMissing: true
        })
    } : {}),
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
}));
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
const adminOnly = (req, res, next) => req.session && req.session.isAdmin ? next() : res.status(401).json({
    error: "Please sign in again."
});

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
    fs.mkdirSync(path.dirname(localMessagesFile), {
        recursive: true
    });
    fs.writeFileSync(localMessagesFile, JSON.stringify(messages, null, 2));
}
async function initDb() {
    if (!hasDatabase) {
        writeLocalMessages(readLocalMessages());
        console.log("DATABASE_URL not set; using local data/messages.json storage.");
        return;
    }
    await pool.query(`CREATE TABLE IF NOT EXISTS portfolio_messages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    subject VARCHAR(180) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`);
}
app.get("/api/health", async (_req, res) => {
    try {
        if (hasDatabase) await pool.query("SELECT 1");
        res.json({
            ok: true,
            database: hasDatabase ? "postgresql" : "local-json"
        });
    } catch (_e) {
        res.status(503).json({
            ok: false,
            database: "unavailable"
        });
    }
});
app.post("/api/messages", messageLimiter, async (req, res) => {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim() : "";
    const subject = typeof req.body.subject === "string" ? req.body.subject.trim() : "";
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    if (name.length < 2 || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254 || subject.length < 3 || subject.length > 180 || message.length < 10 || message.length > 5000) return res.status(400).json({
        error: "Please check the form fields and try again."
    });
    try {
        if (hasDatabase) await pool.query("INSERT INTO portfolio_messages(name,email,subject,message) VALUES($1,$2,$3,$4)", [name, email, subject, message]);
        else {
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
        res.status(201).json({
            ok: true
        });
    } catch (e) {
        console.error("Message save failed:", e.message);
        res.status(503).json({
            error: "Your message could not be saved right now. Please try again later."
        });
    }
});
app.post("/api/admin/login", loginLimiter, (req, res, next) => {
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (!safeEqual(password, ADMIN_PASSWORD)) return res.status(401).json({
        error: "Incorrect password."
    });
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.isAdmin = true;
        req.session.save((saveErr) => saveErr ? next(saveErr) : res.json({
            ok: true
        }));
    });
});
app.post("/api/admin/logout", (req, res, next) => req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie("ya_portfolio_admin", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production"
    });
    res.json({
        ok: true
    });
}));
app.get("/api/admin/messages", adminOnly, async (_req, res) => {
    try {
        if (!hasDatabase) return res.json(readLocalMessages().slice(0, 500).map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            subject: r.subject,
            message: r.message,
            createdAt: r.created_at
        })));
        const result = await pool.query("SELECT id, name, email, subject, message, created_at FROM portfolio_messages ORDER BY created_at DESC LIMIT 500");
        res.json(result.rows.map((r) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            subject: r.subject,
            message: r.message,
            createdAt: r.created_at
        })));
    } catch (e) {
        console.error("Messages load failed:", e.message);
        res.status(500).json({
            error: "Could not load messages."
        });
    }
});
app.delete("/api/admin/messages/:id", adminOnly, async (req, res) => {
    if (!/^\d+$/.test(req.params.id)) return res.status(400).json({
        error: "Invalid message id."
    });
    try {
        if (!hasDatabase) {
            const messages = readLocalMessages();
            const remaining = messages.filter((message) => String(message.id) !== req.params.id);
            if (remaining.length === messages.length) return res.status(404).json({
                error: "Message not found."
            });
            writeLocalMessages(remaining);
            return res.json({
                ok: true
            });
        }
        const result = await pool.query("DELETE FROM portfolio_messages WHERE id=$1", [req.params.id]);
        if (!result.rowCount) return res.status(404).json({
            error: "Message not found."
        });
        res.json({
            ok: true
        });
    } catch (e) {
        console.error("Message delete failed:", e.message);
        res.status(500).json({
            error: "Could not delete message."
        });
    }
});
app.use(express.static(path.join(__dirname), {
    index: "index.html",
    etag: true,
    maxAge: process.env.NODE_ENV === "production" ? "1h" : 0
}));
app.use((err, _req, res, _next) => {
    console.error("Request error:", err.message);
    res.status(500).json({
        error: "Something went wrong. Please try again."
    });
});
initDb().then(() => app.listen(port, "0.0.0.0", () => console.log(`Portfolio server listening on ${port}`))).catch((e) => {
    console.error("Startup failed:", e.message);
    process.exit(1);
});