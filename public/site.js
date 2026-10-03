document.querySelectorAll("[data-copy]").forEach(function (b) {
  b.addEventListener("click", function () {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(b.dataset.copy).then(function () {
      b.textContent = "Copied";
      setTimeout(function () { b.textContent = "Copy"; }, 1500);
    }).catch(function () {});
  });
});

// The hero terminal types its two commands and prints the output line by line.
// The full transcript stays in the HTML, so it reads completely without
// JavaScript and when the visitor prefers reduced motion. With motion on, the
// transcript is only visually hidden and an aria-hidden copy is animated, so
// assistive technology always sees the whole output.
(function () {
  var transcript = document.getElementById("screen");
  var replay = document.getElementById("replay");
  if (!transcript || !replay) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;
  var finalHTML = transcript.innerHTML;
  var lines = finalHTML.replace(/\n$/, "").split("\n");
  var timer = null;
  var screen = document.createElement("pre");
  screen.setAttribute("aria-hidden", "true");
  transcript.classList.add("visually-hidden");
  transcript.parentNode.insertBefore(screen, transcript.nextSibling);

  function stop() { if (timer) { clearTimeout(timer); timer = null; } }

  function play() {
    stop();
    replay.hidden = false;
    screen.innerHTML = "";
    var i = 0;
    function next(delay) { timer = setTimeout(step, delay); }
    function step() {
      if (i >= lines.length) { timer = null; return; }
      var line = lines[i++];
      var isCmd = /^<span class="d">\$ /.test(line);
      if (isCmd) {
        var text = line.replace(/<[^>]+>/g, "");
        var typed = 0;
        var open = '<span class="d">';
        function type() {
          typed++;
          screen.innerHTML = screen.innerHTML.replace(/<span class="d">[^<]*<span class="caret"><\/span><\/span>$/, "")
            + open + text.slice(0, typed) + '<span class="caret"></span></span>';
          if (typed < text.length) { timer = setTimeout(type, 28 + Math.random() * 40); }
          else { timer = setTimeout(function () {
            screen.innerHTML = screen.innerHTML.replace(/<span class="caret"><\/span>/, "") + "\n";
            next(500);
          }, 350); }
        }
        if (screen.innerHTML && !/\n$/.test(screen.innerHTML)) screen.innerHTML += "\n";
        type();
      } else {
        screen.innerHTML += line + "\n";
        next(line === "" ? 650 : (/warning/.test(line) ? 180 : 90));
      }
    }
    next(600);
  }

  replay.addEventListener("click", play);
  var started = false;
  function start() { if (started) return; started = true; play(); }
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
    }, { threshold: 0.4 });
    io.observe(screen);
  } else { start(); }
})();

