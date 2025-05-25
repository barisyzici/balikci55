class TekneAdam {
  constructor() {
    this.width = 100;
    this.height = 100;
    this.x = 0;  // başlangıç solda
    this.y = canvas.height - this.height - 20; // dipte konumlandır
    this.speed = 3;
    this.image = new Image();
    this.image.src = 'assets/tekne_adam.png'; // Tekne+adam görseli
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update(keys) {
    // Sadece sağa ve sola hareket etsin
    if (keys['ArrowRight'] && this.x + this.width < canvas.width) this.x += this.speed;
    if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
  }

  isAtLeftEdge() {
    return this.x <= 5;  // Teknenin en soluna gelmiş mi kontrolü
  }
}

