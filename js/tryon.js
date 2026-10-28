let videoStream = null;
let currentTryOnProduct = null;
let animationFrameId = null;
let faceDetector = null;

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

  initCamera();
}

async function initCamera() {
  const video = document.getElementById("tryon-video");
  const canvas = document.getElementById("tryon-canvas");
  const ctx = canvas.getContext("2d");

  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 }
    });
    video.srcObject = videoStream;
    await video.play();

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const glassesImg = new Image();
    glassesImg.src = currentTryOnProduct.img;

    // Intentamos cargar el detector de rostros
    if (!faceDetector && window.faceLandmarksDetection) {
      const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      const detectorConfig = {
        runtime: 'tfjs',
        refineLandmarks: false
      };
      faceDetector = await window.faceLandmarksDetection.createDetector(model, detectorConfig);
    }

    document.getElementById("tryon-loading").style.display = "none";

    function processFrame() {
      if (!videoStream) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (faceDetector) {
        faceDetector.estimateFaces(video).then(faces => {
          if (faces && faces.length > 0) {
            const keypoints = faces[0].keypoints;
            // Puntos clave de los ojos
            const leftEye = keypoints.find(k => k.name === 'leftEye' || k.name === 'leftEyeBoundary') || keypoints[33];
            const rightEye = keypoints.find(k => k.name === 'rightEye' || k.name === 'rightEyeBoundary') || keypoints[263];

            if (leftEye && rightEye) {
              const eyeDistance = Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y);
              const glassesWidth = eyeDistance * 2.4;
              const glassesHeight = glassesWidth * 0.45;
              const centerX = (leftEye.x + rightEye.x) / 2;
              const centerY = (leftEye.y + rightEye.y) / 2;
              const angle = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

              ctx.save();
              ctx.translate(centerX, centerY);
              ctx.rotate(angle);
              ctx.drawImage(glassesImg, -glassesWidth / 2, -glassesHeight / 2, glassesWidth, glassesHeight);
              ctx.restore();
            }
          } else {
            drawFallbackGlasses(ctx, canvas, glassesImg);
          }
        }).catch(() => {
          drawFallbackGlasses(ctx, canvas, glassesImg);
        });
      } else {
        drawFallbackGlasses(ctx, canvas, glassesImg);
      }

      animationFrameId = requestAnimationFrame(processFrame);
    }

    processFrame();

  } catch (err) {
    document.getElementById("tryon-loading").textContent = "No se pudo acceder a la cámara. Verificá los permisos del navegador.";
  }
}

// Superposición estática central en caso de que falle la detección facial
function drawFallbackGlasses(ctx, canvas, glassesImg) {
  const w = canvas.width * 0.45;
  const h = w * 0.45;
  const x = (canvas.width - w) / 2;
  const y = (canvas.height - h) / 2.2;
  ctx.drawImage(glassesImg, x, y, w, h);
}

function closeTryOnModal() {
  const modal = document.getElementById("tryon-modal");
  modal.classList.remove("open");

  if (animationFrameId) cancelAnimationFrame(animationFrameId);

  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    videoStream = null;
  }
}