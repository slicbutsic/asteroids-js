let canvas;
let ctx;
let canvasWidth;
let canvasHeight;
let keys = [];
let ship;
let bullets = [];
let asteroids = [];
let score = 0;
let lives = 3;

const gameMusic = document.getElementById("gameMusic");
gameMusic.loop = true;

let highScore;
let localStorageName = "HighScore";
let soundOn = true;
let paused = false;

document.addEventListener('DOMContentLoaded', SetupStartPage);

function SetupStartPage(){
  const playButton = document.getElementById("play-button");
  const soundButton = document.getElementById("sound-button");

  playButton.addEventListener("click", StartGame);
  soundButton.addEventListener("click", ToggleSound);

  if (localStorage.getItem(localStorageName) == null) {
    highScore = 0;
  } else {
    highScore = localStorage.getItem(localStorageName);
  }
}

function StartGame(){
  const startPage = document.getElementById("start-page");
  const gamePage = document.getElementById("game-page");

  startPage.style.display = "none";
  gamePage.style.display = "block";

  SetupCanvas();
}

function ToggleSound(){
  const soundButton = document.getElementById("sound-button");

  if (soundOn) {
    gameMusic.pause();
    soundButton.textContent = "Sound: Off";
    soundOn = false;
  } else {
    gameMusic.play();
    soundButton.textContent = "Sound: On";
    soundOn = true;
  }
}

function SetupCanvas(){
  canvas = document.getElementById("my-canvas");
  ctx = canvas.getContext("2d");
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ship = new Ship();

  for(let i = 0; i < 8; i++){
    asteroids.push(new Asteroid());
  }

  document.body.addEventListener("keydown", HandleKeyDown);
  document.body.addEventListener("keyup", HandleKeyUp);

  document.getElementById("pause-button").addEventListener("click", TogglePause);
  document.getElementById("sound-button-game").addEventListener("click", ToggleSoundGame);

  if (soundOn) {
    gameMusic.play();
  }
  Render();
}

function HandleKeyDown(e){
  keys[e.keyCode] = true;
}
function HandleKeyUp(e){
  keys[e.keyCode] = false;

  if (e.keyCode === 32){
    bullets.push(new Bullet(ship.angle));
  }
}

class Ship {
  constructor() {
    this.visible = true;
    this.x = canvasWidth / 2;
    this.y = canvasHeight / 2;
    this.movingForward = false;
    this.speed = 0.1;
    this.velX = 0;
    this.velY = 0;
    this.rotateSpeed = 0.001;
    this.radius = 15;
    this.angle = 0;
    this.strokeColor = 'white';

    this.noseX = canvasWidth / 2 + 15;
    this.noseY = canvasHeight / 2;
  }
  Rotate(dir) {
    this.angle += this.rotateSpeed * dir;
  }
  Update() {

    let radians = this.angle / Math.PI * 180;

    if (this.movingForward) {
      this.velX += Math.cos(radians) * this.speed;
      this.velY += Math.sin(radians) * this.speed;
    }

    if (this.x < this.radius) {
      this.x = canvas.width;
    }
    if (this.x > canvas.width) {
      this.x = this.radius;
    }
    if (this.y < this.radius) {
      this.y = canvas.height;
    }
    if (this.y > canvas.height) {
      this.y = this.radius;
    }
    this.velX *= 0.99;
    this.velY *= 0.99;

    this.x -= this.velX;
    this.y -= this.velY;
  }
  Draw() {
    ctx.strokeStyle = this.strokeColor;
    ctx.beginPath();

    let vertAngle = ((Math.PI * 2) / 3);

    let radians = this.angle / Math.PI * 180;

    this.noseX = this.x - this.radius * Math.cos(radians);
    this.noseY = this.y - this.radius * Math.sin(radians);

    for (let i = 0; i < 3; i++) {
      ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
    }
    ctx.closePath();
    ctx.stroke();
  }
}

class Bullet{
  constructor(angle) {
    this.visible = true;
    this.x = ship.noseX;
    this.y = ship.noseY;
    this.angle = angle;
    this.height = 4;
    this.width = 4;
    this.speed = 5;
    this.velX = 0;
    this.velY = 0;
  }
  Update(){
    let radians = this.angle / Math.PI * 180;
    this.x -= Math.cos(radians) * this.speed;
    this.y -= Math.sin(radians) * this.speed;
  }
  Draw(){
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x,this.y,this.width,this.height);
  }
}

class Asteroid{
  constructor(x,y,radius,level,collisionRadius) {
    this.visible = true;
    this.x = x || Math.floor(Math.random() * canvasWidth);
    this.y = y || Math.floor(Math.random() * canvasHeight);
    this.speed = 3;
    this.radius = radius || 50;
    this.angle = Math.floor(Math.random() * 359);
    this.strokeColor = 'white';
    this.collisionRadius = collisionRadius || 46;
    this.level = level || 1;
  }
  Update(){
    let radians = this.angle / Math.PI * 180;
    this.x += Math.cos(radians) * this.speed;
    this.y += Math.sin(radians) * this.speed;
    if (this.x < this.radius) {
      this.x = canvas.width;
    }
    if (this.x > canvas.width) {
      this.x = this.radius;
    }
    if (this.y < this.radius) {
      this.y = canvas.height;
    }
    if (this.y > canvas.height) {
      this.y = this.radius;
    }
  }
  Draw(){
    ctx.beginPath();
    let vertAngle = ((Math.PI * 2) / 6);
    var radians = this.angle / Math.PI * 180;
    for(let i = 0; i < 6; i++){
      ctx.lineTo(this.x - this.radius * Math.cos(vertAngle * i + radians), this.y - this.radius * Math.sin(vertAngle * i + radians));
    }
    ctx.closePath();
    ctx.stroke();
  }
}

