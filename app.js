// CIMET Control de Calidad · app para supervisores de planta
import { firebaseConfig } from "./firebase-config.js";

// ---------- Parámetros de control (tabla de calidad CIMET) ----------
// Referencias que produce CIMET (tomadas del consolidado de Proceso Rotura del Visor).
// Para agregar o quitar una, edita esta lista.
const REFERENCIAS = [
  "4E · Bloque #4 Estándar (10x20x30)",
  "4EL · Bloque #4 Liso (10x20x30)",
  "4H8 · Bloque #4 8 huecos (10x20x30)",
  "4T · Bloque #4 Tradicional (9x22x33)",
  "4B · Bloque 4B (9x22x31)",
  "5E · Bloque #5 Estándar (12x20x30)",
  "5T · Bloque #5 Tradicional (11x23x33)",
  "5B · Bloque 5B (11x23x31)",
  "L9 · Bloque Llanerito (9x20x30)",
];
const OK = ["Conforme", "No conforme"];
const AREAS = [
  { id: "desm", nombre: "Desmenuzadores", etapa: "Materia prima / mezcla", params: [
    { id: "humcono", l: "Humedad de la arcilla en el cono", u: "%", min: 15, obj: 17, max: 18 },
    { id: "part", l: "Tamaño máximo de partícula salida desmenuzadores", u: "mm", min: 80, obj: 100, max: 150 } ] },
  { id: "molt", nombre: "Molturación", etapa: "Molturación", params: [
    { id: "l1", l: "Espesor laminilla (laminador 1)", u: "mm", min: 10, obj: 15, max: 23 },
    { id: "l2", l: "Espesor laminilla (laminador 2)", u: "mm", min: 5, obj: 6, max: 7 },
    { id: "l3", l: "Espesor laminilla (laminador 3)", u: "mm", min: 3, obj: 4, max: 5 },
    { id: "l086", l: "Espesor laminilla (laminador 086)", u: "mm", min: 2.5, obj: 3.5, max: 4 } ] },
  { id: "mold", nombre: "Moldeo", etapa: "Extrusión y moldeo", params: [
    { id: "ref", l: "Referencia", t: "txt", op: REFERENCIAS },
    { id: "rot", l: "Rotulado", t: "ok" },
    { id: "rad", l: "Radiografía", t: "ok" },
    { id: "pres", l: "Presión de extrusión", u: "bar", min: 27, obj: 28, max: 30 },
    { id: "vac", l: "Vacío de la cámara", u: "%", min: 85, obj: 87, max: 100 },
    { id: "amp", l: "Amperaje moldeo", u: "A", min: 250, obj: 280, max: 300 },
    { id: "hum", l: "Humedad de moldeo", u: "%", min: 15, obj: 17, max: 18 },
    { id: "cortes", l: "Cortes por minuto", u: "und/min", min: 7, obj: 8, max: 8.5 },
    { id: "peso", l: "Peso en verde de la pieza", u: "g", porRef: true },
    { id: "largo", l: "Longitud de la pieza", u: "mm", porRef: true },
    { id: "ancho", l: "Ancho de la pieza", u: "mm", porRef: true },
    { id: "alto", l: "Alto de la pieza", u: "mm", porRef: true },
    { id: "esc", l: "Escuadra", u: "mm", min: 0, obj: 0.2, max: 0.3 } ] },
  { id: "seca", nombre: "Secaderos", etapa: "Secado", params: [
    { id: "t12", l: "Temperatura túnel 1-2", u: "°C", min: 80, obj: 90, max: 110 },
    { id: "t34", l: "Temperatura túnel 3-4", u: "°C", min: 80, obj: 90, max: 110 },
    { id: "v12", l: "Ventiladores operativos túnel 1-2", u: "#", min: 18, obj: 20, max: 25 },
    { id: "v34", l: "Ventiladores operativos túnel 3-4", u: "#", min: 18, obj: 20, max: 25 },
    { id: "tini", l: "Temperatura inicio de secado", u: "°C", min: 45, obj: 50, max: 60 },
    { id: "hres", l: "Humedad residual salida secadero 1-2", u: "%", min: 2, obj: 3, max: 4 },
    { id: "pil", l: "Piloto de extractores", t: "ok" } ] },
  { id: "apil", nombre: "Apilado", etapa: "Apilado", params: [
    { id: "encarre", l: "Condiciones del encarre", t: "ok" } ] },
  { id: "horn", nombre: "Horno", etapa: "Cocción", params: [
    { id: "humc", l: "Humedad del carbón", u: "%", min: 3, obj: 4, max: 5 },
    { id: "ts1", l: "Temperatura de seguridad 1", u: "°C", min: 600, obj: 650, max: 750 },
    { id: "ts2", l: "Temperatura de seguridad 2", u: "°C", min: 700, obj: 750, max: 800 },
    { id: "dtiro", l: "Depresión tiro", u: "mmH2O", obj: -3 },
    { id: "pneu", l: "Presión neutra", u: "mmH2O", min: 2, obj: 2.5, max: 2.8 },
    { id: "drec", l: "Depresión recuperación", u: "mmH2O", min: -14, obj: -10, max: -9 },
    { id: "tcoc", l: "Temperatura zona de cocción", u: "°C", sinRango: true },
    { id: "tenf", l: "Temperatura zona de enfriamiento", u: "°C", min: 40, obj: 80, max: 120 } ],
    turno: { titulo: "Carbón por carbojet (kg por turno)", total: "Consumo de carbón del turno", params: [
      { id: "cj3", l: "Carbojet #3", u: "kg", min: 35, obj: 40, max: 50 },
      { id: "cj4", l: "Carbojet #4", u: "kg", min: 2100, obj: 2300, max: 2400 },
      { id: "cj5", l: "Carbojet #5", u: "kg", min: 2300, obj: 2442, max: 2600 },
      { id: "cj6", l: "Carbojet #6", u: "kg", min: 2000, obj: 2150, max: 2300 },
      { id: "cj7", l: "Carbojet #7", u: "kg", min: 2000, obj: 2200, max: 2400 },
      { id: "cj8", l: "Carbojet #8", u: "kg", min: 2000, obj: 2200, max: 2400 },
      { id: "cj9", l: "Carbojet #9", u: "kg", min: 1700, obj: 1898, max: 2000 },
      { id: "cj10", l: "Carbojet #10", u: "kg", min: 1100, obj: 1219, max: 1400 },
      { id: "cj11", l: "Carbojet #11", u: "kg", min: 1500, obj: 1650, max: 1800 },
      { id: "cj12", l: "Carbojet #12", u: "kg", min: 35, obj: 40, max: 50 } ] } },
  { id: "desa", nombre: "Desapilado", etapa: "Producto terminado", params: [
    { id: "ref", l: "Referencia", t: "txt", op: REFERENCIAS },
    { id: "peso", l: "Peso en cocido de la pieza", u: "g", porRef: true },
    { id: "largo", l: "Longitud de la pieza", u: "mm", porRef: true },
    { id: "ancho", l: "Ancho de la pieza", u: "mm", porRef: true },
    { id: "alto", l: "Altura de la pieza", u: "mm", porRef: true },
    { id: "esc", l: "Escuadra", u: "mm", min: 0, obj: 0.2, max: 0.3 },
    { id: "rot", l: "Rotura por auditoría", u: "%", min: 0, obj: 4, max: 8 },
    { id: "fis", l: "Fisuras / defectos visuales", u: "% lote", min: 0, obj: 2, max: 5 },
    { id: "abs", l: "Absorción de agua", u: "%", min: 11, obj: 11.8, max: 12.5 } ],
    turno: { titulo: "Dato del día", params: [
      { id: "prim", l: "Producto de primera del día", u: "%", min: 92, obj: 95, max: 100 } ] } },
];


