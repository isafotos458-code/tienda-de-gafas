# Óptica Visión — Proyecto escolar

Página web de catálogo con carrito de compras y pago mediante Mercado Pago
(Checkout Pro). No necesitás VS Code ni Live Server: el backend sirve el
frontend solo.

## Estructura del proyecto

```
optica-web/
├── index.html          → Catálogo de productos + carrito lateral
├── checkout.html        → Resumen del pedido + botón de pago
├── success.html         → Pantalla de "pago aprobado"
├── failure.html         → Pantalla de "pago rechazado"
├── pending.html         → Pantalla de "pago pendiente"
├── css/
│   ├── style.css
│   ├── checkout.css
│   └── result.css
├── js/
│   ├── products.js       → Acá van TUS productos reales (nombre, precio, foto)
│   ├── cart.js            → Lógica del carrito (localStorage)
│   ├── catalog.js         → Render del catálogo en index.html
│   └── checkout.js        → Conecta el frontend con el backend
└── server/                → Backend en Node.js, solo para hablar con Mercado Pago
    ├── server.js
    ├── package.json
    ├── .env.example
    └── .env               → Tu configuración (NO subir a GitHub)
```

## ¿Por qué hay un "server" si el resto es HTML/CSS/JS puro?

Porque Mercado Pago necesita una credencial secreta (Access Token) para generar
el link de pago, y esa credencial **nunca puede estar en el código que corre en
el navegador** (cualquiera podría verla con F12 y usarla). El `server/` recibe
el carrito (solo `id` + `cantidad`; los precios los pone el servidor desde su
catálogo), le pide a Mercado Pago el link de pago, y se lo devuelve a la página.
El resto de la web (catálogo, carrito, diseño) es HTML/CSS/JS común y corriente.

## Paso a paso (sin VS Code)

### 1. Cargar tus productos reales
Abrí `js/products.js` y reemplazá los productos de ejemplo por los de la
óptica real: `id` único, nombre, categoría, descripción, precio y la URL de la
foto (podés subir las fotos a una carpeta `img/` del proyecto y poner la ruta,
por ejemplo `"img/anteojo1.jpg"`).
El backend lee este mismo archivo para validar los precios, así que no hay que
duplicar nada.

### 2. Probar el catálogo y el carrito (sin backend todavía)
Abrí `index.html` con doble-click en el Explorador: el catálogo y el carrito
funcionan igual (viven en el navegador, en `localStorage`).
Para pagar sí necesitás el backend (paso 4).

### 3. Crear tu cuenta de Mercado Pago Developers
1. Entrá a https://www.mercadopago.com.ar/developers/panel
2. Creá una aplicación (elegí "Pagos online" / Checkout Pro).
3. Copiá tus credenciales de **PRUEBA**
   (Tus integraciones > tu app > Pruebas > Credenciales de prueba).
   OJO: desde fines de 2025 también empiezan con `APP_USR-`, igual que
   producción — lo que distingue es la sección, no el prefijo.
   Para el proyecto escolar usá siempre las credenciales de prueba, no las de
   producción — así simulás compras sin usar plata real, con los "usuarios de
   prueba" (comprador/vendedor) y las tarjetas de prueba
   (ej. Visa `5031 7557 3453 0604`) que da la plataforma.
4. Creá un usuario de prueba **comprador** (distinto al vendedor) para pagar.

### 4. Configurar y levantar el backend
En una terminal, en la carpeta del proyecto:
```bash
cd server
npm install
npm start
```
La primera vez, copiá `.env.example` a `.env` (en Windows: copiar y pegar el
archivo en el Explorador y renombrarlo a `.env`), y completá:
```ini
MP_ACCESS_TOKEN=APP_USR-... (el de Pruebas > Credenciales de prueba)
MP_ENV=test
FRONTEND_URL=http://localhost:3000
PORT=3000
MOCK_PAYMENTS=false
```
Con `MOCK_PAYMENTS=true` podés probar el botón sin credencial (redirige a
`success.html?mock=1`). Deberías ver:
`✅ Servidor corriendo en http://localhost:3000`

### 5. Probar la compra completa
1. Con el backend corriendo, abrí `http://localhost:3000/index.html`
   (el backend sirve el frontend; no uses doble-click para pagar).
2. Agregá productos, **"Ir a pagar"** y **"Pagar con Mercado Pago"**.
3. Se abre Mercado Pago en **otra pestaña**: logueate con tu **comprador de
   prueba** y pagá con tarjeta de prueba. La pestaña original detecta sola el
   aprobado y te lleva a `success.html` con el comprobante (sin copiar nada).
4. Si el navegador bloquea la pestaña nueva, se usa la misma pestaña como
   alternativa.

### 6. Si algo no conecta
- Revisá que el backend esté corriendo (`npm start` en `/server`) y abrí
  `http://localhost:3000/health` (tiene que dar `ok:true`).
- Abrí siempre por `http://localhost:3000/...`, no con doble-click (`file://`
  bloquea el pago).
- Si cambiaste código, recargá con `Ctrl+Shift+R`.
- Verificá sintaxis con `npm run check` en `/server`.

## Para la entrega del colegio
Se recomienda documentar en el informe: capturas del catálogo, del carrito,
del checkout, y del pago aprobado en el ambiente de prueba de Mercado Pago
(sin mostrar tu Access Token en ninguna captura ni subir el `.env` a GitHub).
