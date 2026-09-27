/* The quiz "איזה איש מכירות אתה?" (/quiz). The flow and the scoring follow Avinoam's final artifact (27.9.2026):
   a client type first (warm lead, referral, cold lead: the first two moments change with it), 21 moments with the
   answers shuffled, and the typecast is the style picked most often out of the times it was offered. The texts live
   in quiz-data.js, verbatim. The result carries the typecast into the book form and into the WhatsApp message */
(function () {
  "use strict";
  var root = document.querySelector("[data-quiz]"), D = window.QUIZ;
  if (!root || !D) return;
  var WHATSAPP = "972542688685"; // Avinoam's number, as he set it in his quiz
  var $ = function (s, el) { return (el || root).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || root).querySelectorAll(s)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var track = function (ev, data) { try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: ev }, data || {})); } catch (e) {} };
  var Q = D.questions, mode = 0, order = [], picks = [], cur = 0;

  var show = function (name) {
    $$(".qz-screen").forEach(function (s) { s.classList.toggle("is-on", s.getAttribute("data-screen") === name); });
    root.setAttribute("data-at", name);
    scrollTo(0, 0);
    var h = $('[data-screen="' + name + '"] [tabindex="-1"]');
    if (h && name !== "intro") h.focus({ preventScroll: true });
  };
  var shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var qText = function (q) { return q.split ? q.split[mode] : q.q; };
  var aText = function (a) { return Array.isArray(a.t) ? a.t[mode] : a.t; };

  var begin = function () {
    order = Q.map(function (q) { return shuffle(q.a.map(function (_, i) { return i; })); });
    picks = Q.map(function () { return null; }); cur = 0;
    $("[data-total]").textContent = Q.length;
    track("quiz_start", { quiz_mode: ["warm", "referral", "cold"][mode] });
    show("question"); render();
  };
  var render = function () {
    var q = Q[cur], box = $("[data-answers]");
    $("[data-num]").textContent = cur + 1;
    $("[data-bar]").style.transform = "scaleX(" + (cur / Q.length).toFixed(3) + ")";
    $("[data-back]").hidden = cur === 0;
    $("[data-moment]").textContent = D.moments[q.m];
    $("[data-q]").textContent = qText(q);
    box.textContent = "";
    order[cur].forEach(function (oi) {
      var b = document.createElement("button");
      b.type = "button"; b.className = "qz-a" + (picks[cur] === oi ? " is-picked" : ""); b.textContent = aText(q.a[oi]);
      b.addEventListener("click", function () {
        picks[cur] = oi; $$(".qz-a", box).forEach(function (x) { x.classList.toggle("is-picked", x === b); x.disabled = true; });
        setTimeout(next, reduced ? 0 : 260);
      });
      box.appendChild(b);
    });
    if (cur > 0) $("[data-q]").focus({ preventScroll: true });
  };
  var next = function () { if (cur < Q.length - 1) { cur++; render(); } else finish(); };

  var finish = function () {
    var c = {}, seen = {};
    D.order.forEach(function (k) { c[k] = 0; seen[k] = 0; });
    Q.forEach(function (q, i) {
      q.a.forEach(function (a) { if (a.s in seen) seen[a.s]++; });
      var p = picks[i]; if (p !== null && q.a[p].s in c) c[q.a[p].s]++;
    });
    var pct = {}; D.order.forEach(function (k) { pct[k] = Math.round(c[k] / seen[k] * 100); });
    var ranked = D.order.slice().sort(function (a, b) { return pct[b] - pct[a] || c[b] - c[a] || D.order.indexOf(a) - D.order.indexOf(b); });
    var top = ranked[0], T = D.profiles[top], S = D.profiles[ranked[1]], maxv = pct[top] || 1;
    var pro = Q.some(function (q, i) { return picks[i] !== null && q.a[picks[i]].s === "PRO"; });
    var set = function (k, v) { $('[data-r="' + k + '"]').textContent = v; };
    set("name", T.name); set("line", T.line); set("strength", T.strength); set("tune", T.tune); set("move", T.move);
    set("second", S.name + "."); set("secondLine", S.line);
    $('[data-r="pro"]').hidden = !pro;
    var mix = $('[data-r="mix"]'); mix.textContent = "";
    ranked.forEach(function (k) {
      var row = document.createElement("div"); row.className = "qz-row" + (k === top ? " is-top" : "");
      var nm = document.createElement("span"); nm.className = "qz-nm"; nm.textContent = D.profiles[k].name;
      var tr = document.createElement("span"); tr.className = "qz-track"; tr.setAttribute("aria-hidden", "true");
      var fl = document.createElement("i"); tr.appendChild(fl);
      var v = document.createElement("span"); v.className = "qz-val"; v.textContent = pct[k] + "%";
      row.appendChild(nm); row.appendChild(tr); row.appendChild(v); mix.appendChild(row);
      requestAnimationFrame(function () { requestAnimationFrame(function () { fl.style.transform = "scaleX(" + (pct[k] / maxv).toFixed(3) + ")"; }); });
    });
    var msg = "היי אבינועם, עניתי על השאלון \"איזה איש מכירות אתה?\" והטייפקאסט שלי: " + T.name + ".";
    $('[data-r="wa"]').href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    $('[data-r="typecast"]').value = T.name;
    try { sessionStorage.setItem("pitch-typecast", T.name); } catch (e) {}
    track("quiz_complete", { typecast: top, typecast_name: T.name, second: ranked[1], pro_move: pro });
    show("result");
  };

  $("[data-start]").addEventListener("click", function () { show("mode"); });
  $$("[data-mode]").forEach(function (b) { b.addEventListener("click", function () { mode = +b.getAttribute("data-mode"); begin(); }); });
  $("[data-back]").addEventListener("click", function () { if (cur > 0) { cur--; render(); } });
  $("[data-again]").addEventListener("click", function () { show("intro"); });
  $('[data-r="wa"]').addEventListener("click", function () { track("quiz_whatsapp", { typecast_name: $('[data-r="typecast"]').value }); });
})();
