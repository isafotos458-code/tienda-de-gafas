let videoStream = null;
let currentTryOnProduct = null;
let animationFrameId = null;
let faceDetector = null;
let lastValidPose = null;
let glassesImg = null;
let isProcessing = false;

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
  document.getElementById("tryon-loading").style.display = "block";
  lastValidPose = null;

  // Precargamos la imagen de los lentes de antemano para que no parpadee
  glassesImg = new Image();
  glassesImg.crossOrigin = "anonymous";
  glassesImg.src = currentTryOnProduct.img;

  glassesImg.onload = () => {
    document.getElementById("tryon-loading").style.display = "none";
    initCamera();
  };

  // Por si la imagen ya está en caché del navegador
  if (glassesImg.complete) {
    document.getElementById("tryon-loading").style.display = "none";
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

    if (!faceDetector && window.faceLandmarksDetection) {
      const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: false
      };
      faceDetector = await window.faceLandmarksDetection.createDetector(model, detectorConfig);
    }

    function processFrame() {
      if (!videoStream || !document.getElementById("tryon-modal").classList.contains("open")) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dibujamos el video en modo espejo
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Ejecutamos la detección facial de forma controlada (evita que el celu colapse)
      if (faceDetector && !isProcessing) {
        isProcessing = true;
        faceDetector.estimateFaces(video, { flipHorizontal: false }).then(faces => {
          if (faces && faces.length > 0) {
            const keypoints = faces[0].keypoints;
            const leftEye = keypoints.find(k => k.name === 'leftEye') || keypoints[33] || keypoints[133];
            const rightEye = keypoints.find(k => k.name === 'rightEye') || keypoints[263] || keypoints[362];

            if (leftEye && rightEye) {
              const mirroredLeftX = canvas.width - leftEye.x;
              const mirroredRightX = canvas.width - rightEye.x;

              const eyeDistance = Math.hypot(mirroredRightX - mirroredLeftX, rightEye.y - leftEye.y);
              const glassesWidth = eyeDistance * 2.5;
              const glassesHeight = glassesWidth * 0.45;
              const centerX = (mirroredLeftX + mirroredRightX) / 2;
              const centerY = ((leftEye.y + rightEye.y) / 2) - (glassesHeight * 0.2);
              const angle = Math.atan2(rightEye.y - leftEye.y, mirroredRightX - mirroredLeftX);

              // Actualizamos la pose fluida para que siga al usuario al moverse
              lastValidPose = { centerX, centerY, glassesWidth, glassesHeight, angle };
            }
          }
          isProcessing = false;
        }).catch(() => {
          isProcessing = false;
        });
      }

      // Dibujamos los lentes de forma continua (usando la última posición válida si se mueve)
      if (lastValidPose && glassesImg) {
        drawTransparentGlasses(ctx, glassesImg, lastValidPose);
      } else if (glassesImg) {
        drawFallbackGlasses(ctx, canvas, glassesImg);
      }

      animationFrameId = requestAnimationFrame(processFrame);
    }

    processFrame();

  } catch (err) {
    document.getElementById("tryon-loading").textContent = "No se pudo acceder a la cámara. Verificá los permisos.";
  }
}

function drawTransparentGlasses(ctx, img, pose) {
  ctx.save();
  ctx.translate(pose.centerX, pose.centerY);
  ctx.rotate(pose.angle);
  
  // 'multiply' fusiona el blanco de la imagen con el video eliminando el fondo cuadrado
  ctx.globalCompositeOperation = 'multiply';
  
  ctx.drawImage(img, -pose.glassesWidth / 2, -pose.glassesHeight / 2, pose.glassesWidth, pose.glassesHeight);
  ctx.restore();
}

function drawFallbackGlasses(ctx, canvas, glassesImg) {
  const w = canvas.width * 0.45;
  const h = w * 0.45;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2.3;
  
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.drawImage(glassesImg, x, y, w, h);
  ctx.restore();
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
  isProcessing = false;
  lastValidPose = null;
}