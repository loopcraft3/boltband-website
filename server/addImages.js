// Run once after adding photos:  npm run images --prefix server
const connectDB = require("./db");
const { Product } = require("./models");

// product name -> file inside client/public/products/
const map = {
  "Araldite Standard Epoxy": "araldite-standard.jpg",
  "Araldite Professional Epoxy": "araldite-pro.jpg",
  "WD-40 Multi-Use Spray": "wd40.jpg",
  "Neutral Cure Silicone Sealant": "silicone.jpg",
  "Expanding PU Foam": "pu-foam.jpg",
  "Industrial Contact Adhesive": "contact-adhesive.jpg",
  "Anaerobic Threadlocker (Blue)": "threadlocker.jpg",
  "Hex Bolt M10 x 50 (Zinc)": "hex-bolt.jpg",
  "Wedge Anchor 12 x 100": "wedge-anchor.jpg",
  "Combination Spanner Set": "spanner-set.jpg",
  "Steel Measuring Tape": "tape.jpg",
  "Angle Grinder 4 in": "grinder.jpg",
  "Cutting Disc 4 in": "cutting-disc.jpg",
  "FR Copper Wire 1.5 sq mm": "copper-wire.jpg",
  "PTFE Thread Seal Tape": "ptfe-tape.jpg",
  "Safety Helmet with Chin Strap": "helmet.jpg",
  "Nitrile Coated Gloves": "gloves.jpg",
};

(async () => {
  await connectDB();
  for (const [name, file] of Object.entries(map)) {
    const r = await Product.updateOne({ name }, { image: `/products/${file}` });
    console.log(r.matchedCount ? "ok       " : "NOT FOUND", name);
  }
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });