const desktop = document.getElementById('desktop');
const selectionBox = document.getElementById('selectionBox');

let startX = 0;
let startY = 0;
let selecting = false;

desktop.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;

  selecting = true;

  selectionBox.style.display = 'block';
  selectionBox.style.opacity = '1';

  startX = e.clientX;
  startY = e.clientY;

  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
});

window.addEventListener('mousemove', (e) => {
  if (!selecting) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const x = Math.min(currentX, startX);
  const y = Math.min(currentY, startY);

  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  selectionBox.style.left = x + 'px';
  selectionBox.style.top = y + 'px';
  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';

  const selectionRect = {
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
  };
});

window.addEventListener('mouseup', () => {
  selecting = false;
  selectionBox.style.opacity = '0';
  setTimeout(() => {
    selectionBox.style.display = 'none';
  }, 180);
});