// ---------- Ejemplo para modo demostración ----------
const EJEMPLO = {
  desm: { r: [ { h: "06:30", humcono: 16.8, part: 95 }, { h: "10:30", humcono: 18.6, part: 120 } ], obs: "A las 10:30 entró arcilla mojada del patio 2." },
  molt: { r: [ { h: "07:00", l1: 14, l2: 6, l3: 4.2, l086: 3.4 } ] },
  mold: { r: [ { h: "07:15", rot: "Conforme", rad: "Conforme", pres: 28, vac: 88, amp: 276, hum: 17.2, cortes: 8, esc: 0.2 } ] },
  horn: { r: [ { h: "09:00", humc: 4.2, ts1: 660, ts2: 755, dtiro: -3, pneu: 2.5, drec: -11, tcoc: 945, tenf: 85 } ], t: { cj3: 40, cj4: 2280, cj5: 2450 } },
};

// ---------- Utilidades ----------
const $ = s => document.querySelector(s);
const vacio = x => x === "" || x == null;
const num = x => (vacio(x) || isNaN(+x)) ? 0 : +x;
const fmt = (n, d) => (+n).toLocaleString("es-CO", { maximumFractionDigits: d ?? 2, minimumFractionDigits: d ?? 0 });
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const tieneRango = p => p.min != null || p.max != null;
const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const TURNOS = { T1: "Turno 1 (6–14)", T2: "Turno 2 (14–22)", T3: "Turno 3 (22–6)" };
const ls = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
function toast(t) { const el = $("#toast"); el.textContent = t; el.hidden = false; clearTimeout(toast.h); toast.h = setTimeout(() => el.hidden = true, 2600); }

function turnoActual() {
  const d = new Date(), h = d.getHours();
  let t = h >= 6 && h < 14 ? "T1" : h >= 14 && h < 22 ? "T2" : "T3";
  if (h < 6) d.setDate(d.getDate() - 1); // el turno 3 se registra con la fecha en que empezó
  const f = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { fecha: f, turno: t };
}

// ---------- Firebase o modo demostración ----------
const DEMO = !firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey.startsWith("PEGAR");
let fb = null;
if (!DEMO) {
  const B = "https://www.gstatic.com/firebasejs/10.12.2/";
  try {
    const [App, A, F] = await Promise.all([import(B + "firebase-app.js"), import(B + "firebase-auth.js"), import(B + "firebase-firestore.js")]);
    const app = App.initializeApp(firebaseConfig);
    const db = F.initializeFirestore(app, { localCache: F.persistentLocalCache({ tabManager: F.persistentMultipleTabManager() }) });
    fb = { A, F, db, auth: A.getAuth(app) };
  } catch (e) {
    document.body.innerHTML = `<div class="wrap" style="padding-block:40px"><h2>No se pudo abrir la app</h2><p>Revisa la conexión a internet y vuelve a intentar. Si el problema sigue, revisa los datos de firebase-config.js.</p></div>`;
    throw e;
  }
}

