// ============================================================
// CHECKOUT
// Llama al backend (server/server.js) que crea la preferencia
// de pago en Mercado Pago y devuelve el link para redirigir.
// Funciona sin VS Code: abrí http://localhost:3000/checkout.html
// ============================================================

// Detección automática del backend:
// 1) Si la página viene de localhost/127.0.0.1 (mismo backend o Live Server),
//    se prueba primero el mismo origen (sin CORS)
// 2) Después los fallbacks clásicos del puerto del backend
function getBackendCandidates() {
  const list = [];
  try {
    const loc = window.location;
    if (loc && loc.protocol.startsWith("http") && /(localhost|127\.0\.0\.1)/.test(loc.hostname)) {
      list.push(loc.origin);
    }
  } catch { /* ignorar */ }
  list.push("http://localhost:3000", "http://127.0.0.1:3000");
  return [...new Set(list)];
}

// Fetch único contra el backend con fallback entre candidatos.
// Para POST: si la respuesta no es JSON (ej. Live Server devolviendo HTML),
// se pasa al siguiente candidato en vez de romper.
async function apiFetch(path, options) {
  const urls = getBackendCandidates();
  let lastNetworkError = null;
  const isGet = !options || !options.method || options.method === "GET";

  for (const base of urls) {
    const url = (window.location.origin === base) ? path : `${base}${path}`;
    try {
      const response = await fetch(url, options);
      if (isGet) {
        if (response.ok || response.status === 502 || response.status === 400) return { response, base };
        continue;
      }
      const ct = response.headers.get("content-type") || "";
      if (!response.ok && !ct.includes("json")) continue; // no es nuestro backend
      return { response, base };
    } catch (err) {
      lastNetworkError = err;
    }
  }
  throw lastNetworkError || new Error("Failed to fetch");
}

async function postPreferencia(items) {
  const { response, base } = await apiFetch("/crear-preferencia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items })
  });
  return { response, base };
}

