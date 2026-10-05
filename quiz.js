/* The quiz "איזה איש מכירות אתה?" (/quiz). The flow and the scoring follow Avinoam's artifact of 5.10.2026:
   8 questions; a professional's answer (v) asks a second pick "on a less good day", which is what gets scored;
   "I don't know" answers (unk) lead to the talent when they are the majority; five professional moves make the
   virtuoso; otherwise the style with the most weight, ties broken by the tie questions in order, and a second
   typecast when it reaches 75% of the first. The texts live in quiz-data.js, verbatim. The result carries the
   typecast into the book form and into the WhatsApp message */
(function () {
  "use strict";
  var root = document.querySelector("[data-quiz]"), D = window.QUIZ;
  if (!root || !D) return;
  var WHATSAPP = "972542688685"; // Avinoam's number, as he set it in his quiz
  var STYLES = ["P", "D", "R", "G"], V_ALL = 5, PRO_MIN = 3, T_NEEDED = 5;
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || root).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var track = function (ev, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, data || {})); } catch (e) {} };
  var Q = D.questions, order = [], answers = [], cur = 0, stage = 1;

  var show = function (name) {
    $$(".qz-screen").forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-screen") === name); });
    root.setAttribute("data-at", name);
    scrollTo(0, 0);
    var h = $('[data-screen="' + name + '"] [tabindex="-1"]');
    if (h && name !== "intro") h.focus({ preventScroll: true });
  };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  var begin = function () {
    order = Q.map(function (q) {
      if (q.fixed) return q.opts.slice();
      return shuffle(q.opts.filter(function (o) { return !o.unk; })).concat(q.opts.filter(function (o) { return o.unk; }));
    });
    answers = []; cur = 0; stage = 1;
    $("[data-total]").textContent = Q.length;
    track("quiz_start");
    show("question"); render();
  };

  var render = function () {
    var q = Q[cur], a = answers[cur] || {}, box = $("[data-answers]");
    $("[data-num]").textContent = cur + 1;
    $("[data-bar]").style.transform = "scaleX(" + (cur / Q.length).toFixed(3) + ")";
    $("[data-back]").hidden = cur === 0 && stage === 1;
    $("[data-q]").textContent = q.q;
    $("[data-second]").hidden = stage !== 2;
    box.textContent = "";
    if (stage === 2) {
      var f = document.createElement("p"); f.className = "qz-first"; f.textContent = a.first.t;
      var fl = document.createElement("span"); fl.textContent = "הבחירה הראשונה שלך"; f.appendChild(fl);
      box.appendChild(f);
    }
    (stage === 2 ? order[cur].filter(function (o) { return o.w; }) : order[cur]).forEach(function (o) {
      var b = document.createElement("button"), chosen = stage === 2 ? a.second === o : a.first === o;
      b.type = "button"; b.className = "qz-a" + (o.unk ? " is-unk" : "") + (chosen ? " is-picked" : ""); b.textContent = o.t;
      b.addEventListener("click", function () {
        $$(".qz-a", box).forEach(function (x) { x.classList.toggle("is-picked", x === b); x.disabled = true; });
        if (stage === 2) { answers[cur].second = o; setTimeout(next, reduced ? 0 : 220); return; }
        answers[cur] = { first: o };
        if (o.v) setTimeout(function () { stage = 2; render(); $("[data-q]").focus({ preventScroll: true }); }, reduced ? 0 : 220);
        else setTimeout(next, reduced ? 0 : 220);
      });
      box.appendChild(b);
    });
    if (cur > 0 || stage === 2) $("[data-q]").focus({ preventScroll: true });
  };
  var next = function () { stage = 1; if (cur < Q.length - 1) { cur++; render(); } else finish(); };

  // his score(), as it is
  var score = function () {
    var s = { P: 0, D: 0, R: 0, G: 0 }, v = 0, unk = 0;
    var add = function (o) { for (var k in o.w) s[k] += o.w[k]; };
    answers.forEach(function (a) {
      if (!a || !a.first) return;
      var o = a.first;
      if (o.unk) { unk++; return; }
      if (o.v) { v++; if (a.second) add(a.second); return; }
      add(o);
    });
    if (unk >= T_NEEDED) return { type: "T", unk: unk, v: v, s: s };
    if (v >= V_ALL) return { type: "V", unk: unk, v: v, s: s };
    var ranked = STYLES.slice().sort(function (x, y) { return s[y] - s[x]; }), top = ranked[0];
    if (s[ranked[0]] === s[ranked[1]]) {
      var tied = ranked.filter(function (k) { return s[k] === s[ranked[0]]; });
      var tieQs = Q.map(function (q, i) { return { q: q, i: i }; }).filter(function (x) { return x.q.tie; }).sort(function (x, y) { return x.q.tie - y.q.tie; });
      for (var n = 0; n < tieQs.length; n++) {
        var a = answers[tieQs[n].i], o = a && (a.first && a.first.w ? a.first : a.second);
        if (!o || !o.w) continue;
        var best = tied.slice().sort(function (m, k) { return (o.w[k] || 0) - (o.w[m] || 0); })[0];
        if ((o.w[best] || 0) > 0) { top = best; break; }
      }
    }
    var rest = ranked.filter(function (k) { return k !== top; });
    var second = (s[top] > 0 && s[rest[0]] >= 0.75 * s[top]) ? rest[0] : null;
    return { type: top, second: second, unk: unk, v: v, s: s, pro: v >= PRO_MIN };
  };

  var finish = function () {
    var r = score(), T = D.types[r.type];
    var set = function (k, v) { var el = $('[data-r="' + k + '"]'); if (el) el.textContent = v; };
    var shown = function (k, on) { var el = $('[data-r="' + k + '"]'); if (el) el.hidden = !on; };
    set("name", T.name); set("strength", T.strength); set("calls", T.calls); set("tune", T.tune);
    set("leak-label", T.ask ? "שאלה אליך" : "האימון שלך");
    set("leak-h", T.ask || "שמירה על כושר");
    set("leak-k", (T.ask ? "אימון ראשון" : "איפה") + ":");
    set("train", " " + T.train);
    shown("goal", !!T.goal); set("goal-p", T.goal || "");
    var nt = r.type !== "T" && r.unk >= 2;
    shown("unk", nt); set("unk-n", "על " + r.unk + " שאלות ענית שאין לך את הנתון.");
    var pro = r.pro && r.type !== "T";
    shown("pro", pro); set("pro-n", "ב-" + r.v + " מתוך 5 שאלות בחרת במהלך של מקצוען.");
    shown("second-box", !!r.second);
    if (r.second) { set("second", D.types[r.second].name + "."); set("second-line", D.types[r.second].calls); }
    var msg = "היי אבינועם, עניתי על השאלון \"איזה איש מכירות אתה?\" והטייפקאסט שלי: " + T.name + ".";
    $('[data-r="wa"]').href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    $('[data-r="typecast"]').value = T.name;
    try { sessionStorage.setItem("pitch-typecast", T.name); } catch (e) {}
    track("quiz_complete", { typecast: r.type, typecast_name: T.name, second: r.second, pro_moves: r.v, unknown: r.unk });
    show("result");
  };

  $("[data-start]").addEventListener("click", begin);
  $("[data-back]").addEventListener("click", function () { if (stage === 2) { stage = 1; render(); } else if (cur > 0) { cur--; stage = 1; render(); } });
  $("[data-again]").addEventListener("click", function () { show("intro"); });
  $('[data-r="wa"]').addEventListener("click", function () { track("quiz_whatsapp", { typecast_name: $('[data-r="typecast"]').value }); });
})();
