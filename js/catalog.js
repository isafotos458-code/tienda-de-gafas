// Memoria de Favoritos
let wishlist = JSON.parse(localStorage.getItem("optica_wishlist")) || [];

function renderCatalog(filteredProducts = null) {
  const catalogContainer = document.getElementById("catalog");
  if (!catalogContainer) return;

  const productsToRender = filteredProducts || PRODUCTS;
  catalogContainer.innerHTML = "";

  const categories = {};
  productsToRender.forEach(product => {
    if (!categories[product.categoria]) {
      categories[product.categoria] = [];
    }
    categories[product.categoria].push(product);
  });

  for (const categoryName in categories) {
    const categoryBlock = document.createElement("section");
    categoryBlock.className = "category-block";

    const title = document.createElement("h2");
    title.className = "category-title";
    title.textContent = categoryName;
    categoryBlock.appendChild(title);

    const grid = document.createElement("div");
    grid.className = "product-grid";

    categories[categoryName].forEach(product => {
      const isFav = wishlist.some(item => item.id === product.id);
      const isGlasses = product.categoria.includes("Recetados") || product.categoria.includes("Sol") || product.categoria.includes("Infantil");

      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <button class="wishlist-btn ${isFav ? 'active' : ''}" onclick="toggleWishlist('${product.id}')" aria-label="Agregar a favoritos">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="${isFav ? '#1C2B33' : 'none'}" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        <div class="product-photo">
          <img src="${product.img}" alt="${product.nombre}" onerror="this.src='https://via.placeholder.com/300x300?text=Sin+Imagen'">
        </div>
        ${isGlasses ? `<button class="tryon-btn" onclick="openTryOnModal('${product.id}')">¡QUIERO PROBARLOS!</button>` : ''}
        <h3>${product.nombre}</h3>
        <p class="product-desc">${product.descripcion}</p>
        <div class="product-footer">
          <span class="product-price">$${(product.precio || product.price).toLocaleString("es-AR")}</span>
          <button class="add-btn" onclick="addToCart('${product.id}')">Agregar</button>
        </div>
      `;
      grid.appendChild(card);
    });

    categoryBlock.appendChild(grid);
    catalogContainer.appendChild(categoryBlock);
  }
  updateWishlistBadge();
}

function filtrarCategoria(categoria) {
  if (categoria === 'Todos') {
    renderCatalog();
  } else {
    const filtrados = PRODUCTS.filter(p => p.categoria === categoria);
    renderCatalog(filtrados);
  }
}

function toggleWishlist(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const index = wishlist.findIndex(item => item.id === productId);
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(product);
  }

  localStorage.setItem("optica_wishlist", JSON.stringify(wishlist));
  updateWishlistBadge();
  renderCatalog();
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-badge");
  if (badge) {
    badge.textContent = wishlist.length;
    badge.style.display = wishlist.length > 0 ? "flex" : "none";
  }
}

function openWishlist() {
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-overlay");
  const container = document.getElementById("wishlist-items");
  if (!drawer || !overlay || !container) return;

  container.innerHTML = "";
  if (wishlist.length === 0) {
    container.innerHTML = `<p class="cart-empty">No tenés productos en favoritos.</p>`;
  } else {
    wishlist.forEach(item => {
      const itemEl = document.createElement("div");
      itemEl.className = "cart-item";
      itemEl.innerHTML = `
        <img src="${item.img}" alt="${item.nombre}">
        <div class="cart-item-info">
          <p class="cart-item-name">${item.nombre}</p>
          <p class="cart-item-price">$${(item.precio || item.price).toLocaleString("es-AR")}</p>
        </div>
        <button class="remove-btn" onclick="toggleWishlist('${item.id}'); openWishlist();">✕</button>
      `;
      container.appendChild(itemEl);
    });
  }

  drawer.classList.add("open");
  overlay.classList.add("open");
}

function closeWishlist() {
  const drawer = document.getElementById("wishlist-drawer");
  const overlay = document.getElementById("wishlist-overlay");
  if (drawer && overlay) {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderCatalog();
});