function renderSummary() {
  const cart = getCart();
  const itemsEl = document.getElementById("summary-items");
  const totalEl = document.getElementById("summary-total");

  if (cart.length === 0) {
    itemsEl.innerHTML = `<p class="cart-empty">Tu carrito está vacío. <a href="index.html">Volver al catálogo</a>.</p>`;
    document.getElementById("pay-btn").disabled = true;
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="summary-line">
        <span><strong>${item.cantidad}x</strong> ${escapeHtml(item.nombre)}</span>
        <span>${formatPrice(item.precio * item.cantidad)}</span>
      </div>
    `).join("");
  }

  totalEl.textContent = formatPrice(cartTotal());
}

function mensajeSegunErrorBackend(data, status) {
  if (!data) return null;
  if (data.code === "MISSING_TOKEN") {
    return "Falta configurar el Access Token en server/.env. Copialo de Tus integraciones > Pruebas > Credenciales de prueba (hoy también empieza con APP_USR-, igual que producción: fijate la sección, no el prefijo). Mientras tanto podés activar MOCK_PAYMENTS=true para probar sin Mercado Pago. Ver README pasos 3 y 4.";
  }
  if (data.code === "MP_AUTH_ERROR") {
    return "Mercado Pago rechazó el Access Token. Revisá que esté bien pegado en server/.env, sin espacios.";
  }
  if (data.code === "BACK_URL_ERROR") {
    return "Mercado Pago rechazó las URLs de retorno. Revisá FRONTEND_URL en server/.env y probá de nuevo.";
  }
  if (data.code === "EMPTY_CART") {
    return "Tu carrito está vacío. Volvé al catálogo y agregá al menos un producto.";
  }
  if (data.code === "INVALID_ITEM") {
    return data.error || "Hay un producto con precio o cantidad inválida en el carrito. Vacialo y volvé a agregar.";
  }
  if (data.error) return data.error;
  return null;
}

async function fetchHealthWithFallback() {
  try {
    const { response, base } = await apiFetch("/health", { method: "GET" });
    return { res: await response.json(), base };
  } catch {
    return null;
  }
}

async function checkBackendStatus() {
  const el = document.getElementById("backend-status");
  if (!el) return;

  // Caso file:// (doble-click): explicar directo cómo abrir bien sin VS Code
  if (window.location.protocol === "file:") {
    el.hidden = false;
    el.textContent = "⚠️ Abriste con doble-click (file://) y el navegador bloquea el pago. Abrí http://localhost:3000/checkout.html con el backend prendido (npm start en /server).";
    el.style.color = "#b45309";
    return;
  }

  const found = await fetchHealthWithFallback();
  if (!found) {
    el.hidden = false;
    el.textContent = "⛔ Backend apagado. Abrí una terminal en /server y corré: npm install, después npm start. Después abrí http://localhost:3000/checkout.html y recargá con Ctrl+Shift+R.";
    return;
  }
  const h = found.res;
  if (!h.mp_configured && !h.mock_mode) {
    el.hidden = false;
    el.textContent = "⚠️ Backend conectado, pero falta el Access Token en server/.env (copialo de Pruebas > Credenciales de prueba, o activá MOCK_PAYMENTS=true).";
    el.style.color = "#b45309";
  } else if (h.mock_mode) {
    el.hidden = true;
    el.textContent = "";
  } else if (h.mp_env === "production") {
    el.hidden = false;
    el.textContent = "⚠️ Backend conectado en modo PRODUCCIÓN (cobra real). Para la entrega usá MP_ENV=test con credencial de Pruebas.";
    el.style.color = "#b45309";
  } else {
    // Todo OK en modo pruebas: no mostramos nada para dejar la pantalla limpia.
    el.hidden = true;
    el.textContent = "";
  }
}

async function pagarConMercadoPago() {
  const cart = getCart();
  const btn = document.getElementById("pay-btn");
  const errorEl = document.getElementById("pay-error");

  errorEl.hidden = true;
  btn.disabled = true;
  btn.textContent = "Abriendo Mercado Pago… aprobá en la otra pestaña";

  if (window.location.protocol === "file:") {
    errorEl.textContent = "Estás en file:// (doble-click). Cerrá esto y abrí http://localhost:3000/checkout.html con el backend prendido (npm start en /server).";
    errorEl.hidden = false;
    btn.disabled = false;
    btn.textContent = "Pagar con Mercado Pago";
    return;
  }

  if (!cart || cart.length === 0) {
    errorEl.textContent = "Tu carrito está vacío. Volvé al catálogo y agregá al menos un producto.";
    errorEl.hidden = false;
    btn.disabled = false;
    btn.textContent = "Pagar con Mercado Pago";
    return;
  }

  try {
    // El precio lo pone el servidor desde su catálogo: solo mandamos id + cantidad.
    const payload = cart.map(i => ({ id: i.id, cantidad: i.cantidad }));
    const { response } = await postPreferencia(payload);

    if (!response.ok) {
      let data = null;
      try { data = await response.json(); } catch { /* no-json */ }
      throw new Error(mensajeSegunErrorBackend(data, response.status) || `El servidor respondió con error ${response.status}`);
    }

    const data = await response.json();

    if (data.init_point) {
      // Guarda el total para mostrarlo en success.html aunque se limpie el carrito.
      try {
        sessionStorage.setItem("optica_last_total", String(cartTotal()));
        sessionStorage.setItem("optica_last_count", String(cart.reduce((n, i) => n + i.cantidad, 0)));
        if (data.preference_id) sessionStorage.setItem("optica_pref_id", String(data.preference_id));
      } catch { /* ignorar */ }
      // Mock: flujo simple en la misma pestaña
      if (data.mock) {
        window.location.href = data.init_point;
        return;
      }
      // Real: abrir MP en otra pestaña y esperar el aprobado sin copiar nada
      let mpWin = null;
      try { mpWin = window.open(data.init_point, "_blank"); } catch { mpWin = null; }
      if (!mpWin) {
        // Popup bloqueado: fallback a misma pestaña (flujo manual viejo)
        window.location.href = data.init_point;
        return;
      }
      startWaiting(data.preference_id, mpWin);
    } else {
      throw new Error("No se recibió el link de pago");
    }
  } catch (err) {
    console.error(err);
    const msg = String(err && err.message || "");
    if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("ERR_CONNECTION_REFUSED") || err instanceof TypeError) {
      const tried = getBackendCandidates().join(" ni ");
      errorEl.textContent = `No pudimos conectar con el servidor de pagos (${tried}). Pasos sin VS Code: 1) Abrí una terminal en la carpeta /server 2) Corré: npm install y después npm start 3) Tiene que decir "✅ Servidor corriendo en http://localhost:3000" 4) Abrí http://localhost:3000/checkout.html (no doble-click) y recargá con Ctrl+Shift+R. Salud: http://localhost:3000/health`;
    } else {
      errorEl.textContent = msg;
    }
    errorEl.hidden = false;
    btn.disabled = false;
    btn.textContent = "Pagar con Mercado Pago";
  }
}

