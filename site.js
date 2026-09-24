/* Pitch. One file for every page; each block checks that its element exists. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var html = document.documentElement;
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var editing = /[?&]edit=1/.test(location.search); // site-edit: the text stays plain, nothing is split into spans
  var NS = "http://www.w3.org/2000/svg";

  // a direct check on scroll and resize: IntersectionObserver alone was throttled in some tabs and entrances never fired
  function inView(el, fn, at) {
    at = at || 0.88;
    function chk() { var r = el.getBoundingClientRect(); if (r.top < innerHeight * at && r.bottom > 0) { off(); fn(); } }
    function off() { removeEventListener("scroll", chk); removeEventListener("resize", chk); }
    addEventListener("scroll", chk, { passive: true }); addEventListener("resize", chk); requestAnimationFrame(chk); setTimeout(chk, 300);
  }

  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

  /* ---------- 3 · the six muscles, drawn for this site in one line, 24 by 24 (24.9.2026). Not a library set ---------- */
  var MUSCLE = {
    "הסכמה": '<circle cx="8" cy="8" r="3"/><circle cx="16" cy="8" r="3"/><path d="M2.5 20c0-3.3 2.4-5.8 5.5-5.8 1.6 0 3 .6 4 1.7"/><path d="M10.5 20c0-3.3 2.4-5.8 5.5-5.8s5.5 2.5 5.5 5.8"/>',
    "שאלה": '<path d="M4 4.5h16A1.5 1.5 0 0 1 21.5 6v9.5A1.5 1.5 0 0 1 20 17h-7l-4.5 3.5V17H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5z"/><path d="M9.9 8.9a2.1 2.1 0 1 1 2.9 1.9c-.5.3-.8.7-.8 1.3v.4"/><circle cx="12" cy="14.3" r=".35"/>',
    "הקשבה": '<path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 2.7-1.9 3.6-2.7 5-.6 1.1-.6 2.3-1.5 3.3a2.8 2.8 0 0 1-4.8-1.6"/><path d="M9.7 9.9a2.3 2.3 0 1 1 3.4 2"/>',
    "ידע": '<path d="M2.5 5.5c2.4-1 5.6-.9 9.5 1 3.9-1.9 7.1-2 9.5-1v13c-2.4-1-5.6-.9-9.5 1-3.9-1.9-7.1-2-9.5-1z"/><path d="M12 6.5v13"/>',
    "אומץ לסגור": '<path d="M15 3.5l5.5 5.5-9.5 9.5-6 1.5 1.5-6z"/><path d="M13 5.5l5.5 5.5"/><path d="M3 22h7"/>',
    "זיהוי התנגדות": '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4L21 21"/><path d="M10.5 7.4v3.6"/><circle cx="10.5" cy="13.7" r=".35"/>'
  };
  $$(".mi-slot").forEach(function (el) { var k = el.getAttribute("data-muscle"); if (MUSCLE[k]) el.outerHTML = '<svg class="mi" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + MUSCLE[k] + '</svg>'; });

  /* ---------- 4 · the wave that goes silent: bars from a fixed seed, so every visit draws the same voice ---------- */
  $$(".wave").forEach(function (w) {
    var bars = $(".wave-bars", w), seed = 7;
    for (var i = 0; i < 34; i++) { seed = (seed * 9301 + 49297) % 233280; var r = seed / 233280, e = document.createElement("i"); e.style.setProperty("--h", (0.25 + r * 0.75).toFixed(2)); e.style.setProperty("--d", (-(r * 0.7)).toFixed(2) + "s"); bars.appendChild(e); }
    inView(w, function () { w.classList.add("run"); }, 0.9);
  });

  /* ---------- 2 · the chat: the bubbles come in when the dialogue is on screen (and, in the pinned scene, when its step is on) ---------- */
  $$(".field.talk").forEach(function (f) { inView(f, function () { f.classList.add("run"); }, 0.85); });

  /* ---------- the page opening (24.9.2026): once, on arrival, about a second, and then the first screen is still ----------
     The head adds html.open-anim only without reduced motion and outside site-edit; the CSS shows everything after 2.5s
     if this never runs. A heading with data-lines rises line by line from a mask; the hero's question mark draws itself. */
  (function () {
    var G = window.gsap, items = $$("[data-open]"), mark = $(".hero-mark");
    var done = function () { html.classList.remove("open-anim"); };
    // the mask reaches past the letter box: at line-height 1.02 the tails of ק ן ף ץ and the tops of ל sit outside it
    var SHUT = "inset(125% -6% -25% -6%)", OPEN = "inset(-20% -6% -25% -6%)";
    if (!html.classList.contains("open-anim")) return;
    // the toolbar's "stop animations" pauses GSAP; an opening that never plays would leave the headline clipped
    if (!G || !items.length || html.classList.contains("a11y-still")) return done();
    if (window.DrawSVGPlugin) G.registerPlugin(window.DrawSVGPlugin);
    // 1 · the coach's mark under "לשאול" is the last stroke of the opening, once the lines are out of their masks
    var hm = window.DrawSVGPlugin && $(".hero h1 .hd-mark path");
    if (hm) G.set(hm, { drawSVG: "0% 0%" });
    var tl = window.__open = G.timeline({ defaults: { ease: "power3.out" }, onComplete: function () { done(); G.set(items.concat(mark ? [mark] : []), { clearProps: "opacity,transform,clipPath" }); if (hm) G.to(hm, { drawSVG: "0% 100%", duration: 0.6, ease: "power2.inOut" }); } });
    items.forEach(function (el, i) {
      var at = Math.min(i, 6) * 0.09;
      if (el.matches("h1")) {
        var lines = el.hasAttribute("data-lines") ? $$(":scope > span", el) : [el];
        tl.set(el, { opacity: 1 }, at).fromTo(lines, { clipPath: SHUT, y: 28 }, { clipPath: OPEN, y: 0, duration: 0.9, stagger: 0.12, clearProps: "clipPath,transform" }, at);
      } else tl.fromTo(el, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6 }, at + 0.1);
    });
    var path = mark && getComputedStyle(mark).display !== "none" && $("path", mark);
    if (path && window.DrawSVGPlugin) {
      tl.set(mark, { opacity: 1 }, 0.1)
        .fromTo(path, { drawSVG: "0% 0%", fillOpacity: 0, stroke: "currentColor", strokeWidth: 3 }, { drawSVG: "0% 100%", duration: 0.8, ease: "power2.inOut" }, 0.1)
        .to(path, { fillOpacity: 1, duration: 0.35, ease: "power2.out" }, 0.75)
        .to(path, { strokeWidth: 0, duration: 0.2 }, 0.95);
    } else if (mark) tl.fromTo(mark, { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.1);
  })();

  /* ---------- reveal: groups stagger 70ms inside themselves only ---------- */
  $$(".rv").forEach(function (el) {
    var sibs = $$(":scope > .rv", el.parentElement); var i = sibs.indexOf(el);
    if (i > 0) el.style.setProperty("--i", Math.min(i, 5));
    inView(el, function () { el.classList.add("is-in"); });
  });

  /* ---------- header: headroom (leaves on scroll down, back on the first move up) ---------- */
  var hd = $("#hd");
  if (hd) {
    var last = scrollY, tol = 6, raf = 0;
    var hold = function () { return html.classList.contains("lock") || (hd.contains(document.activeElement) && hd.querySelector(":focus-visible")); };
    var upd = function () {
      raf = 0; var y = scrollY, d = y - last, top = hd.offsetHeight + 24;
      if (y <= top || hold()) { hd.classList.remove("is-hidden"); last = y; return; }
      if (Math.abs(d) < tol) return;
      hd.classList.toggle("is-hidden", d > 0); last = y;
    };
    addEventListener("scroll", function () { if (!raf) raf = requestAnimationFrame(upd); }, { passive: true });
    hd.addEventListener("focusin", upd); upd();
  }

  /* ---------- drawer: the scroll lock is on html with a stable gutter, never body + padding (headers.md) ---------- */
  var drawer = $("#drawer"), burger = $(".burger");
  if (drawer && burger) {
    var setDrawer = function (o) {
      drawer.classList.toggle("open", o); burger.setAttribute("aria-expanded", String(o)); html.classList.toggle("lock", o);
      if (o) { drawer.removeAttribute("inert"); setTimeout(function () { var f = $(".drawer-x", drawer); if (f) f.focus(); }, 60); }
      else { drawer.setAttribute("inert", ""); burger.focus({ preventScroll: true }); }
    };
    burger.addEventListener("click", function () { setDrawer(true); });
    $$("[data-close]", drawer).forEach(function (b) { b.addEventListener("click", function () { setDrawer(false); }); });
    $$(".drawer-list a, .drawer-foot a", drawer).forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && drawer.classList.contains("open")) setDrawer(false); });
  }

  /* ---------- 01 the hero that asks: one moment from Avinoam's quiz, answered in place ---------- */
  var card = $("[data-qcard]");
  if (card) {
    var ask = $(".qcard-ask", card), res = $("[data-res]", card);
    var ANSWERS = [
      { v: "זו התגובה שאני הייתי בוחר.", w: "לפני שמטפלים בהתנגדות, בודקים אם היא בכלל במחיר. אם חוץ מהכסף הכל בסדר, יש על מה לדבר.", ok: true },
      { v: "שאלה, וזה כבר כיוון נכון.", w: "אבל היא עדיין מתווכחת עם המחיר, לפני שבדקת אם הוא בכלל הבעיה." },
      { v: "זו קפיצה ישר לפתרון.", w: "הלקוח קיבל הסבר, ועדיין לא אמר לך מה באמת מפריע לו." }];
    $$("button", ask).forEach(function (b) {
      b.addEventListener("click", function () {
        var a = ANSWERS[+b.getAttribute("data-a")];
        $("[data-verdict]", res).textContent = a.v; $("[data-why]", res).textContent = a.w;
        res.classList.toggle("is-ok", !!a.ok);
        ask.classList.remove("is-on"); res.classList.add("is-on");
        try { sessionStorage.setItem("pitch-hero-answer", b.getAttribute("data-a")); } catch (e) {}
        setTimeout(function () { var go = $(".qcard-go a", res); if (go && b === document.activeElement) go.focus({ preventScroll: true }); }, 120);
      });
    });
    $("[data-again]", res).addEventListener("click", function () { res.classList.remove("is-on"); ask.classList.add("is-on"); var f = $("button", ask); if (f) f.focus({ preventScroll: true }); });
  }

  /* ---------- the moves need GSAP; without it (or with reduced motion) every final state is already in the markup ---------- */
  function moves() {
    var G = window.gsap, ST = window.ScrollTrigger;
    var ok = !!(G && ST) && !reduced && !html.classList.contains("a11y-still");
    if (G && ST) { G.registerPlugin(ST); if (window.DrawSVGPlugin) G.registerPlugin(window.DrawSVGPlugin); }

    /* MV:g48, the pain scene fills word by word. Words only: Hebrew is never split into letters */
    var fillP = $("[data-fill]");
    if (fillP && ok && !editing) {
      var words = fillP.textContent.trim().split(/\s+/); fillP.textContent = "";
      var spans = words.map(function (w, i) { var s = document.createElement("span"); s.className = "w"; s.textContent = w; fillP.appendChild(s); if (i < words.length - 1) fillP.appendChild(document.createTextNode(" ")); return s; });
      G.timeline({ scrollTrigger: { trigger: fillP, start: "top 80%", end: "bottom 45%", scrub: 0.4 } })
        .fromTo(spans, { color: "#675A4B" }, { color: "#1C1A17", duration: 0.4, stagger: 0.35, ease: "none" }, 0);
    }

    /* MV:g22, the method: the circle is pinned, the arc colors from station to station and closes back on agreement */
    var method = $(".method"), stage = $(".method-stage", method || document);
    if (method && stage) {
      var draw = $(".ring-draw", method), steps = $$(".mstep", method), sts = $$(".ring-st", method);
      var setStep = function (p) {
        var k = p < 0.34 ? 0 : p < 0.67 ? 1 : 2;
        steps.forEach(function (s, i) { s.classList.toggle("is-on", i === k); });
        sts.forEach(function (s, i) { s.classList.toggle("lit", i === 0 || p >= i / 3 - 0.001); });
        method.classList.toggle("loop-on", p > 0.96);
      };
      var full = function () { if (G && window.DrawSVGPlugin) G.set(draw, { drawSVG: "0% 100%" }); sts.forEach(function (s) { s.classList.add("lit"); }); };
      if (ok && window.DrawSVGPlugin) {
        var mm = G.matchMedia();
        mm.add("(min-width: 1024px)", function () {
          method.classList.add("is-pinning"); setStep(0);
          G.set(draw, { drawSVG: "0% 0%" });
          var tl = G.timeline({ scrollTrigger: { trigger: stage, start: "center center", end: "+=240%", scrub: 0.6, pin: true, anticipatePin: 1,
            onUpdate: function (self) { setStep(self.progress); } } });
          tl.to(draw, { drawSVG: "0% 100%", ease: "none", duration: 1 });
          return function () { method.classList.remove("is-pinning", "loop-on"); steps.forEach(function (s) { s.classList.add("is-on"); }); };
        });
        mm.add("(max-width: 1023px)", function () {
          G.set(draw, { drawSVG: "0% 0%" });
          G.to(draw, { drawSVG: "0% 100%", ease: "none", scrollTrigger: { trigger: ".method-ring", start: "top 80%", end: "bottom 40%", scrub: 0.5,
            onUpdate: function (self) { sts.forEach(function (s, i) { s.classList.toggle("lit", i === 0 || self.progress >= i / 3); }); } } });
          steps.forEach(function (s) { s.classList.add("is-on"); });
        });
      } else full();
    }

    /* the signature: the six-muscle map builds with the scroll, the values counted at the pace of the scroll (MV:g14) */
    var hex = $("[data-hex]");
    if (hex) {
      var svg = $("svg", hex), C = 220, R = 150;
      var M = [["הסכמה", 72], ["שאלה", 86], ["הקשבה", 64], ["ידע", 58], ["אומץ לסגור", 38], ["זיהוי התנגדות", 60]];
      var pt = function (i, r) { var a = (-90 + i * 60) * Math.PI / 180; return [C + r * Math.cos(a), C + r * Math.sin(a)]; };
      var poly = function (r) { return M.map(function (_, i) { return pt(i, r).map(function (n) { return n.toFixed(1); }).join(","); }).join(" "); };
      var mk = function (tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
      var grid = $(".hex-grid", svg), dots = $(".hex-dots", svg), labels = $(".hex-labels", svg), shape = $(".hex-shape", svg), score = $("[data-score]", hex);
      var rings = [0.25, 0.5, 0.75, 1].map(function (f) { return mk("polygon", { points: poly(R * f), "class": f === 1 ? "outer" : "" }, grid); });
      var spokes = M.map(function (_, i) { var p = pt(i, R); return mk("line", { x1: C, y1: C, x2: p[0].toFixed(1), y2: p[1].toFixed(1) }, grid); });
      var dotEls = M.map(function () { return mk("circle", { r: 5, cx: C, cy: C }, dots); });
      var vals = M.map(function (m, i) {
        var p = pt(i, R + 42), up = i === 0 ? -8 : (i === 3 ? 10 : 0), lo = m[1] === 38 ? " is-lo" : "";
        var v = mk("text", { x: p[0].toFixed(1), y: (p[1] + up - 6).toFixed(1), "text-anchor": "middle", "class": "val" + lo }, labels); v.textContent = String(m[1]);
        var l = mk("text", { x: p[0].toFixed(1), y: (p[1] + up + 16).toFixed(1), "text-anchor": "middle", "class": lo.trim() }, labels); l.textContent = m[0];
        // 3 · the muscle's icon on the reading side of its name (RTL: to the right of the centered name)
        var w = l.getComputedTextLength ? l.getComputedTextLength() : 60;
        var g = mk("g", { "class": "hex-ic" + lo, transform: "translate(" + (p[0] + w / 2 + 6).toFixed(1) + "," + (p[1] + up + 1).toFixed(1) + ") scale(.72)" }, labels);
        g.innerHTML = MUSCLE[m[0]] || "";
        return v;
      });
      var draw6 = function (t) {
        shape.setAttribute("points", M.map(function (m, i) { return pt(i, R * m[1] / 100 * t).map(function (n) { return n.toFixed(1); }).join(","); }).join(" "));
        M.forEach(function (m, i) { var p = pt(i, R * m[1] / 100 * t); dotEls[i].setAttribute("cx", p[0].toFixed(1)); dotEls[i].setAttribute("cy", p[1].toFixed(1)); vals[i].textContent = String(Math.round(m[1] * t)); });
        if (score) score.textContent = String(Math.round(63 * t));
      };
      if (ok && window.DrawSVGPlugin) {
        var st = { t: 0 }; draw6(0);
        var chips = $$(".chip", hex);
        var tl2 = G.timeline({ scrollTrigger: { trigger: hex, start: "top 85%", end: "center 42%", scrub: 0.5 } });
        tl2.from(rings, { scale: 0, svgOrigin: C + " " + C, opacity: 0, duration: 0.5, stagger: 0.08, ease: "power2.out" }, 0)
          .from(spokes, { drawSVG: "0% 0%", duration: 0.4, stagger: 0.05, ease: "none" }, 0.1)
          .to(st, { t: 1, duration: 1, ease: "power2.out", onUpdate: function () { draw6(st.t); } }, 0.35)
          .from(chips, { opacity: 0, y: 16, duration: 0.3, stagger: 0.1, ease: "power2.out" }, 1.1)
          .from($$(".hex-ic path, .hex-ic circle", hex), { drawSVG: "0%", duration: 0.5, stagger: 0.03, ease: "power2.inOut" }, 0.9);
      } else draw6(1);
    }

    /* MV:g04 level A, ported from export/g04.html: the words of each section heading rise out of a mask at the pace of
       the scroll. Split into words only (the export splits lines too): words do not change when the width or the
       toolbar's text size does, so nothing has to be re-split */
    // split after the fonts are in: SplitText measures the words, and before Talent arrives it measures the fallback
    if (ok && window.SplitText && !editing) (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      G.registerPlugin(window.SplitText);
      $$("main .sec h2, main .close h2").forEach(function (h) {
        var sp = new window.SplitText(h, { type: "words" });
        // the export's inset(100% 0 0 0) ends on the letter box and cuts the tails of ק ן ף ץ; the mask here reaches past it
        // a heading inside the pinned method stage names it as its pinnedContainer, or a refresh mid-page measures it
        // with the pin's 240% added (audit st-refresh, 24.9.2026)
        var pc = h.closest(".method-stage");
        G.fromTo(sp.words, { clipPath: "inset(125% -6% -25% -6%)", opacity: 0 }, { clipPath: "inset(-20% -6% -25% -6%)", opacity: 1, stagger: 0.5, ease: "none", scrollTrigger: { trigger: h, start: "top 80%", end: "top 30%", scrub: 1, pinnedContainer: pc && method && method.classList.contains("is-pinning") ? pc : undefined } });
      });
      // 1 · MV:g42 (export/g42.html): the coach's mark draws once the words of its heading are up
      if (window.DrawSVGPlugin) $$("main .sec h2 .hd-mark path, main .close h2 .hd-mark path").forEach(function (p) {
        var h = p.closest("h2");
        G.fromTo(p, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.75, ease: "power2.inOut", scrollTrigger: { trigger: h, start: "top 45%", toggleActions: "play none none none", pinnedContainer: h.closest(".method-stage") && method && method.classList.contains("is-pinning") ? h.closest(".method-stage") : undefined } });
      });
      ST.refresh();
      // and once more when the page has settled: the first measure after the split came out 80 to 110px short at the
      // closing heading, varying from load to load, while any later refresh agreed with itself (audit st-refresh)
      setTimeout(function () { ST.refresh(); }, 900);
    });

    /* MV:g02, ported from export/g02.html: the portrait and the video pictures are painted from the bottom up */
    if (ok && !editing) {
      $$(".about-img img, .vbtn, .pain-photo img, .gate-media img").forEach(function (el) {
        var state = { val: 0 }; el.classList.add("paint");
        G.to(state, { val: 100, ease: "none", scrollTrigger: { trigger: el, start: "top 85%", end: "top 25%", scrub: true },
          onUpdate: function () { el.style.setProperty("--reveal", state.val + "%"); } });
      });
    }

    if (ok) { if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); }); addEventListener("load", function () { ST.refresh(); }); }
  }
  if (document.readyState === "complete") moves(); else addEventListener("load", moves);

  /* the toolbar's "stop animations", pressed mid-page: every entrance jumps to its end and stays there (the pin keeps its
     place, so the page does not jump). A heading paused halfway into its mask would otherwise stay cut */
  document.addEventListener("a11y:still", function (e) {
    if (!e.detail || !window.gsap) return;
    if (window.__open) window.__open.progress(1);
    if (window.ScrollTrigger) window.ScrollTrigger.getAll().forEach(function (t) { if (!t.pin && t.animation) { t.animation.progress(1); t.kill(false); } });
    $$(".rv").forEach(function (el) { el.classList.add("is-in"); });
    var w = $(".cmosaic"); if (w) w.classList.add("ready");
  });

  /* ---------- MV:b57's entrance (export/b57.html): the comment frames rise one after another when the wall is on screen ---------- */
  var wall = $(".cmosaic");
  if (wall) { $$(".cshot", wall).forEach(function (c, i) { c.style.setProperty("--d", (i * 70) + "ms"); }); inView(wall, function () { wall.classList.add("ready"); }, 0.85); }

  /* ---------- MV:b02, ported from export/b02.html: a number counts once when it comes on screen. The markup holds the real
     number (no script, no count). It counts with reduced motion too: a changing number is text, not movement
     (engine/motion.md 4; the export skipped it) ---------- */
  $$("[data-count]").forEach(function (el) {
    var to = +el.getAttribute("data-count"), sfx = el.getAttribute("data-suffix") || ""; el.textContent = "0" + sfx;
    inView(el, function () {
      var t0 = null;
      var step = function (ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / 900, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + sfx; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }, 0.8);
  });

  /* ---------- videos: the TikTok player loads only on a click (no request to TikTok before it) ---------- */
  $$(".vbtn").forEach(function (b) {
    b.addEventListener("click", function () {
      var id = b.getAttribute("data-tt"), f = document.createElement("div"), fr = document.createElement("iframe");
      f.className = "vframe"; fr.src = "https://www.tiktok.com/embed/v2/" + id + "?lang=he-IL"; fr.title = b.getAttribute("aria-label").replace("לנגן את הסרטון: ", "סרטון: ");
      fr.setAttribute("allow", "encrypted-media; fullscreen; picture-in-picture"); fr.setAttribute("allowfullscreen", "");
      f.appendChild(fr); b.replaceWith(f); fr.focus();
    });
  });

  /* ---------- questions: one open at a time is not forced; each opens and closes on its own ---------- */
  $$(".acc-i").forEach(function (it) {
    var b = $("button", it), pn = $(".acc-p", it); pn.classList.toggle("open", b.getAttribute("aria-expanded") === "true");
    b.addEventListener("click", function () { var o = b.getAttribute("aria-expanded") !== "true"; b.setAttribute("aria-expanded", String(o)); pn.classList.toggle("open", o); });
  });

  /* ---------- the two gates choose the interest in the form below, and bring the visitor to it ---------- */
  $$("[data-pick]").forEach(function (b) {
    b.addEventListener("click", function () {
      var r = $('.lead-form[data-form="talk"] input[name="kind"][value="' + b.getAttribute("data-pick") + '"]'); if (!r) return;
      r.checked = true; r.dispatchEvent(new Event("change", { bubbles: true }));
      var card = r.closest(".form-card"); card.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      setTimeout(function () { var n = $('input[name="name"]', card); if (n) n.focus({ preventScroll: true }); }, reduced ? 0 : 600);
    });
  });

  /* ---------- mobile action bar (MV:cv1): after the hero's own button, never beside a form, never over the keyboard ---------- */
  var bar = $("[data-mbar]");
  if (bar) {
    var origin = $("[data-cta-origin]"), ends = $$("[data-cta-end]"), typing = false;
    // a button in the page for the same action: while one is on the screen, the bar would only repeat it
    var go = bar.querySelector("a[href]"), twins = go ? $$('main a[href="' + go.getAttribute("href") + '"]') : [];
    var place = function () {
      var o = origin && origin.getBoundingClientRect();
      var nearForm = ends.some(function (e) { var r = e.getBoundingClientRect(); return r.top < innerHeight * 0.7 && r.bottom > 0; });
      var twin = twins.some(function (a) { var r = a.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight && r.bottom > 0; });
      var on = (!o || o.bottom < 8) && !nearForm && !twin && !typing && innerWidth < 768;
      if (on !== bar.classList.contains("is-on")) {
        bar.classList.toggle("is-on", on); html.classList.toggle("bar-on", on);
        if (on) bar.removeAttribute("inert"); else bar.setAttribute("inert", "");
      }
    };
    bar.setAttribute("inert", "");
    addEventListener("scroll", function () { requestAnimationFrame(place); }, { passive: true }); addEventListener("resize", place);
    document.addEventListener("focusin", function (e) { if (e.target.matches("input, textarea, select")) { typing = true; place(); } });
    document.addEventListener("focusout", function (e) { if (e.target.matches("input, textarea, select")) { typing = false; setTimeout(place, 160); } });
    place(); setTimeout(place, 300);
  }

  /* ---------- the forms: validation at the right moment (MV:cv9) and a send that never loses the lead (MV:cv8) ---------- */
  var DOMAINS = ["gmail.com", "walla.co.il", "walla.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "012.net.il", "bezeqint.net", "netvision.net.il"];
  var lev = function (a, b) { var m = a.length, n = b.length, d = [], i, j; for (i = 0; i <= m; i++) d[i] = [i]; for (j = 0; j <= n; j++) d[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; };
  var digits = function (v) { return v.replace(/[^0-9]/g, ""); };
  var norm = function (v) { var d = digits(v); if (d.indexOf("972") === 0) d = "0" + d.slice(3); return d; };
  // mobile (05x) and VoIP (07x) are ten digits; landlines (02, 03, 04, 08, 09) are nine
  var fmt = function (d) { if (/^0[57][0-9]{8}$/.test(d)) return d.slice(0, 3) + "-" + d.slice(3, 6) + "-" + d.slice(6); if (/^0[2-489][0-9]{7}$/.test(d)) return d.slice(0, 2) + "-" + d.slice(2, 5) + "-" + d.slice(5); return null; };
  var RULES = {
    name: function (v) { v = v.trim(); if (!v) return "איך לקרוא לך? חסר שם"; if (v.length < 2) return "שם של אות אחת? כתוב לפחות שתיים"; return ""; },
    phone: function (v) { var d = norm(v), miss; if (!d) return "חסר מספר טלפון";
      if (/^0[57]/.test(d)) { if (d.length < 10) { miss = 10 - d.length; return (miss === 1 ? "חסרה ספרה אחת" : "חסרות " + miss + " ספרות") + ": מספר נייד הוא 10 ספרות"; }
        if (d.length > 10) return "יש ספרות מיותרות: מספר נייד הוא 10 ספרות"; }
      return fmt(d) ? "" : "המספר לא נראה כמו טלפון ישראלי"; },
    email: function (v, el) { v = v.trim(); if (!v) return el.hasAttribute("data-optional") ? "" : "חסרה כתובת מייל, לשם נשלח הספר"; if (v.indexOf("@") < 0) return "בכתובת חסר @"; if (!/^[^@ ]+@[^@ ]+[.][^@ ]{2,}$/.test(v)) return "הכתובת לא שלמה, למשל name@gmail.com"; return ""; },
    consent: function (v, el) { return el.checked ? "" : (el.closest('[data-form="book"]') ? "צריך לסמן כדי שאוכל לשלוח לך את הספר" : "צריך לאשר כדי שאוכל לחזור אליך"); },
    kind: function (v, el) { return $("input:checked", el) ? "" : "מה הכי קרוב למה שאתה מחפש?"; }
  };
  var ENDPOINT = ""; // the sketch has no server yet: the flow is real, the request is not (stage 4 wires the database)

  $$(".lead-form").forEach(function (form) {
    var which = form.getAttribute("data-form"), box = form.closest(".form-card");
    var sum = $("[data-summary]", form), sug = $("[data-suggest]", form), panel = $("[data-panel]", form), btn = $(".send", form), lab = $("[data-lab]", btn);
    var label0 = lab.textContent, touched = {}, KEY = "pitch-draft-" + which, tries = 0, timer = 0, busy = false, waiting = false;
    var inputs = $$("[data-v]", form);
    var fields = [].slice.call(form.elements).filter(function (f) { return f.name && f.type !== "checkbox" && f.type !== "radio"; });
    try { var dr = JSON.parse(localStorage.getItem(KEY) || "{}"); fields.forEach(function (f) { if (dr[f.name]) f.value = dr[f.name]; }); } catch (e) {}
    var st0 = 0; form.addEventListener("input", function () { clearTimeout(st0); st0 = setTimeout(function () { var o = {}; fields.forEach(function (f) { o[f.name] = f.value; }); try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }, 300); });

    var valOf = function (inp) { return inp.value || ""; };
    var errOf = function (inp) { var k = inp.getAttribute("data-v"); if (k === "consent") return $(".consent-err", form); if (k === "kind") return $(".kind-err", form); return inp.closest(".f"); };
    var check = function (inp, show) {
      var k = inp.getAttribute("data-v"), m = RULES[k](valOf(inp), inp), wrapEl = errOf(inp);
      if (show || touched[k]) {
        if (k === "consent" || k === "kind") { wrapEl.classList.toggle("is-on", !!m); $("p", wrapEl).textContent = m; }
        else { wrapEl.classList.toggle("is-bad", !!m); wrapEl.classList.toggle("is-ok", !m && valOf(inp).trim() !== ""); if (m) $(".f-err p", wrapEl).textContent = m; }
        if (k !== "kind") inp.setAttribute("aria-invalid", m ? "true" : "false");
      }
      return m;
    };
    var suggest = function (inp) {
      if (!inp || !sug) return;
      var v = inp.value.trim(), at = v.lastIndexOf("@"); if (at < 1) { sug.classList.remove("is-open"); return; }
      var dom = v.slice(at + 1).toLowerCase(), best = null, bd = 9; if (DOMAINS.indexOf(dom) > -1) { sug.classList.remove("is-open"); return; }
      DOMAINS.forEach(function (d) { var x = lev(dom, d); if (x < bd) { bd = x; best = d; } });
      if (best && bd <= 2) { sug.fixed = v.slice(0, at + 1) + best; $("[data-fixed]", sug).textContent = sug.fixed; sug.classList.add("is-open"); inp.closest(".f").classList.remove("is-ok"); } else sug.classList.remove("is-open");
    };
    if (sug) $("button", sug).addEventListener("click", function () { var inp = $("[data-v=email]", form); inp.value = sug.fixed; sug.classList.remove("is-open"); check(inp, true); inp.focus(); });
    inputs.forEach(function (inp) {
      var k = inp.getAttribute("data-v");
      if (k === "consent" || k === "kind") { inp.addEventListener("change", function () { touched[k] = true; check(inp, true); summary(false); }); return; }
      inp.addEventListener("blur", function () {
        if (inp.value.trim() === "" && !touched[k]) return;
        if (k === "phone") { var f = fmt(norm(inp.value)); if (f) inp.value = f; }
        touched[k] = true; check(inp, true); if (k === "email") suggest(inp);
      });
      // after the first mistake it re-checks while typing: the error leaves the moment it is fixed, never arrives mid-word
      inp.addEventListener("input", function () { if (touched[k]) check(inp, true); if (k === "email" && sug) sug.classList.remove("is-open"); });
    });
    var nameOf = function (inp) { var k = inp.getAttribute("data-v"); if (k === "consent") return "האישור"; if (k === "kind") return "מה מעניין אותך"; return inp.closest(".f").querySelector("label").textContent.replace(/[(].*[)]/, "").trim(); };
    var summary = function (focus) {
      if (!sum.classList.contains("is-open") && !focus) return 0;
      var bad = inputs.filter(function (inp) { return RULES[inp.getAttribute("data-v")](valOf(inp), inp); }), ul = $("ul", sum); ul.textContent = "";
      bad.forEach(function (inp) {
        var li = document.createElement("li"), a = document.createElement("a"), target = inp.getAttribute("data-v") === "kind" ? $("input", inp) : inp;
        a.href = "#" + (target.id || ""); a.textContent = nameOf(inp) + ": " + RULES[inp.getAttribute("data-v")](valOf(inp), inp);
        a.addEventListener("click", function (ev) { ev.preventDefault(); target.focus(); }); li.appendChild(a); ul.appendChild(li);
      });
      $("[data-sum-count]", sum).textContent = bad.length === 1 ? "שדה אחד צריך תיקון" : bad.length + " שדות צריכים תיקון";
      sum.classList.toggle("is-open", bad.length > 0);
      if (focus && bad.length) { sum.focus({ preventScroll: true }); sum.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" }); }
      return bad.length;
    };
    form.addEventListener("input", function () { summary(false); });

    // sending: the button keeps its width, the label changes in place, a failure retries by itself
    var state = function (s) { box.setAttribute("data-state", s); };
    var setLab = function (t) { lab.classList.remove("in"); void lab.offsetWidth; lab.textContent = t; lab.classList.add("in"); };
    var msg = $("[data-msg]", panel), sub = $("[data-sub]", panel), ring = $(".ring-cd", panel);
    var show = function (kind, m, s) { panel.setAttribute("data-kind", kind); msg.textContent = m; sub.textContent = s || ""; panel.classList.add("is-open"); };
    var data = function () { var o = { form: which }; fields.forEach(function (f) { o[f.name] = f.value.trim(); }); var k = $('input[name="kind"]:checked', form); if (k) o.kind = k.value; try { o.heroAnswer = sessionStorage.getItem("pitch-hero-answer") || ""; } catch (e) {} return o; };
    var send = function (o) {
      if (!ENDPOINT) return new Promise(function (res) { setTimeout(res, 800); });
      return fetch(ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o) }).then(function (r) { if (!r.ok) throw new Error(r.status); });
    };
    var countdown = function (sec) {
      clearInterval(timer); var left = sec; ring.style.setProperty("--t", sec + "s"); ring.classList.remove("run"); void ring.getBoundingClientRect(); ring.classList.add("run");
      sub.textContent = "אנסה שוב לבד בעוד " + left + " שניות";
      timer = setInterval(function () { left--; if (left <= 0) { clearInterval(timer); submit(); } else sub.textContent = "אנסה שוב לבד בעוד " + left + " שניות"; }, 1000);
    };
    var submit = function () {
      if (busy) return; busy = true; clearInterval(timer); btn.style.minWidth = btn.offsetWidth + "px";
      var o = data();
      if (navigator.onLine === false) { busy = false; waiting = true; state("offline"); setLab("ממתין לחיבור"); show("offline", "אין חיבור לאינטרנט. הפרטים שמורים.", "הטופס יישלח לבד ברגע שהחיבור יחזור."); return; }
      state("sending"); setLab("שולח"); panel.classList.remove("is-open"); btn.setAttribute("aria-busy", "true");
      send(o).then(function () {
        var first = (o.name || "").split(" ")[0];
        try { localStorage.removeItem(KEY); sessionStorage.setItem("lead-name", first); } catch (e) {}
        location.href = "thanks.html?form=" + which + "&name=" + encodeURIComponent(first);
      }, function () {
        busy = false; tries++; btn.removeAttribute("aria-busy"); state("error"); setLab(label0);
        if (tries < 3) { panel.classList.remove("is-final"); show("error", "לא הצלחתי לשלוח. הפרטים שמורים אצלך.", ""); countdown(tries === 1 ? 5 : 10); }
        else { panel.classList.add("is-final"); show("error", "השרת לא עונה כרגע. הפרטים שמורים.", "אפשר לנסות שוב בעוד כמה דקות, הם לא ילכו לאיבוד."); }
      });
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      inputs.forEach(function (inp) { var k = inp.getAttribute("data-v"); touched[k] = true; if (k === "phone") { var f = fmt(norm(inp.value)); if (f) inp.value = f; } check(inp, true); });
      suggest($("[data-v=email]", form));
      if (summary(true)) return;
      tries = 0; submit();
    });
    addEventListener("online", function () { if (waiting) { waiting = false; submit(); } });
  });

  /* ---------- thank-you page (MV:cv3): the form it came from, the name, the time, one conversion per session ---------- */
  var ty = $("[data-thanks]");
  if (ty) {
    var q = new URLSearchParams(location.search), nm = "", fm = q.get("form") === "talk" ? "talk" : "book";
    ty.setAttribute("data-form", fm);
    try { nm = q.get("name") || sessionStorage.getItem("lead-name") || ""; } catch (e) {}
    nm = nm.trim().split(" ")[0];
    if (nm) $("[data-name]", ty).textContent = nm; else $("[data-name-wrap]", ty).remove();
    var d = new Date(), two = function (n) { return (n < 10 ? "0" : "") + n; }, hm = two(d.getHours()) + ":" + two(d.getMinutes());
    $$("[data-now]", ty).forEach(function (e) { e.textContent = hm; });
    inView(ty, function () {
      ty.classList.add("is-in");
      // a refresh or the back button is not a second lead
      try { if (sessionStorage.getItem("lead-fired-" + fm)) return; sessionStorage.setItem("lead-fired-" + fm, "1"); } catch (e) {}
      (window.dataLayer = window.dataLayer || []).push({ event: "generate_lead", form: fm });
      if (typeof window.fbq === "function") window.fbq("track", "Lead");
    });
  }

  /* ---------- 404 (MV:cv6): guess the page from the broken address, and search the site ---------- */
  var nf = $("[data-404]");
  if (nf) {
    var PAGES = [
      { t: "עמוד הבית", u: "index.html", k: "בית ראשי home" },
      { t: "השיטה: הסכמה, שאלה, הקשבה", u: "index.html#method", k: "method שיטה הסכמה שאלה הקשבה" },
      { t: "מבחן הכושר לאנשי מכירות", u: "quiz.html", k: "quiz test מבחן כושר" },
      { t: "הספר הפוך גוטה", u: "index.html#gym", k: "book ספר הפוך גוטה מתנה" },
      { t: "רשימת ההמתנה לחדר הכושר", u: "index.html#gym", k: "gym חדר כושר רשימה המתנה" },
      { t: "מי אני", u: "index.html#about", k: "about אודות אבינועם" },
      { t: "לעבוד איתי: אימון והדרכה", u: "index.html#work", k: "work coaching אימון הדרכה צוות" },
      { t: "הצהרת נגישות", u: "accessibility.html", k: "accessibility נגישות" },
      { t: "מדיניות פרטיות", u: "privacy.html", k: "privacy פרטיות" },
      { t: "תנאי שימוש", u: "terms.html", k: "terms תנאים" }];
    var SLUG = { "method": "index.html#method", "about": "index.html#about", "quiz": "quiz.html", "test": "quiz.html", "book": "index.html#gym", "gym": "index.html#gym", "work": "index.html#work", "coaching": "index.html#work", "privacy": "privacy.html", "terms": "terms.html", "accessibility": "accessibility.html" };
    var path = decodeURIComponent(location.pathname).split("/").filter(Boolean).pop() || "";
    path = path.replace(/[.]html$/, "").toLowerCase();
    $("[data-shown]", nf).textContent = "/" + path;
    var levd = function (a, b) { var m = a.length, n = b.length, dd = [], i, j; for (i = 0; i <= m; i++) dd[i] = [i]; for (j = 0; j <= n; j++) dd[0][j] = j; for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) dd[i][j] = Math.min(dd[i - 1][j] + 1, dd[i][j - 1] + 1, dd[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return dd; };
    var best = null, bs = 1;
    Object.keys(SLUG).forEach(function (s) { if (!path) return; var dd = levd(path, s), r = dd[path.length][s.length] / Math.max(path.length, s.length); if (r < bs) { bs = r; best = s; } });
    var guess = $("[data-guess]", nf);
    if (best && bs <= 0.45 && path !== "404") {
      guess.hidden = false; guess.href = SLUG[best];
      var hit = PAGES.find(function (p) { return p.u === SLUG[best]; }) || { t: best };
      $("[data-gt]", nf).textContent = hit.t;
      var gu = $("[data-gu]", nf), dd = levd(path, best), i = path.length, j = best.length, out = [];
      while (j > 0) { if (i > 0 && path[i - 1] === best[j - 1] && dd[i][j] === dd[i - 1][j - 1]) { out.unshift([best[j - 1], 0]); i--; j--; } else if (i > 0 && dd[i][j] === dd[i - 1][j - 1] + 1) { out.unshift([best[j - 1], 1]); i--; j--; } else if (dd[i][j] === dd[i][j - 1] + 1) { out.unshift([best[j - 1], 1]); j--; } else i--; }
      gu.textContent = "/"; out.forEach(function (c) { if (c[1]) { var mk = document.createElement("mark"); mk.textContent = c[0]; gu.appendChild(mk); } else gu.appendChild(document.createTextNode(c[0])); });
      $("[data-h]", nf).textContent = "הכתובת הזו לא קיימת, אבל נראה שחיפשת משהו קרוב";
    }
    // results are text nodes only: the query is the visitor's input and never becomes HTML
    var qi = $("[data-q]", nf), list = $("[data-list]", nf), empty = $("[data-empty]", nf);
    var filter = function () {
      var v = qi.value.trim().toLowerCase(), n = 0; list.textContent = "";
      PAGES.forEach(function (p) {
        var hay = (p.t + " " + p.k).toLowerCase(); if (v && hay.indexOf(v) < 0) return; if (!v && n >= 6) return; n++;
        var li = document.createElement("li"), a = document.createElement("a"), s = document.createElement("span"), at = p.t.toLowerCase().indexOf(v);
        a.href = p.u;
        if (v && at > -1) { s.appendChild(document.createTextNode(p.t.slice(0, at))); var m = document.createElement("mark"); m.textContent = p.t.slice(at, at + v.length); s.appendChild(m); s.appendChild(document.createTextNode(p.t.slice(at + v.length))); }
        else s.textContent = p.t;
        a.appendChild(s); li.appendChild(a); list.appendChild(li);
      });
      empty.hidden = n > 0;
    };
    qi.addEventListener("input", filter);
    qi.addEventListener("keydown", function (e) { if (e.key === "ArrowDown") { var a = $("a", list); if (a) { e.preventDefault(); a.focus(); } } });
    list.addEventListener("keydown", function (e) { var all = $$("a", list), k = all.indexOf(document.activeElement); if (e.key === "ArrowDown" && k < all.length - 1) { e.preventDefault(); all[k + 1].focus(); } else if (e.key === "ArrowUp") { e.preventDefault(); (k > 0 ? all[k - 1] : qi).focus(); } else if (e.key === "Escape") qi.focus(); });
    filter();
  }
})();