// Reference graph in the open-source band: what a scan walks. The entry point
// on the left, declarations it reaches lit in order, declarations nothing
// reaches dimmed below. Animates once when scrolled into view; draws the final
// state at once under reduced motion.
(function () {
  var c = document.getElementById("dots");
  if (!c || !c.getContext) return;
  var nodes = [
    { id: "app", l: "@main App", x: 0.05, y: 0.30, root: true },
    { id: "scene", l: "SceneDelegate", x: 0.30, y: 0.12 },
    { id: "feed", l: "FeedViewModel", x: 0.30, y: 0.46 },
    { id: "store", l: "Store", x: 0.55, y: 0.29 },
    { id: "load", l: "Store.load()", x: 0.78, y: 0.12 },
    { id: "cache", l: "Cache", x: 0.78, y: 0.46 },
    { id: "parse", l: "Parser.parse()", x: 0.96, y: 0.29 },
    { id: "legacy", l: "LegacyCache", x: 0.30, y: 0.80, dead: true },
    { id: "migrate", l: "migrate()", x: 0.05, y: 0.92, dead: true },
    { id: "reload", l: "Store.reload()", x: 0.60, y: 0.92, dead: true },
    { id: "tag", l: "Bridge.tag", x: 0.96, y: 0.80, dead: true, likely: true }
  ];
  var edges = [["app","scene"],["app","feed"],["scene","store"],["feed","store"],["store","load"],["store","cache"],["load","parse"],["cache","parse"],["reload","cache"],["legacy","migrate"],["reload","legacy"]];
  var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
  // Breadth-first depth from the root decides when each live node lights up.
  var depth = { app: 0 }, queue = ["app"];
  while (queue.length) {
    var cur = queue.shift();
    edges.forEach(function (e) {
      if (e[0] === cur && !byId[e[1]].dead && depth[e[1]] === undefined) { depth[e[1]] = depth[cur] + 1; queue.push(e[1]); }
    });
  }
  var STEP = 700, DEAD_AT = 4 * STEP, DEAD_LEN = 900;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ease = function (t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); };
  function curve(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2, pts = [], len = 0, px = x1, py = y1;
    for (var i = 0; i <= 24; i++) {
      var t = i / 24, u = 1 - t;
      var x = u*u*u*x1 + 3*u*u*t*mx + 3*u*t*t*mx + t*t*t*x2;
      var y = u*u*u*y1 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y2;
      if (i) len += Math.hypot(x - px, y - py);
      pts.push([x, y]); px = x; py = y;
    }
    return { pts: pts, len: len };
  }
  function draw(elapsed) {
    var dpr = window.devicePixelRatio || 1;
    var w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    var bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
    var ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cs = getComputedStyle(document.documentElement);
    var accent = cs.getPropertyValue("--accent").trim() || "#f05138";
    var muted = cs.getPropertyValue("--muted").trim() || "#8f8f8f";
    var line = cs.getPropertyValue("--line-strong").trim() || "#3d3d3d";
    var strong = cs.getPropertyValue("--strong").trim() || "#fafafa";
    var warn = cs.getPropertyValue("--warn").trim() || "#e8c547";
    var small = w < 520;
    var padX = small ? 14 : 24, padT = 16, padB = 16;
    var px = function (n) { return padX + n.x * (w - padX * 2); }, py = function (n) { return padT + n.y * (h - padT - padB); };
    var font = (small ? "10px " : "12px ") + (cs.getPropertyValue("--mono") || "monospace");
    ctx.clearRect(0, 0, w, h);
    ctx.font = font; ctx.textBaseline = "middle";

    // Divider between reached and unreached.
    var divY = py({ y: 0.65 });
    var deadT = ease((elapsed - DEAD_AT) / DEAD_LEN);
    ctx.globalAlpha = 0.9 * deadT; ctx.strokeStyle = line; ctx.setLineDash([2, 6]); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(padX, divY); ctx.lineTo(w - padX, divY); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = muted; ctx.textAlign = "left";
    ctx.fillText("nothing reaches these", padX, divY + 12);
    ctx.globalAlpha = 1;

    ctx.lineWidth = 1.6;
    edges.forEach(function (e) {
      var a = byId[e[0]], b = byId[e[1]];
      var dead = a.dead || b.dead;
      var cv = curve(px(a), py(a), px(b), py(b));
      var t = dead ? deadT : ease((elapsed - depth[e[0]] * STEP) / STEP);
      if (t <= 0) return;
      ctx.strokeStyle = dead ? line : accent;
      ctx.globalAlpha = dead ? 0.9 : 0.6;
      ctx.setLineDash(dead ? [3, 4] : [cv.len, cv.len]);
      ctx.lineDashOffset = dead ? 0 : cv.len * (1 - t);
      if (dead) { ctx.globalAlpha *= t; }
      ctx.beginPath(); ctx.moveTo(cv.pts[0][0], cv.pts[0][1]);
      for (var i = 1; i < cv.pts.length; i++) ctx.lineTo(cv.pts[i][0], cv.pts[i][1]);
      ctx.stroke();
    });
    ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.globalAlpha = 1;

    nodes.forEach(function (n) {
      var x = px(n), y = py(n), r = n.root ? 6 : 4.5;
      var t = n.dead ? deadT : ease((elapsed - depth[n.id] * STEP + 200) / 400);
      if (t <= 0) return;
      ctx.globalAlpha = t;
      if (!n.dead && t < 1) { // arrival pulse
        ctx.beginPath(); ctx.arc(x, y, r + 14 * (1 - t), 0, Math.PI * 2);
        ctx.strokeStyle = accent; ctx.globalAlpha = (1 - t) * 0.6; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = t;
      }
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
      if (n.dead) { ctx.strokeStyle = n.likely ? warn : muted; ctx.lineWidth = 1.5; ctx.stroke(); }
      else { ctx.fillStyle = accent; ctx.fill(); }
      if (n.root) { ctx.beginPath(); ctx.arc(x, y, r + 5, 0, Math.PI * 2); ctx.strokeStyle = accent; ctx.globalAlpha = .4 * t; ctx.lineWidth = 1.5; ctx.stroke(); ctx.globalAlpha = t; }
      ctx.fillStyle = n.dead ? muted : strong;
      var right = n.x < 0.9;
      var short = small ? n.l.replace(/^[A-Za-z]+\./, "") : n.l;
      // Label above the node for the top row and below for the bottom row, to the side otherwise.
      var tag = n.dead ? (n.likely ? "likely" : "unused") : "";
      if (!right && !n.dead) { // right edge: label under the node, clear of the incoming edges
        ctx.textAlign = "right"; ctx.fillText(short, x + r, y + r + 14);
      } else {
        ctx.textAlign = right ? "left" : "right";
        var lx = right ? x + r + 7 : x - r - 7;
        ctx.fillText(short, lx, y);
        if (tag) { ctx.fillStyle = n.likely ? warn : muted; ctx.fillText(tag, lx, y + 14); }
      }
    });
    ctx.globalAlpha = 1;
  }
  var TOTAL = DEAD_AT + DEAD_LEN + 200, start = null, raf = null;
  function frame(now) {
    if (start === null) start = now;
    var e = now - start;
    draw(e);
    if (e < TOTAL) raf = requestAnimationFrame(frame); else raf = null;
  }
  function play() { if (raf) cancelAnimationFrame(raf); start = null; raf = requestAnimationFrame(frame); }
  function settle() { draw(TOTAL); }
  if (reduce) { settle(); }
  else if ("IntersectionObserver" in window) {
    var seen = false;
    var io = new IntersectionObserver(function (entries) {
      if (!seen && entries.some(function (x) { return x.isIntersecting; })) { seen = true; io.disconnect(); play(); }
    }, { threshold: 0.5 });
    io.observe(c);
    c.addEventListener("click", play);
    var btn = document.getElementById("dots-replay");
    if (btn) { btn.hidden = false; btn.addEventListener("click", play); }
  } else { settle(); }
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(function () { if (!raf) settle(); }, 100); });
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () { if (!raf) settle(); });
})();

