const startBtn = document.getElementById('startBtn');
const startOverlay = document.getElementById('startOverlay');
const howToPlay = document.getElementById('howToPlay');
const howToCloseBtn = document.getElementById('howToCloseBtn');

if (startBtn) {
  startBtn.onclick = function () {
    gameStarted = true;
    startOverlay.style.display = 'none';
    if (howToPlay) howToPlay.style.display = 'block'; // "Nasıl Oynanır" kutusunu göster
    backgroundMusic.play();
  };
}

if (howToCloseBtn) {
  howToCloseBtn.onclick = function () {
    if (howToPlay) howToPlay.style.display = 'none';
  };
}
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const sellBgImage = new Image();
sellBgImage.src = 'assets/satis_arkaplan.png'; // Kendi görsel yolunu yaz
const waveSprite = new Image();
waveSprite.src = 'assets/wave_sprite.png';
const fishingSound = new Audio('assets/balik_tutma_ses.mp3');
const uyariSound = new Audio('assets/depo_dolu.mp3');
const yakalamaSound = new Audio('assets/balik_yakalama_ses.mp3');
const shopBgImage = new Image();
shopBgImage.src = 'assets/shop_arkaplan.png'; // Kendi shop arka plan görselinin yolunu yaz



// 🎵 Arka plan müziği
const backgroundMusic = new Audio('assets/arkaplan_muzik.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;


const waveFrameWidth = 1194;
const waveFrameHeight = 216;
const waveFrameCount = 1;
let currentWaveFrame = 0;
let waveFrameDelay = 0;
const waveFrameDelayMax = 20;

let gameOver = false;
let gameStarted = false;
let waveOffsetX = 0;
let waveDirection = 1; // 1: sağa, -1: sola
const waveMaxOffset = 30;
const waveSpeed = 0.4;

let shopMode = false;
let fishingMode = false;
let sellingMode = false;
let frameCount = 0;
let keys = {};
let fishCapacity = 9;


let collectedFish = [];
let totalSoldFish = 0;
let totalMoneyEarned = 0;
let lastSoldFish = [];
let sellingAnimationProgress = 0;
let sellingAnimationMax = 100;
let animateMoney = 0;


let normalBackgroundOffsetX = 0;
const normalScrollSpeed = 0.3;

const leftImage = new Image();
leftImage.src = 'assets/sol_foto.png';

const rightImage = new Image();
rightImage.src = 'assets/sag_foto.png';

const normalBackground = new Image();
normalBackground.src = 'assets/arkaplan.png';


const centerImage = new Image();
centerImage.src = 'assets/orta_foto.png'; // Buraya senin görselinin yolu

const fishingBackground = new Image();
fishingBackground.src = 'assets/fishing_background.png';
let fishingBackgroundOffsetY = 0;

const sellSound = new Audio('assets/satis_ses.mp3');



let player = new Player();
let obstacles = [];
let obstacleInterval = 90;

class TekneAdam {
  constructor() {
    this.width = 250;
    this.height = 250;
    this.x = canvas.width / 2;
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

  isAtRightEdge() {
    return this.x + this.width >= canvas.width - 5;
  }
  isAtCenter() {
  const centerX = canvas.width / 2;
  return Math.abs(this.x + this.width / 2 - centerX) < 50;
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



const fishImage = new Image();
fishImage.src = 'assets/balik.png'; // Görselin yolu


const moneyImage = new Image();
moneyImage.src = 'assets/para.png'; // Görselin yolu

const totalSoldFishImage = new Image();
totalSoldFishImage.src = 'assets/toplam_satilan_balik.png'; // Görselin yolu

function drawFishAndMoneyCounter(ctx) {
  // Balık görseli ve sayısı
  const fishX = 50;
  const fishY = 10;
  const fishWidth = 100;
  const fishHeight = 100;

  if (fishImage.complete) {
    ctx.drawImage(fishImage, fishX, fishY, fishWidth, fishHeight);
  }

  // Balık sayısını görselin ortasına yaz
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#fffbea';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${collectedFish.length}`,
    fishX + fishWidth / 2,
    fishY + fishHeight / 2
  );

  // Para görseli ve miktarı
  const moneyX = fishX + fishWidth + 0;
  const moneyY = fishY - 5;
  const moneyWidth = 100;
  const moneyHeight = 100;

  if (moneyImage.complete) {
    ctx.drawImage(moneyImage, moneyX, moneyY + 6, moneyWidth, moneyHeight);
  }

  // Para miktarını para görselinin ortasına yaz
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#fffbea';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${totalMoneyEarned}`,
    moneyX + moneyWidth / 2,
    moneyY + 6 + moneyHeight / 2
  );

  // Toplam satılan balık görseli ve sayısı
  const soldFishX = moneyX + moneyWidth + 40;
  const soldFishY = moneyY;
  const soldFishWidth = 100;
  const soldFishHeight = 100;

  if (totalSoldFishImage.complete) {
    ctx.drawImage(totalSoldFishImage, soldFishX, soldFishY + 6, soldFishWidth, soldFishHeight);
  }

  // Toplam satılan balık sayısını görselin ortasına yaz
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#fffbea';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(
    `${totalSoldFish}`,
    soldFishX + soldFishWidth / 2,
    soldFishY + 6 + soldFishHeight / 2
  );
}

function update() {
  // 🛍️ Mağaza modu
  if (shopMode) {
    if (keys['q'] || keys['Q']) {
      shopMode = false;
      keys['q'] = false;
      keys['Q'] = false;
    }

    if (keys['1'] && totalMoneyEarned >= 100) {
      tekneAdam.speed += 1;
      totalMoneyEarned -= 100;
      keys['1'] = false;
    }

   if (keys['2'] && totalMoneyEarned >= 150 && fishCapacity < 15) {
  fishCapacity += 1;
  totalMoneyEarned -= 150;
  keys['2'] = false;
}

    return; // Diğer modlara geçilmez
  }

  // 💰 Satış modu
  if (sellingMode) {
    if (sellingAnimationProgress < sellingAnimationMax) {
      sellingAnimationProgress++;
    }

    if (keys['q'] || keys['Q']) {
      sellingMode = false;
      keys['q'] = false;
      keys['Q'] = false;
    }

    return;
  }

  // 🎣 Balık tutma modu
  if (fishingMode) {
    player.update(keys);

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();

   if (checkCollision(player, obstacles[i])) {
  if (collectedFish.length < fishCapacity) {
    collectedFish.push(obstacles[i].fishType);
    yakalamaSound.play();
    obstacles.splice(i, 1);

    if (collectedFish.length >= fishCapacity) {
      fishingMode = false;
      obstacles = [];
      player = new Player();
      frameCount = 0;
      return; // <--- EKLEYİN! Fonksiyonu burada bitiriyoruz
    }
  } else {
    obstacles.splice(i, 1);
  }
} else if (obstacles[i].y > canvas.height) {
        obstacles.splice(i, 1);
      }
    }

    if (frameCount % obstacleInterval === 0) {
      generateObstacle();
    }

    frameCount++;
    fishingBackgroundOffsetY += 0.5;
    if (fishingBackgroundOffsetY > fishingBackground.height) {
      fishingBackgroundOffsetY = 0;
    }

    if (keys['q'] || keys['Q']) {
      fishingMode = false;
      keys['q'] = false;
      keys['Q'] = false;
      obstacles = [];
    }

    return;
  }

  // 🚤 Tekne (normal) modu
  tekneAdam.update(keys);

  waveOffsetX -= waveSpeed;
  normalBackgroundOffsetX += normalScrollSpeed;
  if (normalBackgroundOffsetX > canvas.width) {
    normalBackgroundOffsetX = 0;
  }

  if ((keys['e'] || keys['E']) && tekneAdam.isAtLeftEdge()) {
    if (collectedFish.length < fishCapacity) {
      fishingMode = true;
      fishingSound.play();
    } else {
      uyariSound.play();
    }
    keys['e'] = false;
    keys['E'] = false;
  }

  if ((keys['e'] || keys['E']) && tekneAdam.isAtRightEdge()) {
  sellingMode = true;
  sellSound.play();

  sellingAnimationProgress = 0;
  animateMoney = 0;
  lastSoldFish = [...collectedFish];
  totalSoldFish += collectedFish.length;

  // OYUN BİTİŞ KONTROLÜ
  if (totalSoldFish >= 100) {
    gameOver = true;
  }

  for (const fish of collectedFish) {
    totalMoneyEarned += fish.value;
  }
  collectedFish = [];

  keys['e'] = false;
  keys['E'] = false;
}

  if ((keys['e'] || keys['E']) && tekneAdam.isAtCenter()) {
    shopMode = !shopMode;
    keys['e'] = false;
    keys['E'] = false;
  }
}



