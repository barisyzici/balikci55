// Oyun başlatma ve "Nasıl Oynanır" kutusu kontrolü
const baslatButonu = document.getElementById('baslatButonu');
const baslatKatmani = document.getElementById('baslatKatmani');
const nasilOynanirKutusu = document.getElementById('nasilOynanirKutusu');
const nasilKapatButonu = document.getElementById('nasilKapatButonu');

if (baslatButonu) {
  baslatButonu.onclick = function () {
    oyunBasladi = true;
    baslatKatmani.style.display = 'none';
    if (nasilOynanirKutusu) nasilOynanirKutusu.style.display = 'block';
    arkaPlanMuzik.play();
  };
}

if (nasilKapatButonu) {
  nasilKapatButonu.onclick = function () {
    if (nasilOynanirKutusu) nasilOynanirKutusu.style.display = 'none';
  };
}

// Tuval ve çizim bağlamı
const tuval = document.getElementById('oyunTuvali');
const cizim = tuval.getContext('2d');

// Oyun için gerekli görseller ve sesler
const satisArkaPlanResmi = new Image();
satisArkaPlanResmi.src = 'assets/satis_arkaplan.png';
const dalgaSprite = new Image();
dalgaSprite.src = 'assets/wave_sprite.png';
const balikTutmaSesi = new Audio('assets/balik_tutma_ses.mp3');
const uyariSesi = new Audio('assets/depo_dolu.mp3');
const yakalamaSesi = new Audio('assets/balik_yakalama_ses.mp3');
const dukkanArkaPlanResmi = new Image();
dukkanArkaPlanResmi.src = 'assets/shop_arkaplan.png';

const arkaPlanMuzik = new Audio('assets/arkaplan_muzik.mp3');
arkaPlanMuzik.loop = true;
arkaPlanMuzik.volume = 0.5;

// Dalga animasyonu için değişkenler
const dalgaKareGenislik = 1194;
const dalgaKareYukseklik = 216;
const dalgaKareSayisi = 1;
let mevcutDalgaKare = 0;
let dalgaKareGecikme = 0;
const dalgaKareGecikmeMaks = 20;

// Oyun durumu değişkenleri
let oyunBitti = false;
let oyunBasladi = false;
let dalgaOfsetX = 0;
let dalgaYon = 1;
const dalgaMaksOfset = 30;
const dalgaHiz = 0.4;

let dukkanModu = false;
let balikTutmaModu = false;
let satisModu = false;
let kareSayaci = 0;
let tuslar = {};
let balikKapasitesi = 9;

let toplananBaliklar = [];
let toplamSatilanBalik = 0;
let toplamKazanilanPara = 0;
let sonSatilanBaliklar = [];
let satisAnimasyonIlerleme = 0;
let satisAnimasyonMaks = 100;
let animasyonPara = 0;

let normalArkaPlanOfsetX = 0;
const normalKaydirmaHizi = 0.3;

// Arka plan ve dekor görselleri
const solResim = new Image();
solResim.src = 'assets/sol_foto.png';

const sagResim = new Image();
sagResim.src = 'assets/sag_foto.png';

const normalArkaPlan = new Image();
normalArkaPlan.src = 'assets/arkaplan.png';

const ortaResim = new Image();
ortaResim.src = 'assets/orta_foto.png';

const balikTutmaArkaPlan = new Image();
balikTutmaArkaPlan.src = 'assets/fishing_background.png';
let balikTutmaArkaPlanOfsetY = 0;

const satisSesi = new Audio('assets/satis_ses.mp3');

// Oyun karakterleri ve engeller
let oyuncu = new Oyuncu();
let engeller = [];
let engelAraligi = 90;

// TekneAdam sınıfı: Tekne karakterinin hareket ve çizim işlemleri
class TekneAdam {
  constructor() {
    this.genislik = 250;
    this.yukseklik = 250;
    this.x = tuval.width / 2;
    this.y = tuval.height - this.yukseklik - 125;
    this.hiz = 3;
    this.resim = new Image();
    this.resim.src = 'assets/tekne_adam.png';
  }

