deneme.html dosyasi
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Scale the Depths</title>
  <link rel="stylesheet" href="style.css" />

</head>
<body>
  <canvas id="gameCanvas" width="1280" height="720"></canvas>
  <script src="player.js"></script>
  <script src="obstacle.js"></script>
  <script src="game.js"></script>
</body>
</html>

game.js sayfasi
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const waveSprite = new Image();
waveSprite.src = 'assets/wave_sprite.png'; // sprite görselin yolu

const waveFrameWidth = 128;  // her kare genişliği
const waveFrameHeight = 64;  // her kare yüksekliği
const waveFrameCount = 6;    // toplam kare sayısı
let currentWaveFrame = 0;    // şu anki kare
let waveFrameDelay = 0;      // animasyon yavaşlatma için sayaç
const waveFrameDelayMax = 8; // her 8 frame'de bir kare değiştir


let fishingMode = false;
let frameCount = 0;
let removedObstaclesCount = 0;
let keys = {};
let normalBackgroundOffsetX = 0;
const normalScrollSpeed = 0.3;


const normalBackground = new Image();
normalBackground.src = 'assets/arkaplan.png';

const fishingBackground = new Image();
fishingBackground.src = 'assets/fishing_background.png';

let fishingBackgroundOffsetY = 0; // 🆕 animasyon için offset

let player = new Player();
let obstacles = [];
let obstacleInterval = 90;

class TekneAdam {
  constructor() {
    this.width = 250;
    this.height = 250;
    this.x = canvas.width/2;
    this.y = canvas.height - this.height - 125;
    this.speed = 3;
    this.image = new Image();
    this.image.src = 'assets/tekne_adam.png';
  }

  draw() {
    if (this.image.complete) {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    } else {
      ctx.fillStyle = 'brown';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = 'blue';
      ctx.fillRect(this.x + 10, this.y + 10, this.width - 20, this.height - 20);
    }
  }

  update(keys) {
    if (keys['ArrowRight'] && this.x + this.width < canvas.width) this.x += this.speed;
    if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
  }

  isAtLeftEdge() {
    return this.x <= 5;
  }
}

let tekneAdam = new TekneAdam();

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

function generateObstacle() {
  const width = 48;
  const x = Math.random() * (canvas.width - width);
  obstacles.push(new Obstacle(x));
}

function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
 if (!fishingMode) {
  tekneAdam.update(keys);

  // 🔁 Sprite animasyon güncellemesi
  waveFrameDelay++;
  if (waveFrameDelay >= waveFrameDelayMax) {
    currentWaveFrame = (currentWaveFrame + 1) % waveFrameCount;
    waveFrameDelay = 0;
  }

  normalBackgroundOffsetX += normalScrollSpeed;
  if (normalBackgroundOffsetX > canvas.width) {
    normalBackgroundOffsetX = 0;
  }

  if ((keys['e'] || keys['E']) && tekneAdam.isAtLeftEdge()) {
    fishingMode = true;
    keys['e'] = false;
    keys['E'] = false;
  }
}

 else {
    player.update(keys);

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();

      if (checkCollision(player, obstacles[i])) {
        obstacles.splice(i, 1);
        removedObstaclesCount++;
      } else if (obstacles[i].y > canvas.height) {
        obstacles.splice(i, 1);
      }
    }

    if (frameCount % obstacleInterval === 0) {
      generateObstacle();
    }

    frameCount++;
    fishingBackgroundOffsetY += 0.5; // 🆕 Arka plan kaydırma

    if (fishingBackgroundOffsetY > fishingBackground.height) {
      fishingBackgroundOffsetY = 0; // Sonsuz döngü
    }

    if (keys['q'] || keys['Q']) {
      fishingMode = false;
      keys['q'] = false;
      keys['Q'] = false;
      removedObstaclesCount = 0;
      obstacles = [];
    }
  }
}

function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(Yok edilen balık: ${removedObstaclesCount}, 10, 30);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