// ---- Espera automática del pago (MP en otra pestaña, sin copiar IDs) ----
let pollTimer = null;
let pollTries = 0;
let pollSlow = false;
let activePrefId = null;
let mpWinRef = null;
const POLL_MS = 4000;
const POLL_MS_SLOW = 8000;
const POLL_MAX = 60;

async function fetchEstadoPago(preferenceId) {
  const { response } = await apiFetch(`/estado-pago?preference_id=${encodeURIComponent(preferenceId)}`, { method: "GET" });
  return response.json();
}

function showWaiting() {
  document.getElementById("pay-waiting").hidden = false;
  document.getElementById("pay-btn").hidden = true;
}

function hideWaiting(resetBtn) {
  document.getElementById("pay-waiting").hidden = true;
  const btn = document.getElementById("pay-btn");
  btn.hidden = false;
  if (resetBtn) {
    btn.disabled = false;
    btn.textContent = "Pagar con Mercado Pago";
  }
}

function stopWaiting(closeMp) {
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  pollTries = 0;
  pollSlow = false;
  activePrefId = null;
  // La pestaña de MP se deja abierta al aprobar (ahí está el comprobante);
  // solo se cierra al cancelar o por timeout.
  if (closeMp) {
    try { if (mpWinRef && !mpWinRef.closed) mpWinRef.close(); } catch { /* ignorar */ }
  }
  mpWinRef = null;
}

async function checkOnceAndRedirect() {
  if (!activePrefId) return;
  const stateEl = document.getElementById("pay-wait-state");
  pollTries++;
  // Backoff: tras 10 intentos (~40s) se consulta cada 8s para no saturar a MP.
  if (pollTries === 11 && pollTimer) {
    clearInterval(pollTimer);
    pollSlow = true;
    pollTimer = setInterval(checkOnceAndRedirect, POLL_MS_SLOW);
  }
  try {
    const data = await fetchEstadoPago(activePrefId);
    if (data.status === "approved") {
      stopWaiting(false);
      window.location.href = `success.html?status=approved&payment_id=${encodeURIComponent(data.payment_id || "")}&preference_id=${encodeURIComponent(activePrefId)}`;
      return;
    }
    if (data.status === "rejected" || data.status === "cancelled") {
      stopWaiting(false);
      window.location.href = `failure.html?status=${encodeURIComponent(data.status)}&preference_id=${encodeURIComponent(activePrefId)}`;
      return;
    }
    if (pollTries >= POLL_MAX) {
      stopWaiting(true);
      stateEl.textContent = "Tardó mucho en acreditarse. Si ya pagaste, tocá “Ya pagué, verificar ahora”. Tu carrito sigue guardado.";
      hideWaiting(true);
      return;
    }
    stateEl.textContent = `Pago abierto en otra pestaña… esperando aprobación. Si ya pagaste, tocá “Ya pagué, verificar ahora”.`;
  } catch {
    stateEl.textContent = "Sin conexión al backend para verificar. Revisá que siga con npm start y tocá verificar de nuevo.";
  }
}

function startWaiting(preferenceId, mpWin) {
  stopWaiting(false);
  activePrefId = preferenceId;
  mpWinRef = mpWin;
  pollTries = 0;
  pollSlow = false;
  showWaiting();
  document.getElementById("pay-wait-state").textContent = "Pago abierto en otra pestaña… aprobá ahí con tu comprador de prueba y volvemos solos.";
  checkOnceAndRedirect();
  pollTimer = setInterval(checkOnceAndRedirect, POLL_MS);
}

document.addEventListener("DOMContentLoaded", () => {
  renderSummary();
  checkBackendStatus();
  document.getElementById("pay-btn").addEventListener("click", pagarConMercadoPago);
  document.getElementById("verify-btn").addEventListener("click", checkOnceAndRedirect);
  document.getElementById("cancel-wait-btn").addEventListener("click", () => {
    stopWaiting(true);
    hideWaiting(true);
  });
  window.addEventListener("pagehide", () => stopWaiting(false));
});
