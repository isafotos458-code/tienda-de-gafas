// ============================================================
// SERVIDOR BACKEND — Óptica Visión
// Única función: crear una "preferencia de pago" en Mercado Pago
// y devolverle al frontend el link (init_point) para redirigir.
//
// El Access Token NUNCA va en el frontend: por eso existe este server.
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { MercadoPagoConfig, Preference } = require("mercadopago");

const app = express();

// ---- Config ----
const PORT = process.env.PORT || 3000;
// URL pública de tu frontend (para volver luego de pagar).
// Si usás el backend como servidor del frontend (sin VS Code / sin Live Server),
// dejalo en http://localhost:3000. Si usás Live Server, poné http://127.0.0.1:5500
const FRONTEND_URL = (process.env.FRONTEND_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
const MP_TOKEN = (process.env.MP_ACCESS_TOKEN || "").trim();
// Modo mock: permite probar el flujo sin credencial de Mercado Pago.
// Útil para el colegio mientras conseguís la credencial de prueba.
// Activar con MOCK_PAYMENTS=true en .env
const MOCK_MODE = String(process.env.MOCK_PAYMENTS || "").toLowerCase() === "true";
// MP_ENV=test|production. Desde fines de 2025 Mercado Pago usa prefijo APP_USR-
// tanto en prueba como en producción, así que el prefijo YA NO distingue.
// Lo que distingue es de qué sección lo copiaste:
//   Pruebas > Credenciales de prueba  -> MP_ENV=test (sandbox, sin plata real)
//   Producción > Credenciales          -> MP_ENV=production (cobro REAL)
const MP_ENV = String(process.env.MP_ENV || "test").toLowerCase() === "production" ? "production" : "test";

// Catálogo espejo del frontend (js/products.js) para validar precios en el servidor.
// El navegador podría mandar precios editados; el precio real siempre sale de acá.
let CATALOG = [];
try {
  const loaded = require("../js/products.js");
  if (Array.isArray(loaded)) CATALOG = loaded;
} catch (e) {
  console.error("⚠️  No se pudo cargar ../js/products.js, la validación de precios queda desactivada:", e.message);
}
const PRICE_MAP = new Map(CATALOG.map(p => [String(p.id), { precio: Number(p.precio), nombre: String(p.nombre) }]));

function isTokenConfigured() {
  if (!MP_TOKEN) return false;
  if (MP_TOKEN.length < 20) return false;
  if (MP_TOKEN.includes("000000000000")) return false; // placeholder del .env.example
  if (/PEGAR_ACA|TU_TOKEN|XXXX/i.test(MP_TOKEN)) return false; // placeholder generado
  // Formato actual (2025+): APP_USR- tanto en prueba como en producción.
  // Formato viejo: TEST- (prueba). Se aceptan ambos por compatibilidad.
  return MP_TOKEN.startsWith("TEST-") || MP_TOKEN.startsWith("APP_USR-");
}

const client = new MercadoPagoConfig({
  accessToken: isTokenConfigured() ? MP_TOKEN : "TEST-DUMMY-SIN-CONFIGURAR"
});

// ---- CORS ----
// Acepta el FRONTEND_URL configurado + cualquier localhost/127.0.0.1
// (así no se rompe si Live Server cambia de puerto 5500 -> 5501).
// También acepta Origin "null" (cuando se abre con file:// doble-click)
// para dar un error útil en vez de un bloqueo silencioso.
const staticOrigins = [
  FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:5501",
  "http://127.0.0.1:5501"
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permite curl / health checks sin Origin
    if (!origin) return cb(null, true);
    // Permite file:// (double-click) para diagnóstico (el frontend avisa que use http)
    if (origin === "null") return cb(null, true);
    if (staticOrigins.includes(origin)) return cb(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    return cb(null, false);
  }
}));
app.use(express.json({ limit: "50kb" }));
// JSON malformado -> 400 claro en vez de 500 genérico
app.use((err, req, res, next) => {
  if (err && err.type === "entity.parse.failed") {
    return res.status(400).json({ code: "INVALID_JSON", error: "El cuerpo del pedido no es JSON válido." });
  }
  next(err);
});

// ---- Frontend estático (para no depender de VS Code / Live Server) ----
// Sirve index.html, checkout.html, css/, js/ desde http://localhost:3000/
// Así podés usar http://localhost:3000/checkout.html directo, sin Live Server.
// IMPORTANTE: nunca servir nada de /server (código backend, .env, package.json).
app.use("/server", (req, res) => res.status(404).json({ code: "NOT_FOUND", error: "No encontrado" }));
app.use(express.static(path.join(__dirname, ".."), { dotfiles: "deny", index: ["index.html"] }));

