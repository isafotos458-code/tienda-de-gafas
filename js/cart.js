// ============================================================
// CARRITO DE COMPRAS
// Se guarda en localStorage para que persista si recargás la página.
// ============================================================

const CART_KEY = "optica_cart";
const MAX_QTY = 99;

// Escapa texto para interpolar seguro en HTML (nombres, ids, rutas).
function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function isValidCartItem(it) {
  return it && typeof it.id === "string" && it.id.length > 0
    && typeof it.nombre === "string"
    && Number.isFinite(Number(it.precio)) && Number(it.precio) > 0
    && Number.isFinite(Number(it.cantidad)) && Number(it.cantidad) >= 1;
}

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidCartItem).map(it => ({
      id: String(it.id),
      nombre: String(it.nombre),
      precio: Number(it.precio),
      img: String(it.img || ""),
      cantidad: Math.min(MAX_QTY, Math.max(1, Math.floor(Number(it.cantidad))))
    }));
  } catch {
    // Carrito corrupto: se resetea en vez de romper toda la página
    try { localStorage.removeItem(CART_KEY); } catch { /* ignorar */ }
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    existing.cantidad = Math.min(MAX_QTY, existing.cantidad + 1);
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      precio: product.precio,
      img: product.img,
      cantidad: 1
    });
  }

  saveCart(cart);
  openCart();
  renderCart();
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function changeQuantity(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart(cart);
  renderCart();
}

function cartTotal() {
  return getCart().reduce((sum, item) => sum + item.precio * item.cantidad, 0);
}

function cartCount() {
  return getCart().reduce((sum, item) => sum + item.cantidad, 0);
}

function formatPrice(n) {
  return n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = cartCount();
}

function renderCart() {
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  if (!container) return;

  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `<p class="cart-empty">Todavía no agregaste productos.</p>`;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${escapeHtml(item.img)}" alt="${escapeHtml(item.nombre)}" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="cart-item-info">
          <p class="cart-item-name">${escapeHtml(item.nombre)}</p>
          <p class="cart-item-price">${formatPrice(item.precio)}</p>
          <div class="qty-controls">
            <button onclick="changeQuantity('${escapeHtml(item.id)}', -1)">−</button>
            <span>${item.cantidad}</span>
            <button onclick="changeQuantity('${escapeHtml(item.id)}', 1)">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeFromCart('${escapeHtml(item.id)}')" aria-label="Quitar">✕</button>
      </div>
    `).join("");
  }

  if (totalEl) totalEl.textContent = formatPrice(cartTotal());
}

function openCart() {
  document.getElementById("cart-drawer")?.classList.add("open");
  document.getElementById("cart-overlay")?.classList.add("open");
}

function closeCart() {
  document.getElementById("cart-drawer")?.classList.remove("open");
  document.getElementById("cart-overlay")?.classList.remove("open");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  renderCart();
});
