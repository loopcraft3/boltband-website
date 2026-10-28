"use client";
import { useCallback, useEffect, useState } from "react";

const rupee = (n) => "₹" + Number(n).toLocaleString("en-IN");

async function api(path, token, opts = {}) {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: "Bearer " + token } : {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Request failed."), { status: res.status, data });
  return data;
}

export default function Admin() {
  const [token, setToken] = useState(null); // null = not checked yet
  useEffect(() => { setToken(localStorage.getItem("bb-token") || ""); }, []);
  const logout = () => { localStorage.removeItem("bb-token"); setToken(""); };
  if (token === null) return null;
  return (
    <div className="adm">
      <header className="top"><a className="logo" href="/">Bolt<span>&amp;</span>Bond</a><b>Admin</b>
        {token && <button className="cartbtn" onClick={logout}>Log out</button>}
      </header>
      {token ? <Dashboard token={token} logout={logout} /> : <Login onDone={(t) => { localStorage.setItem("bb-token", t); setToken(t); }} />}
    </div>
  );
}

function Login({ onDone }) {
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault(); setBusy(true); setErr("");
    try { onDone((await api("/api/auth/login", null, { method: "POST", body: JSON.stringify(f) })).token); }
    catch (x) { setErr(x.message); }
    setBusy(false);
  }
  return (
    <form className="loginbox" onSubmit={submit}>
      <h2>Admin login</h2>
      <label>Email<input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="username" /></label>
      <label>Password<input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></label>
      {err && <p className="msg err" role="alert">{err}</p>}
      <button className="add" disabled={busy}>{busy ? "Signing in…" : "Log in"}</button>
    </form>
  );
}

function Dashboard({ token, logout }) {
  const [tab, setTab] = useState("quotes");
  const guard = useCallback((e) => { if (e.status === 401) logout(); return e.message; }, [logout]);
  return (
    <main className="admwrap">
      <div className="tabs">
        <button className={tab === "quotes" ? "on" : ""} onClick={() => setTab("quotes")}>Quote requests</button>
        <button className={tab === "products" ? "on" : ""} onClick={() => setTab("products")}>Products</button>
      </div>
      {tab === "quotes" ? <Quotes token={token} guard={guard} /> : <Products token={token} guard={guard} />}
    </main>
  );
}

function Quotes({ token, guard }) {
  const [list, setList] = useState(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/api/admin/quotes", token).then(setList).catch((e) => setErr(guard(e))); }, [token, guard]);

  async function setStatus(id, status) {
    try {
      const q = await api("/api/admin/quotes/" + id, token, { method: "PATCH", body: JSON.stringify({ status }) });
      setList((l) => l.map((x) => (x.id === id ? q : x)));
    } catch (e) { setErr(guard(e)); }
  }
  if (err) return <p className="msg err">{err}</p>;
  if (!list) return <p className="msg">Loading…</p>;
  if (!list.length) return <p className="msg">No quote requests yet. They'll appear here when customers submit one.</p>;
  return (
    <ul className="qlist">
      {list.map((q) => (
        <li key={q.id} className="card">
          <div className="row"><strong>{q.ref}</strong>
            <select value={q.status} onChange={(e) => setStatus(q.id, e.target.value)} aria-label="Status">
              <option value="new">New</option><option value="contacted">Contacted</option><option value="closed">Closed</option>
            </select>
          </div>
          <p className="meta">{q.name}{q.company ? ` · ${q.company}` : ""} · <a href={`tel:${q.phone}`}>{q.phone}</a></p>
          <ul className="plain">{q.lines.map((l, i) => <li key={i}>{l.qty} × {l.name} <small>{rupee(l.total)}</small></li>)}</ul>
          {q.note && <p className="meta">Note: {q.note}</p>}
          <p><b>{rupee(q.total)}</b> <small>· {new Date(q.createdAt).toLocaleString("en-IN")}</small></p>
        </li>
      ))}
    </ul>
  );
}

const blank = { name: "", brand: "", pack: "", price: "", stock: "", tag: "", category: "" };

function Products({ token, guard }) {
  const [cats, setCats] = useState([]);
  const [list, setList] = useState(null);
  const [form, setForm] = useState(blank);
  const [errs, setErrs] = useState({});
  const [msg, setMsg] = useState("");

  const load = useCallback(() => {
    Promise.all([api("/api/categories"), api("/api/products")]).then(([c, p]) => { setCats(c); setList(p); }).catch((e) => setMsg(guard(e)));
  }, [guard]);
  useEffect(load, [load]);

  async function add(e) {
    e.preventDefault(); setErrs({}); setMsg("");
    try { await api("/api/admin/products", token, { method: "POST", body: JSON.stringify(form) }); setForm(blank); load(); setMsg("Product added."); }
    catch (x) { x.status === 422 ? setErrs(x.data.errors) : setMsg(guard(x)); }
  }
  async function save(p, patch) {
    try { await api("/api/admin/products/" + p.id, token, { method: "PUT", body: JSON.stringify({ ...p, ...patch }) }); setMsg(`Saved ${p.name}.`); load(); }
    catch (x) { setMsg(x.status === 422 ? Object.values(x.data.errors).join(" ") : guard(x)); }
  }
  async function del(p) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api("/api/admin/products/" + p.id, token, { method: "DELETE" }); load(); } catch (x) { setMsg(guard(x)); }
  }
  const inp = (k, label, type = "text") => (
    <label>{label}<input type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} aria-invalid={!!errs[k]} />{errs[k] && <span className="fe">{errs[k]}</span>}</label>
  );

  return (
    <>
      <form className="addform" onSubmit={add} noValidate>
        <h3>Add product</h3>
        <div className="fgrid">
          {inp("name", "Name")}{inp("brand", "Brand")}{inp("pack", "Pack size")}{inp("tag", "Tag")}
          {inp("price", "Price (₹)", "number")}{inp("stock", "Stock", "number")}
          <label>Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} aria-invalid={!!errs.category}>
              <option value="">Select…</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.no}. {c.name}</option>)}
            </select>{errs.category && <span className="fe">{errs.category}</span>}
          </label>
        </div>
        <button className="add">Add product</button>
      </form>
      {msg && <p className="msg" role="status">{msg}</p>}
      {!list ? <p className="msg">Loading…</p> : (
        <div className="tablewrap"><table>
          <thead><tr><th>Product</th><th>Category</th><th>Price ₹</th><th>Stock</th><th></th></tr></thead>
          <tbody>{list.map((p) => <Row key={p.id} p={p} save={save} del={del} />)}</tbody>
        </table></div>
      )}
    </>
  );
}

function Row({ p, save, del }) {
  const [price, setPrice] = useState(p.price);
  const [stock, setStock] = useState(p.stock);
  const dirty = Number(price) !== p.price || Number(stock) !== p.stock;
  return (
    <tr>
      <td><b>{p.name}</b><small>{p.brand} · {p.pack}</small></td>
      <td>{p.category}</td>
      <td><input type="number" value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Price" /></td>
      <td><input type="number" value={stock} onChange={(e) => setStock(e.target.value)} aria-label="Stock" /></td>
      <td className="acts"><button disabled={!dirty} onClick={() => save(p, { price, stock })}>Save</button><button className="danger" onClick={() => del(p)}>Delete</button></td>
    </tr>
  );
}
