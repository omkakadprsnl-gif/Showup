const { useState, useEffect } = React;

/* ---------------- palettes ---------------- */
const PALETTES = {
  sakura: {
    label: "Sakura",
    vars: {
      "--pink": "oklch(0.74 0.14 352)",
      "--pink-deep": "oklch(0.62 0.18 352)",
      "--lav": "oklch(0.70 0.12 300)",
      "--bg1": "oklch(0.985 0.012 352)",
      "--bg2": "oklch(0.95 0.022 320)"
    },
    cover: "linear-gradient(135deg, oklch(0.80 0.10 352), oklch(0.74 0.11 300))",
    blobs: ["oklch(0.88 0.08 352)", "oklch(0.86 0.07 300)", "oklch(0.90 0.06 170)"]
  },
  twilight: {
    label: "Twilight",
    vars: {
      "--pink": "oklch(0.66 0.15 300)",
      "--pink-deep": "oklch(0.55 0.18 295)",
      "--lav": "oklch(0.62 0.14 265)",
      "--bg1": "oklch(0.975 0.013 300)",
      "--bg2": "oklch(0.94 0.025 290)"
    },
    cover: "linear-gradient(135deg, oklch(0.72 0.13 300), oklch(0.66 0.14 262))",
    blobs: ["oklch(0.86 0.08 300)", "oklch(0.84 0.07 262)", "oklch(0.88 0.06 330)"]
  },
  koi: {
    label: "Koi",
    vars: {
      "--pink": "oklch(0.68 0.17 22)",
      "--pink-deep": "oklch(0.57 0.20 22)",
      "--lav": "oklch(0.72 0.15 45)",
      "--bg1": "oklch(0.98 0.012 30)",
      "--bg2": "oklch(0.95 0.024 30)"
    },
    cover: "linear-gradient(135deg, oklch(0.74 0.15 28), oklch(0.78 0.13 50))",
    blobs: ["oklch(0.88 0.07 28)", "oklch(0.89 0.07 50)", "oklch(0.90 0.05 90)"]
  }
};

const TAGLINES = {
  romance: { head: ["Start your", "romance arc."], sub: "The dating app for anime fans. Get matched on the stories you love — your top 5 anime, your fav character, fav genre, your hottest takes." },
  waifu: { head: ["Find your", "waifu. (or husbando.)"], sub: "The dating app for anime fans. We match real people by their taste — not just a swipe. Your top 5, your faves, your prompts." }
};

const STORE_KEY = "kokoro_waitlist_v1";
const BASE_COUNT = 12438;
const SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwnNozzwRdyd7yRzh1b0BiQ6tBKpDycRGjCFCRlXaUf7zc9D0dJYRHuPqGBIS37V-Qfdw/exec";

/* ---------------- decorative backdrop ---------------- */
function Backdrop({ pal }) {
  const blobs = [
  { c: pal.blobs[0], s: 240, t: "8%", l: "-12%" },
  { c: pal.blobs[1], s: 200, t: "44%", l: "82%" },
  { c: pal.blobs[2], s: 160, t: "78%", l: "-6%" }];

  const glyphs = [
  { g: "❀", t: "12%", l: "84%" }, { g: "✦", t: "30%", l: "6%" },
  { g: "♡", t: "60%", l: "90%" }, { g: "✿", t: "86%", l: "10%" },
  { g: "✦", t: "92%", l: "78%" }];

  return (
    <React.Fragment>
      {blobs.map((b, i) =>
      <div key={i} className="blob" style={{ width: b.s, height: b.s, top: b.t, left: b.l, background: b.c }} />
      )}
      {glyphs.map((g, i) =>
      <span key={i} className="glyph" style={{ top: g.t, left: g.l, color: pal.blobs[i % 3] }}>{g.g}</span>
      )}
    </React.Fragment>);

}