function CircleCollision(p1x, p1y, r1, p2x, p2y, r2){
  let radiusSum;
  let xDiff;
  let yDiff;

  radiusSum = r1 + r2;
  xDiff = p1x - p2x;
  yDiff = p1y - p2y;

  if (radiusSum > Math.sqrt((xDiff * xDiff) + (yDiff * yDiff))) {
    return true;
  } else {
    return false;
  }
}

function DrawLifeShips(){
  let startX = canvasWidth - 50;
  let startY = 10;
  let points = [[9, 9], [-9, 9]];
  ctx.strokeStyle = 'white';
  for(let i = 0; i < lives; i++){

    ctx.beginPath();

    ctx.moveTo(startX, startY);

    for(let j = 0; j < points.length; j++){
      ctx.lineTo(startX + points[j][0],
          startY + points[j][1]);
    }

    ctx.closePath();
    ctx.stroke();

    startX -= 30;
  }
}

function TogglePause() {
  if (paused) {
    paused = false;
    document.getElementById("pause-button").innerHTML = "&#9208;";
    Render();
  } else {
    paused = true;
    document.getElementById("pause-button").innerHTML = "&#9658;";
  }
}

function ToggleSoundGame() {
  if (soundOn) {
    gameMusic.pause();
    document.getElementById("sound-button-game").innerHTML = "&#x1F507;";
    soundOn = false;
  } else {
    gameMusic.play();
    document.getElementById("sound-button-game").innerHTML = "&#9835;";
    soundOn = true;
  }
}

function Render() {
  if (paused) return;

  ship.movingForward = (keys['87']) || (keys['38']);

  if (keys[68] || keys[39]) {

    ship.Rotate(1);
  }
  if (keys[65] || keys[37]) {

    ship.Rotate(-1);
  }

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  ctx.fillStyle = 'white';
  ctx.font = '21px Arial';
  ctx.fillText("SCORE : " + score.toString(), 20, 35);

  if(lives <= 0){

    document.body.removeEventListener("keydown", HandleKeyDown);
    document.body.removeEventListener("keyup", HandleKeyUp);

    ship.visible = false;
    ctx.fillStyle = 'white';
    ctx.font = '50px Arial';
    ctx.fillText("GAME OVER", canvasWidth / 2 - 150, canvasHeight / 2);
    gameMusic.pause();
  }

  if(asteroids.length === 0){
    ship.x = canvasWidth / 2;
    ship.y = canvasHeight / 2;
    ship.velX = 0;
    ship.velY = 0;
    for(let i = 0; i < 8; i++){
      let asteroid = new Asteroid();
      asteroid.speed += .5;
      asteroids.push(asteroid);
    }
  }

  DrawLifeShips();

  if (asteroids.length !== 0) {
    for(let k = 0; k < asteroids.length; k++){
      if(CircleCollision(ship.x, ship.y, 11, asteroids[k].x, asteroids[k].y, asteroids[k].collisionRadius)){
        ship.x = canvasWidth / 2;
        ship.y = canvasHeight / 2;
        ship.velX = 0;
        ship.velY = 0;
        lives -= 1;
      }
    }
  }

  if (asteroids.length !== 0 && bullets.length != 0){
    loop1:
      for(let l = 0; l < asteroids.length; l++){
        for(let m = 0; m < bullets.length; m++){
          if(CircleCollision(bullets[m].x, bullets[m].y, 3, asteroids[l].x, asteroids[l].y, asteroids[l].collisionRadius)){
            if(asteroids[l].level === 1){
              asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 25, 2, 22));
              asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 25, 2, 22));
            } else if(asteroids[l].level === 2){
              asteroids.push(new Asteroid(asteroids[l].x - 5, asteroids[l].y - 5, 15, 3, 12));
              asteroids.push(new Asteroid(asteroids[l].x + 5, asteroids[l].y + 5, 15, 3, 12));
            }
            asteroids.splice(l,1);
            bullets.splice(m,1);
            score += 20;

            break loop1;
          }
        }
      }
  }

  if(ship.visible){
    ship.Update();
    ship.Draw();
  }

  if (bullets.length !== 0) {
    for(let i = 0; i < bullets.length; i++){
      bullets[i].Update();
      bullets[i].Draw();
    }
  }
  if (asteroids.length !== 0) {
    for(let j = 0; j < asteroids.length; j++){
      asteroids[j].Update();

      asteroids[j].Draw(j);
    }
  }

  highScore = Math.max(score, highScore);
  localStorage.setItem(localStorageName, highScore);
  ctx.font = '21px Arial';
  ctx.fillText("HIGHEST SCORE : " + highScore.toString(), 20, 70);

  requestAnimationFrame(Render);
}

window.addEventListener('resize', function() {
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
});