// Devuelve la base correcta para redirecciones:
// - Si el navegador vino de localhost/127.0.0.1 (Live Server o backend mismo), usa ese Origin
// - Si vino de file:// o curl (sin Origin), usa FRONTEND_URL del .env
function getBaseUrl(req) {
  const origin = req.headers.origin;
  if (origin && origin !== "null" && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return origin.replace(/\/$/, "");
  }
  return FRONTEND_URL;
}

// ---- Diagnóstico ----
// GET /health -> el frontend lo usa para decir "el backend está vivo / apagado"
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    backend: `http://localhost:${PORT}`,
    frontend_url: FRONTEND_URL,
    mp_configured: isTokenConfigured(),
    mp_env: MP_ENV,
    token_prefix: MP_TOKEN ? MP_TOKEN.slice(0, 7) : null,
    mock_mode: MOCK_MODE,
    timestamp: new Date().toISOString()
  });
});

// GET /api -> ayuda rápida (GET / sirve el index.html por el static de arriba)
app.get("/api", (req, res) => {
  res.json({
    mensaje: "Backend Óptica Visión corriendo. Usá POST /crear-preferencia desde checkout.html",
    frontend: `http://localhost:${PORT}/checkout.html`,
    health: "/health",
    crear_preferencia: "POST /crear-preferencia { items: [...] }"
  });
});

app.post("/crear-preferencia", async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        code: "EMPTY_CART",
        error: "El carrito está vacío"
      });
    }

    // Validación contra el catálogo del servidor (el precio del navegador no se confía).
    // El frontend manda { id, cantidad }; nombre y precio reales salen de PRICE_MAP.
    const MAX_QTY = 99;
    for (const it of items) {
      const entry = PRICE_MAP.get(String(it && it.id));
      const qty = Math.floor(Number(it && it.cantidad));
      if (!entry || !Number.isFinite(qty) || qty < 1 || qty > MAX_QTY) {
        return res.status(400).json({
          code: "INVALID_ITEM",
          error: "Hay un producto inválido en el carrito (id desconocido o cantidad fuera de rango). Vacialo y volvé a agregar desde el catálogo."
        });
      }
    }

    // Modo mock: devuelve un link falso al success.html local.
    // Sirve para probar todo el flujo sin credencial de Mercado Pago.
    if (MOCK_MODE || !isTokenConfigured()) {
      if (!isTokenConfigured() && !MOCK_MODE) {
        return res.status(503).json({
          code: "MISSING_TOKEN",
          error: "Falta configurar MP_ACCESS_TOKEN en server/.env. Copialo de Tus integraciones > Pruebas > Credenciales de prueba (hoy también empieza con APP_USR-, igual que producción: fijate la sección, no el prefijo). Ver README paso 3 y 4."
        });
      }
      const base = getBaseUrl(req);
      const mockUrl = `${base}/success.html?mock=1&items=${items.length}`;
      const mockPrefId = `mock-${Date.now()}`;
      console.log(`[mock] preferencia simulada para ${items.length} items -> ${mockUrl}`);
      return res.json({ init_point: mockUrl, mock: true, preference_id: mockPrefId });
    }

    // Mercado Pago espera cada item con: title, quantity, unit_price.
    // Precio y nombre SIEMPRE del catálogo del servidor, nunca del navegador.
    const mpItems = items.map(item => {
      const entry = PRICE_MAP.get(String(item.id));
      return {
        title: entry.nombre.slice(0, 100),
        quantity: Math.floor(Number(item.cantidad)),
        unit_price: entry.precio,
        currency_id: "ARS"
      };
    });

    const preference = new Preference(client);
    const base = getBaseUrl(req);
    // Mercado Pago no acepta auto_return="approved" con localhost/http.
    // En local se omite: el pago se crea igual y volvés con "Volver al sitio" (retorno manual).
    // Solo se usa auto_return cuando la base es https pública (ej. ngrok).
    const isLocalBase = /^(http:\/\/(localhost|127\.0\.0\.1))/i.test(base);
    const preferenceBody = {
      items: mpItems,
      back_urls: {
        success: `${base}/success.html`,
        failure: `${base}/failure.html`,
        pending: `${base}/pending.html`
      },
      ...(isLocalBase ? {} : { auto_return: "approved" })
    };
    console.log(`[mp] creando preferencia base=${base} auto_return=${isLocalBase ? "off(local)" : "approved"}`);

    const result = await preference.create({
      body: preferenceBody
    });

    res.json({ init_point: result.init_point, preference_id: result.id });
  } catch (error) {
    const mpStatus = error?.status || error?.response?.status;
    const mpMessage = error?.message || "Error desconocido";
    let mpCause = "";
    try {
      const cause = error?.cause || error?.response?.data?.cause || error?.apiResponse;
      if (cause) mpCause = JSON.stringify(cause).slice(0, 1000);
    } catch { /* ignorar */ }
    const mpDetails = `${mpMessage} ${mpCause}`;
    console.error("Error creando preferencia:", mpDetails);

    // Token inválido o expirado: el caso más común después del "backend apagado"
    if (mpStatus === 401 || mpStatus === 403 || /unauthorized|forbidden|invalid.*token/i.test(mpDetails)) {
      return res.status(502).json({
        code: "MP_AUTH_ERROR",
        error: "Mercado Pago rechazó el Access Token. Revisá que esté bien pegado en server/.env, sin espacios."
      });
    }

    // back_urls / auto_return rechazados (típico si FRONTEND_URL es inválida)
    if (/auto_return|back_url/i.test(mpDetails)) {
      return res.status(502).json({
        code: "BACK_URL_ERROR",
        error: "Mercado Pago rechazó las URLs de retorno. Revisá FRONTEND_URL en server/.env (en local: http://localhost:3000; en producción: tu https pública)."
      });
    }

    res.status(500).json({ code: "MP_ERROR", error: "Error al crear la preferencia de pago" });
  }
});