/* ---------------- waitlist form ---------------- */
function JoinForm() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [errs, setErrs] = useState({});
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    try {const s = JSON.parse(localStorage.getItem(STORE_KEY));if (s && s.spot) setSaved(s);} catch (e) {}
  }, []);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "What should we call you?";
    const c = contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
    const isPhone = /^[+]?[\d\s()-]{7,}$/.test(c);
    if (!c) e.contact = "Add an email or phone number.";else
    if (!isEmail && !isPhone) e.contact = "Hmm, that doesn't look like an email or number.";
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrs(e);
    if (Object.keys(e).length) return;
    const rec = { name: name.trim(), contact: contact.trim(), at: Date.now() };
    try {localStorage.setItem(STORE_KEY, JSON.stringify(rec));} catch (e2) {}
    // Fire-and-forget to Google Sheets (Apps Script web app). no-cors: we
    // can't read the response, but the row still gets appended. The local
    // confirmation always shows so the user never sees a failure.
    try {
      fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(rec)
      }).catch(() => {});
    } catch (e3) {}
    setSaved(rec);
  }

  if (saved) {
    return (
      <div className="joincard" id="join">
        <div className="done">
          <div className="burst">🌸</div>
          <h3>You're on the list, {saved.name.split(" ")[0]}!</h3>
          <p>We'll message you <b>exactly once</b> — the day Kokoro launches. No spam, no newsletters. Pinky promise.</p>
          <button className="btn ghost" style={{ marginTop: 18 }} onClick={() => {try {localStorage.removeItem(STORE_KEY);} catch (e) {}setSaved(null);setName("");setContact("");}}>
            Use a different contact
          </button>
        </div>
      </div>);

  }

  return (
    <form className="joincard" id="join" onSubmit={submit} noValidate>
      <div className="eyebrow">Launching soon</div>
      <h2 className="title">Save your spot ♡</h2>
      <div className="field">
        <label htmlFor="nm">Your name</label>
        <input id="nm" className={errs.name ? "err" : ""} value={name} placeholder="e.g. Hana"
        onChange={(e) => setName(e.target.value)} />
        {errs.name && <div className="errmsg">{errs.name}</div>}
      </div>
      <div className="field">
        <label htmlFor="ct">Email or phone number</label>
        <input id="ct" className={errs.contact ? "err" : ""} value={contact} placeholder="you@email.com or +1 555 000 1234"
        onChange={(e) => setContact(e.target.value)} />
        {errs.contact && <div className="errmsg">{errs.contact}</div>}
      </div>
      <button className="btn" type="submit" style={{ marginTop: 18 }}>Join the waitlist 💕</button>
      <div className="spam">
        <span className="s">🔒</span>
        <span>We <b>won't spam you</b>. We'll only reach out once — to let you know the moment Kokoro is live.</span>
      </div>
    </form>);

}

