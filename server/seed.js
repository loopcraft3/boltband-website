// Run once: npm run seed   (needs MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD in server/.env)
const bcrypt = require("bcryptjs");
const connectDB = require("./db");
const { categories, products } = require("./data");
const { Category, Product, User } = require("./models");

(async () => {
  await connectDB();

  for (const c of categories) {
    await Category.updateOne({ slug: c.id }, { slug: c.id, no: c.no, name: c.name, blurb: c.blurb }, { upsert: true });
  }
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(products.map(({ id, ...rest }) => rest));
    console.log(`Inserted ${products.length} products`);
  } else console.log("Products already exist, skipped");

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD) {
    const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.updateOne({ email: ADMIN_EMAIL.toLowerCase() }, { email: ADMIN_EMAIL.toLowerCase(), hash }, { upsert: true });
    console.log("Admin ready:", ADMIN_EMAIL);
  } else console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set, admin not created");

  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
