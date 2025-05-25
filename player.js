// Oyuncu (kanca) sınıfı
class Oyuncu {
  constructor() {
    // Oyuncunun boyut ve başlangıç konumu
    this.genislik = 70;
    this.yukseklik = 70;
    this.x = tuval.width / 2 - this.genislik / 2;
    this.y = tuval.height - this.yukseklik - 10;
    this.hiz = 4;
    // Kanca görseli
    this.resim = new Image();
    this.resim.src = 'assets/kanca.png';
  }

  // Oyuncuyu ekrana çizer
  ciz() {
    cizim.drawImage(this.resim, this.x, this.y, this.genislik, this.yukseklik);
  }

  // Oyuncunun hareketini günceller
  guncelle(tuslar) {
    if (tuslar['ArrowLeft'] && this.x > 0) this.x -= this.hiz;
    if (tuslar['ArrowRight'] && this.x + this.genislik < tuval.width) this.x += this.hiz;
    if (tuslar['ArrowUp'] && this.y > 0) this.y -= this.hiz;
    if (tuslar['ArrowDown'] && this.y + this.yukseklik < tuval.height) this.y += this.hiz;
  }
}
