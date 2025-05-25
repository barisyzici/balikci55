// Oyun için balık türleri dizisi
const balikTurleri = [
  {
    ad: 'Küçük Balık',
    resimYolu: 'assets/fish_small.png',
    genislik: 40,
    yukseklik: 40,
    hiz: 2,
    deger: 5
  },
  {
    ad: 'Orta Balık',
    resimYolu: 'assets/fish_medium.png',
    genislik: 60,
    yukseklik: 60,
    hiz: 1.5,
    deger: 10
  },
  {
    ad: 'Büyük Balık',
    resimYolu: 'assets/fish_big.png',
    genislik: 80,
    yukseklik: 80,
    hiz: 1,
    deger: 20
  }
];

// Engel (balık) sınıfı
class Engel {
  constructor(x) {
    // Rastgele bir balık türü seç
    const rastgeleTur = balikTurleri[Math.floor(Math.random() * balikTurleri.length)];
    this.balikTuru = rastgeleTur; // Ekle!
    this.ad = rastgeleTur.ad;
    this.genislik = rastgeleTur.genislik;
    this.yukseklik = rastgeleTur.yukseklik;
    this.x = x;
    this.y = 0;
    this.hiz = rastgeleTur.hiz;
    this.resim = new Image();
    this.resim.src = rastgeleTur.resimYolu;
    this.deger = rastgeleTur.deger;
  }

  // Balığı ekrana çizer
  ciz() {
    cizim.drawImage(this.resim, this.x, this.y, this.genislik, this.yukseklik);
  }

  // Balığın konumunu günceller (aşağıya hareket)
  guncelle() {
    this.y += this.hiz;
  }
}
