const Graphics = PIXI.Graphics;
const Application = PIXI.Application;
const Container = PIXI.Container;
const loader = PIXI.Loader.shared;
const Text = PIXI.Text;
const TextStyle = PIXI.TextStyle;

const WHITE_COLOR = 0xFFFFFF;
const BLACK_COLOR = 0x000000;

const WIDTH = 512;
const HEIGHT = 256;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 50;
const PLAYER_MAX_VX = 2;

//Create a Pixi Application
const app = new Application({width: WIDTH, height: HEIGHT});
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// game objects
let player, floor, boxes, boxSpawner;

// game 'infrastructure' objects
let gameScene, gameOverScene, state, gameOverMessage;

loader.load(init);

function BoxSpawner() {
    this.nextSpawn = Date.now();
    this.getNextSpawnTime = function() {
        // next spawn is now + (500 to 1500 ms)
        return Date.now() + 500 + Math.ceil(Math.random()*1000)
    };
    this.spawnIfReady = function() {
        const now = Date.now();
        if (this.nextSpawn <= now) {
            const box = this.spawnBox();
            boxes.push(box);
            gameScene.addChild(box);
            this.nextSpawn = this.getNextSpawnTime();
        }
    };
    this.spawnBox = function() {
        // from 2 to 10
        const boxWidth = 2 + Math.ceil(Math.random() * 8);
        // from 5 to 10
        const boxHeight = 5 + Math.ceil(Math.random() * 5);
        // from 0 to WIDTH - boxWidth
        const boxX = Math.ceil(Math.random() * (WIDTH - boxWidth));
        
        let box = GameObject(boxX, 0, boxWidth, boxHeight, WHITE_COLOR);
        // from 1 to 2;
        box.vy = 1 + Math.random()*1;
        box.move = function() {
            this.y += this.vy;
        };

        return box;
    }
}

function GameObject(x, y, width, height, color) {
    let gameObj = new Graphics();
    gameObj.x = x;
    gameObj.y = y;
    gameObj.width = width;
    gameObj.height = height;
    gameObj.beginFill(color)
    gameObj.drawRect(0, 0, width, height);
    gameObj.endFill();
    return gameObj;
}

function createFloor() {
    return GameObject(0, HEIGHT - 20, WIDTH, 5, WHITE_COLOR);
}

function createPlayer() {
    let p = GameObject(10, HEIGHT - 20 - PLAYER_HEIGHT, PLAYER_WIDTH, PLAYER_HEIGHT, WHITE_COLOR);
    p.hp = 100;
    p.vx = 0.0;
    p.move = function() {
        this.x += this.vx;
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > (WIDTH - PLAYER_WIDTH)) {
            this.x = (WIDTH - PLAYER_WIDTH);
        }
    };
    p.moveRight = function() {
        this.vx = Math.min(this.vx + 1, PLAYER_MAX_VX);
    }
    p.moveLeft = function() {
        this.vx = Math.max(this.vx - 1, -PLAYER_MAX_VX);
    }
    return p;
}

function createGameOverScene() {
    let scene = new Container();

    const style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    });
    gameOverMessage = new Text("The End!", style);
    gameOverMessage.x = WIDTH / 2 - 110;
    gameOverMessage.y = HEIGHT / 2 - 32;
    scene.addChild(gameOverMessage);

    scene.visible = false;
    return scene;
}

function init() {
    let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
      type = "canvas";
    }

    PIXI.utils.sayHello(type);
    
    gameScene = new Container();
    app.stage.addChild(gameScene);

    // add floor
    floor = createFloor();
    gameScene.addChild(floor);

    // add player
    player = createPlayer();
    gameScene.addChild(player);

    // boxes 
    boxes = new Array();
    boxSpawner = new BoxSpawner();

    // controls
    const left = keyboard('ArrowLeft'),
        right = keyboard('ArrowRight');
    
    left.press = () => {player.moveLeft()};
    right.press = () => {player.moveRight()};

    // game over scene
    gameOverScene = createGameOverScene();
    app.stage.addChild(gameOverScene);

    state = play;

    // game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function play(delta) {
    // spawn boxes
    boxSpawner.spawnIfReady();

    // move player
    player.move();

    // move boxes
    boxes.forEach(box => {
        box.move();
    });

    // remove boxes that are away from screen
    for (let index = boxes.length -1; index >= 0; index--) {
        const box = boxes[index];
        if (box.y > HEIGHT) {
            gameScene.removeChild(box);
            boxes.splice(index, 1);
        }
    }

    // check for collisions
    for(let index = 0; index < boxes.length; index++) {
        const box = boxes[index];
        if (hitTestRectangle(player, box)) {
            console.log("Collision with box");
            state = end;
            break;
        }
    }
}

function end() {
    gameScene.visible = false;
    gameOverScene.visible = true;
  }

function keyboard(value) {
  const key = {};
  key.value = value;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  //The `downHandler`
  key.downHandler = (event) => {
    if (event.key === key.value) {
      if (key.isUp && key.press) {
        key.press();
      }
      key.isDown = true;
      key.isUp = false;
      event.preventDefault();
    }
  };

  //The `upHandler`
  key.upHandler = (event) => {
    if (event.key === key.value) {
      if (key.isDown && key.release) {
        key.release();
      }
      key.isDown = false;
      key.isUp = true;
      event.preventDefault();
    }
  };

  //Attach event listeners
  const downListener = key.downHandler.bind(key);
  const upListener = key.upHandler.bind(key);
  
  window.addEventListener("keydown", downListener, false);
  window.addEventListener("keyup", upListener, false);
  
  // Detach event listeners
  key.unsubscribe = () => {
    window.removeEventListener("keydown", downListener);
    window.removeEventListener("keyup", upListener);
  };
  
  return key;
}

function hitTestRectangle(r1, r2) {

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
  
    //hit will determine whether there's a collision
    hit = false;
  
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2; 
    r1.centerY = r1.y + r1.height / 2; 
    r2.centerX = r2.x + r2.width / 2; 
    r2.centerY = r2.y + r2.height / 2; 
  
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2;
  
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY;
  
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight;
  
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) {
  
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) {
  
        //There's definitely a collision happening
        hit = true;
      } else {
  
        //There's no collision on the y axis
        hit = false;
      }
    } else {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
  };