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