  ciz() {
    if (this.resim.complete) {
      cizim.drawImage(this.resim, this.x, this.y, this.genislik, this.yukseklik);
    } else {
      cizim.fillStyle = 'brown';
      cizim.fillRect(this.x, this.y, this.genislik, this.yukseklik);
      cizim.fillStyle = 'blue';
      cizim.fillRect(this.x + 10, this.y + 10, this.genislik - 20, this.yukseklik - 20);
    }
  }

  guncelle(tuslar) {
    if (tuslar['ArrowRight'] && this.x + this.genislik < tuval.width) this.x += this.hiz;
    if (tuslar['ArrowLeft'] && this.x > 0) this.x -= this.hiz;
  }

  soldaMi() {
    return this.x <= 5;
  }

  sagdaMi() {
    return this.x + this.genislik >= tuval.width - 5;
  }
  ortadaMi() {
    const merkezX = tuval.width / 2;
    return Math.abs(this.x + this.genislik / 2 - merkezX) < 50;
  }
}

let tekneAdam = new TekneAdam();

// Klavye olayları ile tuş kontrolü
document.addEventListener('keydown', (e) => {
  tuslar[e.key] = true;
});

document.addEventListener('keyup', (e) => {
  tuslar[e.key] = false;
});

// Yeni engel (balık) üretir
function engelUret() {
  const genislik = 48;
  const x = Math.random() * (tuval.width - genislik);
  engeller.push(new Engel(x));
}

// Çarpışma kontrolü
function carpistiMi(a, b) {
  return (
    a.x < b.x + b.genislik &&
    a.x + a.genislik > b.x &&
    a.y < b.y + b.yukseklik &&
    a.y + a.yukseklik > b.y
  );
}

// Sayaç görselleri
const balikResmi = new Image();
balikResmi.src = 'assets/balik.png';

const paraResmi = new Image();
paraResmi.src = 'assets/para.png';

const toplamSatilanBalikResmi = new Image();
toplamSatilanBalikResmi.src = 'assets/toplam_satilan_balik.png';

// Ekranın üst kısmındaki balık, para ve toplam satılan balık sayaçlarını çizer
function balikParaSayacCiz(cizim) {
  const balikX = 50;
  const balikY = 10;
  const balikGenislik = 100;
  const balikYukseklik = 100;

  if (balikResmi.complete) {
    cizim.drawImage(balikResmi, balikX, balikY, balikGenislik, balikYukseklik);
  }

  cizim.font = 'bold 24px Arial';
  cizim.fillStyle = '#fffbea';
  cizim.textAlign = 'center';
  cizim.textBaseline = 'middle';
  cizim.fillText(
    `${toplananBaliklar.length}`,
    balikX + balikGenislik / 2,
    balikY + balikYukseklik / 2
  );

  const paraX = balikX + balikGenislik + 0;
  const paraY = balikY - 5;
  const paraGenislik = 100;
  const paraYukseklik = 100;

  if (paraResmi.complete) {
    cizim.drawImage(paraResmi, paraX, paraY + 6, paraGenislik, paraYukseklik);
  }

  cizim.font = 'bold 24px Arial';
  cizim.fillStyle = '#fffbea';
  cizim.textAlign = 'left';
  cizim.textBaseline = 'middle';
  cizim.fillText(
    `${toplamKazanilanPara}`,
    paraX + paraGenislik / 2,
    paraY + 6 + paraYukseklik / 2
  );

  const satilanBalikX = paraX + paraGenislik + 40;
  const satilanBalikY = paraY;
  const satilanBalikGenislik = 100;
  const satilanBalikYukseklik = 100;

  if (toplamSatilanBalikResmi.complete) {
    cizim.drawImage(toplamSatilanBalikResmi, satilanBalikX, satilanBalikY + 6, satilanBalikGenislik, satilanBalikYukseklik);
  }

  cizim.font = 'bold 24px Arial';
  cizim.fillStyle = '#fffbea';
  cizim.textAlign = 'left';
  cizim.textBaseline = 'middle';
  cizim.fillText(
    `${toplamSatilanBalik}`,
    satilanBalikX + satilanBalikGenislik / 2,
    satilanBalikY + 6 + satilanBalikYukseklik / 2
  );
}