// ---------- Estado ----------
// doc = { areas: { [areaId]: { r: { [lecturaId]: { n, h, ...valores } }, t: {}, obs, done } } }
let S = { meta: { ...turnoActual(), sup: ls.get("cimet-sup") || "" }, doc: { areas: {} }, user: null };
let unsub = null, pendientes = new Map(), timers = new Map(), renderPendiente = false, estadoSync = { pend: false, desdeCache: false };
const docId = () => `${S.meta.fecha}_${S.meta.turno}`;
const area = id => (S.doc.areas[id] ||= { r: {}, t: {}, obs: "", done: false });
const lecturas = id => Object.entries(area(id).r || {}).map(([lid, v]) => ({ lid, ...v })).sort((a, b) => (a.n || 0) - (b.n || 0));

function setPath(obj, path, v) { let o = obj; for (let i = 0; i < path.length - 1; i++) o = (o[path[i]] ||= {}); if (v === undefined) delete o[path.at(-1)]; else o[path.at(-1)] = v; }
function anidar(path, v) { const o = {}; setPath(o, path, v); return o; }

// Guarda un valor. Los campos que se escriben se envían con una pausa corta para no mandar cada tecla.
function guardar(path, v, inmediato = false) {
  setPath(S.doc, path, v);
  if (DEMO) { ls.set("cimet-demo-" + docId(), JSON.stringify(S.doc)); return; }
  const key = path.join(".");
  pendientes.set(key, { path, v });
  clearTimeout(timers.get(key));
  const enviar = () => {
    timers.delete(key); pendientes.delete(key);
    const ref = fb.F.doc(fb.db, "turnos", docId());
    const base = { fecha: S.meta.fecha, turno: S.meta.turno, actualizado: fb.F.serverTimestamp(), supervisores: { [S.user.uid]: S.meta.sup || S.user.email } };
    const p = v === undefined
      ? fb.F.setDoc(ref, base, { merge: true }).then(() => fb.F.updateDoc(ref, { [key]: fb.F.deleteField() }))
      : fb.F.setDoc(ref, { ...base, ...anidar(path, v) }, { merge: true });
    p.catch(err => { console.error(err); toast("No se pudo guardar: " + (err.code === "permission-denied" ? "el usuario no tiene permiso" : "revisa la conexión")); });
  };
  if (inmediato) enviar(); else timers.set(key, setTimeout(enviar, 600));
  pintarSync();
}
function enviarTodo() { for (const [key, t] of timers) { clearTimeout(t); } const p = [...pendientes.values()]; pendientes.clear(); timers.clear(); p.forEach(x => guardar(x.path, x.v, true)); }

function abrirTurno() {
  if (unsub) { unsub(); unsub = null; }
  if (DEMO) {
    const r = ls.get("cimet-demo-" + docId());
    if (r) S.doc = JSON.parse(r);
    else if (!ls.get("cimet-demo-usado")) { S.doc = { areas: {} }; let n = 1; Object.entries(EJEMPLO).forEach(([aid, x]) => { const a = area(aid); (x.r || []).forEach(v => a.r[nuevoId()] = { n: n++, ...v }); a.t = { ...(x.t || {}) }; a.obs = x.obs || ""; }); ls.set("cimet-demo-usado", "1"); ls.set("cimet-demo-" + docId(), JSON.stringify(S.doc)); }
    else S.doc = { areas: {} };
    renderFlow(); pintarSync(); return;
  }
  S.doc = { areas: {} }; renderFlow();
  const ref = fb.F.doc(fb.db, "turnos", docId());
  unsub = fb.F.onSnapshot(ref, { includeMetadataChanges: true }, snap => {
    const data = snap.data() || {};
    S.doc = { areas: data.areas || {} };
    for (const { path, v } of pendientes.values()) setPath(S.doc, path, v); // lo que se está escribiendo gana
    estadoSync = { pend: snap.metadata.hasPendingWrites, desdeCache: snap.metadata.fromCache };
    pintarSync();
    if (enFormulario()) renderPendiente = true; else { renderFlow(); if (!$("#view-resumen").hidden) renderResumen(); }
  }, err => { console.error(err); toast("No se pudo leer el turno: " + (err.code === "permission-denied" ? "sin permiso" : "error de conexión")); });
}
const enFormulario = () => { const a = document.activeElement; return a && $("#flow").contains(a) && /INPUT|SELECT|TEXTAREA/.test(a.tagName); };
document.addEventListener("focusout", () => setTimeout(() => { if (renderPendiente && !enFormulario()) { renderPendiente = false; renderFlow(); } }, 50));

function pintarSync() {
  const el = $("#sync");
  if (DEMO) { el.className = "sync pend"; el.textContent = "Solo en este celular"; return; }
  if (!navigator.onLine) { el.className = "sync off"; el.textContent = "Sin señal · guardado en el celular"; return; }
  if (pendientes.size || estadoSync.pend) { el.className = "sync pend"; el.textContent = "Enviando…"; return; }
  el.className = "sync ok"; el.textContent = "Sincronizado";
}
addEventListener("online", pintarSync); addEventListener("offline", pintarSync);

