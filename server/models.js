const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

// Clients get `id` (category slug or Mongo _id) and no internals.
const opts = {
  timestamps: true,
  toJSON: {
    transform: (_doc, ret) => {
      ret.id = ret.slug || String(ret._id);
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};

const Category = models.Category || model("Category", new Schema({
  slug: { type: String, required: true, unique: true },
  no: String,
  name: { type: String, required: true },
  blurb: String,
}, opts));

const Product = models.Product || model("Product", new Schema({
  category: { type: String, required: true, index: true }, // category slug
  name: { type: String, required: true, trim: true },
  brand: { type: String, trim: true, default: "" },
  pack: { type: String, trim: true, default: "" },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0, min: 0 },
  tag: { type: String, trim: true, default: "" },
}, opts));

const Quote = models.Quote || model("Quote", new Schema({
  ref: { type: String, unique: true },
  name: String,
  phone: String,
  company: String,
  note: String,
  lines: [{ product: String, name: String, qty: Number, unit: Number, total: Number, _id: false }],
  total: Number,
  status: { type: String, enum: ["new", "contacted", "closed"], default: "new" },
}, opts));

const User = models.User || model("User", new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  hash: { type: String, required: true },
}, opts));

module.exports = { Category, Product, Quote, User };