// Caché corta para /estado-pago: el frontend consulta cada 4s y no tiene
// sentido pegar a Mercado Pago en cada poll. TTL 5s por preferencia.
const estadoCache = new Map();
const ESTADO_TTL_MS = 5000;

// GET /estado-pago?preference_id=XXX
// Consulta a Mercado Pago los pagos de una preferencia para que el frontend
// detecte solo el aprobado sin que el usuario copie IDs ni use "Volver al sitio".
// Funciona en localhost (no necesita auto_return ni https pública).
app.get("/estado-pago", async (req, res) => {
  try {
    const preferenceId = String(req.query.preference_id || "").trim();
    if (!preferenceId) {
      return res.status(400).json({ code: "MISSING_PREFERENCE", error: "Falta preference_id" });
    }
    if (preferenceId.startsWith("mock-") || MOCK_MODE || !isTokenConfigured()) {
      return res.json({ status: null, payment_id: null, preference_id: preferenceId, mock: true });
    }

    const cached = estadoCache.get(preferenceId);
    if (cached && (Date.now() - cached.at) < ESTADO_TTL_MS) {
      return res.json(cached.body);
    }

    const url = `https://api.mercadopago.com/merchant_orders/search?preference_id=${encodeURIComponent(preferenceId)}`;
    const r = await fetch(url, {
      headers: { Authorization: `Bearer ${MP_TOKEN}` }
    });
    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      console.error(`[estado-pago] MP respondió ${r.status}: ${txt.slice(0, 300)}`);
      return res.status(502).json({ code: "MP_STATUS_ERROR", error: "No se pudo consultar el estado del pago" });
    }
    const data = await r.json();
    const orders = Array.isArray(data.elements) ? data.elements : [];
    const payments = orders.flatMap(o => Array.isArray(o.payments) ? o.payments : []);
    const approved = payments.find(p => p.status === "approved");
    const first = approved || payments[0] || null;
    if (!first) {
      const empty = { status: null, payment_id: null, preference_id: preferenceId };
      estadoCache.set(preferenceId, { at: Date.now(), body: empty });
      return res.json(empty);
    }
    console.log(`[estado-pago] pref=${preferenceId} status=${first.status} payment=${first.id}`);
    const body = { status: first.status, payment_id: String(first.id), preference_id: preferenceId };
    // Cachea solo estados finales; mientras está pendiente sigue consultando a MP.
    if (first.status === "approved" || first.status === "rejected" || first.status === "cancelled") {
      estadoCache.set(preferenceId, { at: Date.now(), body });
    }
    return res.json(body);
  } catch (error) {
    console.error("Error consultando estado:", error?.message || error);
    return res.status(502).json({ code: "MP_STATUS_ERROR", error: "No se pudo consultar el estado del pago" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`   Catálogo:  http://localhost:${PORT}/index.html`);
  console.log(`   Checkout:  http://localhost:${PORT}/checkout.html`);
  console.log(`   Salud: http://localhost:${PORT}/health`);
  console.log(`   (Ya no necesitás Live Server: el backend sirve el frontend solo)`);
  if (MOCK_MODE) {
    console.log(`   ⚠️  MOCK_PAYMENTS=true: se devuelven links de prueba sin llamar a Mercado Pago.`);
  } else if (!isTokenConfigured()) {
    console.log(`   ⚠️  MP_ACCESS_TOKEN sin configurar: /crear-preferencia va a responder 503 MISSING_TOKEN hasta que lo pegues de Pruebas > Credenciales de prueba (APP_USR- de prueba).`);
  } else if (MP_ENV === "production") {
    console.log(`   MP token configurado: sí (modo PRODUCCIÓN, cobro REAL)`);
    console.log(`   El pago se abre en otra pestaña y el comprobante vuelve solo por /estado-pago.`);
  } else {
    console.log(`   MP token configurado: sí (modo PRUEBAS, sandbox sin plata real)`);
    console.log(`   Pagá con tu usuario comprador de prueba + tarjeta de prueba. Se abre en otra pestaña y volvemos solos.`);
  }
});