// ---------- Evaluación contra límites ----------
function evalua(p, v) {
  if (vacio(v)) return null;
  if (p.t === "ok") return v !== "No conforme";
  if (p.t === "txt" || !tieneRango(p)) return null;
  const n = +v; if (isNaN(n)) return null;
  if (p.min != null && n < p.min) return false;
  if (p.max != null && n > p.max) return false;
  return true;
}
function limHtml(p) {
  if (p.t === "txt") return "";
  if (p.t === "ok") return `<div class="lim">Conforme / No conforme</div>`;
  if (p.porRef) return `<div class="lim"><span class="pend">Rango según referencia (pendiente)</span></div>`;
  if (p.sinRango) return `<div class="lim"><span class="pend">Sin rango definido</span></div>`;
  const parts = [];
  if (p.min != null) parts.push(`<span>mín ${fmt(p.min)}</span>`);
  if (p.obj != null) parts.push(`<span class="o">obj ${fmt(p.obj)}</span>`);
  if (p.max != null) parts.push(`<span>máx ${fmt(p.max)}</span>`);
  return `<div class="lim">${parts.join("")}</div>`;
}
function limTxt(p) { if (p.min != null && p.max != null) return `${fmt(p.min)} a ${fmt(p.max)}`; if (p.obj != null) return `obj ${fmt(p.obj)}`; return ""; }
function fueras(a) {
  const x = area(a.id), out = [];
  lecturas(a.id).forEach(r => a.params.forEach(p => { if (evalua(p, r[p.id]) === false) out.push({ h: r.h, p, v: r[p.id] }); }));
  if (a.turno) a.turno.params.forEach(p => { if (evalua(p, (x.t || {})[p.id]) === false) out.push({ h: "turno", p, v: x.t[p.id] }); });
  return out;
}
function tieneDatos(a) { const x = area(a.id); return lecturas(a.id).length || Object.values(x.t || {}).some(v => !vacio(v)) || x.obs; }
function estado(a) { if (fueras(a).length) return "fuera"; if (area(a.id).done) return "completo"; return tieneDatos(a) ? "en-curso" : "pendiente"; }
const ETQ = { pendiente: "Sin lecturas", "en-curso": "En curso", completo: "Revisada", fuera: "Fuera de límites" };
function subTxt(a) { const n = lecturas(a.id).length, f = fueras(a).length; return [a.etapa, n ? `${n} lectura${n > 1 ? "s" : ""}` : "", f ? `${f} fuera de límite` : ""].filter(Boolean).join(" · "); }
function turnoCompleto(a) { const t = area(a.id).t || {}; return a.turno.params.every(p => !vacio(t[p.id])); }
function totalTurno(a) { const t = area(a.id).t || {}; return a.turno.params.reduce((s, p) => s + num(t[p.id]), 0); }
function rangoTotal(a) { return a.turno.params.reduce((o, p) => ({ min: o.min + p.min, obj: o.obj + p.obj, max: o.max + p.max }), { min: 0, obj: 0, max: 0 }); }

// ---------- Pantalla de áreas ----------
function inputHtml(id, p, v, data) {
  const ev = evalua(p, v), cls = ev === false ? "fuera" : ev === true ? "dentro" : "";
  if (p.t === "ok") return `<select id="${id}" class="${cls}" ${data} aria-label="${esc(p.l)}"><option value="">—</option>${OK.map(o => `<option${o === v ? " selected" : ""}>${o}</option>`).join("")}</select>`;
  if (p.t === "txt" && p.op) { const ops = !vacio(v) && !p.op.includes(v) ? [...p.op, v] : p.op;
    return `<select id="${id}" ${data} aria-label="${esc(p.l)}"><option value="">Seleccionar…</option>${ops.map(o => `<option${o === v ? " selected" : ""}>${esc(o)}</option>`).join("")}</select>`; }
  if (p.t === "txt") return `<input id="${id}" type="text" ${data} value="${esc(v)}" aria-label="${esc(p.l)}">`;
  return `<input id="${id}" class="${cls}" type="number" inputmode="decimal" step="any" ${data} value="${esc(v)}" aria-label="${esc(p.l)}">`;
}
function prow(id, p, v, data) {
  return `<div class="prow${evalua(p, v) === false ? " fuera" : ""}"><div><div class="pl">${esc(p.l)}${p.u ? ` <small>(${esc(p.u)})</small>` : ""}</div>${limHtml(p)}</div>${inputHtml(id, p, v, data)}</div>`;
}
function rondaCnt(a, r) { const evs = a.params.map(p => evalua(p, r[p.id])).filter(e => e !== null); const bad = evs.filter(e => e === false).length; return evs.length ? (bad ? `<span class="cnt bad">${bad} fuera</span>` : `<span class="cnt ok">Todo dentro</span>`) : ""; }

function renderFlow() {
  const open = new Set([...document.querySelectorAll(".area[open]")].map(e => e.dataset.id));
  $("#flow").innerHTML = AREAS.map((a, i) => {
    const x = area(a.id), st = estado(a), ls_ = lecturas(a.id);
    const rondas = ls_.map((r, j) => `<div class="ronda">
        <div class="ronda-h"><b>Lectura ${j + 1}</b><input type="time" id="h-${a.id}-${r.lid}" data-a="${a.id}" data-l="${r.lid}" data-k="h" value="${esc(r.h)}" aria-label="Hora lectura ${j + 1}"><span class="sp"></span><span data-cnt="${a.id}:${r.lid}">${rondaCnt(a, r)}</span><button class="icon-btn" data-dell="${a.id}:${r.lid}" aria-label="Quitar lectura">×</button></div>
        ${a.params.map(p => prow(`r-${a.id}-${r.lid}-${p.id}`, p, r[p.id], `data-a="${a.id}" data-l="${r.lid}" data-k="${p.id}"`)).join("")}
      </div>`).join("");
    let turno = "";
    if (a.turno) {
      const tot = a.turno.total ? `<div class="tot" data-tot="${a.id}"><span>${a.turno.total}</span><span></span></div>` : "";
      turno = `<div class="paradas"><h3>${a.turno.titulo}</h3><div class="turno-blk">${a.turno.params.map(p => prow(`t-${a.id}-${p.id}`, p, (x.t || {})[p.id], `data-ta="${a.id}" data-k="${p.id}"`)).join("")}${tot}</div></div>`;
    }
    return `<details class="area" data-id="${a.id}" data-state="${st}"${open.has(a.id) ? " open" : ""}>
      <summary><div class="step">${i + 1}</div><div><h2>${a.nombre}</h2><div class="sub"></div></div><span class="chip"></span></summary>
      <div class="body">
        <div class="paradas"><h3>Lecturas del turno</h3>${rondas || '<div class="sub">Todavía no hay lecturas en este turno.</div>'}<button class="link-btn" data-addl="${a.id}">+ Nueva lectura</button></div>
        ${turno}
        <label class="field"><span>Observaciones y acciones tomadas</span><textarea id="o-${a.id}" data-obs="${a.id}" placeholder="Qué se encontró y qué se hizo">${esc(x.obs)}</textarea></label>
        <div class="row-end"><span class="sub">${x.done ? "Revisado por el supervisor" : "Al terminar el recorrido, marca el área como revisada"}</span>
          <button class="btn ${x.done ? "" : "ok"}" data-done="${a.id}">${x.done ? "Reabrir" : "Marcar revisada"}</button></div>
      </div></details>`;
  }).join("");
  renderStatus();
}

