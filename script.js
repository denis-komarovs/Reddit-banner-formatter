// Get the HTML elements
const canvas = document.getElementById('banner');
const ctx = canvas.getContext('2d');
const upload = document.getElementById('upload');
const download = document.getElementById('download');

// Variables to handle image and interaction state
let img = new Image();
let dragging = false;
let offset = { x: 0, y: 0 };
let imgPos = { x: 0, y: 0 };
let imgScale = 1;

// Handle image upload
upload.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.src = reader.result;
    img.onload = () => {
      imgPos = { x: 0, y: 0 };
      imgScale = 1;
      draw();
    };
  };
  reader.readAsDataURL(file);
};

// Draw the image to the canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const w = img.width * imgScale;
  const h = img.height * imgScale;
  ctx.drawImage(img, imgPos.x, imgPos.y, w, h);
}

// Drag functionality
canvas.onmousedown = (e) => {
  dragging = true;
  offset.x = e.offsetX - imgPos.x;
  offset.y = e.offsetY - imgPos.y;
};

canvas.onmousemove = (e) => {
  if (!dragging) return;
  imgPos.x = e.offsetX - offset.x;
  imgPos.y = e.offsetY - offset.y;
  draw();
};

canvas.onmouseup = () => dragging = false;
canvas.onmouseleave = () => dragging = false;

// Zoom functionality
canvas.onwheel = (e) => {
  e.preventDefault();
  imgScale += e.deltaY * -0.001;
  imgScale = Math.max(0.1, imgScale);
  draw();
};

// Download logic (ensures < 500KB with compression)
download.onclick = () => {
  const downloadCanvas = document.createElement('canvas');
  downloadCanvas.width = 1920;
  downloadCanvas.height = 384;
  const downloadCtx = downloadCanvas.getContext('2d');

  const scaleFactor = 1920 / canvas.width;
  downloadCtx.drawImage(
    img,
    imgPos.x * scaleFactor,
    imgPos.y * scaleFactor,
    img.width * imgScale * scaleFactor,
    img.height * imgScale * scaleFactor
  );

  let quality = 0.9;
  let dataUrl = downloadCanvas.toDataURL('image/jpeg', quality);

  while (dataUrl.length > 512000 && quality > 0.1) {
    quality -= 0.05;
    dataUrl = downloadCanvas.toDataURL('image/jpeg', quality);
  }

  const link = document.createElement('a');
  link.download = 'reddit-banner.jpg';
  link.href = dataUrl;
  link.click();
};