// Hero background: a faint, still field of pixels with a few blocks lit in
// orange, like findings on a map of the code. Nothing moves; it is redrawn
// only on resize and when the colour scheme changes.
(function () {
  var c = document.getElementById("bg");
  if (!c || !c.getContext) return;
  var CELL = 16, P = 3, BLOCKS = 5;
  function rnd(seed) { var x = Math.sin(seed * 9999.1) * 10000; return x - Math.floor(x); }
  function draw() {
    var dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    var bw = Math.round(w * dpr), bh = Math.round(h * dpr);
    if (c.width !== bw || c.height !== bh) { c.width = bw; c.height = bh; }
    var ctx = c.getContext("2d"); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
    var cs = getComputedStyle(document.documentElement);
    var accent = cs.getPropertyValue("--accent").trim() || "#f05138";
    var fg = cs.getPropertyValue("--fg").trim() || "#e4e4e4";
    var cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
    ctx.fillStyle = fg;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++) {
      ctx.globalAlpha = 0.05 + 0.04 * rnd(x * 3 + y * 17);
      ctx.fillRect(x * CELL + 6, y * CELL + 6, P, P);
    }
    ctx.fillStyle = accent; ctx.globalAlpha = 0.35;
    for (var k = 0; k < BLOCKS; k++) {
      var seed = k * 977 + 7, bw2 = 2 + Math.floor(rnd(seed + 1) * 5), bh2 = 1 + Math.floor(rnd(seed + 2) * 3);
      var bx = Math.floor(rnd(seed + 3) * (cols - bw2)), by = Math.floor(rnd(seed + 4) * (rows - bh2));
      for (var yy = by; yy < by + bh2; yy++) for (var xx = bx; xx < bx + bw2; xx++) ctx.fillRect(xx * CELL + 5, yy * CELL + 5, P + 2, P + 2);
    }
    ctx.globalAlpha = 1;
  }
  draw();
  var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(draw, 100); });
  if (window.matchMedia) window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", draw);
})();

// Mark the nav link of the section that sits under the top third of the viewport.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll("nav a[href^='#']"));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if (!secs.length) return;
  var raf = 0;
  function update() {
    raf = 0;
    var line = window.innerHeight * 0.35, cur = null;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) cur = s; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) cur = secs[secs.length - 1];
    links.forEach(function (a) { a.classList.toggle("on", !!cur && a.getAttribute("href") === "#" + cur.id); });
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update); }
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  update();
})();