if (!fishingMode) {
  if (normalBackground.complete) {
    const x = -normalBackgroundOffsetX;
    ctx.drawImage(normalBackground, x, 0, canvas.width, canvas.height);
    ctx.drawImage(normalBackground, x + canvas.width, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#569cdd';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 🟦 Dalga sprite'ını çiz (sprite sheet'in doğru karesi)
  if (waveSprite.complete) {
    ctx.drawImage(
      waveSprite,
      currentWaveFrame * waveFrameWidth,  // sprite x başlangıcı
      0,                                  // sprite y
      waveFrameWidth,
      waveFrameHeight,
      0,                                  // canvas üzerinde x
      canvas.height - waveFrameHeight,    // canvas üzerinde y
      canvas.width,                       // ölçeklenmiş genişlik
      waveFrameHeight
    );
  }

  tekneAdam.draw();
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText('En sola gel ve E tuşuna basarak balık tutma moduna geç', 10, 30);
}

 else {
    if (fishingBackground.complete) {
      const y = -fishingBackgroundOffsetY;
      ctx.drawImage(fishingBackground, 0, y, canvas.width, fishingBackground.height);
      ctx.drawImage(fishingBackground, 0, y + fishingBackground.height, canvas.width, fishingBackground.height);
    } else {
      ctx.fillStyle = '#2b6ca3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    player.draw();
    obstacles.forEach(o => o.draw(ctx));

    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Q tuşuna basarak tekne moduna dön', 10, 60);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

player.js sayfasi
class Player {
  constructor() {
    this.width = 70;
    this.height = 70;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - this.height - 10;
    this.speed = 4;
    this.image = new Image();
    this.image.src = 'assets/kanca.png'; // Kanca görselinin yolu
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update(keys) {
    if (keys['ArrowLeft'] && this.x > 0) this.x -= this.speed;
    if (keys['ArrowRight'] && this.x + this.width < canvas.width) this.x += this.speed;
    if (keys['ArrowUp'] && this.y > 0) this.y -= this.speed;
    if (keys['ArrowDown'] && this.y + this.height < canvas.height) this.y += this.speed;
  }
}

tekneadam.js dosyasi
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


obstacle.js dosyasi
const obstacleImage = new Image();
obstacleImage.src = 'assets/fish.png';

class Obstacle {
  constructor(x) {
    this.width = 48;
    this.height = 48;
    this.x = x;
    this.y = 0;
    this.speed = 2;
  }

  draw() {
    ctx.drawImage(obstacleImage, this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}

style.css dosyasi
/* style.css */
body {
    margin: 0;
    overflow: hidden;
    background: linear-gradient(to bottom, #99c1e9, #569cdd);
  }
  
 canvas {
  display: block;
  margin: auto;
  background-color: #569cdd; /* arka plan JS ile çizildiği için sadece renk */
}


bu kodda balik tutma modu arkaplani anismasyonu duzgun calismiyor


ChatGPT said:
Balık tutma modundaki arka plan animasyonunun düzgün çalışmaması, genellikle şu sorunlardan kaynaklanır:

✅ Sorunun Muhtemel Nedenleri:
1. Görselin height değeri bilinmeden kaydırılıyor
fishingBackground.height ifadesi animasyon başladığında 0 olabilir. Görsel henüz tam yüklenmeden bu değere erişmeye çalışırsan fishingBackgroundOffsetY > fishingBackground.height kontrolü anlamsız olur.

2. Animasyon sıfırlanmıyor veya görüntü tam dönmüyor
Eğer fishingBackgroundOffsetY sürekli artar ama doğru zamanda sıfırlanmazsa, "kayma" görünmez olur (boşluk oluşur).

3. Görselin canvas'a doğru şekilde kopyalanmaması
Arka planı 2 kez çiziyorsun ama eğer ikinci çizim ekranın dışına taşıyorsa görünmeyebilir.

✅ Düzgün Kaydırmalı Balık Tutma Arka Planı (Düzenlenmiş Kod)
Aşağıdaki değişiklikleri yap:

🔁 update fonksiyonu içindeki fishingBackgroundOffsetY işlemi:
js
Copy
Edit
if (fishingBackground.complete && fishingBackground.naturalHeight > 0) {
  fishingBackgroundOffsetY += 0.5;
  if (fishingBackgroundOffsetY > fishingBackground.height) {
    fishingBackgroundOffsetY = 0;
  }
}
🎨 draw fonksiyonu içindeki çizim kısmı:
js
Copy
Edit
if (fishingBackground.complete && fishingBackground.naturalHeight > 0) {
  const y = -fishingBackgroundOffsetY;
  ctx.drawImage(fishingBackground, 0, y, canvas.width, fishingBackground.height);
  ctx.drawImage(fishingBackground, 0, y + fishingBackground.height, canvas.width, fishingBackground.height);
}
naturalHeight kontrolü, görselin gerçekten yüklenip yüklenmediğini garantiler.

Ekstra Öneri:
Görsel yüksekliği sabitse, örneğin 720 piksel ise, fishingBackground.height yerine direkt 720 yazmak daha garantili olur:

js
Copy
Edit
if (fishingBackgroundOffsetY > 720) {
  fishingBackgroundOffsetY = 0;
}
🧪 Test Etmek İçin:
assets/fishing_background.png dosyasının boyutu, canvas'tan (720px) yüksek olmalı.

Görselin gerçekten yüklendiğinden emin ol:

js
Copy
Edit
fishingBackground.onload = () => {
  console.log('Balık tutma arka planı yüklendi:', fishingBackground.width, fishingBackground.height);
};
İstersen arka planı farklı efektlerle (dalga distort, parallax, opacity vs.) daha da geliştirebilirim. Yardımcı olayım mı?






You said:
bana yeni game.js dosyasini yazar misin
ChatGPT said:
Tabii! Aşağıda, sprite tabanlı dalga animasyonu ve düzgün çalışan balık tutma arka plan kayması içeren güncel game.js dosyasını bulabilirsin. Kodun tamamı uyumlu şekilde düzenlendi:

✅ game.js (Tamamı Güncel):
javascript
Copy
Edit
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// DALGA SPRITE AYARLARI
const waveSprite = new Image();
waveSprite.src = 'assets/wave_sprite.png';

const waveFrameWidth = 128;
const waveFrameHeight = 64;
const waveFrameCount = 6;
let currentWaveFrame = 0;
let waveFrameDelay = 0;
const waveFrameDelayMax = 8;

// MODLAR VE VERİLER
let fishingMode = false;
let frameCount = 0;
let removedObstaclesCount = 0;
let keys = {};

let normalBackgroundOffsetX = 0;
const normalScrollSpeed = 0.3;

// ARKA PLANLAR
const normalBackground = new Image();
normalBackground.src = 'assets/arkaplan.png';

const fishingBackground = new Image();
fishingBackground.src = 'assets/fishing_background.png';

let fishingBackgroundOffsetY = 0;

// NESNELER
let player = new Player();
let obstacles = [];
let obstacleInterval = 90;
let tekneAdam = new TekneAdam();

// KONTROLLER
document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});

// ENGEL OLUŞTURUCU
function generateObstacle() {
  const width = 48;
  const x = Math.random() * (canvas.width - width);
  obstacles.push(new Obstacle(x));
}

// ÇARPIŞMA
function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

// GÜNCELLEME
function update() {
  if (!fishingMode) {
    tekneAdam.update(keys);

    // Dalga sprite animasyonu
    waveFrameDelay++;
    if (waveFrameDelay >= waveFrameDelayMax) {
      currentWaveFrame = (currentWaveFrame + 1) % waveFrameCount;
      waveFrameDelay = 0;
    }

    // Normal arka plan kayması
    normalBackgroundOffsetX += normalScrollSpeed;
    if (normalBackgroundOffsetX > canvas.width) {
      normalBackgroundOffsetX = 0;
    }

    if ((keys['e'] || keys['E']) && tekneAdam.isAtLeftEdge()) {
      fishingMode = true;
      keys['e'] = false;
      keys['E'] = false;
    }
  } else {
    player.update(keys);

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();

      if (checkCollision(player, obstacles[i])) {
        obstacles.splice(i, 1);
        removedObstaclesCount++;
      } else if (obstacles[i].y > canvas.height) {
        obstacles.splice(i, 1);
      }
    }

    if (frameCount % obstacleInterval === 0) {
      generateObstacle();
    }

    frameCount++;

    // 🎣 Arka plan yumuşak kaydırma (görsel yüklendiyse)
    if (fishingBackground.complete && fishingBackground.naturalHeight > 0) {
      fishingBackgroundOffsetY += 0.5;
      if (fishingBackgroundOffsetY > fishingBackground.height) {
        fishingBackgroundOffsetY = 0;
      }
    }

    if (keys['q'] || keys['Q']) {
      fishingMode = false;
      keys['q'] = false;
      keys['Q'] = false;
      removedObstaclesCount = 0;
      obstacles = [];
    }
  }
}

// SKOR YAZISI
function drawScore() {
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.fillText(`Yok edilen balık: ${removedObstaclesCount}`, 10, 30);
}

// ÇİZİM
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (!fishingMode) {
    // Normal arka plan
    if (normalBackground.complete) {
      const x = -normalBackgroundOffsetX;
      ctx.drawImage(normalBackground, x, 0, canvas.width, canvas.height);
      ctx.drawImage(normalBackground, x + canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#569cdd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Dalga animasyonu
    if (waveSprite.complete) {
      ctx.drawImage(
        waveSprite,
        currentWaveFrame * waveFrameWidth,
        0,
        waveFrameWidth,
        waveFrameHeight,
        0,
        canvas.height - waveFrameHeight,
        canvas.width,
        waveFrameHeight
      );
    }

    tekneAdam.draw();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('En sola gel ve E tuşuna basarak balık tutma moduna geç', 10, 30);
  } else {
    // Balık tutma arka planı
    if (fishingBackground.complete && fishingBackground.naturalHeight > 0) {
      const y = -fishingBackgroundOffsetY;
      ctx.drawImage(fishingBackground, 0, y, canvas.width, fishingBackground.height);
      ctx.drawImage(fishingBackground, 0, y + fishingBackground.height, canvas.width, fishingBackground.height);
    } else {
      ctx.fillStyle = '#2b6ca3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    player.draw();
    obstacles.forEach(o => o.draw(ctx));

    drawScore();
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Q tuşuna basarak tekne moduna dön', 10, 60);
  }
}

// ANA OYUN DÖNGÜSÜ
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
🧪 Notlar:
wave_sprite.png → Sprite dalga dosyanı doğru eklemelisin (assets/wave_sprite.png)

fishing_background.png → Yüksekliği canvas’tan (720px) büyük veya eşit olmalı (örneğin 1024px)

Görseller assets/ klasöründe yer almalı.

İstersen bir sonraki adımda:

Parallax efektli derinlik

Balık türüne göre puanlama

Daha gelişmiş sprite animasyonları
ekleyebilirim. Hazır mısın?
