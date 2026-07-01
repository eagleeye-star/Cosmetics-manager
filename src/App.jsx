import { useState, useEffect, useMemo } from "react";

const STORAGE_KEY = "cosmeticsManager_v1";
const LICENSE_KEY = "cosmeticsManager_v1_license";
const TRIAL_DAYS = 14;
const VALID_KEYS = ["COSM-DEMO-TRIAL-0001", "COSM-AIFARMS-VIP-002"];

function daysLeft(expiry) { if (!expiry) return 0; return Math.max(0, Math.ceil((new Date(expiry) - new Date()) / 86400000)); }
function isExpired(expiry) { if (!expiry) return true; return new Date(expiry) < new Date(); }
function loadLicense() { try { const r = localStorage.getItem(LICENSE_KEY); if (r) return JSON.parse(r); } catch (_) {} return null; }
function saveLicense(lic) { try { localStorage.setItem(LICENSE_KEY, JSON.stringify(lic)); } catch (_) {} }

// ── Brand palette ─────────────────────────────────────────────────────────
const C = {
  bg: "#0d0a0e",
  card: "#17131a",
  surface: "#211d25",
  border: "#2e2833",
  accent: "#d946a8",
  accentDark: "#831843",
  accentLight: "#fce7f3",
  gold: "#f59e0b",
  green: "#22c55e",
  red: "#ef4444",
  blue: "#818cf8",
  text: "#f5f0f7",
  muted: "#9d8fa8",
  soft: "#c4b5d4",
};

// ── Seed Data ─────────────────────────────────────────────────────────────
const CATEGORIES = ["Foundation","Lipstick","Eyeshadow","Mascara","Skincare","Fragrance","Nail Care","Hair Care","Tools & Brushes","Sets & Gifts"];

const seedBrands = [
  { id:"br1", name:"MAC",         country:"USA",    tier:"Premium"   },
  { id:"br2", name:"Maybelline",  country:"USA",    tier:"Mid-range" },
  { id:"br3", name:"Fenty Beauty",country:"USA",    tier:"Premium"   },
  { id:"br4", name:"NYX",         country:"USA",    tier:"Mid-range" },
  { id:"br5", name:"Lush",        country:"UK",     tier:"Natural"   },
  { id:"br6", name:"Zaron",       country:"Ghana",  tier:"Local"     },
  { id:"br7", name:"Black Opal",  country:"USA",    tier:"Mid-range" },
  { id:"br8", name:"OPI",         country:"USA",    tier:"Premium"   },
];

const seedProducts = [
  { id:"p1",  name:"Studio Fix Fluid Foundation", brandId:"br1", category:"Foundation",  sku:"MAC-SFF-01", qty:18, minQty:5,  costPrice:95,  sellPrice:185, supplierId:"s1", shade:"NC42",    size:"30ml" },
  { id:"p2",  name:"Ruby Woo Lipstick",           brandId:"br1", category:"Lipstick",    sku:"MAC-RWL-01", qty:30, minQty:8,  costPrice:55,  sellPrice:120, supplierId:"s1", shade:"Red",     size:"3g"   },
  { id:"p3",  name:"Fit Me Foundation",           brandId:"br2", category:"Foundation",  sku:"MBL-FMF-01", qty:25, minQty:8,  costPrice:28,  sellPrice:65,  supplierId:"s2", shade:"Natural", size:"30ml" },
  { id:"p4",  name:"Sky High Mascara",            brandId:"br2", category:"Mascara",     sku:"MBL-SHM-01", qty:40, minQty:10, costPrice:22,  sellPrice:55,  supplierId:"s2", shade:"Black",   size:"8ml"  },
  { id:"p5",  name:"Pro Filt'r Foundation",       brandId:"br3", category:"Foundation",  sku:"FTY-PFF-01", qty:12, minQty:5,  costPrice:120, sellPrice:220, supplierId:"s1", shade:"260N",    size:"32ml" },
  { id:"p6",  name:"Gloss Bomb Lip Luminizer",    brandId:"br3", category:"Lipstick",    sku:"FTY-GBL-01", qty:22, minQty:6,  costPrice:60,  sellPrice:125, supplierId:"s1", shade:"Fenty Glow",size:"9ml"},
  { id:"p7",  name:"Lingerie Push-Up Lip",        brandId:"br4", category:"Lipstick",    sku:"NYX-LPL-01", qty:4,  minQty:8,  costPrice:18,  sellPrice:45,  supplierId:"s3", shade:"Nude",    size:"3.5g" },
  { id:"p8",  name:"Vitamin C Glow Serum",        brandId:"br5", category:"Skincare",    sku:"LSH-VCS-01", qty:15, minQty:4,  costPrice:85,  sellPrice:165, supplierId:"s4", shade:"—",       size:"50ml" },
  { id:"p9",  name:"Even True Foundation",        brandId:"br7", category:"Foundation",  sku:"BOP-ETF-01", qty:20, minQty:6,  costPrice:35,  sellPrice:80,  supplierId:"s2", shade:"Caramel", size:"30ml" },
  { id:"p10", name:"Infinite Shine Polish",       brandId:"br8", category:"Nail Care",   sku:"OPI-ISP-01", qty:35, minQty:10, costPrice:25,  sellPrice:60,  supplierId:"s4", shade:"Berry",   size:"15ml" },
  { id:"p11", name:"Zaron Mattifying Powder",     brandId:"br6", category:"Foundation",  sku:"ZRN-ZMP-01", qty:2,  minQty:5,  costPrice:20,  sellPrice:45,  supplierId:"s5", shade:"Deep",    size:"12g"  },
  { id:"p12", name:"12-Pan Eyeshadow Palette",    brandId:"br4", category:"Eyeshadow",   sku:"NYX-ULP-01", qty:8,  minQty:3,  costPrice:45,  sellPrice:95,  supplierId:"s3", shade:"Neutrals",size:"14g" },
  { id:"p13", name:"Argan Oil Hair Serum",        brandId:"br5", category:"Hair Care",   sku:"LSH-AHS-01", qty:10, minQty:4,  costPrice:70,  sellPrice:140, supplierId:"s4", shade:"—",       size:"100ml"},
  { id:"p14", name:"Contour & Highlight Kit",     brandId:"br7", category:"Sets & Gifts",sku:"BOP-CHK-01", qty:6,  minQty:3,  costPrice:55,  sellPrice:120, supplierId:"s2", shade:"Medium",  size:"—"    },
  { id:"p15", name:"Pro Brush Set (12pc)",        brandId:"br1", category:"Tools & Brushes",sku:"MAC-PBS-01",qty:9,minQty:3, costPrice:180, sellPrice:350, supplierId:"s1", shade:"—",       size:"—"    },
];

const seedSuppliers = [
  { id:"s1", name:"Prestige Beauty GH",   contact:"Kwame Asante",  phone:"0244-001-001", email:"prestige@beauty.gh",  location:"Accra",   terms:"Net 30" },
  { id:"s2", name:"Maybelline Distributor",contact:"Ama Boateng",  phone:"0554-002-002", email:"maybeline@dist.gh",   location:"Kumasi",  terms:"Net 15" },
  { id:"s3", name:"NYX Ghana",             contact:"Efua Mensah",  phone:"0200-003-003", email:"nyx@ghana.com",       location:"Accra",   terms:"Net 30" },
  { id:"s4", name:"Natural Beauty Imports",contact:"Yaw Darko",    phone:"0277-004-004", email:"natural@import.gh",   location:"Tema",    terms:"COD"    },
  { id:"s5", name:"Zaron Direct",          contact:"Akosua Tabi",  phone:"0244-005-005", email:"zaron@direct.gh",     location:"Accra",   terms:"Net 7"  },
];

const seedStaff = [
  { id:"st1", name:"Gilbert",  role:"Owner",          commissionRate:0,   pin:"1234" },
  { id:"st2", name:"Abena",    role:"Beauty Advisor", commissionRate:5,   pin:"2222" },
  { id:"st3", name:"Ama",      role:"Beauty Advisor", commissionRate:5,   pin:"3333" },
  { id:"st4", name:"Kweku",    role:"Stock Manager",  commissionRate:2,   pin:"4444" },
];