function renderStatus() {
  const n = AREAS.filter(a => area(a.id).done).length;
  $("#prog").style.width = (n / AREAS.length * 100) + "%";
  $("#prog-t").textContent = `${n} de ${AREAS.length} áreas revisadas`;
  const nf = AREAS.reduce((t, a) => t + fueras(a).length, 0);
  $("#st").textContent = nf ? `${nf} valor${nf > 1 ? "es" : ""} fuera de límite` : (n === AREAS.length ? "Listo para cerrar" : `Faltan ${AREAS.length - n} áreas`);
  AREAS.forEach(a => {
    const el = document.querySelector(`.area[data-id="${a.id}"]`); if (!el) return;
    const st = estado(a); el.dataset.state = st;
    const chip = el.querySelector(".chip"); chip.className = "chip " + st; chip.textContent = ETQ[st];
    el.querySelector("summary .sub").textContent = subTxt(a);
    lecturas(a.id).forEach(r => { const c = el.querySelector(`[data-cnt="${a.id}:${r.lid}"]`); if (c) c.innerHTML = rondaCnt(a, r); });
    const tt = el.querySelector(`[data-tot="${a.id}"]`);
    if (tt) { const t = totalTurno(a), rg = rangoTotal(a); const comp = turnoCompleto(a); tt.classList.toggle("bad", comp && (t < rg.min || t > rg.max)); tt.lastElementChild.textContent = `${t ? fmt(t) + " kg" : "—"}${t && !comp ? " (faltan carbojets)" : ""} · obj ${fmt(rg.obj)} kg`; }
  });
}
function marcar(t, p, v) { const ev = evalua(p, v); t.classList.toggle("fuera", ev === false); t.classList.toggle("dentro", ev === true); t.closest(".prow")?.classList.toggle("fuera", ev === false); }

