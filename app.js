(() => {
  const R = window.RULES;
  const TEAS = window.TEA_DATA.teas;
  const BY_ID = {};
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- Búsqueda ----------
  const FILLER = new Set(["te", "tea", "de", "del", "la", "el", "y", "con", "and", "infusion", "lata", "mini", "minitin", "g", "tb"]);
  const norm = R.norm;
  const tokens = (s) => norm(s).split(" ").filter((w) => w && !FILLER.has(w) && !/^\d+(g|tb)?$/.test(w));

  function lev(a, b, max) {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      let best = i;
      for (let j = 1; j <= b.length; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
        best = Math.min(best, cur[j]);
      }
      if (best > max) return max + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  function index(t) {
    const all = [t.nombre, t.corto, ...(t.alias || []), t.tipo].filter(Boolean).join(" ");
    t._name = norm(t.corto || t.nombre);
    t._all = norm(all);
    t._tok = [...new Set(tokens(all))];
    BY_ID[t.id] = t;
  }

  function tokenScore(q, words) {
    let best = 0;
    for (const w of words) {
      if (w === q) return 1;
      if (w.startsWith(q)) best = Math.max(best, q.length >= 3 ? 0.9 : 0.6);
      else if (q.length >= 4 && w.includes(q)) best = Math.max(best, 0.7);
      else if (q.length >= 4) {
        // Erratas: contra la palabra entera y contra su inicio (por si aún se está escribiendo).
        const d = Math.min(lev(q, w, 2), lev(q, w.slice(0, q.length), 2));
        if (d === 1) best = Math.max(best, 0.75);
        else if (d === 2 && q.length >= 6) best = Math.max(best, 0.6);
      }
    }
    return best;
  }

  function search(query) {
    const qn = norm(query);
    const qt = tokens(query);
    if (!qn) return TEAS.map((t) => ({ t, s: 0 }));
    const out = [];
    for (const t of TEAS) {
      let s = 0;
      if (t._name === qn) s = 3;
      else if (t._all.includes(qn)) s = 2 + (t._name.startsWith(qn) ? 0.5 : 0);
      if (qt.length) {
        const parts = qt.map((q) => tokenScore(q, t._tok));
        const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
        if (Math.min(...parts) > 0 || avg >= 0.6) s = Math.max(s, avg);
      }
      if (s > 0.55) out.push({ t, s });
    }
    return out.sort((a, b) => b.s - a.s || b.t.score - a.t.score);
  }

  // ---------- Estado ----------
  const MINE_KEY = "te-con-leche:mis-tes";
  const OWN_KEY = "te-con-leche:propios";
  const mine = new Set(JSON.parse(localStorage.getItem(MINE_KEY) || "[]"));
  let own = JSON.parse(localStorage.getItem(OWN_KEY) || "[]");
  const saveMine = () => localStorage.setItem(MINE_KEY, JSON.stringify([...mine]));
  const saveOwn = () => localStorage.setItem(OWN_KEY, JSON.stringify(own));
  const HEAT_KEY = "te-con-leche:calentar";
  let micro = localStorage.getItem(HEAT_KEY) === "micro";
  let filter = "all";

  // Un té propio guardado ({id, nombre, base, ingredientes}) -> té completo valorado con las reglas.
  function buildOwn(o) {
    const a = R.analyze({ nombre: o.nombre, ingredientes: o.ingredientes, base: o.base || undefined, fuente: "Mío" });
    if (!a) return null;
    const [temp, min] = R.BREW[a.base];
    return { id: o.id, fuente: "Mío", nombre: o.nombre, ingredientes: o.ingredientes, temperatura: temp, minutos: min, ...a, _own: o };
  }

  for (const t of TEAS) index(t);
  for (const o of own) {
    const t = buildOwn(o);
    if (t) { TEAS.push(t); index(t); }
  }

  const passes = (t) =>
    filter === "all" ||
    (filter === "milk" && t.score >= 3) ||
    (filter === "ts" && t.fuente === "Tea Shop") ||
    (filter === "mc" && t.fuente === "Mercadona") ||
    (filter === "hm" && t.fuente === "Hornimans") ||
    (filter === "gen" && t.fuente === "Genérico");

  // ---------- Piezas de interfaz ----------
  const COLORS = ["#b5483b", "#c9773a", "#c9a23a", "#8aa646", "#5c9a4f", "#3f8a5a"];
  const SOURCE = { "Tea Shop": ["ts", "Tea Shop"], Mercadona: ["mc", "Mercadona"], Hornimans: ["hm", "Hornimans"], "Genérico": ["gen", "Clásico"], "Mío": ["own", "Mío"] };
  const STORE_URL = { "Tea Shop": "teashop.com", Mercadona: "tienda.mercadona.es", Hornimans: "hornimans.com" };

  function meter(score, big) {
    let html = `<span class="meter${big ? " big" : ""}" style="--c:${COLORS[score]}" aria-label="${score} de 5">`;
    for (let i = 1; i <= 5; i++) html += `<i class="${i <= score ? "on" : ""}"></i>`;
    return html + "</span>";
  }

  function img(t, cls) {
    if (!t.imagen) return `<div class="${cls} ph">${t.fuente === "Mío" ? "📝" : "🫖"}</div>`;
    const src = t.imagen.startsWith("//") ? "https:" + t.imagen : t.imagen;
    const sized = src + (src.includes("?") ? "&" : "?") + "width=" + (cls === "thumb" ? 120 : 600);
    return `<img class="${cls}" loading="lazy" src="${esc(sized)}" alt="">`;
  }

  function meta(t) {
    const [cls, label] = SOURCE[t.fuente] || SOURCE["Genérico"];
    return `<div class="meta"><span class="badge ${cls}">${label}</span><span>${esc(t.tipo)}${t.formato ? " · " + esc(t.formato) : ""}</span></div>`;
  }

  function item(t) {
    return `<li><a href="#/te/${encodeURIComponent(t.id)}" class="row">
      ${img(t, "thumb")}
      <div class="info">
        <div class="name">${esc(t.corto || t.nombre)}</div>
        ${meta(t)}
        <div class="verdict">${meter(t.score)}<span>${esc(t.veredicto)}</span></div>
      </div>
      ${mine.has(t.id) ? '<span class="star">★</span>' : ""}
    </a></li>`;
  }

  function minutes(m, add) {
    const nums = String(m ?? "").match(/\d+(?:[.,]\d+)?/g);
    const base = nums ? Math.max(...nums.map((n) => parseFloat(n.replace(",", ".")))) : 4;
    return Math.round(Math.min(base + add, 10) * 2) / 2;
  }

  const fill = (text, t) => text
    .replace(/\{T\}/g, t.temperatura || 95)
    .replace(/\{M(?:\+(\d+))?\}/g, (_, n) => minutes(t.minutos, n ? +n : 0));

  function methodCard(id, t, open) {
    const m = window.METHODS[id];
    if (!m) return "";
    const v = micro && m.micro ? m.micro : m;
    return `<details class="method"${open ? " open" : ""}>
      <summary><b>${esc(v.nombre || m.nombre)}</b><span>${esc(v.sub || m.sub)}${v !== m ? " · versión microondas" : ""}</span></summary>
      <ol>${v.pasos.map((p) => `<li>${esc(fill(p, t))}</li>`).join("")}</ol>
      ${v.tip ? `<p class="tip">💡 ${esc(v.tip)}</p>` : ""}
    </details>`;
  }

  // Métodos con leche + selector "¿Puedes hervir la leche?" (solo si algún método calienta la leche).
  let methodsTea = null;
  function methodsBlock(t) {
    methodsTea = t;
    const heats = t.metodos.some((id) => window.METHODS[id]?.micro);
    const toggle = heats
      ? `<div class="heat" role="group" aria-label="¿Puedes hervir la leche?"><span>¿Puedes hervir la leche o solo tienes microondas?</span>
          <div><button data-heat="fuego" class="${micro ? "" : "on"}">🔥 Tengo fuego</button><button data-heat="micro" class="${micro ? "on" : ""}">Solo microondas</button></div></div>`
      : "";
    return `${toggle}${t.metodos.map((m, i) => methodCard(m, t, i === 0)).join("")}`;
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".heat button");
    if (!b || !methodsTea) return;
    micro = b.dataset.heat === "micro";
    localStorage.setItem(HEAT_KEY, micro ? "micro" : "fuego");
    const box = b.closest(".methods");
    const open = [...box.querySelectorAll("details")].map((d) => d.open);
    box.innerHTML = methodsBlock(methodsTea);
    box.querySelectorAll("details").forEach((d, i) => (d.open = open[i]));
  });

  function alternatives(t) {
    const pool = TEAS.filter((x) => x.score >= 4 && x.id !== t.id && x.fuente !== "Mío");
    const same = pool.filter((x) => x.base === t.base);
    const pick = (same.length >= 3 ? same : pool.filter((x) => x.fuente === "Tea Shop"))
      .sort((a, b) => b.score - a.score || a.nombre.localeCompare(b.nombre))
      .slice(0, 4);
    return pick.length ? `<h3>Si lo quieres con leche, prueba…</h3><ul class="list">${pick.map(item).join("")}</ul>` : "";
  }

  // Valoración + cómo prepararlo (común a la ficha y al analizador).
  function verdictBlock(t) {
    const brew = t.temperatura ? `${t.temperatura}ºC · ${esc(t.minutos || "?")} min` : null;
    return `
      <div class="score" style="--c:${COLORS[t.score]}">
        ${meter(t.score, true)}
        <div class="vtext">${esc(t.veredicto)}</div>
      </div>
      <ul class="reasons">${t.razones.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
      ${t.leche ? `<p class="milk"><b>Qué leche:</b> ${esc(t.leche)}</p>` : ""}
      ${t.metodos.length
        ? `<h3>Cómo prepararlo con leche</h3><div class="methods">${methodsBlock(t)}</div>`
        : `<h3>Mejor tómalo solo</h3><p>${brew ? `Agua a ${t.temperatura}ºC, ${esc(t.minutos)} min.` : "Sigue las indicaciones del paquete."}</p>${alternatives(t)}`}
      ${brew ? `<p class="official"><b>${t.oficial ? `Preparación oficial ${esc(t.fuente)}` : "Preparación sin leche (orientativa)"}:</b> ${brew}</p>` : ""}`;
  }

  // ---------- Vistas ----------
  const LIMIT = 80;
  function renderSearch() {
    const q = $("#q").value.trim();
    const res = search(q).filter((r) => passes(r.t));
    if (!q) res.sort((a, b) => b.t.score - a.t.score || (a.t.corto || a.t.nombre).localeCompare(b.t.corto || b.t.nombre, "es"));
    const strong = res.some((r) => r.s >= 2);
    const analyzeCard = q
      ? `<a class="analyze${res.length ? "" : " big"}" href="#/analizar?q=${encodeURIComponent(q)}">
          <b>${res.length ? "¿No es ninguno de estos?" : "No lo tengo en la base de datos"}</b>
          <span>Analizar «${esc(q)}» por su nombre e ingredientes →</span></a>`
      : "";
    $("#count").textContent = q
      ? res.length ? `${res.length} resultado${res.length > 1 ? "s" : ""}` : ""
      : `${res.length} tés en la base de datos`;
    $("#results").innerHTML =
      (q && !strong ? analyzeCard : "") +
      res.slice(0, LIMIT).map((r) => item(r.t)).join("") +
      (q && strong ? analyzeCard : "");
  }

  function renderMine() {
    const list = [...new Set([...own.map((o) => o.id), ...mine])].map((id) => BY_ID[id]).filter(Boolean).sort((a, b) => b.score - a.score);
    $("#mine-empty").hidden = list.length > 0;
    $("#mine").innerHTML = list.map(item).join("");
  }

  function renderDetail(id) {
    const t = BY_ID[id];
    if (!t) return (location.hash = "#/");
    const gen = t.generico && BY_ID["g-" + t.generico];
    $("#view-detail").innerHTML = `
      <button class="back" onclick="history.length > 1 ? history.back() : (location.hash='#/')">‹ Volver</button>
      ${t.imagen ? img(t, "hero") : ""}
      <div class="head">
        <div><h2>${esc(t.corto || t.nombre)}</h2>${meta(t)}</div>
        <button class="fav" id="fav" aria-label="Guardar">${mine.has(t.id) ? "★" : "☆"}</button>
      </div>
      ${verdictBlock(t)}
      ${t.ingredientes ? `<h3>Ingredientes</h3><p>${esc(t.ingredientes)}</p>` : ""}
      ${t.sabor ? `<p><b>Sabor:</b> ${esc(t.sabor)}</p>` : ""}
      ${t.descripcion ? `<details class="desc"><summary>Descripción de Tea Shop</summary><p>${esc(t.descripcion)}</p></details>` : ""}
      ${gen ? `<p class="rel">Es un tipo de <a href="#/te/${gen.id}">${esc(gen.nombre)}</a> ${meter(gen.score)}</p>` : ""}
      ${t.variantes && t.variantes.length > 1 ? `<details class="desc"><summary>Formatos (${t.variantes.length})</summary><ul>${t.variantes.map((v) => `<li><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.nombre)}</a></li>`).join("")}</ul></details>` : ""}
      ${t.url ? `<p><a class="shop" href="${esc(t.url)}" target="_blank" rel="noopener">Ver en ${STORE_URL[t.fuente] || "la tienda"} ↗</a></p>` : ""}
      ${t._own ? `<p class="own-actions"><a class="btn" href="#/analizar?id=${encodeURIComponent(t.id)}">Editar</a><button class="btn danger" id="del">Borrar</button></p>
                 <p class="hint">Valoración calculada automáticamente a partir del tipo e ingredientes.</p>` : ""}
    `;
    $("#fav").onclick = () => {
      mine.has(t.id) ? mine.delete(t.id) : mine.add(t.id);
      saveMine();
      $("#fav").textContent = mine.has(t.id) ? "★" : "☆";
    };
    const del = $("#del");
    if (del) del.onclick = () => {
      if (!confirm(`¿Borrar «${t.nombre}» de tus tés?`)) return;
      own = own.filter((o) => o.id !== t.id);
      saveOwn();
      mine.delete(t.id); saveMine();
      TEAS.splice(TEAS.indexOf(t), 1);
      delete BY_ID[t.id];
      location.hash = "#/mis-tes";
    };
    window.scrollTo(0, 0);
  }

  // Analizador: valora un té que no está en la base de datos.
  const BASE_ORDER = ["negro", "chai", "rooibos", "pu-erh", "oolong", "verde", "hojicha", "matcha", "blanco", "mate", "infusion"];
  const BASE_LABEL = { negro: "Té negro", chai: "Chai (té con especias)", rooibos: "Rooibos / Honeybush", "pu-erh": "Pu-erh / Té rojo", oolong: "Oolong", verde: "Té verde", hojicha: "Hojicha (verde tostado)", matcha: "Matcha", blanco: "Té blanco / amarillo", mate: "Mate", infusion: "Infusión / Tisana" };

  function renderAnalyzer(params) {
    const editing = params.get("id") && own.find((o) => o.id === params.get("id"));
    const init = editing || { nombre: params.get("q") || "", base: "", ingredientes: "" };
    $("#view-analyze").innerHTML = `
      <button class="back" onclick="history.length > 1 ? history.back() : (location.hash='#/')">‹ Volver</button>
      <h2>${editing ? "Editar té" : "Analizar un té"}</h2>
      <p class="hint">Escribe el nombre tal y como viene en el paquete. Si añades los ingredientes, el análisis será mucho más fiable.</p>
      <form class="form" id="an-form" autocomplete="off">
        <label>Nombre<input id="an-nombre" value="${esc(init.nombre)}" placeholder="Ej.: Hornimans Chai, Twinings Lemon & Ginger…"></label>
        <label>Tipo<select id="an-base">
          <option value="">Detectar automáticamente</option>
          ${BASE_ORDER.map((b) => `<option value="${b}"${init.base === b ? " selected" : ""}>${BASE_LABEL[b]}</option>`).join("")}
        </select></label>
        <label><span>Ingredientes <small>(opcional)</small></span><textarea id="an-ing" rows="3" placeholder="Té negro, canela, jengibre, cardamomo…">${esc(init.ingredientes)}</textarea></label>
      </form>
      <div id="an-out"></div>
    `;
    const update = () => {
      const o = { nombre: $("#an-nombre").value.trim(), base: $("#an-base").value, ingredientes: $("#an-ing").value.trim() };
      const out = $("#an-out");
      if (!o.nombre && !o.ingredientes) { out.innerHTML = ""; return; }
      const t = buildOwn({ ...o, id: editing ? editing.id : "c-" + Date.now() });
      if (!t) {
        out.innerHTML = `<p class="milk">🤔 No sé qué tipo de té es solo por el nombre. Elige el <b>Tipo</b> arriba o añade los ingredientes.</p>`;
        return;
      }
      const auto = !o.base ? `<p class="hint">Tipo detectado: <b>${BASE_LABEL[t.base]}</b>. Si no es correcto, cámbialo arriba.</p>` : "";
      out.innerHTML = `${auto}${verdictBlock(t)}
        <p><button class="btn primary" id="an-save">${editing ? "Guardar cambios" : "Guardar en Mis tés"}</button></p>`;
      $("#an-save").onclick = () => {
        const rec = { id: t.id, nombre: o.nombre || "Mi té", base: o.base, ingredientes: o.ingredientes };
        own = own.filter((x) => x.id !== rec.id).concat(rec);
        saveOwn();
        const old = BY_ID[rec.id];
        if (old) TEAS.splice(TEAS.indexOf(old), 1);
        const full = buildOwn(rec);
        TEAS.push(full); index(full);
        mine.add(full.id); saveMine();
        location.hash = "#/te/" + encodeURIComponent(full.id);
      };
    };
    $("#an-form").addEventListener("input", update);
    $("#an-form").addEventListener("submit", (e) => e.preventDefault());
    update();
    window.scrollTo(0, 0);
  }

  // ---------- Router ----------
  let searchScroll = 0;
  function route() {
    const h = location.hash || "#/";
    const views = { search: "#view-search", mine: "#view-mine", guide: "#view-guide", detail: "#view-detail", analyze: "#view-analyze" };
    let v = "search";
    if (h.startsWith("#/te/")) v = "detail";
    else if (h.startsWith("#/analizar")) v = "analyze";
    else if (h === "#/mis-tes") v = "mine";
    else if (h === "#/guia") v = "guide";
    if (!$("#view-search").hidden && v !== "search") searchScroll = window.scrollY;
    for (const [k, sel] of Object.entries(views)) $(sel).hidden = k !== v;
    $(".top").classList.toggle("compact", v !== "search");
    $(".top").hidden = v === "analyze";
    $(".title").hidden = v !== "search";
    document.querySelectorAll(".tabs a").forEach((a) => a.classList.toggle("on", a.dataset.tab === (v === "analyze" ? "search" : v)));
    if (v === "detail") renderDetail(decodeURIComponent(h.slice(5)));
    if (v === "analyze") renderAnalyzer(new URLSearchParams(h.split("?")[1] || ""));
    if (v === "mine") { renderMine(); window.scrollTo(0, 0); }
    if (v === "guide") { $("#view-guide").innerHTML = window.GUIDE; window.scrollTo(0, 0); }
    if (v === "search") { renderSearch(); window.scrollTo(0, searchScroll); }
  }

  $("#q").addEventListener("input", () => {
    if (location.hash.length > 2) location.hash = "#/";
    renderSearch();
  });
  $("#chips").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll("#chips button").forEach((x) => x.classList.toggle("on", x === b));
    renderSearch();
  });
  window.addEventListener("hashchange", route);
  const preset = new URLSearchParams(location.search).get("q");
  if (preset) $("#q").value = preset;
  route();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("sw.js");
  }
})();