const seedSales = [
  { id:"sl1", items:[{productId:"p2",name:"Ruby Woo Lipstick",brandName:"MAC",qty:2,unitPrice:120,total:240},{productId:"p6",name:"Gloss Bomb Lip Luminizer",brandName:"Fenty Beauty",qty:1,unitPrice:125,total:125}], subtotal:365, discount:0, total:365, paymentMethod:"Cash", staffId:"st2", staffName:"Abena", date:"2026-06-26", time:"10:15", note:"", commission:18.25 },
  { id:"sl2", items:[{productId:"p5",name:"Pro Filt'r Foundation",brandName:"Fenty Beauty",qty:1,unitPrice:220,total:220},{productId:"p4",name:"Sky High Mascara",brandName:"Maybelline",qty:1,unitPrice:55,total:55}], subtotal:275, discount:10, total:247.5, paymentMethod:"MoMo", staffId:"st3", staffName:"Ama", date:"2026-06-26", time:"11:30", note:"Loyal customer", commission:12.375 },
  { id:"sl3", items:[{productId:"p10",name:"Infinite Shine Polish",brandName:"OPI",qty:3,unitPrice:60,total:180}], subtotal:180, discount:0, total:180, paymentMethod:"Cash", staffId:"st2", staffName:"Abena", date:"2026-06-25", time:"14:00", note:"", commission:9 },
  { id:"sl4", items:[{productId:"p8",name:"Vitamin C Glow Serum",brandName:"Lush",qty:1,unitPrice:165,total:165},{productId:"p13",name:"Argan Oil Hair Serum",brandName:"Lush",qty:1,unitPrice:140,total:140}], subtotal:305, discount:5, total:289.75, paymentMethod:"Card", staffId:"st3", staffName:"Ama", date:"2026-06-25", time:"15:45", note:"", commission:14.4875 },
  { id:"sl5", items:[{productId:"p3",name:"Fit Me Foundation",brandName:"Maybelline",qty:2,unitPrice:65,total:130},{productId:"p12",name:"12-Pan Eyeshadow Palette",brandName:"NYX",qty:1,unitPrice:95,total:95}], subtotal:225, discount:0, total:225, paymentMethod:"Cash", staffId:"st2", staffName:"Abena", date:"2026-06-24", time:"12:00", note:"", commission:11.25 },
];

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = n => `GH₵ ${Number(n).toFixed(2)}`;
const margin = (c, s) => s === 0 ? 0 : Math.round(((s - c) / s) * 100);

function loadData() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); } catch (_) {}
  return { products: seedProducts, brands: seedBrands, suppliers: seedSuppliers, staff: seedStaff, sales: seedSales };
}