// ---------- Resumen ----------
function resumen() {
  let nVal = 0, nFuera = 0;
  AREAS.forEach(a => {
    lecturas(a.id).forEach(r => a.params.forEach(p => { const e = evalua(p, r[p.id]); if (e !== null) { nVal++; if (!e) nFuera++; } }));
    if (a.turno) a.turno.params.forEach(p => { const e = evalua(p, (area(a.id).t || {})[p.id]); if (e !== null) { nVal++; if (!e) nFuera++; } });
  });
  const horno = AREAS.find(a => a.id === "horn");
  return { nVal, nFuera, carbon: totalTurno(horno), carbonCompleto: turnoCompleto(horno), rgC: rangoTotal(horno), prim: (area("desa").t || {}).prim };
}
function renderResumen() {
  const d = resumen(), conf = d.nVal ? (d.nVal - d.nFuera) / d.nVal * 100 : null;
  const primP = AREAS.find(a => a.id === "desa").turno.params[0];
  const kp = [
    { k: "Valores dentro de límites", v: conf == null ? "—" : `${fmt(conf, 1)}<small>%</small>`, alert: conf != null && conf < 90 },
    { k: "Fuera de límites", v: `${d.nFuera}<small> de ${d.nVal}</small>`, alert: d.nFuera > 0 },
    { k: "Carbón del turno", v: d.carbon ? `${fmt(d.carbon)}<small> kg</small>` : "—", alert: d.carbonCompleto && (d.carbon < d.rgC.min || d.carbon > d.rgC.max) },
    { k: "Primera del día", v: vacio(d.prim) ? "—" : `${fmt(+d.prim, 1)}<small>%</small>`, alert: evalua(primP, d.prim) === false },
  ];
  $("#kpis").innerHTML = kp.map(x => `<div class="kpi${x.alert ? " alert" : ""}"><span class="k">${x.k}</span><span class="v">${x.v}</span></div>`).join("");
  const nov = [];
  AREAS.forEach(a => fueras(a).forEach(o => nov.push(`<b>${a.nombre}</b>${o.h && o.h !== "turno" ? " " + esc(o.h) : ""}: ${esc(o.p.l)} = ${esc(o.v)}${o.p.u && o.p.t !== "ok" ? " " + esc(o.p.u) : ""}${limTxt(o.p) ? ` (límites ${limTxt(o.p)})` : ""}`)));
  $("#nov").innerHTML = nov.length ? nov.map(n => `<li>${n}</li>`).join("") : "<li>Todos los valores registrados están dentro de límites.</li>";
  const rows = [];
  AREAS.forEach(a => {
    const x = area(a.id), L = lecturas(a.id), filas = [];
    a.params.filter(p => !p.t).forEach(p => {
      const vals = L.map(r => r[p.id]).filter(v => !vacio(v)).map(Number); if (!vals.length) return;
      const prom = vals.reduce((s, v) => s + v, 0) / vals.length, ult = vals.at(-1), c = v => evalua(p, v) === false ? "bad" : "";
      filas.push(`<tr><td>${esc(p.l)}${p.u ? ` (${esc(p.u)})` : ""}</td><td class="lims">${limTxt(p) || "—"}</td><td class="${c(ult)}">${fmt(ult)}</td><td class="${c(prom)}">${fmt(prom, 1)}</td><td>${vals.length}</td></tr>`);
    });
    a.params.filter(p => p.t === "ok").forEach(p => { const vals = L.map(r => r[p.id]).filter(v => !vacio(v)); if (!vals.length) return; const nc = vals.filter(v => v === "No conforme").length;
      filas.push(`<tr><td>${esc(p.l)}</td><td class="lims">Conforme</td><td class="${nc ? "bad" : ""}">${nc ? nc + " no conf." : "Conforme"}</td><td></td><td>${vals.length}</td></tr>`); });
    if (a.turno) a.turno.params.forEach(p => { const v = (x.t || {})[p.id]; if (vacio(v)) return; filas.push(`<tr><td>${esc(p.l)} (${esc(p.u)})</td><td class="lims">${limTxt(p)}</td><td class="${evalua(p, v) === false ? "bad" : ""}">${fmt(+v)}</td><td></td><td>turno</td></tr>`); });
    if (filas.length) rows.push(`<tr class="grp"><td colspan="5">${a.nombre}</td></tr>`, ...filas);
  });
  $("#res-tab").innerHTML = rows.length ? `<thead><tr><th>Parámetro</th><th>Límites</th><th>Último</th><th>Prom.</th><th>Lect.</th></tr></thead><tbody>${rows.join("")}</tbody>` : "<tbody><tr><td>Sin lecturas registradas.</td></tr></tbody>";
  $("#msg").textContent = reporte();
}
function reporte() {
  const d = resumen(), m = S.meta;
  const L = [`*CIMET – Control de calidad*`, `${m.fecha} · ${TURNOS[m.turno]}`, `Supervisor: ${m.sup || "—"}`, "", `Valores registrados: ${d.nVal} · fuera de límites: ${d.nFuera}`];
  if (d.carbon) L.push(`Carbón del turno: ${fmt(d.carbon)} kg (obj ${fmt(d.rgC.obj)} kg)${d.carbonCompleto ? "" : " · faltan carbojets"}`);
  if (!vacio(d.prim)) L.push(`Primera del día: ${fmt(+d.prim, 1)}%`);
  const fu = []; AREAS.forEach(a => fueras(a).forEach(o => fu.push(`- ${a.nombre}${o.h && o.h !== "turno" ? " " + o.h : ""}: ${o.p.l} ${o.v}${o.p.u && o.p.t !== "ok" ? " " + o.p.u : ""}${limTxt(o.p) ? ` (límites ${limTxt(o.p)})` : ""}`)));
  if (fu.length) L.push("", "Fuera de límites:", ...fu);
  const obs = AREAS.filter(a => area(a.id).obs).map(a => `- ${a.nombre}: ${area(a.id).obs}`);
  if (obs.length) L.push("", "Observaciones:", ...obs);
  const falt = AREAS.filter(a => !area(a.id).done).map(a => a.nombre);
  if (falt.length) L.push("", `Sin revisar: ${falt.join(", ")}`);
  return L.join("\n");
}

