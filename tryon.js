let videoStream = null;
let currentTryOnProduct = null;
let animationFrameId = null;
let glassesImg = null;
let glassesPos = { x: 0, y: 0, w: 200, h: 90 };
let isDragging = false;
let startX, startY;

async function openTryOnModal(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  currentTryOnProduct = product;
  const modal = document.getElementById("tryon-modal");
  document.getElementById("tryon-title").textContent = product.nombre;
  document.getElementById("tryon-product-price").textContent = `$${(product.precio || product.price).toLocaleString("es-AR")}`;
  document.getElementById("tryon-add-btn").onclick = () => {
    addToCart(product.id);
    closeTryOnModal();
  };

  modal.classList.add("open");
  
  const loadingEl = document.getElementById("tryon-loading");
  if (loadingEl) loadingEl.style.display = "none";

  glassesImg = new Image();
  glassesImg.crossOrigin = "anonymous";
  glassesImg.src = currentTryOnProduct.img;

  glassesImg.onload = () => {
    initCamera();
  };

  if (glassesImg.complete) {
    initCamera();
  }
}

async function initCamera() {
  const video = document.getElementById("tryon-video");
  const canvas = document.getElementById("tryon-canvas");
  const ctx = canvas.getContext("2d");

  try {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }

    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } }
    });
    video.srcObject = videoStream;
    await video.play();

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    glassesPos.w = canvas.width * 0.45;
    glassesPos.h = glassesPos.w * 0.45;
    glassesPos.x = (canvas.width - glassesPos.w) / 2;
    glassesPos.y = (canvas.height - glassesPos.h) / 2.5;

    setupTouchListeners(canvas);

    function renderLoop() {
      if (!videoStream || !document.getElementById("tryon-modal").classList.contains("open")) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (glassesImg) {
        ctx.save();
        ctx.globalCompositeOperation = 'multiply'; // Elimina el fondo blanco automáticamente
        ctx.drawImage(glassesImg, glassesPos.x, glassesPos.y, glassesPos.w, glassesPos.h);
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    }

    renderLoop();

  } catch (err) {
    const loadingEl = document.getElementById("tryon-loading");
    if (loadingEl) {
      loadingEl.style.display = "block";
      loadingEl.textContent = "No se pudo acceder a la cámara. Verificá los permisos.";
    }
  }
}

function setupTouchListeners(canvas) {
  const getPos = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDrag = (e) => {
    isDragging = true;
    const pos = getPos(e);
    startX = pos.x - glassesPos.x;
    startY = pos.y - glassesPos.y;
  };

  const moveDrag = (e) => {
    if (!isDragging) return;
    const pos = getPos(e);
    glassesPos.x = pos.x - startX;
    glassesPos.y = pos.y - startY;
  };

  const endDrag = () => { isDragging = false; };

  canvas.onmousedown = startDrag;
  canvas.onmousemove = moveDrag;
  canvas.onmouseup = endDrag;

  canvas.ontouchstart = startDrag;
  canvas.ontouchmove = moveDrag;
  canvas.ontouchend = endDrag;
}

function closeTryOnModal() {
  const modal = document.getElementById("tryon-modal");
  modal.classList.remove("open");

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
}