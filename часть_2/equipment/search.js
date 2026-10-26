(function () {
  var q = document.getElementById('side-q'), box = document.getElementById('side-res'), sb = document.querySelector('.sidebar');
  if (!q || !box || !window.SEARCH_INDEX) return;
  var root = q.getAttribute('data-root') || '';
  function norm(s) { return (s || '').toLowerCase().replace(/ё/g, 'е'); }
  var PH = { а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'e',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'ch',ш:'sh',щ:'sch',ы:'y',э:'e',ю:'yu',я:'ya',ъ:'',ь:'' };
  var HG = { а:'a',в:'b',е:'e',к:'k',м:'m',н:'h',о:'o',р:'p',с:'c',т:'t',х:'x',у:'y' };
  function conv(s, map) { return s.replace(/[а-яё]/g, function (c) { return map[c] === undefined ? c : map[c]; }); }
  function compact(s) { return norm(s).replace(/[^a-zа-я0-9]/g, ''); }
  var idx = window.SEARCH_INDEX.map(function (e) { return { t: e.t, s: e.s, u: e.u, nt: norm(e.t), ns: norm(e.s), nh: norm(e.t + ' ' + e.s + ' ' + e.k), ct: compact(e.t), ch: compact(e.t + e.k) }; });
  var sel = -1, cur = [], wrap = q.parentNode;
  wrap.style.top = (-(parseFloat(getComputedStyle(sb).paddingTop) || 0)) + 'px';
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function run() {
    var v = norm(q.value).trim();
    if (!v) { box.className = 'side-res'; box.innerHTML = ''; sb.classList.remove('is-searching'); cur = []; return; }
    var toks = v.split(/\s+/), cv = compact(v), out = [];
    idx.forEach(function (e) {
      var all = toks.every(function (t) { return e.nh.indexOf(t) > -1 || e.nh.indexOf(conv(t, PH)) > -1 || e.nh.indexOf(conv(t, HG)) > -1; });
      var cm = cv.length >= 3 && (e.ch.indexOf(cv) > -1 || e.ch.indexOf(conv(cv, PH)) > -1 || e.ch.indexOf(conv(cv, HG)) > -1);
      if (!all && !cm) return;
      var sc = e.nt.indexOf(v) > -1 || (cv.length >= 3 && e.ct.indexOf(cv) > -1) ? 0 : (toks.every(function (t) { return e.nt.indexOf(t) > -1; }) ? 1 : (toks.every(function (t) { return e.ns.indexOf(t) > -1; }) ? 2 : 3));
      out.push({ e: e, sc: sc });
    });
    out.sort(function (a, b) { return a.sc - b.sc || a.e.t.length - b.e.t.length; });
    cur = out.slice(0, 8).map(function (o) { return o.e; });
    sel = -1; sb.classList.add('is-searching'); sb.scrollTop = 0; box.className = 'side-res is-on';
    box.innerHTML = cur.length ? cur.map(function (e) { return '<li><a href="' + root + e.u + '"><b>' + esc(e.t) + '</b><small>' + esc(e.s) + '</small></a></li>'; }).join('')
      : '<li class="none">Ничего не найдено. Попробуйте название модели, например ECLB-250.</li>';
  }
  (function () {
    var acts = sb.querySelectorAll('.side-nav a.is-active'), el = acts[acts.length - 1];
    if (!el) return;
    var go = function () {
      var r = el.getBoundingClientRect(), sr = sb.getBoundingClientRect();
      sb.scrollTop += (r.top - sr.top) - sb.clientHeight / 2 + r.height / 2;
    };
    go(); setTimeout(go, 150);
  })();
  q.addEventListener('input', run);
  q.addEventListener('keydown', function (ev) {
    var links = box.querySelectorAll('a');
    if (ev.key === 'ArrowDown' && links.length) { ev.preventDefault(); sel = (sel + 1) % links.length; }
    else if (ev.key === 'ArrowUp' && links.length) { ev.preventDefault(); sel = (sel - 1 + links.length) % links.length; }
    else if (ev.key === 'Enter') { if (links.length) { ev.preventDefault(); location.href = links[sel < 0 ? 0 : sel].href; } return; }
    else if (ev.key === 'Escape') { q.value = ''; run(); return; }
    else return;
    links.forEach(function (a, i) { a.classList.toggle('is-sel', i === sel); });
  });
})();