// ---------- Eventos ----------
$("#flow").addEventListener("input", e => {
  const t = e.target;
  if (t.dataset.l) {
    const a = AREAS.find(x => x.id === t.dataset.a);
    guardar(["areas", a.id, "r", t.dataset.l, t.dataset.k], t.value);
    const p = a.params.find(x => x.id === t.dataset.k); if (p) marcar(t, p, t.value);
  } else if (t.dataset.ta) {
    const a = AREAS.find(x => x.id === t.dataset.ta);
    guardar(["areas", a.id, "t", t.dataset.k], t.value);
    marcar(t, a.turno.params.find(x => x.id === t.dataset.k), t.value);
  } else if (t.dataset.obs) guardar(["areas", t.dataset.obs, "obs"], t.value);
  else return;
  renderStatus();
});
$("#flow").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.addl) {
    const id = b.dataset.addl, now = new Date(), lid = nuevoId();
    guardar(["areas", id, "r", lid], { n: Date.now(), h: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}` }, true);
    renderFlow();
    const a = AREAS.find(x => x.id === id), first = a.params.find(p => p.t !== "txt") || a.params[0];
    const el = document.getElementById(`r-${id}-${lid}-${first.id}`); el?.closest(".ronda")?.scrollIntoView({ block: "start", behavior: "smooth" }); el?.focus({ preventScroll: true });
  }
  if (b.dataset.dell) {
    if (b.dataset.confirm !== "1") { b.dataset.confirm = "1"; b.textContent = "¿?"; b.setAttribute("aria-label", "Toca otra vez para quitar"); toast("Toca otra vez la × para quitar la lectura"); setTimeout(() => { b.dataset.confirm = ""; b.textContent = "×"; }, 3000); return; }
    const [a, lid] = b.dataset.dell.split(":"); guardar(["areas", a, "r", lid], undefined, true); renderFlow();
  }
  if (b.dataset.done) {
    const a = b.dataset.done, v = !area(a).done; guardar(["areas", a, "done"], v, true); renderFlow();
    if (v) { const i = AREAS.findIndex(x => x.id === a); document.querySelector(`.area[data-id="${a}"]`).open = false;
      const nx = AREAS.slice(i + 1).find(x => !area(x.id).done); if (nx) { const n = document.querySelector(`.area[data-id="${nx.id}"]`); n.open = true; n.scrollIntoView({ block: "start", behavior: "smooth" }); } }
  }
});

function tab(r) {
  ["areas", "resumen", "informe"].forEach(k => { $("#tab-" + k).setAttribute("aria-selected", r === k); $("#view-" + k).hidden = r !== k; });
  document.querySelector(".footer-bar").hidden = r === "informe";
  if (r === "resumen") renderResumen();
  scrollTo(0, 0);
}
$("#tab-areas").onclick = () => tab("areas");
$("#tab-resumen").onclick = () => tab("resumen");
$("#tab-informe").onclick = () => tab("informe");

$("#m-fecha").value = S.meta.fecha; $("#m-turno").value = S.meta.turno; $("#m-sup").value = S.meta.sup;
$("#m-fecha").addEventListener("change", e => { enviarTodo(); S.meta.fecha = e.target.value; abrirTurno(); });
$("#m-turno").addEventListener("change", e => { enviarTodo(); S.meta.turno = e.target.value; abrirTurno(); });
$("#m-sup").addEventListener("input", e => { S.meta.sup = e.target.value; ls.set("cimet-sup", e.target.value); });

$("#cerrar").onclick = () => {
  const falt = AREAS.filter(a => !area(a.id).done);
  if (falt.length) { toast(`Faltan por revisar: ${falt.map(a => a.nombre).join(", ")}`); return; }
  enviarTodo(); tab("resumen"); toast("Turno cerrado. Copia el reporte para enviarlo");
};
$("#copy").onclick = () => {
  const t = reporte();
  const sel = () => { const r = document.createRange(); r.selectNodeContents($("#msg")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); toast("Texto seleccionado, cópialo"); };
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast("Reporte copiado"), sel); else sel();
};
addEventListener("pagehide", enviarTodo);
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") enviarTodo(); });

// ---------- Instalación ----------
let promptInstalar = null;
const instalada = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); promptInstalar = e; if (!instalada) $("#install").hidden = false; });
$("#install-btn").onclick = async () => {
  if (promptInstalar) { promptInstalar.prompt(); await promptInstalar.userChoice; promptInstalar = null; $("#install").hidden = true; }
  else $("#install").hidden = true;
};
if (!instalada && /iphone|ipad|ipod/i.test(navigator.userAgent)) {
  $("#install-t").textContent = "Para instalarla en iPhone: toca Compartir y luego “Agregar a inicio”.";
  $("#install-btn").textContent = "Entendido"; $("#install").hidden = false;
}
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

// ---------- Inicio y sesión ----------
function mostrarApp() { $("#login").hidden = true; $("#app").hidden = false; abrirTurno(); }
if (DEMO) {
  $("#demo-note").hidden = false; $("#u-name").textContent = "Modo demostración"; mostrarApp();
} else {
  fb.A.onAuthStateChanged(fb.auth, u => {
    S.user = u;
    if (!u) { if (unsub) { unsub(); unsub = null; } $("#app").hidden = true; $("#login").hidden = false; return; }
    $("#u-name").textContent = u.displayName || u.email; $("#logout").hidden = false;
    if (!S.meta.sup) { S.meta.sup = u.displayName || ""; $("#m-sup").value = S.meta.sup; }
    mostrarApp();
  });
  const ERR = { "auth/invalid-credential": "Correo o contraseña incorrectos.", "auth/wrong-password": "Correo o contraseña incorrectos.", "auth/user-not-found": "Ese correo no tiene usuario. Pídelo al director de producción.", "auth/too-many-requests": "Demasiados intentos. Espera unos minutos.", "auth/network-request-failed": "Sin conexión. La primera vez se necesita internet para entrar." };
  $("#login-form").addEventListener("submit", async e => {
    e.preventDefault(); $("#l-err").hidden = true; $("#l-btn").disabled = true; $("#l-btn").textContent = "Entrando…";
    try { await fb.A.signInWithEmailAndPassword(fb.auth, $("#l-email").value.trim(), $("#l-pass").value); }
    catch (err) { $("#l-err").textContent = ERR[err.code] || "No se pudo entrar. Intenta de nuevo."; $("#l-err").hidden = false; }
    $("#l-btn").disabled = false; $("#l-btn").textContent = "Entrar";
  });
  $("#logout").onclick = () => { enviarTodo(); fb.A.signOut(fb.auth); };
}


// ---------- Informes ----------
// Junta todos los turnos de un rango de fechas y los deja listos para Excel (una fila por valor registrado).
let INF = [];
{
  const hoy = turnoActual().fecha;
  $("#i-hasta").value = hoy; $("#i-desde").value = hoy.slice(0, 8) + "01";
}
async function cargarTurnos(desde, hasta) {
  if (DEMO) {
    const out = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k.startsWith("cimet-demo-2")) continue;
      const id = k.slice(11), [f, t] = id.split("_"); if (f >= desde && f <= hasta) out.push({ id, fecha: f, turno: t, ...JSON.parse(localStorage.getItem(k)) }); }
    return out;
  }
  const q = fb.F.query(fb.F.collection(fb.db, "turnos"), fb.F.where("fecha", ">=", desde), fb.F.where("fecha", "<=", hasta));
  const snap = await fb.F.getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
function filasTurno(t) {
  const filas = [], sup = Object.values(t.supervisores || {}).join(", ");
  AREAS.forEach(a => {
    const x = (t.areas || {})[a.id]; if (!x) return;
    const L = Object.values(x.r || {}).sort((p, q) => (p.n || 0) - (q.n || 0));
    L.forEach((r, j) => a.params.forEach(p => { const v = r[p.id]; if (vacio(v)) return;
      filas.push({ fecha: t.fecha, turno: t.turno, sup, area: a.nombre, lectura: j + 1, hora: r.h || "", p, v, ev: evalua(p, v), obs: x.obs || "" }); }));
    if (a.turno) a.turno.params.forEach(p => { const v = (x.t || {})[p.id]; if (vacio(v)) return;
      filas.push({ fecha: t.fecha, turno: t.turno, sup, area: a.nombre, lectura: "turno", hora: "", p, v, ev: evalua(p, v), obs: x.obs || "" }); });
  });
  return filas;
}
$("#i-cargar").onclick = async () => {
  const desde = $("#i-desde").value, hasta = $("#i-hasta").value;
  if (!desde || !hasta || desde > hasta) { toast("Revisa las fechas: Desde debe ser anterior a Hasta"); return; }
  $("#i-estado").textContent = "Consultando…"; $("#i-cargar").disabled = true;
  try {
    const turnos = (await cargarTurnos(desde, hasta)).sort((a, b) => a.id < b.id ? -1 : 1);
    INF = turnos.map(t => ({ t, filas: filasTurno(t) }));
    renderInforme();
    $("#i-estado").textContent = turnos.length ? `${turnos.length} turno${turnos.length > 1 ? "s" : ""} entre ${desde} y ${hasta}` : "No hay turnos registrados en ese rango.";
  } catch (e) { console.error(e); $("#i-estado").textContent = "No se pudo consultar. Revisa la conexión."; }
  $("#i-cargar").disabled = false;
};
function renderInforme() {
  const todas = INF.flatMap(x => x.filas), conRango = todas.filter(f => f.ev !== null), fuera = conRango.filter(f => f.ev === false);
  const has = INF.length > 0;
  ["#i-kpis", "#i-panel-turnos", "#i-panel-fuera"].forEach(s => $(s).hidden = !has);
  if (!has) return;
  const conf = conRango.length ? (conRango.length - fuera.length) / conRango.length * 100 : null;
  $("#i-kpis").innerHTML = [
    { k: "Turnos", v: INF.length },
    { k: "Valores registrados", v: fmt(todas.length) },
    { k: "Dentro de límites", v: conf == null ? "—" : `${fmt(conf, 1)}<small>%</small>`, alert: conf != null && conf < 90 },
    { k: "Fuera de límites", v: fmt(fuera.length), alert: fuera.length > 0 },
  ].map(x => `<div class="kpi${x.alert ? " alert" : ""}"><span class="k">${x.k}</span><span class="v">${x.v}</span></div>`).join("");
  $("#i-turnos").innerHTML = `<thead><tr><th>Turno</th><th>Supervisor</th><th>Valores</th><th>Fuera</th><th>Áreas rev.</th></tr></thead><tbody>${INF.map(({ t, filas }) => {
    const nf = filas.filter(f => f.ev === false).length, rev = AREAS.filter(a => ((t.areas || {})[a.id] || {}).done).length;
    return `<tr><td>${esc(t.fecha)} · ${esc((TURNOS[t.turno] || t.turno).replace(/ \(.*/, ""))}</td><td>${esc(Object.values(t.supervisores || {}).join(", ") || "—")}</td><td>${filas.length}</td><td class="${nf ? "bad" : ""}">${nf}</td><td>${rev} de 7</td></tr>`;
  }).join("")}</tbody>`;
  const cuenta = {}; fuera.forEach(f => { const k = `${f.area} · ${f.p.l}`; cuenta[k] = (cuenta[k] || 0) + 1; });
  const top = Object.entries(cuenta).sort((a, b) => b[1] - a[1]).slice(0, 8), max = Math.max(1, ...top.map(x => x[1]));
  $("#i-bars").innerHTML = top.length ? top.map(([k, n]) => `<div class="barrow" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr) 44px"><span>${esc(k)}</span><div class="t"><div class="f" style="width:${n / max * 100}%"></div></div><span class="n">${n}</span></div>`).join("") : '<div class="sub">Ningún valor fuera de límites en este rango.</div>';
}
$("#i-excel").onclick = () => {
  const num_ = v => (v === "" || v == null) ? "" : String(v).replace(".", ",");
  const cel = v => { const s = String(v ?? ""); return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const head = ["Fecha", "Turno", "Supervisor", "Área", "Lectura", "Hora", "Parámetro", "Unidad", "Valor", "Lím. inf", "Objetivo", "Lím. sup", "Estado", "Observaciones del área"];
  const rows = INF.flatMap(x => x.filas).map(f => [f.fecha, TURNOS[f.turno] || f.turno, f.sup, f.area, f.lectura, f.hora, f.p.l, f.p.u || "",
    f.p.t ? f.v : num_(f.v), num_(f.p.min), num_(f.p.obj), num_(f.p.max), f.ev === false ? "Fuera" : f.ev === true ? "Dentro" : "Sin rango", f.obs]);
  const csv = "﻿" + [head, ...rows].map(r => r.map(cel).join(";")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
  a.download = `CIMET_calidad_${$("#i-desde").value}_a_${$("#i-hasta").value}.csv`;
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Archivo descargado");
};
