// In-memory data. Phase 2: replace with Mongoose models (Category, Product, Quote).
const categories = [
  { id: "fasteners", no: "01", name: "Fasteners & Fixings", blurb: "Bolts, anchors, screws, rivets and washers in bulk packs." },
  { id: "hand-tools", no: "02", name: "Hand Tools", blurb: "Spanners, pliers, hammers, measuring and marking tools." },
  { id: "power-tools", no: "03", name: "Power Tools", blurb: "Drills, grinders, saws and the discs and bits that go with them." },
  { id: "electrical", no: "04", name: "Electrical", blurb: "Cables, switchgear, connectors and testers." },
  { id: "plumbing", no: "05", name: "Plumbing & Pipes", blurb: "PVC, CPVC and GI fittings, valves and thread tape." },
  { id: "adhesives", no: "06", name: "Adhesives & Chemical Sealants", blurb: "Instant access to epoxy resins (Araldite), industrial glues, silicone sealants, rust removers (WD-40), and expanding PU polyurethane foam." },
  { id: "safety", no: "07", name: "Safety & PPE", blurb: "Helmets, gloves, goggles, harnesses and high-visibility wear." },
];

const p = (id, category, name, brand, pack, price, stock, tag) => ({ id, category, name, brand, pack, price, stock, tag });

const products = [
  p("a1", "adhesives", "Araldite Standard Epoxy", "Pidilite", "2 x 15 g tubes", 135, 240, "Epoxy"),
  p("a2", "adhesives", "Araldite Professional Epoxy", "Huntsman", "90 g syringe set", 395, 62, "Epoxy"),
  p("a3", "adhesives", "WD-40 Multi-Use Spray", "WD-40", "420 ml can", 465, 180, "Rust remover"),
  p("a4", "adhesives", "Neutral Cure Silicone Sealant", "Dow", "280 ml cartridge", 210, 310, "Silicone"),
  p("a5", "adhesives", "Expanding PU Foam", "Fischer", "750 ml can", 360, 95, "PU foam"),
  p("a6", "adhesives", "Industrial Contact Adhesive", "Fevicol", "1 L tin", 285, 140, "Glue"),
  p("a7", "adhesives", "Anaerobic Threadlocker (Blue)", "Loctite", "50 ml bottle", 780, 0, "Glue"),
  p("f1", "fasteners", "Hex Bolt M10 x 50 (Zinc)", "Unbrako", "Box of 100", 640, 90, "Bolts"),
  p("f2", "fasteners", "Wedge Anchor 12 x 100", "Hilti", "Box of 50", 1150, 40, "Anchors"),
  p("h1", "hand-tools", "Combination Spanner Set", "Taparia", "12 pcs, 6-32 mm", 1290, 55, "Spanners"),
  p("h2", "hand-tools", "Steel Measuring Tape", "Stanley", "8 m", 345, 120, "Measuring"),
  p("t1", "power-tools", "Angle Grinder 4 in", "Bosch", "720 W", 2650, 18, "Grinders"),
  p("t2", "power-tools", "Cutting Disc 4 in", "Norton", "Pack of 25", 520, 200, "Discs"),
  p("e1", "electrical", "FR Copper Wire 1.5 sq mm", "Polycab", "90 m coil", 1980, 33, "Cable"),
  p("p1", "plumbing", "PTFE Thread Seal Tape", "Generic", "Pack of 10", 120, 400, "Tape"),
  p("s1", "safety", "Safety Helmet with Chin Strap", "Karam", "Each", 280, 75, "Head"),
  p("s2", "safety", "Nitrile Coated Gloves", "Karam", "Pack of 12 pairs", 540, 110, "Hands"),
];

module.exports = { categories, products };
