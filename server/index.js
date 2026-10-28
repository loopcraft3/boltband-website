const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const connectDB = require("./db");
const { Category, Product, Quote, User } = require("./models");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50kb" }));

const secret = () => {
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set");
  return process.env.JWT_SECRET;
};

// Connect before every request (cached, so cheap after the first one)
app.use(async (_req, _res, next) => {
  try { await connectDB(); next(); } catch (e) { next(e); }
});

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  try { req.admin = jwt.verify(token, secret()); next(); }
  catch { res.status(401).json({ error: "Please log in again." }); }
}

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// ---------- public ----------
app.get("/api/categories", wrap(async (_req, res) => {
  const [cats, counts] = await Promise.all([
    Category.find().sort("no"),
    Product.aggregate([{ $group: { _id: "$category", n: { $sum: 1 } } }]),
  ]);
  const map = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  res.json(cats.map((c) => ({ ...c.toJSON(), count: map[c.slug] || 0 })));
}));

app.get("/api/products", wrap(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = String(req.query.category);
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ name: rx }, { brand: rx }, { tag: rx }];
  }
  res.json(await Product.find(filter).sort("name"));
}));

app.post("/api/quotes", wrap(async (req, res) => {
  const { name, phone, company, note, items } = req.body || {};
  const errors = {};
  if (typeof name !== "string" || name.trim().length < 2) errors.name = "Enter your name.";
  const cleanPhone = String(phone || "").replace(/[\s-]/g, "");
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) errors.phone = "Enter a 10-digit mobile number.";
  if (!Array.isArray(items) || items.length === 0) errors.items = "Add at least one product.";

  const lines = [];
  if (Array.isArray(items) && items.length) {
    const ids = items.map((i) => i && i.id).filter((id) => mongoose.isValidObjectId(id));
    const found = await Product.find({ _id: { $in: ids } });
    for (const i of items) {
      const prod = found.find((p) => String(p._id) === String(i && i.id));
      const qty = Number(i && i.qty);
      if (!prod || !Number.isInteger(qty) || qty < 1 || qty > 999) { errors.items = "One of the items is no longer available."; break; }
      if (qty > prod.stock) { errors.items = `${prod.name}: only ${prod.stock} in stock.`; break; }
      lines.push({ product: String(prod._id), name: prod.name, qty, unit: prod.price, total: prod.price * qty });
    }
  }
  if (Object.keys(errors).length) return res.status(422).json({ errors });

  const quote = await Quote.create({
    ref: "BB-" + Date.now().toString(36).toUpperCase().slice(-6),
    name: name.trim(),
    phone: cleanPhone,
    company: String(company || "").trim().slice(0, 80),
    note: String(note || "").trim().slice(0, 500),
    lines,
    total: lines.reduce((s, l) => s + l.total, 0),
  });
  res.status(201).json({ ref: quote.ref, total: quote.total });
}));

// ---------- auth ----------
app.post("/api/auth/login", wrap(async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
  const ok = user && (await bcrypt.compare(String(password || ""), user.hash));
  if (!ok) return res.status(401).json({ error: "Wrong email or password." });
  const token = jwt.sign({ sub: String(user._id), email: user.email }, secret(), { expiresIn: "12h" });
  res.json({ token, email: user.email });
}));

// ---------- admin ----------
app.get("/api/admin/quotes", requireAdmin, wrap(async (_req, res) => {
  res.json(await Quote.find().sort("-createdAt").limit(200));
}));

app.patch("/api/admin/quotes/:id", requireAdmin, wrap(async (req, res) => {
  const { status } = req.body || {};
  if (!["new", "contacted", "closed"].includes(status) || !mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ error: "Invalid request." });
  const q = await Quote.findByIdAndUpdate(req.params.id, { status }, { new: true });
  q ? res.json(q) : res.status(404).json({ error: "Quote not found." });
}));

async function cleanProduct(b = {}) {
  const errors = {};
  const price = Number(b.price), stock = Number(b.stock);
  if (!String(b.name || "").trim()) errors.name = "Name is required.";
  if (!(price >= 0) || b.price === "") errors.price = "Enter a valid price.";
  if (!Number.isInteger(stock) || stock < 0) errors.stock = "Stock must be a whole number.";
  if (!(await Category.exists({ slug: b.category }))) errors.category = "Pick a category.";
  const data = {
    name: String(b.name || "").trim(), brand: String(b.brand || "").trim(), pack: String(b.pack || "").trim(),
    tag: String(b.tag || "").trim(), category: b.category, price, stock,
  };
  return { data, errors };
}

app.post("/api/admin/products", requireAdmin, wrap(async (req, res) => {
  const { data, errors } = await cleanProduct(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  res.status(201).json(await Product.create(data));
}));

app.put("/api/admin/products/:id", requireAdmin, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Product not found." });
  const { data, errors } = await cleanProduct(req.body);
  if (Object.keys(errors).length) return res.status(422).json({ errors });
  const p = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
  p ? res.json(p) : res.status(404).json({ error: "Product not found." });
}));

app.delete("/api/admin/products/:id", requireAdmin, wrap(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: "Product not found." });
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
}));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Try again." });
});

module.exports = app; // Vercel uses this export

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
}