// Oyun durumunu günceller
function guncelle() {
  // Mağaza modu
  if (dukkanModu) {
    if (tuslar['q'] || tuslar['Q']) {
      dukkanModu = false;
      tuslar['q'] = false;
      tuslar['Q'] = false;
    }

    if (tuslar['1'] && toplamKazanilanPara >= 100) {
      tekneAdam.hiz += 1;
      toplamKazanilanPara -= 100;
      tuslar['1'] = false;
    }

    if (tuslar['2'] && toplamKazanilanPara >= 150 && balikKapasitesi < 15) {
      balikKapasitesi += 1;
      toplamKazanilanPara -= 150;
      tuslar['2'] = false;
    }

    return;
  }

  // Satış modu
  if (satisModu) {
    if (satisAnimasyonIlerleme < satisAnimasyonMaks) {
      satisAnimasyonIlerleme++;
    }

    if (tuslar['q'] || tuslar['Q']) {
      satisModu = false;
      tuslar['q'] = false;
      tuslar['Q'] = false;
    }

    return;
  }

  // Balık tutma modu
  if (balikTutmaModu) {
    oyuncu.guncelle(tuslar);

    for (let i = engeller.length - 1; i >= 0; i--) {
      engeller[i].guncelle();

      if (carpistiMi(oyuncu, engeller[i])) {
        if (toplananBaliklar.length < balikKapasitesi) {
          toplananBaliklar.push(engeller[i].balikTuru);
          yakalamaSesi.play();
          engeller.splice(i, 1);

          if (toplananBaliklar.length >= balikKapasitesi) {
            balikTutmaModu = false;
            engeller = [];
            oyuncu = new Oyuncu();
            kareSayaci = 0;
            return;
          }
        } else {
          engeller.splice(i, 1);
        }
      } else if (engeller[i].y > tuval.height) {
        engeller.splice(i, 1);
      }
    }

    if (kareSayaci % engelAraligi === 0) {
      engelUret();
    }

    kareSayaci++;
    balikTutmaArkaPlanOfsetY += 0.5;
    if (balikTutmaArkaPlanOfsetY > balikTutmaArkaPlan.height) {
      balikTutmaArkaPlanOfsetY = 0;
    }

    if (tuslar['q'] || tuslar['Q']) {
      balikTutmaModu = false;
      tuslar['q'] = false;
      tuslar['Q'] = false;
      engeller = [];
    }

    return;
  }

  // Normal tekne modu
  tekneAdam.guncelle(tuslar);

  dalgaOfsetX -= dalgaHiz;
  normalArkaPlanOfsetX += normalKaydirmaHizi;
  if (normalArkaPlanOfsetX > tuval.width) {
    normalArkaPlanOfsetX = 0;
  }

  // Balık tutma başlatma
  if ((tuslar['e'] || tuslar['E']) && tekneAdam.soldaMi()) {
    if (toplananBaliklar.length < balikKapasitesi) {
      balikTutmaModu = true;
      balikTutmaSesi.play();
    } else {
      uyariSesi.play();
    }
    tuslar['e'] = false;
    tuslar['E'] = false;
  }

  // Balık satma başlatma
  if ((tuslar['e'] || tuslar['E']) && tekneAdam.sagdaMi()) {
    satisModu = true;
    satisSesi.play();

    satisAnimasyonIlerleme = 0;
    animasyonPara = 0;
    sonSatilanBaliklar = [...toplananBaliklar];
    toplamSatilanBalik += toplananBaliklar.length;

    if (toplamSatilanBalik >= 100) {
      oyunBitti = true;
    }

    for (const balik of toplananBaliklar) {
      toplamKazanilanPara += balik.deger;
    }
    toplananBaliklar = [];

    tuslar['e'] = false;
    tuslar['E'] = false;
  }

  // Dükkan aç/kapat
  if ((tuslar['e'] || tuslar['E']) && tekneAdam.ortadaMi()) {
    dukkanModu = !dukkanModu;
    tuslar['e'] = false;
    tuslar['E'] = false;
  }
}