// ── Micro-components ──────────────────────────────────────────────────────
const Bdg = ({ bg, tc, children }) =>
  <span style={{ background: bg, color: tc, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{children}</span>;

function Modal({ title, onClose, wide, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={onClose}>
      <div style={{ background: C.card, borderRadius: 16, padding: "26px 28px", width: `min(96vw,${wide ? "740px" : "500px"})`, maxHeight: "92vh", overflowY: "auto", border: `1px solid ${C.border}` }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: C.muted }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const iS = { width: "100%", padding: "9px 11px", border: `1.5px solid ${C.border}`, borderRadius: 8, fontSize: 14, boxSizing: "border-box", outline: "none", background: C.surface, color: C.text };
function Row({ label, children, half }) {
  return <div style={{ marginBottom: 12, gridColumn: half ? "span 1" : "span 2" }}><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.muted, marginBottom: 4 }}>{label}</label>{children}</div>;
}
function Grid2({ children }) { return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>; }

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div style={{ background: C.card, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: color || C.accent }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function StockBar({ qty, min }) {
  const pct = Math.min(100, min > 0 ? (qty / (min * 3)) * 100 : 100);
  const col = qty === 0 ? C.red : qty <= min ? C.gold : C.green;
  return (
    <div style={{ height: 4, background: C.border, borderRadius: 3, overflow: "hidden", width: 70, display: "inline-block" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: col }} />
    </div>
  );
}

function printReceipt(sale, storeName = "My Cosmetics Shop") {
  const w = window.open("", "_blank", "width=400,height=640");
  const discAmt = sale.subtotal * ((sale.discount || 0) / 100);
  w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
    body{font-family:'Courier New',monospace;padding:20px;max-width:320px;margin:0 auto;font-size:13px;color:#111}
    .c{text-align:center}.b{font-weight:bold}.d{border:none;border-top:1px dashed #999;margin:10px 0}
    table{width:100%;border-collapse:collapse}td{padding:3px 0}
  </style></head><body>
  <div class="c b" style="font-size:20px">✨ ${storeName}</div>
  <div class="c" style="font-size:11px;color:#666">${sale.date} ${sale.time} · Ref: ${sale.id?.toUpperCase()}</div>
  <div class="c" style="font-size:11px;color:#666">Served by: ${sale.staffName || "—"} · ${sale.paymentMethod}</div>
  <hr class="d"/>
  <table>${sale.items.map(i => `<tr><td>${i.qty}× ${i.name}<br/><span style="font-size:11px;color:#888">${i.brandName}</span></td><td style="text-align:right">${fmt(i.total)}</td></tr>`).join("")}</table>
  <hr class="d"/>
  <table>
    <tr><td>Subtotal</td><td style="text-align:right">${fmt(sale.subtotal)}</td></tr>
    ${sale.discount ? `<tr><td>Discount (${sale.discount}%)</td><td style="text-align:right;color:red">-${fmt(discAmt)}</td></tr>` : ""}
    <tr><td class="b" style="font-size:15px">TOTAL</td><td class="b" style="text-align:right;font-size:15px">${fmt(sale.total)}</td></tr>
  </table>
  <hr class="d"/>
  <div class="c" style="font-size:11px;color:#666">Thank you for your purchase! 💄<br/>You look amazing!</div>
  <script>window.onload=()=>window.print();</script>
  </body></html>`);
  w.document.close();
}

function exportCSV(data, filename) {
  const csv = data.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${filename}_${today()}.csv`;
  a.click();
}

// ── LICENSE SCREEN ───────────────────────────────────────────────────────────
function LicenseScreen({ onActivate }) {
  const [mode, setMode] = useState("trial");
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");

  const startTrial = () => {
    const expiry = new Date(); expiry.setDate(expiry.getDate() + TRIAL_DAYS);
    const lic = { type: "trial", key: null, expiry: expiry.toISOString(), issued: new Date().toISOString() };
    saveLicense(lic); onActivate(lic);
  };

  const activateKey = () => {
    const k = key.toUpperCase().trim();
    if (!k) { setErr("Enter a license key."); return; }
    const validFormat = /^COSM-[A-Z0-9]{2,8}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(k) || VALID_KEYS.includes(k);
    if (!validFormat) { setErr("Invalid license key. Format: COSM-XXXX-XXXX-XXXX"); return; }
    const planSeg = k.split("-")[1] || "";
    let days = 365;
    if (planSeg === "TRIAL") days = TRIAL_DAYS;
    else if (planSeg === "1M") days = 30;
    else if (planSeg === "6M") days = 182;
    else if (planSeg === "12M") days = 365;
    else if (/^\d+Y$/.test(planSeg)) days = Math.round(parseInt(planSeg) * 365);
    const expiry = new Date(); expiry.setDate(expiry.getDate() + days);
    const lic = { type: "licensed", key: k, expiry: expiry.toISOString(), issued: new Date().toISOString() };
    saveLicense(lic); onActivate(lic);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${C.bg} 0%, ${C.accentDark} 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💄</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.accent }}>Cosmetics Manager</div>
          <div style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>Beauty & Cosmetics Store Manager</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
          <button onClick={() => { setMode("trial"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `2px solid ${C.border}`, background: mode === "trial" ? C.accent : "transparent", color: mode === "trial" ? "#fff" : C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Free Trial</button>
          <button onClick={() => { setMode("activate"); setErr(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 8, border: `2px solid ${C.border}`, background: mode === "activate" ? C.accent : "transparent", color: mode === "activate" ? "#fff" : C.muted, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>Activate License</button>
        </div>

        {mode === "trial" && (
          <div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>
              Start a <strong>{TRIAL_DAYS}-day free trial</strong>. All features unlocked — POS, inventory, brands, staff commission, and reports. No card required.
            </p>
            <div style={{ background: "#3b1f3a", border: `1px solid ${C.gold}`, borderRadius: 8, padding: 12, marginBottom: 16, fontSize: 12, color: "#fcd9a8" }}>
              Trial includes full access. Purchase a license before expiry to keep your data.
            </div>
            <button onClick={startTrial} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Start Free Trial
            </button>
          </div>
        )}

        {mode === "activate" && (
          <div>
            <p style={{ fontSize: 13, color: C.muted, margin: "0 0 10px" }}>Enter your license key to activate.</p>
            <input value={key} onChange={e => { setKey(e.target.value.toUpperCase()); setErr(""); }} onKeyDown={e => e.key === "Enter" && activateKey()}
              placeholder="COSM-XXXX-XXXX-XXXX"
              style={{ width: "100%", padding: 11, border: `2px solid ${C.border}`, borderRadius: 8, fontSize: 14, textAlign: "center", boxSizing: "border-box", letterSpacing: 2, marginBottom: 8, fontFamily: "monospace", background: C.surface, color: C.text, outline: "none" }} />
            {err && <div style={{ color: C.red, fontSize: 12, marginBottom: 8 }}>{err}</div>}
            <button onClick={activateKey} style={{ width: "100%", padding: "13px 0", background: `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`, color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              Activate
            </button>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 12, textAlign: "center" }}>
              To purchase a license, contact: gilbert@aifarms.gh
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function LicenseExpiredScreen({ license, onRenew }) {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#7f1d1d 0%,#991b1b 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "32px 30px", width: "min(94vw,420px)", textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>⏰</div>
        <div style={{ fontSize: 20, fontWeight: 900, color: "#f87171", marginBottom: 6 }}>
          {license.type === "trial" ? "Trial Expired" : "License Expired"}
        </div>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, marginBottom: 20 }}>
          Your {license.type === "trial" ? "free trial" : "license"} ended on {new Date(license.expiry).toLocaleDateString()}.
          Activate a new license key to keep using Cosmetics Manager.
        </p>
        <button onClick={onRenew} style={{ width: "100%", padding: "13px 0", background: "#991b1b", color: "#fff", border: "none", borderRadius: 9, fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
          Activate License
        </button>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────
export default function App() {
  const [license, setLicense] = useState(loadLicense);
  const [db, setDb] = useState(loadData);
  const [view, setView] = useState("pos");
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [toast, setToast] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [catFilter, setCatFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [reportPeriod, setReportPeriod] = useState("today");
  const [activeStaff, setActiveStaff] = useState(db.staff[0]);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (_) {} }, [db]);

  if (!license) return <LicenseScreen onActivate={setLicense} />;
  if (isExpired(license.expiry)) return <LicenseExpiredScreen license={license} onRenew={() => setLicense(null)} />;


  const { products, brands, suppliers, staff, sales } = db;

  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2800); };
  const close = () => { setModal(null); setEditing(null); setForm({}); };
  const fld = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  // Helpers
  const getBrand = id => brands.find(b => b.id === id);
  const getSupplier = id => suppliers.find(s => s.id === id);
  const lowStock = products.filter(p => p.qty <= p.minQty);

  // Today stats
  const todaySales = sales.filter(s => s.date === today());
  const todayRevenue = todaySales.reduce((a, s) => a + s.total, 0);
  const todayCost = todaySales.reduce((a, s) => a + s.items.reduce((b, i) => { const p = products.find(x => x.id === i.productId); return b + (p ? p.costPrice * i.qty : 0); }, 0), 0);
  const todayProfit = todayRevenue - todayCost;
  const todayCommission = todaySales.reduce((a, s) => a + (s.commission || 0), 0);

  // Cart
  const addToCart = p => {
    if (p.qty <= 0) { showToast("Out of stock!", "err"); return; }
    setCartItems(prev => {
      const ex = prev.find(x => x.productId === p.id);
      if (ex) {
        if (ex.qty >= p.qty) { showToast("Max stock reached", "warn"); return prev; }
        return prev.map(x => x.productId === p.id ? { ...x, qty: x.qty + 1, total: (x.qty + 1) * x.unitPrice } : x);
      }
      return [...prev, { productId: p.id, name: p.name, brandName: getBrand(p.brandId)?.name || "", qty: 1, unitPrice: p.sellPrice, total: p.sellPrice }];
    });
  };
  const removeFromCart = id => setCartItems(prev => prev.map(x => x.productId === id && x.qty > 1 ? { ...x, qty: x.qty - 1, total: (x.qty - 1) * x.unitPrice } : x).filter(x => x.qty > 0));
  const cartSubtotal = cartItems.reduce((a, x) => a + x.total, 0);
  const discPct = Number(form.discount) || 0;
  const discAmt = cartSubtotal * (discPct / 100);
  const cartTotal = cartSubtotal - discAmt;
  const commissionEarned = cartTotal * ((activeStaff?.commissionRate || 0) / 100);

  const completeSale = () => {
    if (!cartItems.length) return;
    const sale = {
      id: uid(),
      items: cartItems,
      subtotal: cartSubtotal,
      discount: discPct,
      total: cartTotal,
      paymentMethod: form.paymentMethod || "Cash",
      staffId: activeStaff?.id || "",
      staffName: activeStaff?.name || "",
      date: today(),
      time: new Date().toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" }),
      note: form.saleNote || "",
      commission: commissionEarned,
    };
    setDb(prev => ({
      ...prev,
      sales: [...prev.sales, sale],
      products: prev.products.map(p => {
        const ci = cartItems.find(x => x.productId === p.id);
        return ci ? { ...p, qty: p.qty - ci.qty } : p;
      }),
    }));
    printReceipt(sale);
    setCartItems([]);
    setForm({});
    showToast(`Sale complete — ${fmt(cartTotal)}`);
  };

  // Product CRUD
  const saveProduct = () => {
    const p = { id: editing ? editing.id : uid(), name: form.pname || "", brandId: form.pbrand || "", category: form.pcat || "Lipstick", sku: form.psku || "", qty: Number(form.pqty) || 0, minQty: Number(form.pmin) || 3, costPrice: Number(form.pcost) || 0, sellPrice: Number(form.psell) || 0, supplierId: form.psupp || "", shade: form.pshade || "—", size: form.psize || "—" };
    setDb(prev => ({ ...prev, products: editing ? prev.products.map(x => x.id === editing.id ? p : x) : [...prev.products, p] }));
    showToast(editing ? "Product updated." : "Product added."); close();
  };
  const deleteProduct = id => { setDb(prev => ({ ...prev, products: prev.products.filter(x => x.id !== id) })); showToast("Removed.", "warn"); close(); };
  const restockProduct = () => {
    const add = Number(form.addQty) || 0;
    setDb(prev => ({ ...prev, products: prev.products.map(p => p.id === editing.id ? { ...p, qty: p.qty + add } : p) }));
    showToast(`Restocked +${add} units`); close();
  };

  // Brand CRUD
  const saveBrand = () => {
    const b = { id: editing ? editing.id : uid(), name: form.bname || "", country: form.bcountry || "", tier: form.btier || "Mid-range" };
    setDb(prev => ({ ...prev, brands: editing ? prev.brands.map(x => x.id === editing.id ? b : x) : [...prev.brands, b] }));
    showToast(editing ? "Brand updated." : "Brand added."); close();
  };

  // Supplier CRUD
  const saveSupplier = () => {
    const s = { id: editing ? editing.id : uid(), name: form.sname || "", contact: form.scontact || "", phone: form.sphone || "", email: form.semail || "", location: form.sloc || "", terms: form.sterms || "COD" };
    setDb(prev => ({ ...prev, suppliers: editing ? prev.suppliers.map(x => x.id === editing.id ? s : x) : [...prev.suppliers, s] }));
    showToast(editing ? "Supplier updated." : "Supplier added."); close();
  };

  // Staff CRUD
  const saveStaff = () => {
    const s = { id: editing ? editing.id : uid(), name: form.stname || "", role: form.strole || "Beauty Advisor", commissionRate: Number(form.stcomm) || 0, pin: form.stpin || "0000" };
    setDb(prev => ({ ...prev, staff: editing ? prev.staff.map(x => x.id === editing.id ? s : x) : [...prev.staff, s] }));
    showToast(editing ? "Updated." : "Staff added."); close();
  };

  // Report data
  const reportSales = useMemo(() => {
    if (reportPeriod === "today") return todaySales;
    const days = reportPeriod === "week" ? 7 : 30;
    const cut = new Date("2026-06-26"); cut.setDate(cut.getDate() - days + 1);
    return sales.filter(s => new Date(s.date) >= cut);
  }, [sales, reportPeriod, todaySales]);

  const repRevenue = reportSales.reduce((a, s) => a + s.total, 0);
  const repCost = reportSales.reduce((a, s) => a + s.items.reduce((b, i) => { const p = products.find(x => x.id === i.productId); return b + (p ? p.costPrice * i.qty : 0); }, 0), 0);
  const repProfit = repRevenue - repCost;
  const repCommission = reportSales.reduce((a, s) => a + (s.commission || 0), 0);

  const topProducts = useMemo(() => {
    const map = {};
    reportSales.forEach(s => s.items.forEach(i => { map[i.name] = (map[i.name] || 0) + i.qty; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [reportSales]);

  const staffPerf = useMemo(() => staff.map(s => {
    const sSales = reportSales.filter(x => x.staffId === s.id);
    return { ...s, salesCount: sSales.length, revenue: sSales.reduce((a, x) => a + x.total, 0), commission: sSales.reduce((a, x) => a + (x.commission || 0), 0) };
  }).sort((a, b) => b.revenue - a.revenue), [staff, reportSales]);

  const chartDays = reportPeriod === "today" ? 1 : reportPeriod === "week" ? 7 : 14;
  const chartData = useMemo(() => Array.from({ length: chartDays }, (_, i) => {
    const d = new Date("2026-06-26"); d.setDate(d.getDate() - (chartDays - 1 - i));
    const ds = d.toISOString().slice(0, 10);
    return { l: ds.slice(5), v: reportSales.filter(s => s.date === ds).reduce((a, s) => a + s.total, 0) };
  }), [reportSales, chartDays]);
  const maxBar = Math.max(...chartData.map(d => d.v), 1);

  // Filtered products for POS & inventory
  const filteredProducts = products.filter(p => {
    const matchCat = catFilter === "All" || p.category === catFilter;
    const brand = getBrand(p.brandId);
    const matchSearch = !searchQ || p.name.toLowerCase().includes(searchQ.toLowerCase()) || brand?.name.toLowerCase().includes(searchQ.toLowerCase()) || p.sku.toLowerCase().includes(searchQ.toLowerCase()) || p.shade.toLowerCase().includes(searchQ.toLowerCase());
    return matchCat && matchSearch;
  });

  const toastBg = { ok: C.green, warn: C.gold, err: C.red };
  const tierColor = t => t === "Premium" ? C.gold : t === "Natural" ? C.green : t === "Local" ? C.blue : C.soft;

  const navItems = [
    { id: "pos",       label: "💄 POS / Sell"                                           },
    { id: "products",  label: "📦 Products"                                              },
    { id: "inventory", label: `🔔 Stock${lowStock.length ? ` (${lowStock.length})` : ""}` },
    { id: "brands",    label: "✨ Brands"                                                },
    { id: "suppliers", label: "🚚 Suppliers"                                             },
    { id: "staff",     label: "👥 Staff"                                                 },
    { id: "sales",     label: "🧾 Sales History"                                         },
    { id: "reports",   label: "📊 Reports"                                               },
    { id: "backup",    label: "💾 Backup"                                                },
  ];

  return (
    <div style={{ fontFamily: "'Inter','Segoe UI',sans-serif", background: C.bg, minHeight: "100vh", color: C.text }}>

      {toast && <div style={{ position: "fixed", top: 16, right: 16, zIndex: 999, background: toastBg[toast.type], color: "#fff", padding: "11px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, boxShadow: "0 4px 24px rgba(0,0,0,0.5)" }}>{toast.msg}</div>}

      {/* HEADER */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.accent, letterSpacing: -0.5 }}>💄 Cosmetics Manager</div>
            <div style={{ fontSize: 12, color: C.muted }}>
              Staff:&nbsp;
              <select value={activeStaff?.id || ""} onChange={e => setActiveStaff(staff.find(s => s.id === e.target.value))}
                style={{ background: "transparent", color: C.soft, border: "none", fontSize: 12, cursor: "pointer", outline: "none" }}>
                {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
              </select>
              {activeStaff?.commissionRate > 0 && <span style={{ color: C.accent }}> · {activeStaff.commissionRate}% commission</span>}
            </div>
            {license.type === "trial" && <div style={{ fontSize: 11, marginTop: 4, color: C.gold, background: "#3b1f3a", borderRadius: 6, padding: "2px 8px", display: "inline-block" }}>Trial: {daysLeft(license.expiry)} days left</div>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <StatCard label="Today's Revenue" value={fmt(todayRevenue)} color={C.accent} icon="💰" />
            <StatCard label="Today's Profit" value={fmt(todayProfit)} color={C.green} icon="📈" />
            <StatCard label="Commission Due" value={fmt(todayCommission)} color={C.gold} icon="⭐" />
            <StatCard label="Low Stock" value={lowStock.length} color={lowStock.length > 0 ? C.red : C.green} icon="📦" />
          </div>
        </div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {navItems.map(n => (
            <button key={n.id} onClick={() => setView(n.id)}
              style={{ background: view === n.id ? C.accent : "transparent", color: view === n.id ? "#fff" : C.muted, border: "none", borderRadius: 8, padding: "8px 14px", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              {n.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>

        {/* ── POS ── */}
        {view === "pos" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 16 }}>
            {/* Product grid */}
            <div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search product, brand, SKU, shade…"
                  style={{ ...iS, maxWidth: 280, flex: 1 }} />
              </div>
              <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                {["All", ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)}
                    style={{ background: catFilter === c ? C.accent : "transparent", color: catFilter === c ? "#fff" : C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>{c}</button>
                ))}
              </div>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill,minmax(175px,1fr))" }}>
                {filteredProducts.map(p => {
                  const brand = getBrand(p.brandId);
                  const inCart = cartItems.find(x => x.productId === p.id);
                  const isOut = p.qty === 0;
                  return (
                    <button key={p.id} onClick={() => !isOut && addToCart(p)} disabled={isOut}
                      style={{ background: inCart ? C.accentDark + "55" : C.card, border: `1.5px solid ${inCart ? C.accent : C.border}`, borderRadius: 12, padding: 14, cursor: isOut ? "not-allowed" : "pointer", textAlign: "left", opacity: isOut ? 0.5 : 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <Bdg bg={C.surface} tc={C.muted}>{p.category}</Bdg>
                        {inCart && <Bdg bg={C.accent} tc="#fff">×{inCart.qty}</Bdg>}
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.text, marginBottom: 2 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{brand?.name} {p.shade !== "—" ? `· ${p.shade}` : ""}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.accent }}>{fmt(p.sellPrice)}</div>
                        <div style={{ fontSize: 11, color: p.qty <= p.minQty ? C.gold : C.muted }}>{isOut ? "OUT" : `${p.qty} left`}</div>
                      </div>
                    </button>
                  );
                })}
                {filteredProducts.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: C.muted }}>No products found.</div>}
              </div>
            </div>

            {/* Cart */}
            <div style={{ background: C.card, borderRadius: 14, padding: 18, border: `1px solid ${C.border}`, height: "fit-content", position: "sticky", top: 20 }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: C.accent, marginBottom: 14 }}>🛒 Current Sale</div>
              <div style={{ minHeight: 120, maxHeight: 280, overflowY: "auto", marginBottom: 14 }}>
                {cartItems.length === 0 && <div style={{ textAlign: "center", color: C.muted, padding: 32, fontSize: 13 }}>Tap a product to add it</div>}
                {cartItems.map(item => (
                  <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{item.brandName} · {fmt(item.unitPrice)}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => removeFromCart(item.productId)} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 5, width: 24, height: 24, cursor: "pointer", fontWeight: 800, fontSize: 14 }}>−</button>
                      <span style={{ fontWeight: 800, color: C.accent, minWidth: 18, textAlign: "center" }}>{item.qty}</span>
                      <button onClick={() => addToCart(products.find(p => p.id === item.productId))} style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 5, width: 24, height: 24, cursor: "pointer", fontWeight: 800, fontSize: 14 }}>+</button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 60, textAlign: "right" }}>{fmt(item.total)}</div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                <Grid2>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>Discount %</label>
                    <input style={iS} type="number" min="0" max="100" placeholder="0" value={form.discount || ""} onChange={fld("discount")} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>Payment</label>
                    <select style={iS} value={form.paymentMethod || "Cash"} onChange={fld("paymentMethod")}>
                      {["Cash", "MoMo", "Card", "Bank Transfer"].map(m => <option key={m}>{m}</option>)}
                    </select>
                  </div>
                </Grid2>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 3 }}>Note</label>
                  <input style={iS} type="text" placeholder="Customer name, note…" value={form.saleNote || ""} onChange={fld("saleNote")} />
                </div>
                <div style={{ background: C.surface, borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.muted, marginBottom: 4 }}>
                    <span>Subtotal</span><span>{fmt(cartSubtotal)}</span>
                  </div>
                  {discPct > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.gold, marginBottom: 4 }}>
                    <span>Discount ({discPct}%)</span><span>-{fmt(discAmt)}</span>
                  </div>}
                  {activeStaff?.commissionRate > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.blue, marginBottom: 4 }}>
                    <span>Commission ({activeStaff.commissionRate}%)</span><span>{fmt(commissionEarned)}</span>
                  </div>}
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 900, color: C.accent, borderTop: `1px solid ${C.border}`, paddingTop: 8, marginTop: 8 }}>
                    <span>TOTAL</span><span>{fmt(cartTotal)}</span>
                  </div>
                </div>
                <button onClick={completeSale} disabled={!cartItems.length}
                  style={{ width: "100%", background: cartItems.length ? C.accent : C.surface, color: cartItems.length ? "#fff" : C.muted, border: "none", borderRadius: 10, padding: "13px 0", fontWeight: 900, cursor: cartItems.length ? "pointer" : "default", fontSize: 15 }}>
                  ✓ Complete Sale & Print Receipt
                </button>
                {cartItems.length > 0 && <button onClick={() => { setCartItems([]); setForm({}); }} style={{ width: "100%", background: "transparent", color: C.red, border: `1px solid ${C.red}33`, borderRadius: 8, padding: "8px 0", fontWeight: 700, cursor: "pointer", fontSize: 13, marginTop: 8 }}>Clear Cart</button>}
              </div>
            </div>
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {view === "products" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>📦 Product Catalogue ({products.length})</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => exportCSV([["Name","Brand","Category","SKU","Shade","Size","Qty","Cost","Sell","Margin%","Supplier"],...products.map(p=>[p.name,getBrand(p.brandId)?.name||"",p.category,p.sku,p.shade,p.size,p.qty,p.costPrice,p.sellPrice,margin(p.costPrice,p.sellPrice)+"%",getSupplier(p.supplierId)?.name||""])], "products")}
                  style={{ background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>⬇ Export</button>
                <button onClick={() => { setEditing(null); setForm({ pcat: "Lipstick" }); setModal("editProduct"); }}
                  style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Add Product</button>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search name, SKU, brand, shade…" style={{ ...iS, maxWidth: 300, flex: 1 }} />
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {["All", ...CATEGORIES].map(c => (
                  <button key={c} onClick={() => setCatFilter(c)} style={{ background: catFilter === c ? C.accent : "transparent", color: catFilter === c ? "#fff" : C.muted, border: `1px solid ${C.border}`, borderRadius: 20, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ background: C.surface }}>
                  {["Product", "Brand", "SKU", "Shade", "Size", "Stock", "Cost", "Price", "Margin", "Supplier", ""].map(h => (
                    <th key={h} style={{ padding: "10px 11px", textAlign: "left", fontSize: 11, fontWeight: 700, color: C.muted, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredProducts.length === 0 && <tr><td colSpan={11} style={{ padding: 28, textAlign: "center", color: C.muted }}>No products found.</td></tr>}
                  {filteredProducts.map((p, i) => {
                    const brand = getBrand(p.brandId);
                    const supp = getSupplier(p.supplierId);
                    const mgn = margin(p.costPrice, p.sellPrice);
                    const isLow = p.qty <= p.minQty, isOut = p.qty === 0;
                    return (
                      <tr key={p.id} style={{ borderTop: `1px solid ${C.border}`, background: i % 2 === 0 ? C.card : C.surface }}>
                        <td style={{ padding: "10px 11px", fontWeight: 600, color: C.text, fontSize: 13 }}>{p.name}</td>
                        <td style={{ padding: "10px 11px" }}><Bdg bg={tierColor(brand?.tier) + "22"} tc={tierColor(brand?.tier)}>{brand?.name || "—"}</Bdg></td>
                        <td style={{ padding: "10px 11px", fontSize: 11, color: C.muted, fontFamily: "monospace" }}>{p.sku}</td>
                        <td style={{ padding: "10px 11px", fontSize: 12, color: C.soft }}>{p.shade}</td>
                        <td style={{ padding: "10px 11px", fontSize: 12, color: C.muted }}>{p.size}</td>
                        <td style={{ padding: "10px 11px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: isOut ? C.red : isLow ? C.gold : C.text }}>{p.qty}</span>
                            <StockBar qty={p.qty} min={p.minQty} />
                            {isOut && <Bdg bg="#7f1d1d" tc={C.red}>OUT</Bdg>}
                            {!isOut && isLow && <Bdg bg="#92400e33" tc={C.gold}>LOW</Bdg>}
                          </div>
                        </td>
                        <td style={{ padding: "10px 11px", fontSize: 12, color: C.muted }}>{fmt(p.costPrice)}</td>
                        <td style={{ padding: "10px 11px", fontWeight: 700, color: C.accent, fontSize: 13 }}>{fmt(p.sellPrice)}</td>
                        <td style={{ padding: "10px 11px" }}><Bdg bg={mgn >= 40 ? "#14532d" : mgn >= 20 ? "#92400e33" : "#7f1d1d33"} tc={mgn >= 40 ? C.green : mgn >= 20 ? C.gold : C.red}>{mgn}%</Bdg></td>
                        <td style={{ padding: "10px 11px", fontSize: 12, color: C.muted }}>{supp?.name || "—"}</td>
                        <td style={{ padding: "10px 11px" }}>
                          <div style={{ display: "flex", gap: 5 }}>
                            <button onClick={() => { setEditing(p); setForm({}); setModal("restock"); }} style={{ background: "#14532d", color: C.green, border: "none", borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>+Stock</button>
                            <button onClick={() => { setEditing(p); setForm({ pname: p.name, pbrand: p.brandId, pcat: p.category, psku: p.sku, pqty: p.qty, pmin: p.minQty, pcost: p.costPrice, psell: p.sellPrice, psupp: p.supplierId, pshade: p.shade, psize: p.size }); setModal("editProduct"); }}
                              style={{ background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 6, padding: "3px 9px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── INVENTORY ALERTS ── */}
        {view === "inventory" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 14 }}>🔔 Stock Alerts & Inventory</div>
            {lowStock.length === 0
              ? <div style={{ background: "#14532d33", border: `1px solid ${C.green}44`, borderRadius: 12, padding: 24, color: C.green, fontWeight: 600, textAlign: "center" }}>✅ All products are well stocked!</div>
              : (
                <>
                  <div style={{ background: "#7f1d1d33", border: `1px solid ${C.red}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, color: C.red, marginBottom: 8 }}>⚠️ {lowStock.length} product{lowStock.length > 1 ? "s" : ""} need restocking</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{lowStock.map(p => <Bdg key={p.id} bg="#7f1d1d" tc={C.red}>{p.name}: {p.qty} left</Bdg>)}</div>
                  </div>
                  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
                    {lowStock.map(p => {
                      const brand = getBrand(p.brandId);
                      const supp = getSupplier(p.supplierId);
                      return (
                        <div key={p.id} style={{ background: C.card, borderRadius: 12, padding: 18, border: `2px solid ${p.qty === 0 ? C.red : C.gold}44` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{p.name}</div>
                              <div style={{ fontSize: 12, color: C.muted }}>{brand?.name} · {p.category}</div>
                            </div>
                            <Bdg bg={p.qty === 0 ? "#7f1d1d" : "#92400e33"} tc={p.qty === 0 ? C.red : C.gold}>{p.qty === 0 ? "OUT OF STOCK" : "LOW STOCK"}</Bdg>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                            <div><span style={{ fontSize: 30, fontWeight: 900, color: p.qty === 0 ? C.red : C.gold }}>{p.qty}</span><span style={{ fontSize: 12, color: C.muted, marginLeft: 4 }}>units left</span></div>
                            <div style={{ textAlign: "right", fontSize: 12, color: C.muted }}><div>Alert at: {p.minQty}</div><div>SKU: {p.sku}</div></div>
                          </div>
                          {supp && (
                            <div style={{ background: C.surface, borderRadius: 8, padding: "8px 12px", marginBottom: 12, fontSize: 12 }}>
                              <div style={{ color: C.soft, fontWeight: 600 }}>🏢 {supp.name}</div>
                              <div style={{ color: C.muted }}>📞 {supp.phone}</div>
                              {supp.phone && <a href={`https://wa.me/233${supp.phone.replace(/^0/, "").replace(/[-\s]/g, "")}`} target="_blank" rel="noreferrer"
                                style={{ display: "inline-block", marginTop: 4, background: "#25D366", color: "#fff", borderRadius: 5, padding: "2px 10px", fontSize: 11, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp Supplier</a>}
                            </div>
                          )}
                          <button onClick={() => { setEditing(p); setForm({}); setModal("restock"); }}
                            style={{ width: "100%", background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 0", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>Restock Now</button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            }
          </>
        )}

        {/* ── BRANDS ── */}
        {view === "brands" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>✨ Brand Management</div>
              <button onClick={() => { setEditing(null); setForm({ btier: "Mid-range" }); setModal("editBrand"); }}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Add Brand</button>
            </div>
            <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
              {brands.map(b => {
                const bProds = products.filter(p => p.brandId === b.id);
                const bRevenue = sales.reduce((a, s) => a + s.items.filter(i => { const p = products.find(x => x.id === i.productId); return p?.brandId === b.id; }).reduce((c, i) => c + i.total, 0), 0);
                return (
                  <div key={b.id} style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{b.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>🌍 {b.country}</div>
                      </div>
                      <Bdg bg={tierColor(b.tier) + "22"} tc={tierColor(b.tier)}>{b.tier}</Bdg>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 12 }}>
                      <div><div style={{ fontSize: 10, color: C.muted }}>Products</div><div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{bProds.length}</div></div>
                      <div><div style={{ fontSize: 10, color: C.muted }}>Revenue</div><div style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{fmt(bRevenue)}</div></div>
                    </div>
                    <button onClick={() => { setEditing(b); setForm({ bname: b.name, bcountry: b.country, btier: b.tier }); setModal("editBrand"); }}
                      style={{ width: "100%", background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 7, padding: "6px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── SUPPLIERS ── */}
        {view === "suppliers" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>🚚 Supplier Directory</div>
              <button onClick={() => { setEditing(null); setForm({ sterms: "Net 30" }); setModal("editSupplier"); }}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Add Supplier</button>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
              {suppliers.map(s => {
                const sProds = products.filter(p => p.supplierId === s.id);
                const sLow = sProds.filter(p => p.qty <= p.minQty);
                return (
                  <div key={s.id} style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${sLow.length > 0 ? C.gold + "44" : C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: C.muted }}>👤 {s.contact}</div>
                      </div>
                      <Bdg bg={C.surface} tc={C.soft}>{s.terms}</Bdg>
                    </div>
                    <div style={{ fontSize: 13, color: C.soft, marginBottom: 3 }}>📞 {s.phone}</div>
                    {s.email && <div style={{ fontSize: 12, color: C.muted, marginBottom: 3 }}>✉️ {s.email}</div>}
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 10 }}>📍 {s.location}</div>
                    {sLow.length > 0 && <div style={{ background: "#92400e22", borderRadius: 7, padding: "6px 10px", marginBottom: 10, fontSize: 12, color: C.gold }}>⚠️ {sLow.length} item{sLow.length > 1 ? "s" : ""} need restocking</div>}
                    <div style={{ display: "flex", gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10, marginBottom: 12 }}>
                      <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 10, color: C.muted }}>Products</div><div style={{ fontSize: 16, fontWeight: 800, color: C.accent }}>{sProds.length}</div></div>
                      <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 10, color: C.muted }}>Low Stock</div><div style={{ fontSize: 16, fontWeight: 800, color: sLow.length > 0 ? C.gold : C.green }}>{sLow.length}</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {s.phone && <a href={`https://wa.me/233${s.phone.replace(/^0/, "").replace(/[-\s]/g, "")}`} target="_blank" rel="noreferrer"
                        style={{ flex: 1, textAlign: "center", background: "#25D366", color: "#fff", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>💬 WhatsApp</a>}
                      <button onClick={() => { setEditing(s); setForm({ sname: s.name, scontact: s.contact, sphone: s.phone, semail: s.email, sloc: s.location, sterms: s.terms }); setModal("editSupplier"); }}
                        style={{ flex: 1, background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── STAFF ── */}
        {view === "staff" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>👥 Staff & Commission</div>
              <button onClick={() => { setEditing(null); setForm({ strole: "Beauty Advisor", stcomm: 5 }); setModal("editStaff"); }}
                style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontWeight: 800, cursor: "pointer", fontSize: 13 }}>+ Add Staff</button>
            </div>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))" }}>
              {staffPerf.map(s => (
                <div key={s.id} style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 17, color: C.text }}>{s.name}</div>
                      <Bdg bg={s.role === "Owner" ? C.gold + "33" : C.accent + "22"} tc={s.role === "Owner" ? C.gold : C.accent}>{s.role}</Bdg>
                    </div>
                    <button onClick={() => { setEditing(s); setForm({ stname: s.name, strole: s.role, stcomm: s.commissionRate, stpin: s.pin }); setModal("editStaff"); }}
                      style={{ background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Edit</button>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Commission: <b style={{ color: C.accent }}>{s.commissionRate}%</b> · PIN: {"•".repeat(s.pin?.length || 4)}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 12 }}>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: C.muted }}>Sales</div><div style={{ fontSize: 18, fontWeight: 900, color: C.accent }}>{s.salesCount}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: C.muted }}>Revenue</div><div style={{ fontSize: 12, fontWeight: 800, color: C.green }}>{fmt(s.revenue)}</div></div>
                    <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: C.muted }}>Commission</div><div style={{ fontSize: 12, fontWeight: 800, color: C.gold }}>{fmt(s.commission)}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SALES HISTORY ── */}
        {view === "sales" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>🧾 Sales History</div>
                <div style={{ fontSize: 13, color: C.muted }}>{sales.length} transactions · Total: <b style={{ color: C.accent }}>{fmt(sales.reduce((a, s) => a + s.total, 0))}</b></div>
              </div>
              <button onClick={() => exportCSV([["Date","Time","Items","Subtotal","Discount%","Total","Payment","Staff","Commission","Note"],...[...sales].reverse().map(s=>[s.date,s.time,s.items.map(i=>`${i.qty}×${i.name}`).join("; "),s.subtotal,s.discount||0,s.total,s.paymentMethod,s.staffName,s.commission?.toFixed(2)||0,s.note||""])], "sales_history")}
                style={{ background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>⬇ Export CSV</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[...sales].reverse().map((s, i) => (
                <div key={s.id} style={{ background: C.card, borderRadius: 12, padding: 16, border: `1px solid ${C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{s.date} {s.time} · {s.staffName}</div>
                      <div style={{ fontSize: 12, color: C.muted }}>{s.paymentMethod}{s.note ? ` · ${s.note}` : ""}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {s.discount > 0 && <Bdg bg="#92400e33" tc={C.gold}>{s.discount}% off</Bdg>}
                      <div style={{ fontSize: 17, fontWeight: 900, color: C.accent }}>{fmt(s.total)}</div>
                      <button onClick={() => printReceipt(s)} style={{ background: C.surface, color: C.soft, border: `1px solid ${C.border}`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🖨 Receipt</button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {s.items.map((item, j) => (
                      <span key={j} style={{ background: C.surface, borderRadius: 6, padding: "3px 10px", fontSize: 12, color: C.soft }}>{item.qty}× {item.name} <span style={{ color: C.muted }}>({item.brandName})</span></span>
                    ))}
                  </div>
                  {s.commission > 0 && <div style={{ fontSize: 11, color: C.gold, marginTop: 8 }}>⭐ Commission: {fmt(s.commission)}</div>}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── REPORTS ── */}
        {view === "reports" && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <div style={{ fontWeight: 800, fontSize: 17 }}>📊 Sales Reports & Analytics</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[["today", "Today"], ["week", "7 Days"], ["month", "30 Days"]].map(([k, l]) => (
                  <button key={k} onClick={() => setReportPeriod(k)} style={{ background: reportPeriod === k ? C.accent : "transparent", color: reportPeriod === k ? "#fff" : C.muted, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 14px", fontWeight: 700, cursor: "pointer", fontSize: 12 }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 16 }}>
              {[
                { label: "Revenue", value: fmt(repRevenue), color: C.accent, icon: "💰" },
                { label: "Gross Profit", value: fmt(repProfit), color: C.green, icon: "📈" },
                { label: "Transactions", value: reportSales.length, color: C.blue, icon: "🧾" },
                { label: "Avg. Sale", value: fmt(reportSales.length ? repRevenue / reportSales.length : 0), color: C.soft, icon: "📊" },
                { label: "Profit Margin", value: repRevenue > 0 ? Math.round((repProfit / repRevenue) * 100) + "%" : "0%", color: C.green, icon: "%" },
                { label: "Commission", value: fmt(repCommission), color: C.gold, icon: "⭐" },
              ].map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Chart */}
            <div style={{ background: C.card, borderRadius: 12, padding: 18, marginBottom: 14, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 14 }}>📈 Revenue Trend</div>
              {chartData.every(d => d.v === 0)
                ? <div style={{ textAlign: "center", color: C.muted, padding: 28 }}>No sales in this period.</div>
                : <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 140, paddingBottom: 22 }}>
                  {chartData.map((d, i) => {
                    const h = Math.max(4, (d.v / maxBar) * 116);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <div title={fmt(d.v)} style={{ width: "100%", height: h, background: C.accent, borderRadius: "4px 4px 0 0", opacity: 0.85 }} />
                        <div style={{ fontSize: 9, color: C.muted, transform: "rotate(-30deg)", transformOrigin: "top center", whiteSpace: "nowrap" }}>{d.l}</div>
                      </div>
                    );
                  })}
                </div>
              }
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              {/* Top products */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 14 }}>🏆 Top Selling Products</div>
                {topProducts.length === 0 ? <div style={{ color: C.muted, textAlign: "center", padding: 16 }}>No data.</div>
                  : topProducts.map(([name, qty], i) => {
                    const max = topProducts[0][1];
                    return (
                      <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 22, fontSize: 13, fontWeight: 700, color: i === 0 ? C.gold : C.muted, textAlign: "center" }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                          <div style={{ height: 5, background: C.border, borderRadius: 3, marginTop: 3 }}><div style={{ width: `${(qty / max) * 100}%`, height: "100%", background: C.accent, borderRadius: 3 }} /></div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, whiteSpace: "nowrap" }}>{qty} sold</div>
                      </div>
                    );
                  })}
              </div>

              {/* Staff performance */}
              <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 14 }}>⭐ Staff Performance</div>
                {staffPerf.map(s => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${C.border}` }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{s.name} <span style={{ fontSize: 11, color: C.muted }}>({s.role})</span></div>
                      <div style={{ fontSize: 11, color: C.muted }}>{s.salesCount} sales · Commission: <span style={{ color: C.gold }}>{fmt(s.commission)}</span></div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.green }}>{fmt(s.revenue)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand performance */}
            <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.text, marginBottom: 14 }}>✨ Revenue by Brand</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 10 }}>
                {brands.map(b => {
                  const bRev = reportSales.reduce((a, s) => a + s.items.filter(i => { const p = products.find(x => x.id === i.productId); return p?.brandId === b.id; }).reduce((c, i) => c + i.total, 0), 0);
                  if (bRev === 0) return null;
                  return (
                    <div key={b.id} style={{ background: C.surface, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{b.name}</div>
                      <Bdg bg={tierColor(b.tier) + "22"} tc={tierColor(b.tier)}>{b.tier}</Bdg>
                      <div style={{ fontSize: 17, fontWeight: 900, color: C.accent, marginTop: 8 }}>{fmt(bRev)}</div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          </>
        )}

        {view === "backup" && (() => {
          const [confirmRestore, setConfirmRestore] = useState(null);
          const [fileError, setFileError] = useState("");
          const stats2 = [["Products", products.length], ["Sales", sales.length], ["Brands", brands.length], ["Staff", staff.length]];
          const download = () => {
            const blob = new Blob([JSON.stringify({ app: "Cosmetics Manager", exportedAt: new Date().toISOString(), version: 1, data: db }, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `Cosmetics-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            showToast("Backup downloaded", "ok");
          };
          const onFile = (e) => {
            const file = e.target.files?.[0]; if (!file) return; setFileError("");
            const reader = new FileReader();
            reader.onload = () => { try { const p = JSON.parse(reader.result); if (!p.data) { setFileError("Not a valid backup file."); return; } setConfirmRestore(p); } catch { setFileError("Could not read file."); } };
            reader.readAsText(file); e.target.value = "";
          };
          return (
            <>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 6 }}>💾 Backup & Restore</div>
              <p style={{ color: C.muted, fontSize: 13, marginBottom: 20, maxWidth: 560, lineHeight: 1.6 }}>All data lives only in this browser. Download a backup regularly and store it in Google Drive, email, or a USB drive.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 800, marginBottom: 12 }}>⬇️ Export Backup</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>{stats2.map(([l,v]) => <div key={l} style={{ background: C.surface, borderRadius: 7, padding: "8px 10px" }}><div style={{ fontSize: 10, color: C.muted }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div></div>)}</div>
                  <button onClick={download} style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 700, cursor: "pointer", width: "100%" }}>⬇️ Download Backup File</button>
                </div>
                <div style={{ background: C.card, borderRadius: 12, padding: 18, border: `1px solid ${C.border}` }}>
                  <div style={{ fontWeight: 800, marginBottom: 10 }}>⬆️ Restore from Backup</div>
                  <div style={{ background: "#3b1f3a", border: `1px solid ${C.gold}`, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: "#fcd9a8" }}>⚠️ Restoring overwrites all data. Export first if needed.</div>
                  <label style={{ display: "block", textAlign: "center", padding: "9px 16px", borderRadius: 8, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", fontWeight: 600 }}>Choose Backup File… <input type="file" accept="application/json" onChange={onFile} style={{ display: "none" }} /></label>
                  {fileError && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{fileError}</div>}
                </div>
              </div>
              {confirmRestore && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }} onClick={() => setConfirmRestore(null)}>
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28, width: "min(94vw,400px)" }} onClick={e => e.stopPropagation()}>
                    <h3 style={{ margin: "0 0 12px", color: C.accent }}>Confirm Restore</h3>
                    <p style={{ fontSize: 13, color: C.muted, marginBottom: 16 }}>Backup from <strong style={{ color: C.text }}>{new Date(confirmRestore.exportedAt).toLocaleString()}</strong>. This replaces all current data and cannot be undone.</p>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button onClick={() => setConfirmRestore(null)} style={{ flex: 1, background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 0", color: C.muted, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
                      <button onClick={() => { setDb(confirmRestore.data); setConfirmRestore(null); showToast("Data restored", "ok"); }} style={{ flex: 1, background: "#991b1b", color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>Yes, Restore</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════ */}

      {modal === "editProduct" && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={close} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={{ gridColumn: "span 2" }}><Row label="Product Name"><input style={iS} type="text" value={form.pname || ""} onChange={fld("pname")} /></Row></div>
            <Row label="Brand"><select style={iS} value={form.pbrand || ""} onChange={fld("pbrand")}><option value="">— Select Brand —</option>{brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></Row>
            <Row label="Category"><select style={iS} value={form.pcat || "Lipstick"} onChange={fld("pcat")}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Row>
            <Row label="SKU"><input style={iS} type="text" placeholder="e.g. MAC-RWL-01" value={form.psku || ""} onChange={fld("psku")} /></Row>
            <Row label="Supplier"><select style={iS} value={form.psupp || ""} onChange={fld("psupp")}><option value="">— Select Supplier —</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Row>
            <Row label="Shade / Colour"><input style={iS} type="text" placeholder="e.g. Ruby Red, NC42" value={form.pshade || ""} onChange={fld("pshade")} /></Row>
            <Row label="Size"><input style={iS} type="text" placeholder="e.g. 30ml, 3g" value={form.psize || ""} onChange={fld("psize")} /></Row>
            <Row label="Quantity in Stock"><input style={iS} type="number" value={form.pqty ?? ""} onChange={fld("pqty")} /></Row>
            <Row label="Low Stock Alert (qty)"><input style={iS} type="number" value={form.pmin ?? 3} onChange={fld("pmin")} /></Row>
            <Row label="Cost Price (GH₵)"><input style={iS} type="number" value={form.pcost ?? ""} onChange={fld("pcost")} /></Row>
            <Row label="Selling Price (GH₵)"><input style={iS} type="number" value={form.psell ?? ""} onChange={fld("psell")} /></Row>
          </div>
          {form.pcost && form.psell && (
            <div style={{ background: "#14532d33", borderRadius: 8, padding: "9px 14px", marginBottom: 12, fontSize: 13, color: C.green }}>
              Margin: <b>{margin(Number(form.pcost), Number(form.psell))}%</b> · Profit per unit: <b>{fmt(Number(form.psell) - Number(form.pcost))}</b>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={saveProduct} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 800, cursor: "pointer" }}>{editing ? "Save Changes" : "Add Product"}</button>
            {editing && <button onClick={() => { if (window.confirm("Delete this product?")) deleteProduct(editing.id); }} style={{ background: "#7f1d1d", color: C.red, border: "none", borderRadius: 8, padding: "11px 14px", fontWeight: 800, cursor: "pointer" }}>Delete</button>}
          </div>
        </Modal>
      )}

      {modal === "restock" && editing && (
        <Modal title={`Restock — ${editing.name}`} onClose={close}>
          <div style={{ background: C.surface, borderRadius: 8, padding: "10px 14px", marginBottom: 14, color: C.muted, fontSize: 14 }}>Current stock: <b style={{ color: C.text }}>{editing.qty} units</b> · SKU: {editing.sku}</div>
          <Row label="Add Quantity"><input style={iS} type="number" min="1" placeholder="e.g. 20" value={form.addQty || ""} onChange={fld("addQty")} /></Row>
          <button onClick={restockProduct} style={{ width: "100%", background: C.green, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 800, cursor: "pointer" }}>Confirm Restock</button>
        </Modal>
      )}

      {modal === "editBrand" && (
        <Modal title={editing ? "Edit Brand" : "Add Brand"} onClose={close}>
          <Row label="Brand Name"><input style={iS} type="text" value={form.bname || ""} onChange={fld("bname")} /></Row>
          <Grid2>
            <Row label="Country"><input style={iS} type="text" placeholder="e.g. USA, Ghana" value={form.bcountry || ""} onChange={fld("bcountry")} /></Row>
            <Row label="Tier"><select style={iS} value={form.btier || "Mid-range"} onChange={fld("btier")}>{["Premium", "Mid-range", "Budget", "Natural", "Local"].map(t => <option key={t}>{t}</option>)}</select></Row>
          </Grid2>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={saveBrand} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 800, cursor: "pointer" }}>{editing ? "Save Changes" : "Add Brand"}</button>
            {editing && <button onClick={() => { setDb(prev => ({ ...prev, brands: prev.brands.filter(x => x.id !== editing.id) })); showToast("Brand removed.", "warn"); close(); }} style={{ background: "#7f1d1d", color: C.red, border: "none", borderRadius: 8, padding: "11px 14px", fontWeight: 800, cursor: "pointer" }}>Delete</button>}
          </div>
        </Modal>
      )}

      {modal === "editSupplier" && (
        <Modal title={editing ? "Edit Supplier" : "Add Supplier"} onClose={close}>
          <Row label="Company Name"><input style={iS} type="text" value={form.sname || ""} onChange={fld("sname")} /></Row>
          <Row label="Contact Person"><input style={iS} type="text" value={form.scontact || ""} onChange={fld("scontact")} /></Row>
          <Grid2>
            <Row label="Phone"><input style={iS} type="text" value={form.sphone || ""} onChange={fld("sphone")} /></Row>
            <Row label="Email"><input style={iS} type="email" value={form.semail || ""} onChange={fld("semail")} /></Row>
          </Grid2>
          <Grid2>
            <Row label="Location"><input style={iS} type="text" placeholder="e.g. Accra" value={form.sloc || ""} onChange={fld("sloc")} /></Row>
            <Row label="Payment Terms"><select style={iS} value={form.sterms || "Net 30"} onChange={fld("sterms")}>{["COD", "Net 7", "Net 15", "Net 30", "Net 60"].map(t => <option key={t}>{t}</option>)}</select></Row>
          </Grid2>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={saveSupplier} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 800, cursor: "pointer" }}>{editing ? "Save Changes" : "Add Supplier"}</button>
            {editing && <button onClick={() => { setDb(prev => ({ ...prev, suppliers: prev.suppliers.filter(x => x.id !== editing.id) })); showToast("Removed.", "warn"); close(); }} style={{ background: "#7f1d1d", color: C.red, border: "none", borderRadius: 8, padding: "11px 14px", fontWeight: 800, cursor: "pointer" }}>Delete</button>}
          </div>
        </Modal>
      )}

      {modal === "editStaff" && (
        <Modal title={editing ? "Edit Staff" : "Add Staff"} onClose={close}>
          <Row label="Full Name"><input style={iS} type="text" value={form.stname || ""} onChange={fld("stname")} /></Row>
          <Grid2>
            <Row label="Role"><select style={iS} value={form.strole || "Beauty Advisor"} onChange={fld("strole")}>{["Owner", "Manager", "Beauty Advisor", "Cashier", "Stock Manager"].map(r => <option key={r}>{r}</option>)}</select></Row>
            <Row label="Commission Rate (%)"><input style={iS} type="number" min="0" max="20" step="0.5" value={form.stcomm ?? 5} onChange={fld("stcomm")} /></Row>
          </Grid2>
          <Row label="PIN (4 digits)"><input style={iS} type="password" maxLength={6} value={form.stpin || ""} onChange={fld("stpin")} /></Row>
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={saveStaff} style={{ flex: 1, background: C.accent, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 800, cursor: "pointer" }}>{editing ? "Save Changes" : "Add Staff"}</button>
            {editing && <button onClick={() => { setDb(prev => ({ ...prev, staff: prev.staff.filter(x => x.id !== editing.id) })); showToast("Removed.", "warn"); close(); }} style={{ background: "#7f1d1d", color: C.red, border: "none", borderRadius: 8, padding: "11px 14px", fontWeight: 800, cursor: "pointer" }}>Remove</button>}
          </div>
        </Modal>
      )}
    </div>
  );
}
