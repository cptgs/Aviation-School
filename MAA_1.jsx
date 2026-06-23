import React, { useState, useEffect, useCallback } from "react";
import {
  Plane, Menu, X, Mail, Phone, MapPin, ChevronRight, LayoutDashboard,
  BookOpen, CalendarDays, Bell, LogOut, Clock, GraduationCap, Plus,
  MessageSquare, Users, Megaphone, Send, Shield, Award, CheckCircle2,
  Edit3, Trash2, ClipboardList, User, Lock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Persistent storage helpers (shared "backend" across all roles)     */
/* ------------------------------------------------------------------ */
const DB_KEY = "maa_db_v1";
const SHARED = true;

const seed = () => ({
  users: [
    { id: "S-1042", name: "Batbayar Dorj", role: "student", pass: "1234", program: "CPL", enrolled: "2025-09-01" },
    { id: "S-1043", name: "Sarnai Tseren", role: "student", pass: "1234", program: "PPL ASEL", enrolled: "2026-01-12" },
    { id: "CFI-07", name: "Nergui Bold", role: "cfi", pass: "1234" },
    { id: "ADMIN", name: "Academy Office", role: "admin", pass: "admin" },
  ],
  flights: [
    { id: "F-3001", student: "S-1042", date: "2026-06-10", aircraft: "C172 (JU-1801)", type: "Dual", from: "ZMUB", to: "ZMUB", hours: 1.4, cfi: "CFI-07", comment: "Steep turns improving. Watch altitude on rollout — drifted +120 ft. Pattern work solid.", lesson: "Lesson 14 — Steep turns" },
    { id: "F-3002", student: "S-1042", date: "2026-06-14", aircraft: "C172 (JU-1801)", type: "Dual", from: "ZMUB", to: "ZMCD", hours: 1.8, cfi: "CFI-07", comment: "First XC dual. Good pilotage, slow on radio. Review lost-comms next session.", lesson: "Lesson 15 — XC navigation" },
    { id: "F-3003", student: "S-1043", date: "2026-06-15", aircraft: "C172 (JU-1802)", type: "Dual", from: "ZMUB", to: "ZMUB", hours: 1.1, cfi: "CFI-07", comment: "", lesson: "Lesson 3 — Slow flight" },
  ],
  schedule: [
    { id: "SC-1", student: "S-1042", date: "2026-06-24", time: "08:00", aircraft: "C172 (JU-1801)", cfi: "CFI-07", activity: "XC solo prep", status: "Scheduled" },
    { id: "SC-2", student: "S-1043", date: "2026-06-24", time: "10:30", aircraft: "C172 (JU-1802)", cfi: "CFI-07", activity: "Slow flight & stalls", status: "Scheduled" },
    { id: "SC-3", student: "S-1042", date: "2026-06-26", time: "13:00", aircraft: "C172 (JU-1801)", cfi: "CFI-07", activity: "Ground — Weather theory", status: "Scheduled" },
  ],
  ground: [
    { id: "G-1", student: "S-1042", topic: "Aerodynamics", hours: 6 },
    { id: "G-2", student: "S-1042", topic: "Meteorology", hours: 4 },
    { id: "G-3", student: "S-1042", topic: "Air law", hours: 3 },
    { id: "G-4", student: "S-1043", topic: "Aerodynamics", hours: 2 },
  ],
  notifications: [
    { id: "N-1", date: "2026-06-20", title: "Runway 14/32 maintenance", body: "ZMUB runway closed 06:00–09:00 on June 25. Adjust schedules accordingly." },
    { id: "N-2", date: "2026-06-18", title: "C208 ground school starts July", body: "C208 Initial ground school cohort opens July 7. Sign up at the front office." },
  ],
  messages: [],
});

function loadDB() {
  return seed(); // replaced at runtime by async load
}

/* ------------------------------------------------------------------ */
/*  Brand tokens                                                       */
/* ------------------------------------------------------------------ */
const NAVY = "#0B1F3A";
const NAVY2 = "#13294B";
const SKY = "#2F6FB0";
const GOLD = "#C8A24B";
const PAPER = "#F5F3EC";
const INK = "#11151C";

const PROGRAMS = [
  { code: "PPL", title: "Private Pilot — ASEL", desc: "Airplane Single-Engine Land. Your first licence and the foundation of every rating that follows.", icon: Plane },
  { code: "PPL", title: "Private Pilot — HSEL", desc: "Helicopter Single-Engine Land. Rotary-wing private licence training.", icon: Plane },
  { code: "IR", title: "Instrument Rating", desc: "Fly under IFR in instrument meteorological conditions — precision approaches, holds, and en-route procedures.", icon: Shield },
  { code: "CPL", title: "Commercial Pilot — ASEL", desc: "Fly for compensation. Advanced manoeuvres, complex aircraft, and commercial standards.", icon: Award },
  { code: "CFI", title: "Flight Instructor — ASEL", desc: "Teach the next generation. Fundamentals of instruction and the instructor checkride.", icon: GraduationCap },
  { code: "C208", title: "C208 Initial", desc: "Cessna 208 Caravan initial type training for turbine single-engine operations.", icon: Plane },
];

/* ================================================================== */
/*  ROOT                                                               */
/* ================================================================== */
export default function App() {
  const [db, setDB] = useState(null);
  const [view, setView] = useState("public"); // public | login | portal
  const [session, setSession] = useState(null);

  // load persistent db
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(DB_KEY, SHARED);
        if (res && res.value) setDB(JSON.parse(res.value));
        else {
          const s = seed();
          await window.storage.set(DB_KEY, JSON.stringify(s), SHARED);
          setDB(s);
        }
      } catch {
        setDB(seed());
      }
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setDB(next);
    try { await window.storage.set(DB_KEY, JSON.stringify(next), SHARED); } catch {}
  }, []);

  if (!db) return <Splash />;

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: INK, background: PAPER, minHeight: "100vh" }}>
      {view === "public" && <Public db={db} persist={persist} onLogin={() => setView("login")} />}
      {view === "login" && (
        <Login
          db={db}
          onBack={() => setView("public")}
          onAuth={(u) => { setSession(u); setView("portal"); }}
        />
      )}
      {view === "portal" && session && (
        <Portal
          db={db}
          persist={persist}
          session={session}
          onLogout={() => { setSession(null); setView("public"); }}
        />
      )}
    </div>
  );
}