function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Oyun başlamadıysa sadece başlat ekranını göster

  if (!gameStarted) {
  ctx.fillStyle = 'rgba(30,60,100,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Balıkçı Oyunu', canvas.width / 2, canvas.height / 2 - 120);

  ctx.font = '28px Arial';
  ctx.textAlign = 'left';
  const howTo = [
    "Nasıl Oynanır?",
    "- Sağ/Sol ok tuşları ile tekneyi hareket ettir.",
    "- E tuşu ile balık tut veya sat.",
    "- Q tuşu ile balık tutmayı bırak veya satıştan çık.",
    "- Balık kapasiten dolunca tekneye dönüp balıkları sat.",
    "- 100 balık sattığında oyun biter."
  ];
  let y = canvas.height / 2 - 60;
  for (const line of howTo) {
    ctx.fillText(line, canvas.width / 2 - 260, y);
    y += 40;
  }

  ctx.textAlign = 'center';
  ctx.font = '32px Arial';
  ctx.fillText('Başlamak için "Oyuna Başla" butonuna tıkla', canvas.width / 2, canvas.height / 2 + 140);

  return;
}

  if (gameOver) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Oyun Bitti!', canvas.width / 2, canvas.height / 2 - 40);

    ctx.font = '32px Arial';
    ctx.fillText(`Toplam Kazanç: ₺${totalMoneyEarned}`, canvas.width / 2, canvas.height / 2 + 30);
    ctx.fillText('Yeniden başlatmak için sayfayı yenileyin.', canvas.width / 2, canvas.height / 2 + 90);
    return;
  }

 if (shopMode) {
  // Shop arka plan fotoğrafı
  if (shopBgImage.complete) {
    ctx.drawImage(shopBgImage, 0, 0, canvas.width, canvas.height);
  } else {
    // Fotoğraf yüklenmediyse sade bir renk kullan
    ctx.fillStyle = "#232526";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.fillStyle = 'white';
  ctx.font = '36px Arial';
  ctx.fillText('Tersane', canvas.width / 2 - 80, 60);

  ctx.font = '24px Arial';
  ctx.fillText(`1.  Tekne Hızını Artır - 100₺ (1 tuşu)  ➤ Şu an: ${tekneAdam.speed}`, 100, 150);
  ctx.fillText(`2. Balık Kapasitesini Artır (max 15) - 150₺ (2 tuşu)  ➤ Şu an: ${fishCapacity}`, 100, 200);

  ctx.fillStyle = '#ffff66';
  ctx.fillText(`Paran: ${totalMoneyEarned}₺`, 100, 270);

  ctx.fillStyle = 'white';
  ctx.fillText('Q tuşuna basarak çık', 100, 350);

  return;
}

  if (!fishingMode && !sellingMode) {
    // 🚤 Normal Mod (Teknedeyken)
    if (normalBackground.complete) {
      const x = -normalBackgroundOffsetX;
      ctx.drawImage(normalBackground, x, 0, canvas.width, canvas.height);
      ctx.drawImage(normalBackground, x + canvas.width, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#569cdd';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (leftImage.complete) {
      const imgWidth = 400;
      const imgHeight = 400;
      const imgX = 0;
      const imgY = canvas.height - waveFrameHeight - imgHeight + 180;
      ctx.drawImage(leftImage, imgX, imgY, imgWidth, imgHeight);
    }

    if (rightImage.complete) {
      const imgWidth = 400;
      const imgHeight = 400;
      const imgX = canvas.width - imgWidth;
      const imgY = canvas.height - waveFrameHeight - imgHeight + 140;
      ctx.drawImage(rightImage, imgX, imgY, imgWidth, imgHeight);
    }

    if (waveSprite.complete) {
      const waveY = canvas.height - waveFrameHeight;
      for (let x = waveOffsetX % waveSprite.width - waveSprite.width; x < canvas.width; x += waveSprite.width) {
        ctx.drawImage(waveSprite, x, waveY, waveSprite.width, waveFrameHeight);
      }
    }

    if (centerImage.complete) {
      const imgWidth = 400;
      const imgHeight = 400;
      const imgX = (canvas.width - imgWidth) / 2;
      const imgY = (canvas.height - imgHeight) / 2 + 50;
      ctx.drawImage(centerImage, imgX, imgY, imgWidth, imgHeight);
    }

    tekneAdam.draw();
    
    drawFishAndMoneyCounter(ctx);

  } else if (fishingMode) {
    // 🎣 Balık Tutma Modu
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
    ctx.fillText('Q tuşuna basarak tekneye dön', 10, 100);
    drawFishAndMoneyCounter(ctx);

  } else if (sellingMode) {
    // 💰 Satış Ekranı
    // Arka plana fotoğraf ekle
    if (sellBgImage.complete) {
      ctx.drawImage(sellBgImage, 0, 0, canvas.width, canvas.height);
    } else {
      // Fotoğraf yüklenmediyse sade bir renk kullan
      ctx.fillStyle = "#e0ecff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = '#fff'; // Koyu gri yazı
    ctx.font = '32px Arial';
    ctx.fillText('Balıklar satıldı!', 50, 50);


    ctx.font = '20px Arial';
    const lineHeight = 30;
    let startY = 90;
    let index = 1;
    let total = 0;

    if (lastSoldFish && lastSoldFish.length > 0) {
      for (const fish of lastSoldFish) {
        ctx.fillText(`${index}. ${fish.name} - ₺${fish.value}`, 60, startY);
        total += fish.value;
        startY += lineHeight;
        index++;
      }

      ctx.font = '22px Arial';
      if (sellingAnimationProgress < sellingAnimationMax) {
        animateMoney += total / sellingAnimationMax;
        sellingAnimationProgress++;
      } else {
        animateMoney = total;
      }

      ctx.fillText(`Toplam Kazanç: ₺${Math.floor(animateMoney)}`, 60, startY + 20);
      ctx.fillText(`Toplam Satılan Balık: ${lastSoldFish.length}`, 60, startY + 50);
    } else {
      ctx.fillText('Satacak balık yok.', 60, startY);
    }

    ctx.fillText('Q tuşuna basarak devam et', 60, startY + 90);
}
}



function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}


// 🎵 Müziği başlatmayı dene
backgroundMusic.play().catch(() => {
  // Otomatik oynatma engellenirse ilk tuşla başlat
  document.addEventListener('keydown', () => {
    backgroundMusic.play();
  }, { once: true });
});

document.addEventListener('keydown', function startGameOnce() {
  if (!gameStarted) {
    gameStarted = true;
    // Eğer müzik otomatik başlamadıysa burada başlatabilirsin
    backgroundMusic.play();
  }
}, { once: true });

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

const fishTypes = [
  {
    name: 'Küçük Balık',
    imageSrc: 'assets/fish_small.png',
    width: 40,
    height: 40,
    speed: 2,
    value: 5
  },
  {
    name: 'Orta Balık',
    imageSrc: 'assets/fish_medium.png',
    width: 60,
    height: 60,
    speed: 1.5,
    value: 10
  },
  {
    name: 'Büyük Balık',
    imageSrc: 'assets/fish_big.png',
    width: 80,
    height: 80,
    speed: 1,
    value: 20
  }
];

class Obstacle {
  constructor(x) {
    const randomType = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    this.fishType = randomType;
    this.width = randomType.width;
    this.height = randomType.height;
    this.x = x;
    this.y = 0;
    this.speed = randomType.speed;
    this.image = new Image();
    this.image.src = randomType.imageSrc;
    this.value = randomType.value;
    
  }

  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  update() {
    this.y += this.speed;
  }
}
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


gameLoop();