// Oyun ekranını çizer
function ciz() {
  cizim.clearRect(0, 0, tuval.width, tuval.height);

  // Başlangıç ekranı
  if (!oyunBasladi) {
    cizim.fillStyle = 'rgba(30,60,100,0.85)';
    cizim.fillRect(0, 0, tuval.width, tuval.height);

    cizim.fillStyle = '#fff';
    cizim.font = 'bold 48px Arial';
    cizim.textAlign = 'center';
    cizim.fillText('Balıkçı Oyunu', tuval.width / 2, tuval.height / 2 - 120);

    cizim.font = '28px Arial';
    cizim.textAlign = 'left';
    const nasil = [
      "Nasıl Oynanır?",
      "- Sağ/Sol ok tuşları ile tekneyi hareket ettir.",
      "- E tuşu ile balık tut veya sat.",
      "- Q tuşu ile balık tutmayı bırak veya satıştan çık.",
      "- Balık kapasiten dolunca tekneye dönüp balıkları sat.",
      "- 100 balık sattığında oyun biter."
    ];
    let y = tuval.height / 2 - 60;
    for (const satir of nasil) {
      cizim.fillText(satir, tuval.width / 2 - 260, y);
      y += 40;
    }

    cizim.textAlign = 'center';
    cizim.font = '32px Arial';
    cizim.fillText('Başlamak için "Oyuna Başla" butonuna tıkla', tuval.width / 2, tuval.height / 2 + 140);

    return;
  }

  // Oyun bitti ekranı
  if (oyunBitti) {
    cizim.fillStyle = 'rgba(0,0,0,0.85)';
    cizim.fillRect(0, 0, tuval.width, tuval.height);

    cizim.fillStyle = '#fff';
    cizim.font = 'bold 64px Arial';
    cizim.textAlign = 'center';
    cizim.fillText('Oyun Bitti!', tuval.width / 2, tuval.height / 2 - 40);

    cizim.font = '32px Arial';
    cizim.fillText(`Toplam Kazanç: ₺${toplamKazanilanPara}`, tuval.width / 2, tuval.height / 2 + 30);
    cizim.fillText('Yeniden başlatmak için sayfayı yenileyin.', tuval.width / 2, tuval.height / 2 + 90);
    return;
  }

  // Dükkan ekranı
  if (dukkanModu) {
    if (dukkanArkaPlanResmi.complete) {
      cizim.drawImage(dukkanArkaPlanResmi, 0, 0, tuval.width, tuval.height);
    } else {
      cizim.fillStyle = "#232526";
      cizim.fillRect(0, 0, tuval.width, tuval.height);
    }

    cizim.fillStyle = 'white';
    cizim.font = '36px Arial';
    cizim.fillText('Tersane', tuval.width / 2 - 80, 60);

    cizim.font = '24px Arial';
    cizim.fillText(`1.  Tekne Hızını Artır - 100₺ (1 tuşu)  ➤ Şu an: ${tekneAdam.hiz}`, 100, 150);
    cizim.fillText(`2. Balık Kapasitesini Artır (max 15) - 150₺ (2 tuşu)  ➤ Şu an: ${balikKapasitesi}`, 100, 200);

    cizim.fillStyle = '#ffff66';
    cizim.fillText(`Paran: ${toplamKazanilanPara}₺`, 100, 270);

    cizim.fillStyle = 'white';
    cizim.fillText('Q tuşuna basarak çık', 100, 350);

    return;
  }

  // Oyun oynanışı ekranı
  if (!balikTutmaModu && !satisModu) {
    if (normalArkaPlan.complete) {
      const x = -normalArkaPlanOfsetX;
      cizim.drawImage(normalArkaPlan, x, 0, tuval.width, tuval.height);
      cizim.drawImage(normalArkaPlan, x + tuval.width, 0, tuval.width, tuval.height);
    } else {
      cizim.fillStyle = '#569cdd';
      cizim.fillRect(0, 0, tuval.width, tuval.height);
    }

    if (solResim.complete) {
      const resimGenislik = 400;
      const resimYukseklik = 400;
      const resimX = 0;
      const resimY = tuval.height - dalgaKareYukseklik - resimYukseklik + 180;
      cizim.drawImage(solResim, resimX, resimY, resimGenislik, resimYukseklik);
    }

    if (sagResim.complete) {
      const resimGenislik = 400;
      const resimYukseklik = 400;
      const resimX = tuval.width - resimGenislik;
      const resimY = tuval.height - dalgaKareYukseklik - resimYukseklik + 140;
      cizim.drawImage(sagResim, resimX, resimY, resimGenislik, resimYukseklik);
    }

    if (dalgaSprite.complete) {
      const dalgaY = tuval.height - dalgaKareYukseklik;
      for (let x = dalgaOfsetX % dalgaSprite.width - dalgaSprite.width; x < tuval.width; x += dalgaSprite.width) {
        cizim.drawImage(dalgaSprite, x, dalgaY, dalgaSprite.width, dalgaKareYukseklik);
      }
    }

    if (ortaResim.complete) {
      const resimGenislik = 400;
      const resimYukseklik = 400;
      const resimX = (tuval.width - resimGenislik) / 2;
      const resimY = (tuval.height - resimYukseklik) / 2 + 50;
      cizim.drawImage(ortaResim, resimX, resimY, resimGenislik, resimYukseklik);
    }

    tekneAdam.ciz();
    balikParaSayacCiz(cizim);

  } else if (balikTutmaModu) {
    // Balık tutma ekranı
    if (balikTutmaArkaPlan.complete) {
      const y = -balikTutmaArkaPlanOfsetY;
      cizim.drawImage(balikTutmaArkaPlan, 0, y, tuval.width, balikTutmaArkaPlan.height);
      cizim.drawImage(balikTutmaArkaPlan, 0, y + balikTutmaArkaPlan.height, tuval.width, balikTutmaArkaPlan.height);
    } else {
      cizim.fillStyle = '#2b6ca3';
      cizim.fillRect(0, 0, tuval.width, tuval.height);
    }

    oyuncu.ciz();
    engeller.forEach(o => o.ciz(cizim));

    cizim.fillStyle = 'white';
    cizim.font = '20px Arial';
    cizim.fillText('Q tuşuna basarak tekneye dön', 10, 100);
    balikParaSayacCiz(cizim);

  } else if (satisModu) {
    // Satış ekranı
    if (satisArkaPlanResmi.complete) {
      cizim.drawImage(satisArkaPlanResmi, 0, 0, tuval.width, tuval.height);
    } else {
      cizim.fillStyle = "#e0ecff";
      cizim.fillRect(0, 0, tuval.width, tuval.height);
    }

    cizim.fillStyle = '#fff';
    cizim.font = '32px Arial';
    cizim.fillText('Balıklar satıldı!', 50, 50);

    cizim.font = '20px Arial';
    const satirYukseklik = 30;
    let baslangicY = 90;
    let index = 1;
    let toplam = 0;

    if (sonSatilanBaliklar && sonSatilanBaliklar.length > 0) {
      for (const balik of sonSatilanBaliklar) {
        cizim.fillText(`${index}. ${balik.ad} - ₺${balik.deger}`, 60, baslangicY);
        toplam += balik.deger;
        baslangicY += satirYukseklik;
        index++;
      }

      cizim.font = '22px Arial';
      if (satisAnimasyonIlerleme < satisAnimasyonMaks) {
        animasyonPara += toplam / satisAnimasyonMaks;
        satisAnimasyonIlerleme++;
      } else {
        animasyonPara = toplam;
      }

      cizim.fillText(`Toplam Kazanç: ₺${Math.floor(animasyonPara)}`, 60, baslangicY + 20);
      cizim.fillText(`Toplam Satılan Balık: ${sonSatilanBaliklar.length}`, 60, baslangicY + 50);
    } else {
      cizim.fillText('Satacak balık yok.', 60, baslangicY);
    }

    cizim.fillText('Q tuşuna basarak devam et', 60, baslangicY + 90);
  }
}

// Oyun döngüsü (her karede güncelle ve çiz)
function oyunDongusu() {
  guncelle();
  ciz();
  requestAnimationFrame(oyunDongusu);
}

// Arka plan müziğini otomatik başlat (tarayıcı engellerse ilk tuşla başlat)
arkaPlanMuzik.play().catch(() => {
  document.addEventListener('keydown', () => {
    arkaPlanMuzik.play();
  }, { once: true });
});

// Oyun ilk tuşa basınca başlasın
document.addEventListener('keydown', function oyunBaslatBirKere() {
  if (!oyunBasladi) {
    oyunBasladi = true;
    arkaPlanMuzik.play();
  }
}, { once: true });

// Oyun döngüsünü başlat
oyunDongusu();