function Splash() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: NAVY, color: "#fff" }}>
      <div style={{ textAlign: "center" }}>
        <Plane size={40} style={{ transform: "rotate(-45deg)" }} />
        <p style={{ marginTop: 12, letterSpacing: 2 }}>LOADING</p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PUBLIC SITE                                                        */
/* ================================================================== */
function Public({ db, persist, onLogin }) {
  const [open, setOpen] = useState(false);
  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setOpen(false); };

  return (
    <div>
      {/* NAV */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(11,31,58,0.96)", backdropFilter: "blur(8px)", color: "#fff" }}>
        <div style={wrap}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: GOLD, display: "grid", placeItems: "center" }}>
                <Plane size={22} color={NAVY} style={{ transform: "rotate(-45deg)" }} />
              </div>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>Mongolian Aviation Academy</div>
                <div style={{ fontSize: 11, color: GOLD, letterSpacing: 1 }}>MCAA PART 141 FLIGHT SCHOOL</div>
              </div>
            </div>
            <nav style={{ display: "flex", alignItems: "center", gap: 24 }} className="maa-desktop-nav">
              {["programs", "about", "fleet", "contact"].map((s) => (
                <a key={s} onClick={() => go(s)} style={navLink}>{s[0].toUpperCase() + s.slice(1)}</a>
              ))}
              <button onClick={onLogin} style={portalBtn}>Portal login <ChevronRight size={15} /></button>
            </nav>
            <button onClick={() => setOpen(!open)} className="maa-burger" style={{ ...iconBtn, display: "none" }}>
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {open && (
          <div style={{ background: NAVY2, padding: "8px 0" }}>
            {["programs", "about", "fleet", "contact"].map((s) => (
              <a key={s} onClick={() => go(s)} style={{ ...navLink, display: "block", padding: "12px 24px" }}>{s[0].toUpperCase() + s.slice(1)}</a>
            ))}
            <a onClick={onLogin} style={{ ...navLink, display: "block", padding: "12px 24px", color: GOLD }}>Portal login</a>
          </div>
        )}
      </header>

      {/* HERO */}
      <section style={{ background: `linear-gradient(180deg, ${NAVY} 0%, ${NAVY2} 100%)`, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ ...wrap, padding: "88px 24px 96px" }}>
          <div style={{ maxWidth: 720 }}>
            <span style={eyebrow}>CIVIL AVIATION AUTHORITY OF MONGOLIA · PART 141</span>
            <h1 style={{ fontSize: "clamp(34px,5vw,58px)", lineHeight: 1.05, margin: "18px 0 0", fontWeight: 800 }}>
              Where Mongolia<br /> learns to fly.
            </h1>
            <p style={{ fontSize: 19, color: "#C9D6E5", marginTop: 20, maxWidth: 560, lineHeight: 1.6 }}>
              From your first private licence to commercial and instructor ratings, the Mongolian Aviation Academy trains pilots to international standard — under the skies of the steppe.
            </p>
            <div style={{ display: "flex", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
              <button onClick={() => go("programs")} style={ctaGold}>Explore programs</button>
              <button onClick={onLogin} style={ctaGhost}>Student & CFI portal</button>
            </div>
          </div>
        </div>
        <Plane size={420} style={{ position: "absolute", right: -90, bottom: -120, opacity: 0.05, transform: "rotate(-30deg)" }} />
      </section>

      {/* STATS */}
      <section style={{ background: NAVY2, color: "#fff", borderTop: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ ...wrap, padding: "0 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))" }}>
            {[["6", "Rating programs"], ["MCAA", "Part 141 approved"], ["ASEL · HSEL", "Single-engine"], ["C208", "Turbine initial"]].map(([n, l]) => (
              <div key={l} style={{ padding: "28px 8px", textAlign: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: GOLD }}>{n}</div>
                <div style={{ fontSize: 13, color: "#9DB0C7", marginTop: 4 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" style={section}>
        <div style={wrap}>
          <SectionHead kicker="TRAINING" title="Programs we teach" sub="Approved Part 141 courses, from primary training to advanced commercial and instructor ratings." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginTop: 40 }}>
            {PROGRAMS.map((p, i) => (
              <div key={i} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: PAPER, display: "grid", placeItems: "center" }}>
                    <p.icon size={22} color={SKY} />
                  </div>
                  <span style={badge}>{p.code}</span>
                </div>
                <h3 style={{ margin: "18px 0 8px", fontSize: 19 }}>{p.title}</h3>
                <p style={{ color: "#566", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" style={{ ...section, background: "#fff" }}>
        <div style={wrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48, alignItems: "center" }}>
            <div>
              <SectionHead kicker="ABOUT US" title="An MCAA Part 141 flight school" align="left" />
              <p style={{ color: "#445", lineHeight: 1.75, fontSize: 16 }}>
                The Mongolian Aviation Academy is a certified Part 141 flight school approved by the Civil Aviation Authority of Mongolia. Our structured syllabi, standardised instructors, and modern training fleet prepare students for licences and ratings recognised to international standard.
              </p>
              <ul style={{ listStyle: "none", padding: 0, marginTop: 22, display: "grid", gap: 12 }}>
                {["Structured Part 141 syllabi with stage checks", "Standardised CFI cadre and digital logbooks", "PPL, IR, CPL, CFI for ASEL · PPL HSEL · C208 Initial"].map((t) => (
                  <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: "#334" }}>
                    <CheckCircle2 size={20} color={SKY} style={{ flexShrink: 0, marginTop: 1 }} /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: NAVY, borderRadius: 16, padding: 36, color: "#fff" }}>
              <Megaphone size={28} color={GOLD} />
              <h3 style={{ fontSize: 22, margin: "16px 0 10px" }}>Train with us</h3>
              <p style={{ color: "#C9D6E5", lineHeight: 1.7, fontSize: 15 }}>
                Enrolled students and instructors manage flight time, logbooks, schedules and announcements through our online portal — sign in any time.
              </p>
              <button onClick={onLogin} style={{ ...ctaGold, marginTop: 18 }}>Open the portal</button>
            </div>
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section id="fleet" style={section}>
        <div style={wrap}>
          <SectionHead kicker="OUR FLEET" title="Training aircraft" sub="Reliable single-engine trainers and turbine type training." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, marginTop: 40 }}>
            {[["Cessna 172", "Primary ASEL trainer for PPL, IR and CPL flight training."], ["Helicopter SEL", "Rotary-wing trainer for the PPL HSEL programme."], ["Cessna 208 Caravan", "Turbine single-engine aircraft for C208 Initial training."]].map(([n, d]) => (
              <div key={n} style={{ ...card, borderTop: `3px solid ${GOLD}` }}>
                <Plane size={26} color={SKY} style={{ transform: "rotate(-30deg)" }} />
                <h3 style={{ margin: "14px 0 8px", fontSize: 18 }}>{n}</h3>
                <p style={{ color: "#566", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ ...section, background: "#fff" }}>
        <div style={wrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 48 }}>
            <div>
              <SectionHead kicker="CONTACT" title="Send us a message" align="left" sub="Your message goes straight to the academy office. We reply by email." />
              <div style={{ marginTop: 28, display: "grid", gap: 18 }}>
                <Info icon={Mail} label="Email" value="office@maa.aero" />
                <Info icon={Phone} label="Phone" value="+976 7000-0000" />
                <Info icon={MapPin} label="Location" value="Buyant-Ukhaa, Ulaanbaatar, Mongolia" />
              </div>
            </div>
            <ContactForm db={db} persist={persist} />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: NAVY, color: "#9DB0C7", padding: "40px 0" }}>
        <div style={{ ...wrap, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
            <Plane size={18} color={GOLD} style={{ transform: "rotate(-45deg)" }} />
            Mongolian Aviation Academy
          </div>
          <div style={{ fontSize: 13 }}>MCAA Part 141 Flight School · © {new Date().getFullYear()}</div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 860px){ .maa-desktop-nav{display:none!important;} .maa-burger{display:grid!important;} }
        a{cursor:pointer;}
      `}</style>
    </div>
  );
}

function ContactForm({ db, persist }) {
  const [f, setF] = useState({ name: "", email: "", subject: "", body: "" });
  const [sent, setSent] = useState(false);
  const submit = async () => {
    if (!f.name || !f.email || !f.body) return;
    const msg = { id: "M-" + Date.now(), ...f, date: new Date().toISOString().slice(0, 10), read: false };
    await persist({ ...db, messages: [msg, ...db.messages] });
    setSent(true);
    setF({ name: "", email: "", subject: "", body: "" });
  };
  if (sent) return (
    <div style={{ ...card, display: "grid", placeItems: "center", textAlign: "center", minHeight: 320 }}>
      <div>
        <CheckCircle2 size={48} color={SKY} />
        <h3 style={{ margin: "16px 0 6px" }}>Message sent</h3>
        <p style={{ color: "#566" }}>The academy office has received your message and will reply by email.</p>
        <button onClick={() => setSent(false)} style={{ ...ctaGhostDark, marginTop: 14 }}>Send another</button>
      </div>
    </div>
  );
  return (
    <div style={card}>
      <div style={{ display: "grid", gap: 14 }}>
        <Field label="Your name"><input style={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Bat-Erdene" /></Field>
        <Field label="Email"><input style={input} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="you@email.com" /></Field>
        <Field label="Subject"><input style={input} value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="Enquiry about PPL course" /></Field>
        <Field label="Message"><textarea style={{ ...input, minHeight: 110, resize: "vertical" }} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} placeholder="How can we help?" /></Field>
        <button onClick={submit} style={ctaGold}><Send size={16} style={{ marginRight: 8 }} />Send message</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  LOGIN                                                              */
/* ================================================================== */
function Login({ db, onBack, onAuth }) {
  const [id, setId] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const submit = () => {
    const u = db.users.find((x) => x.id.toLowerCase() === id.trim().toLowerCase() && x.pass === pass);
    if (u) onAuth(u); else setErr("Invalid ID or password.");
  };
  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr", placeItems: "center", background: `linear-gradient(180deg,${NAVY},${NAVY2})`, color: "#fff", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: GOLD, display: "grid", placeItems: "center", margin: "0 auto" }}>
            <Plane size={28} color={NAVY} style={{ transform: "rotate(-45deg)" }} />
          </div>
          <h2 style={{ margin: "16px 0 4px", fontSize: 22 }}>Portal sign in</h2>
          <p style={{ color: "#9DB0C7", fontSize: 14 }}>Mongolian Aviation Academy</p>
        </div>
        <div style={{ background: "#fff", borderRadius: 14, padding: 24, color: INK }}>
          <Field label="ID"><div style={inputWrap}><User size={16} color="#889" /><input style={inputBare} value={id} onChange={(e) => setId(e.target.value)} placeholder="S-1042 / CFI-07 / ADMIN" /></div></Field>
          <div style={{ height: 14 }} />
          <Field label="Password"><div style={inputWrap}><Lock size={16} color="#889" /><input type="password" style={inputBare} value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="••••" /></div></Field>
          {err && <p style={{ color: "#c0392b", fontSize: 13, marginTop: 10 }}>{err}</p>}
          <button onClick={submit} style={{ ...ctaGold, width: "100%", justifyContent: "center", marginTop: 18 }}>Sign in</button>
          <div style={{ marginTop: 16, padding: 12, background: PAPER, borderRadius: 8, fontSize: 12, color: "#667", lineHeight: 1.7 }}>
            <strong>Demo logins</strong><br />
            Student — <code>S-1042</code> / 1234<br />
            Instructor — <code>CFI-07</code> / 1234<br />
            Admin — <code>ADMIN</code> / admin
          </div>
        </div>
        <button onClick={onBack} style={{ ...ctaGhost, width: "100%", justifyContent: "center", marginTop: 16 }}>← Back to website</button>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  PORTAL SHELL                                                       */
/* ================================================================== */
function Portal({ db, persist, session, onLogout }) {
  const isStudent = session.role === "student";
  const isCFI = session.role === "cfi";
  const isAdmin = session.role === "admin";

  const studentTabs = [
    { id: "board", label: "Student board", icon: LayoutDashboard },
    { id: "logbook", label: "Flight logbook", icon: BookOpen },
    { id: "schedule", label: "Flight schedule", icon: CalendarDays },
    { id: "notes", label: "Notifications", icon: Bell },
  ];
  const cfiTabs = [
    { id: "students", label: "My students", icon: Users },
    { id: "review", label: "Review & comment", icon: MessageSquare },
    { id: "schedule", label: "Flight schedule", icon: CalendarDays },
    { id: "notes", label: "Notifications", icon: Bell },
  ];
  const adminTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "people", label: "Students & CFIs", icon: Users },
    { id: "schedule", label: "Schedule", icon: CalendarDays },
    { id: "announce", label: "Announcements", icon: Megaphone },
    { id: "inbox", label: "Website inbox", icon: Mail },
  ];
  const tabs = isStudent ? studentTabs : isCFI ? cfiTabs : adminTabs;
  const [tab, setTab] = useState(tabs[0].id);
  const [sb, setSb] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: PAPER }}>
      {/* SIDEBAR */}
      <aside style={{ width: 256, background: NAVY, color: "#fff", display: "flex", flexDirection: "column", position: "fixed", top: 0, bottom: 0, left: sb ? 0 : -256, transition: "left .25s", zIndex: 50 }} className="maa-side">
        <div style={{ padding: "20px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: GOLD, display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Plane size={18} color={NAVY} style={{ transform: "rotate(-45deg)" }} />
          </div>
          <div style={{ lineHeight: 1.15 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>MAA Portal</div>
            <div style={{ fontSize: 10, color: GOLD, letterSpacing: 1 }}>{session.role.toUpperCase()}</div>
          </div>
        </div>
        <nav style={{ padding: 12, flex: 1 }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setSb(false); }} style={{ ...sideItem, ...(tab === t.id ? sideItemActive : {}) }}>
              <t.icon size={18} /> {t.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: SKY, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>
              {session.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div style={{ lineHeight: 1.2, overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{session.name}</div>
              <div style={{ fontSize: 11, color: "#9DB0C7" }}>{session.id}</div>
            </div>
          </div>
          <button onClick={onLogout} style={{ ...sideItem, color: "#F0A8A8" }}><LogOut size={18} /> Sign out</button>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, marginLeft: 0 }} className="maa-main">
        <header style={{ background: "#fff", borderBottom: "1px solid #e5e2d8", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={() => setSb(true)} className="maa-burger2" style={{ ...iconBtnDark, display: "none" }}><Menu /></button>
            <h1 style={{ fontSize: 18, margin: 0 }}>{tabs.find((t) => t.id === tab)?.label}</h1>
          </div>
          <div style={{ fontSize: 13, color: "#778" }}>{new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</div>
        </header>

        <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
          {isStudent && tab === "board" && <StudentBoard db={db} me={session} />}
          {isStudent && tab === "logbook" && <Logbook db={db} flights={db.flights.filter((f) => f.student === session.id)} canComment={false} />}
          {isStudent && tab === "schedule" && <Schedule db={db} rows={db.schedule.filter((s) => s.student === session.id)} />}
          {(isStudent || isCFI || isAdmin) && tab === "notes" && <Notifications db={db} />}

          {isCFI && tab === "students" && <CFIStudents db={db} />}
          {isCFI && tab === "review" && <CFIReview db={db} persist={persist} me={session} />}
          {isCFI && tab === "schedule" && <Schedule db={db} rows={db.schedule.filter((s) => s.cfi === session.id)} cfiView />}

          {isAdmin && tab === "overview" && <AdminOverview db={db} />}
          {isAdmin && tab === "people" && <AdminPeople db={db} persist={persist} />}
          {isAdmin && tab === "schedule" && <AdminSchedule db={db} persist={persist} />}
          {isAdmin && tab === "announce" && <AdminAnnounce db={db} persist={persist} />}
          {isAdmin && tab === "inbox" && <AdminInbox db={db} persist={persist} />}
        </main>
      </div>

      <div onClick={() => setSb(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 49, display: sb ? "block" : "none" }} className="maa-scrim" />
      <style>{`
        @media (min-width: 861px){ .maa-side{left:0!important;} .maa-main{margin-left:256px!important;} .maa-scrim{display:none!important;} }
        @media (max-width: 860px){ .maa-burger2{display:grid!important;} }
      `}</style>
    </div>
  );
}

/* -------------------- STUDENT -------------------- */
function StudentBoard({ db, me }) {
  const flights = db.flights.filter((f) => f.student === me.id);
  const totalFlight = flights.reduce((s, f) => s + f.hours, 0);
  const groundRows = db.ground.filter((g) => g.student === me.id);
  const groundHrs = groundRows.reduce((s, g) => s + g.hours, 0);
  const upcoming = db.schedule.filter((s) => s.student === me.id && s.status === "Scheduled").sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const next = upcoming[0];
  const nextGround = upcoming.find((s) => /ground/i.test(s.activity));

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <Stat icon={Clock} label="Total flight time" value={totalFlight.toFixed(1) + " h"} />
        <Stat icon={BookOpen} label="Logged flights" value={flights.length} />
        <Stat icon={GraduationCap} label="Ground training" value={groundHrs + " h"} />
        <Stat icon={Award} label="Program" value={me.program} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
        <Panel title="Next flight" icon={CalendarDays}>
          {next ? (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtDate(next.date)} · {next.time}</div>
              <div style={{ color: "#566", marginTop: 6 }}>{next.activity}</div>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag>{next.aircraft}</Tag><Tag>CFI {next.cfi}</Tag>
              </div>
            </div>
          ) : <Empty>No upcoming flight scheduled.</Empty>}
        </Panel>
        <Panel title="Next ground training" icon={ClipboardList}>
          {nextGround ? (
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{fmtDate(nextGround.date)} · {nextGround.time}</div>
              <div style={{ color: "#566", marginTop: 6 }}>{nextGround.activity}</div>
            </div>
          ) : <Empty>No ground session scheduled.</Empty>}
        </Panel>
      </div>

      <Panel title="Ground training hours by topic" icon={ClipboardList}>
        {groundRows.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {groundRows.map((g) => (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
                  <span>{g.topic}</span><span style={{ color: "#778" }}>{g.hours} h</span>
                </div>
                <div style={{ height: 8, background: PAPER, borderRadius: 4 }}>
                  <div style={{ height: "100%", width: Math.min(100, (g.hours / Math.max(...groundRows.map((x) => x.hours))) * 100) + "%", background: SKY, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        ) : <Empty>No ground training recorded yet.</Empty>}
      </Panel>
    </div>
  );
}

function Logbook({ db, flights, canComment }) {
  const [open, setOpen] = useState(null);
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {flights.length === 0 && <Empty>No flights logged yet.</Empty>}
      {flights.sort((a, b) => b.date.localeCompare(a.date)).map((f) => (
        <div key={f.id} style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 13, color: "#778" }}>{fmtDate(f.date)} · {f.id}</div>
              <h3 style={{ margin: "4px 0 8px", fontSize: 17 }}>{f.lesson || f.type}</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag>{f.aircraft}</Tag><Tag>{f.type}</Tag><Tag>{f.from} → {f.to}</Tag><Tag>{f.hours} h</Tag>
              </div>
            </div>
            <button onClick={() => setOpen(open === f.id ? null : f.id)} style={ctaGhostDark}>
              {open === f.id ? "Hide" : "CFI comments"}
            </button>
          </div>
          {open === f.id && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #eee" }}>
              {f.comment ? (
                <div style={{ background: PAPER, borderRadius: 10, padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#556", marginBottom: 6 }}>
                    <MessageSquare size={15} /> {name(f.cfi)} <span style={{ color: "#99a" }}>({f.cfi})</span>
                  </div>
                  <p style={{ margin: 0, lineHeight: 1.65 }}>{f.comment}</p>
                </div>
              ) : <Empty>No instructor comment on this flight yet.</Empty>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Schedule({ db, rows, cfiView }) {
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  return (
    <div style={card}>
      {rows.length === 0 ? <Empty>Nothing scheduled.</Empty> : (
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead><tr>{["Date", "Time", cfiView ? "Student" : "CFI", "Aircraft", "Activity", "Status"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((r) => (
                <tr key={r.id}>
                  <td style={td}>{fmtDate(r.date)}</td>
                  <td style={td}>{r.time}</td>
                  <td style={td}>{cfiView ? name(r.student) : "CFI " + r.cfi}</td>
                  <td style={td}>{r.aircraft}</td>
                  <td style={td}>{r.activity}</td>
                  <td style={td}><span style={pill(r.status)}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Notifications({ db }) {
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {db.notifications.length === 0 && <Empty>No announcements.</Empty>}
      {db.notifications.sort((a, b) => b.date.localeCompare(a.date)).map((n) => (
        <div key={n.id} style={{ ...card, borderLeft: `3px solid ${GOLD}` }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 12, color: "#778" }}>
            <Bell size={14} /> {fmtDate(n.date)}
          </div>
          <h3 style={{ margin: "8px 0 6px", fontSize: 17 }}>{n.title}</h3>
          <p style={{ margin: 0, color: "#445", lineHeight: 1.6 }}>{n.body}</p>
        </div>
      ))}
    </div>
  );
}

/* -------------------- CFI -------------------- */
function CFIStudents({ db }) {
  const students = db.users.filter((u) => u.role === "student");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
      {students.map((s) => {
        const fl = db.flights.filter((f) => f.student === s.id);
        const tot = fl.reduce((a, f) => a + f.hours, 0);
        return (
          <div key={s.id} style={card}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: SKY, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700 }}>
                {s.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <div>
                <div style={{ fontWeight: 600 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "#778" }}>{s.id} · {s.program}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <Tag>{tot.toFixed(1)} h total</Tag><Tag>{fl.length} flights</Tag>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CFIReview({ db, persist, me }) {
  const [draft, setDraft] = useState({});
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  const save = async (fid) => {
    const text = (draft[fid] ?? "").trim();
    const next = { ...db, flights: db.flights.map((f) => f.id === fid ? { ...f, comment: text, cfi: me.id } : f) };
    await persist(next);
    setDraft((d) => { const c = { ...d }; delete c[fid]; return c; });
  };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <p style={{ color: "#556", margin: "0 0 4px" }}>Write or update your instructor comment on each flight. Comments are signed with your ID (<strong>{me.id}</strong>) and visible to the student.</p>
      {db.flights.sort((a, b) => b.date.localeCompare(a.date)).map((f) => {
        const editing = draft[f.id] !== undefined;
        return (
          <div key={f.id} style={card}>
            <div style={{ fontSize: 13, color: "#778" }}>{fmtDate(f.date)} · {name(f.student)} ({f.student})</div>
            <h3 style={{ margin: "4px 0 8px", fontSize: 16 }}>{f.lesson || f.type}</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
              <Tag>{f.aircraft}</Tag><Tag>{f.from} → {f.to}</Tag><Tag>{f.hours} h</Tag>
            </div>
            {editing ? (
              <div>
                <textarea style={{ ...input, minHeight: 90 }} value={draft[f.id]} onChange={(e) => setDraft({ ...draft, [f.id]: e.target.value })} placeholder="Your comment for this flight…" />
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <button onClick={() => save(f.id)} style={ctaGold}>Save comment</button>
                  <button onClick={() => setDraft((d) => { const c = { ...d }; delete c[f.id]; return c; })} style={ctaGhostDark}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ background: PAPER, borderRadius: 10, padding: 12 }}>
                {f.comment ? <p style={{ margin: 0, lineHeight: 1.6 }}>{f.comment} <span style={{ color: "#99a", fontSize: 12 }}>— {f.cfi}</span></p> : <span style={{ color: "#99a" }}>No comment yet.</span>}
                <button onClick={() => setDraft({ ...draft, [f.id]: f.comment || "" })} style={{ ...ctaGhostDark, marginTop: 10 }}><Edit3 size={14} style={{ marginRight: 6 }} />{f.comment ? "Edit" : "Add comment"}</button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* -------------------- ADMIN -------------------- */
function AdminOverview({ db }) {
  const students = db.users.filter((u) => u.role === "student").length;
  const cfis = db.users.filter((u) => u.role === "cfi").length;
  const unread = db.messages.filter((m) => !m.read).length;
  const totalHrs = db.flights.reduce((s, f) => s + f.hours, 0);
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        <Stat icon={Users} label="Students" value={students} />
        <Stat icon={GraduationCap} label="Instructors" value={cfis} />
        <Stat icon={Clock} label="Flight hours logged" value={totalHrs.toFixed(1)} />
        <Stat icon={Mail} label="Unread messages" value={unread} />
      </div>
      <Panel title="Recent flights" icon={BookOpen}>
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead><tr>{["Date", "Student", "Lesson", "Hours", "CFI"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {db.flights.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6).map((f) => (
                <tr key={f.id}>
                  <td style={td}>{fmtDate(f.date)}</td>
                  <td style={td}>{db.users.find((u) => u.id === f.student)?.name}</td>
                  <td style={td}>{f.lesson || f.type}</td>
                  <td style={td}>{f.hours}</td>
                  <td style={td}>{f.cfi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AdminPeople({ db, persist }) {
  const [form, setForm] = useState({ id: "", name: "", role: "student", program: "PPL ASEL", pass: "1234" });
  const add = async () => {
    if (!form.id || !form.name) return;
    if (db.users.some((u) => u.id.toLowerCase() === form.id.toLowerCase())) return alert("ID already exists.");
    await persist({ ...db, users: [...db.users, { ...form }] });
    setForm({ id: "", name: "", role: "student", program: "PPL ASEL", pass: "1234" });
  };
  const remove = async (id) => {
    if (!confirm("Remove this person?")) return;
    await persist({ ...db, users: db.users.filter((u) => u.id !== id) });
  };
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Panel title="Add student or instructor" icon={Plus}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, alignItems: "end" }}>
          <Field label="ID"><input style={input} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="S-1050" /></Field>
          <Field label="Name"><input style={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" /></Field>
          <Field label="Role"><select style={input} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}><option value="student">Student</option><option value="cfi">Instructor</option></select></Field>
          {form.role === "student" && <Field label="Program"><input style={input} value={form.program} onChange={(e) => setForm({ ...form, program: e.target.value })} /></Field>}
          <Field label="Password"><input style={input} value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} /></Field>
          <button onClick={add} style={ctaGold}>Add</button>
        </div>
      </Panel>
      <Panel title="Everyone" icon={Users}>
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead><tr>{["ID", "Name", "Role", "Program", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {db.users.map((u) => (
                <tr key={u.id}>
                  <td style={td}>{u.id}</td>
                  <td style={td}>{u.name}</td>
                  <td style={td}><span style={pill(u.role)}>{u.role}</span></td>
                  <td style={td}>{u.program || "—"}</td>
                  <td style={td}>{u.role !== "admin" && <button onClick={() => remove(u.id)} style={iconBtnSm}><Trash2 size={15} color="#c0392b" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AdminSchedule({ db, persist }) {
  const students = db.users.filter((u) => u.role === "student");
  const cfis = db.users.filter((u) => u.role === "cfi");
  const [f, setF] = useState({ student: students[0]?.id || "", cfi: cfis[0]?.id || "", date: "", time: "08:00", aircraft: "C172 (JU-1801)", activity: "" });
  const add = async () => {
    if (!f.date || !f.activity) return;
    const row = { id: "SC-" + Date.now(), ...f, status: "Scheduled" };
    await persist({ ...db, schedule: [...db.schedule, row] });
    setF({ ...f, date: "", activity: "" });
  };
  const remove = async (id) => { await persist({ ...db, schedule: db.schedule.filter((s) => s.id !== id) }); };
  const name = (id) => db.users.find((u) => u.id === id)?.name || id;
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Panel title="Add to schedule" icon={Plus}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, alignItems: "end" }}>
          <Field label="Student"><select style={input} value={f.student} onChange={(e) => setF({ ...f, student: e.target.value })}>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></Field>
          <Field label="Instructor"><select style={input} value={f.cfi} onChange={(e) => setF({ ...f, cfi: e.target.value })}>{cfis.map((s) => <option key={s.id} value={s.id}>{s.id}</option>)}</select></Field>
          <Field label="Date"><input type="date" style={input} value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field>
          <Field label="Time"><input type="time" style={input} value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} /></Field>
          <Field label="Aircraft"><input style={input} value={f.aircraft} onChange={(e) => setF({ ...f, aircraft: e.target.value })} /></Field>
          <Field label="Activity"><input style={input} value={f.activity} onChange={(e) => setF({ ...f, activity: e.target.value })} placeholder="Lesson / ground topic" /></Field>
          <button onClick={add} style={ctaGold}>Add</button>
        </div>
      </Panel>
      <Panel title="All scheduled" icon={CalendarDays}>
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead><tr>{["Date", "Time", "Student", "CFI", "Aircraft", "Activity", ""].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {db.schedule.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map((r) => (
                <tr key={r.id}>
                  <td style={td}>{fmtDate(r.date)}</td><td style={td}>{r.time}</td>
                  <td style={td}>{name(r.student)}</td><td style={td}>{r.cfi}</td>
                  <td style={td}>{r.aircraft}</td><td style={td}>{r.activity}</td>
                  <td style={td}><button onClick={() => remove(r.id)} style={iconBtnSm}><Trash2 size={15} color="#c0392b" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function AdminAnnounce({ db, persist }) {
  const [f, setF] = useState({ title: "", body: "" });
  const post = async () => {
    if (!f.title || !f.body) return;
    const n = { id: "N-" + Date.now(), date: new Date().toISOString().slice(0, 10), ...f };
    await persist({ ...db, notifications: [n, ...db.notifications] });
    setF({ title: "", body: "" });
  };
  const remove = async (id) => { await persist({ ...db, notifications: db.notifications.filter((n) => n.id !== id) }); };
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <Panel title="Post announcement" icon={Megaphone}>
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="Title"><input style={input} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. Schedule change for Friday" /></Field>
          <Field label="Message"><textarea style={{ ...input, minHeight: 90 }} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></Field>
          <button onClick={post} style={{ ...ctaGold, justifySelf: "start" }}>Publish to all</button>
        </div>
      </Panel>
      <div style={{ display: "grid", gap: 12 }}>
        {db.notifications.map((n) => (
          <div key={n.id} style={{ ...card, borderLeft: `3px solid ${GOLD}` }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: "#778" }}>{fmtDate(n.date)}</span>
              <button onClick={() => remove(n.id)} style={iconBtnSm}><Trash2 size={15} color="#c0392b" /></button>
            </div>
            <h3 style={{ margin: "4px 0 6px", fontSize: 16 }}>{n.title}</h3>
            <p style={{ margin: 0, color: "#445" }}>{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminInbox({ db, persist }) {
  const mark = async (id) => { await persist({ ...db, messages: db.messages.map((m) => m.id === id ? { ...m, read: true } : m) }); };
  const del = async (id) => { await persist({ ...db, messages: db.messages.filter((m) => m.id !== id) }); };
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {db.messages.length === 0 && <Empty>No messages from the website yet.</Empty>}
      {db.messages.map((m) => (
        <div key={m.id} style={{ ...card, borderLeft: `3px solid ${m.read ? "#cfcabb" : SKY}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontWeight: 600 }}>{m.subject || "(no subject)"} {!m.read && <span style={{ ...pill("student"), marginLeft: 6 }}>New</span>}</div>
              <div style={{ fontSize: 13, color: "#778", marginTop: 2 }}>{m.name} · {m.email} · {fmtDate(m.date)}</div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {!m.read && <button onClick={() => mark(m.id)} style={ctaGhostDark}>Mark read</button>}
              <button onClick={() => del(m.id)} style={iconBtnSm}><Trash2 size={15} color="#c0392b" /></button>
            </div>
          </div>
          <p style={{ margin: "12px 0 0", color: "#334", lineHeight: 1.6 }}>{m.body}</p>
          <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your enquiry")}`} style={{ ...ctaGhostDark, marginTop: 12, display: "inline-flex", textDecoration: "none" }}><Mail size={14} style={{ marginRight: 6 }} />Reply by email</a>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Small UI atoms                                                     */
/* ------------------------------------------------------------------ */
const fmtDate = (s) => { try { return new Date(s + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); } catch { return s; } };

function SectionHead({ kicker, title, sub, align = "center" }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 640 : "none", margin: align === "center" ? "0 auto" : 0 }}>
      <span style={eyebrowDark}>{kicker}</span>
      <h2 style={{ fontSize: "clamp(26px,3.5vw,38px)", margin: "10px 0 0", fontWeight: 800, color: NAVY }}>{title}</h2>
      {sub && <p style={{ color: "#566", fontSize: 16, marginTop: 12, lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}
function Stat({ icon: Icon, label, value }) {
  return (
    <div style={card}>
      <Icon size={20} color={SKY} />
      <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, color: NAVY }}>{value}</div>
      <div style={{ fontSize: 13, color: "#778", marginTop: 2 }}>{label}</div>
    </div>
  );
}
function Panel({ title, icon: Icon, children }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, color: NAVY }}>
        {Icon && <Icon size={18} color={SKY} />}<h3 style={{ margin: 0, fontSize: 16 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return <label style={{ display: "block" }}><span style={{ fontSize: 12, fontWeight: 600, color: "#556", display: "block", marginBottom: 6 }}>{label}</span>{children}</label>;
}
function Info({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: PAPER, display: "grid", placeItems: "center" }}><Icon size={18} color={SKY} /></div>
      <div><div style={{ fontSize: 12, color: "#889" }}>{label}</div><div style={{ fontWeight: 600 }}>{value}</div></div>
    </div>
  );
}
const Tag = ({ children }) => <span style={{ fontSize: 12, background: PAPER, border: "1px solid #e5e2d8", padding: "4px 10px", borderRadius: 20, color: "#445" }}>{children}</span>;
const Empty = ({ children }) => <div style={{ padding: 20, textAlign: "center", color: "#99a", background: PAPER, borderRadius: 10 }}>{children}</div>;

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */
const wrap = { maxWidth: 1160, margin: "0 auto", padding: "0 24px" };
const section = { padding: "76px 0" };
const navLink = { color: "#D6E0EC", fontSize: 14, fontWeight: 500, textDecoration: "none" };
const eyebrow = { fontSize: 12, letterSpacing: 2, color: GOLD, fontWeight: 700 };
const eyebrowDark = { fontSize: 12, letterSpacing: 2, color: SKY, fontWeight: 700 };
const card = { background: "#fff", border: "1px solid #e7e4da", borderRadius: 14, padding: 22 };
const badge = { fontSize: 11, fontWeight: 700, color: NAVY, background: GOLD, padding: "3px 9px", borderRadius: 6, letterSpacing: 0.5 };
const portalBtn = { display: "inline-flex", alignItems: "center", gap: 4, background: GOLD, color: NAVY, border: "none", padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer" };
const iconBtn = { background: "transparent", border: "none", color: "#fff", cursor: "pointer", placeItems: "center" };
const iconBtnDark = { background: "transparent", border: "none", color: NAVY, cursor: "pointer", placeItems: "center" };
const iconBtnSm = { background: "transparent", border: "none", cursor: "pointer", padding: 4 };
const ctaGold = { display: "inline-flex", alignItems: "center", justifyContent: "center", background: GOLD, color: NAVY, border: "none", padding: "12px 22px", borderRadius: 9, fontWeight: 700, fontSize: 15, cursor: "pointer" };
const ctaGhost = { display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.4)", padding: "12px 22px", borderRadius: 9, fontWeight: 600, fontSize: 15, cursor: "pointer" };
const ctaGhostDark = { display: "inline-flex", alignItems: "center", background: "transparent", color: NAVY, border: "1px solid #cfcabb", padding: "8px 14px", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer" };
const input = { width: "100%", padding: "10px 12px", border: "1px solid #d8d4c8", borderRadius: 8, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", background: "#fff" };
const inputWrap = { display: "flex", alignItems: "center", gap: 8, border: "1px solid #d8d4c8", borderRadius: 8, padding: "0 12px", background: "#fff" };
const inputBare = { flex: 1, border: "none", outline: "none", padding: "11px 0", fontSize: 14, fontFamily: "inherit", background: "transparent" };
const sideItem = { display: "flex", alignItems: "center", gap: 12, width: "100%", background: "transparent", border: "none", color: "#C9D6E5", padding: "11px 14px", borderRadius: 9, fontSize: 14, fontWeight: 500, cursor: "pointer", textAlign: "left", marginBottom: 2 };
const sideItemActive = { background: "rgba(255,255,255,0.1)", color: "#fff" };
const table = { width: "100%", borderCollapse: "collapse", fontSize: 14 };
const th = { textAlign: "left", padding: "10px 12px", fontSize: 12, color: "#889", borderBottom: "2px solid #eee", whiteSpace: "nowrap", fontWeight: 700 };
const td = { padding: "11px 12px", borderBottom: "1px solid #f0ede4", color: "#334" };
function pill(kind) {
  const map = { Scheduled: [SKY, "#e8f0f8"], Completed: ["#1d9e75", "#e1f5ee"], student: [SKY, "#e8f0f8"], cfi: ["#9a6b1a", "#faeeda"], admin: [NAVY, "#e7e4da"] };
  const [c, bg] = map[kind] || ["#556", "#eee"];
  return { fontSize: 12, fontWeight: 700, color: c, background: bg, padding: "3px 10px", borderRadius: 20, textTransform: "capitalize" };
}
