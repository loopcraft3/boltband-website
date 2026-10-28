"use client";
import { useEffect, useMemo, useState } from "react";

const rupee = (n) => "₹" + n.toLocaleString("en-IN");

export default function Home() {
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [cat, setCat] = useState("adhesives");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({});
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem("bb-cart") || "{}")); } catch {}
    setReady(true);
    Promise.all([fetch("/api/categories"), fetch("/api/products")])
      .then(async ([a, b]) => {
        if (!a.ok || !b.ok) throw new Error();
        setCats(await a.json());
        setProducts(await b.json());
      })
      .catch(() => setError("Can't reach the product server. Start it with npm run dev and refresh."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (ready) localStorage.setItem("bb-cart", JSON.stringify(cart)); }, [cart, ready]);

  const active = cats.find((c) => c.id === cat);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((x) =>
      s ? [x.name, x.brand, x.tag].some((t) => t.toLowerCase().includes(s)) : x.category === cat
    );
  }, [products, cat, q]);

  const setQty = (id, qty) =>
    setCart((c) => {
      const n = { ...c };
      if (qty <= 0) delete n[id]; else n[id] = Math.min(qty, 999);
      return n;
    });

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ ...products.find((p) => p.id === id), qty }))
    .filter((l) => l.name);
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const total = lines.reduce((s, l) => s + l.qty * l.price, 0);

  return (
    <>
      <header className="top">
        <a className="logo" href="#">Bolt<span>&amp;</span>Bond</a>
        <label className="search">
          <span className="sr">Search products</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Araldite, WD-40, grinder, M10 bolt…" />
        </label>
        <button className="cartbtn" onClick={() => setOpen(true)}>
          Quote list <b>{count}</b>
        </button>
      </header>

      <section className="hero">
        <h1>Stock the job site before the job starts.</h1>
        <p>Seven product lines, bulk pack prices, one quote request. We call you back the same day.</p>
      </section>

      <main className="shop">
        <nav className="cats" aria-label="Categories">
          {cats.map((c) => (
            <button key={c.id} className={c.id === cat && !q ? "on" : ""} onClick={() => { setCat(c.id); setQ(""); }}>
              <i>{c.no}</i><span>{c.name}</span><em>{c.count}</em>
            </button>
          ))}
        </nav>

        <section>
          {error && <p className="msg err" role="alert">{error}</p>}
          {!error && (
            <div className="cathead">
              <h2>{q ? `Results for “${q}”` : active ? `${active.no}. ${active.name}` : "Loading…"}</h2>
              {!q && active && <p>{active.blurb}</p>}
            </div>
          )}
          {loading && <p className="msg">Loading products…</p>}
          {!loading && !error && shown.length === 0 && (
            <p className="msg">No products match “{q}”. Try a brand name or clear the search.</p>
          )}
          <ul className="grid">
            {shown.map((p) => (
              <li key={p.id} className={"card" + (p.stock === 0 ? " out" : "")}>
                <span className="tag">{p.tag}</span>
                <h3>{p.name}</h3>
                <p className="meta">{p.brand} · {p.pack}</p>
                <div className="row">
                  <strong>{rupee(p.price)}</strong>
                  <small>{p.stock === 0 ? "Out of stock" : p.stock < 50 ? `Only ${p.stock} left` : "In stock"}</small>
                </div>
                {cart[p.id] ? (
                  <div className="stepper">
                    <button aria-label="Remove one" onClick={() => setQty(p.id, cart[p.id] - 1)}>−</button>
                    <span>{cart[p.id]} in list</span>
                    <button aria-label="Add one" onClick={() => setQty(p.id, cart[p.id] + 1)}>+</button>
                  </div>
                ) : (
                  <button className="add" disabled={p.stock === 0} onClick={() => setQty(p.id, 1)}>
                    {p.stock === 0 ? "Unavailable" : "Add to quote list"}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>

      {open && <Drawer lines={lines} total={total} setQty={setQty} onClose={() => setOpen(false)} clear={() => setCart({})} />}
    </>
  );
}

function Drawer({ lines, total, setQty, onClose, clear }) {
  const [f, setF] = useState({ name: "", phone: "", company: "", note: "" });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErrs({});
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, items: lines.map((l) => ({ id: l.id, qty: l.qty })) }),
      });
      const data = await res.json();
      if (res.status === 422) setErrs(data.errors);
      else if (!res.ok) setErrs({ form: data.error });
      else { setDone(data); clear(); }
    } catch {
      setErrs({ form: "Can't reach the server. Check your connection and try again." });
    }
    setBusy(false);
  }

  const field = (k, label, props = {}) => (
    <label>{label}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errs[k]} {...props} />
      {errs[k] && <span className="fe">{errs[k]}</span>}
    </label>
  );

  return (
    <div className="scrim" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-label="Quote list" onClick={(e) => e.stopPropagation()}>
        <div className="dh"><h2>Quote list</h2><button onClick={onClose} aria-label="Close">✕</button></div>
        {done ? (
          <div className="done">
            <h3>Quote requested</h3>
            <p>Reference <b>{done.ref}</b> · estimated {rupee(done.total)}. We'll call you to confirm stock and delivery.</p>
            <button className="add" onClick={onClose}>Back to products</button>
          </div>
        ) : lines.length === 0 ? (
          <p className="msg">Your list is empty. Add products and they'll show up here.</p>
        ) : (
          <form onSubmit={submit} noValidate>
            <ul className="lines">
              {lines.map((l) => (
                <li key={l.id}>
                  <div><b>{l.name}</b><small>{l.pack} · {rupee(l.price)}</small></div>
                  <div className="stepper sm">
                    <button type="button" aria-label="Remove one" onClick={() => setQty(l.id, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button type="button" aria-label="Add one" onClick={() => setQty(l.id, l.qty + 1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="tot">Estimated total <b>{rupee(total)}</b></p>
            {errs.items && <p className="msg err">{errs.items}</p>}
            {field("name", "Your name", { autoComplete: "name" })}
            {field("phone", "Mobile number", { inputMode: "numeric", autoComplete: "tel" })}
            {field("company", "Company (optional)")}
            <label>Note (optional)
              <textarea rows={2} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} />
            </label>
            {errs.form && <p className="msg err" role="alert">{errs.form}</p>}
            <button className="add" disabled={busy}>{busy ? "Sending…" : "Request quote"}</button>
          </form>
        )}
      </aside>
    </div>
  );
}