/* ---------------- main app ---------------- */
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const pal = PALETTES[t.palette] || PALETTES.sakura;
  const tag = TAGLINES[t.tagline] || TAGLINES.romance;

  const features = [
  { ic: "🏆", b: "Your Top 5 anime", p: "Rank the shows that built you. We weigh overlap to find real compatibility." },
  { ic: "💫", b: "Your favorite anime", p: "The one you'd defend to the death. Instant conversation starter." },
  { ic: "💗", b: "Comfort character", p: "Your waifu, husbando, or blorbo. It says more than a bio ever could." },
  { ic: "🎭", b: "Favorite genre", p: "Shonen heart? Slice-of-life soul? Psychological thriller energy? We match the vibe." },
  { ic: "💬", b: "Playful prompts", p: "Answer fun prompts so your personality shows before the first message." }];


  return (
    <div className="stage" style={pal.vars}>
      <Backdrop pal={pal} />
      <div className="phone">
        <div className="topbar">
          <div className="brand">
            <img className="appicon-sm" src="assets/kokoro-logo.png" alt="Kokoro app icon" />
            <div className="wordmark"><b>kokoro</b><span className="kanji"></span></div>
          </div>
          <span className="pill"><span className="dot"></span>Launching soon</span>
        </div>

        {/* hero */}
        <section className="hero">
          <h1>{tag.head[0]} <span className="hl">{tag.head[1]}</span></h1>
          <p className="sub">{tag.sub}</p>
          <div className="proof">
            <div className="avatars">
              <span style={{ background: "oklch(0.90 0.07 352)" }}>🌸</span>
              <span style={{ background: "oklch(0.90 0.06 300)" }}>⚔️</span>
              <span style={{ background: "oklch(0.90 0.06 170)" }}>👹</span>
              <span style={{ background: "oklch(0.90 0.07 55)" }}>✨</span>
            </div>
            <span>{BASE_COUNT.toLocaleString()}+ anime fans already in line</span>
          </div>

          {/* match visual */}
          <div className="matchcard">
            <svg className="thread" viewBox="0 0 396 230" preserveAspectRatio="none" aria-hidden="true">
              <path d="M 96,138 C 132,200 176,212 200,206 C 226,200 266,150 300,116" strokeWidth="3.6" />
              <path className="sheen" d="M 96,138 C 132,200 176,212 200,206 C 226,200 266,150 300,116" strokeWidth="1.2" />
            </svg>
            <div className="pcard a">
              <div className="ava" style={{ background: "linear-gradient(150deg, oklch(0.48 0.14 18), oklch(0.30 0.07 22))" }}>M</div>
              <div className="meta"><b>Mikasa, 19</b><small>Top show · Attack on Titan</small></div>
            </div>
            <div className="pcard b">
              <div className="ava" style={{ background: "linear-gradient(150deg, oklch(0.52 0.10 195), oklch(0.36 0.06 160))" }}>E</div>
              <div className="meta"><b>Eren, 19</b><small>Top show · Attack on Titan</small></div>
            </div>
            <div className="matchbadge">It's a match! 💞</div>
            <span className="knot-heart"></span>
          </div>
          <div className="fate-cap"><span className="jp"></span> bound by the red thread of fate</div>

          <div className="cta-wrap">
            <a href="#join" className="btn" style={{ textDecoration: "none" }}>Join the waitlist ♡</a>
            <div className="cta-note">Free to join · No spam, ever · Notified at launch</div>
          </div>
        </section>

        {/* how matching works */}
        <section className="block">
          <div className="eyebrow">How matching works</div>
          <h2 className="title">Matched on what you actually love</h2>
          <div className="feat">
            {features.map((f, i) =>
            <div className="row" key={i}>
                <div className="ic">{f.ic}</div>
                <div><b>{f.b}</b><p>{f.p}</p></div>
              </div>
            )}
          </div>

          <div className="automatch">
            <span className="tag">✨ One tap · instant</span>
            <h3>Auto-Match</h3>
            <p>Not in the mood to browse? Hit Auto-Match and Kokoro instantly pairs you with someone whose taste lines up with yours.</p>
            <div className="amrow">
              <span className="ambtn"><span className="spark">✨</span> Auto-match me</span>
              <span className="amnote">live at launch</span>
            </div>
          </div>
        </section>

        {/* sample profile */}
        <section className="block">
          <div className="eyebrow">A peek inside</div>
          <h2 className="title">Profiles that feel like you</h2>
          <div className="profile">
            <div className="cover" style={{ background: pal.cover }}>
              <div className="ph" style={{ height: "100%", background: "transparent", color: "rgba(255,255,255,.7)" }}>profile photo</div>
              <div className="nm"><b>Yuki, 23</b><br /><span>Tokyo · 2 km away</span></div>
            </div>
            <div className="body">
              <div>
                <div className="lbl">Top 5 anime</div>
                <div className="chips">
                  <span className="chip">One Piece</span>
                  <span className="chip lav">AOT</span>
                  <span className="chip mint">Naruto</span>
                  <span className="chip">Bleach</span>
                  <span className="chip lav">Dragon Ball</span>
                </div>
              </div>
              <div>
                <div className="lbl">Comfort character & genre</div>
                <div className="chips">
                  <span className="chip mint">Saiki Kusuo</span>
                  <span className="chip">Slice of life</span>
                  <span className="chip lav">Psychological</span>
                </div>
              </div>
              <div className="promptbox">
                <div className="q">The anime that made me cry was…</div>
                <div className="a">"Your Lie in April. I'm still not okay."</div>
              </div>
            </div>
          </div>
        </section>

        {/* prompt examples */}
        <section className="block">
          <div className="eyebrow">Show your personality</div>
          <h2 className="title">Prompts worth answering</h2>
          <div className="prompts">
            <div className="p"><span>💭</span>My villain origin story is…</div>
            <div className="p"><span>🍿</span>Sub or dub — defend your answer</div>
            <div className="p"><span>🌟</span>We'll get along if you also cried at…</div>
            <div className="p"><span>🔥</span>My most controversial anime take is…</div>
            <div className="p"><span>🎟️</span>First date: convention, café, or rewatch?</div>
          </div>
        </section>

        {/* join */}
        <section className="block">
          <JoinForm />
        </section>

        <footer>
          <div className="socials">
            <a href="#" aria-label="Instagram">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="6" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a href="#" aria-label="X">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
              </svg>
            </a>
          </div>
          <div className="footmark">kokoro 心</div>
          <div className="fineprint">Your other half has great taste. © 2026 Kokoro</div>
        </footer>
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Theme" />
        <TweakRadio label="Palette" value={t.palette}
        options={["sakura", "twilight", "koi"]}
        onChange={(v) => setTweak("palette", v)} />
        <TweakSection label="Headline" />
        <TweakRadio label="Tagline" value={t.tagline}
        options={["romance", "waifu"]}
        onChange={(v) => setTweak("tagline", v)} />
      </TweaksPanel>
    </div>);

}

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sakura",
  "tagline": "romance"
} /*EDITMODE-END*/;

ReactDOM.createRoot(document.getElementById("root")).render(<App />);