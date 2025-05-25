// tekneAdam karakteri sınıfı
class TekneAdam {
  constructor() {
    // Teknenin boyutu ve başlangıç konumu
    this.genislik = 100;
    this.yukseklik = 100;
    this.x = 0; 
    this.y = tuval.height - this.yukseklik - 20; 
    this.hiz = 3;
    // tekneAdam görseli
    this.resim = new Image();
    this.resim.src = 'assets/tekne_adam.png';
  }

  // Tekneyi ekrana çizer
  ciz() {
    cizim.drawImage(this.resim, this.x, this.y, this.genislik, this.yukseklik);
  }

  // Teknenin sağa ve sola hareketini günceller
  guncelle(tuslar) {
    if (tuslar['ArrowRight'] && this.x + this.genislik < tuval.width) this.x += this.hiz;
    if (tuslar['ArrowLeft'] && this.x > 0) this.x -= this.hiz;
  }

  // Tekne en solda mı kontrolü
  soldaMi() {
    return this.x <= 5;
  }

  // Tekne en sağda mı kontrolü
  sagdaMi() {
    return this.x + this.genislik >= tuval.width - 5;
  }

  // Tekne ortada mı kontrolü
  ortadaMi() {
    const merkezX = tuval.width / 2;
    return Math.abs(this.x + this.genislik / 2 - merkezX) < 50;
  }
}
