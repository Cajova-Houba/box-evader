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
let player, floor, boxes, boxSpawner, score;

// game 'infrastructure' objects
let gameScene, gameOverScene, state, scoreMessage;

loader.load(init);

function BoxSpawner() {
    this.nextSpawn = Date.now();
    this.getNextSpawnTime = function() {
        // next spawn is now + (250 to (1500-score) ms)
        const upperBoundary = Math.max(0, 1250 - 4*score);
        return Date.now() + 250 + Math.ceil(Math.random()*upperBoundary);
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
        // from 10 to 50
        const boxWidth = 10 + Math.ceil(Math.random() * 40);
        // from 15 to 70
        const boxHeight = 15 + Math.ceil(Math.random() * 55);
        // from 0 to WIDTH - boxWidth
        const boxX = Math.ceil(Math.random() * (WIDTH - boxWidth));
        
        let box = GameObject(boxX, 0, boxWidth, boxHeight, WHITE_COLOR);
        // from 1 to 3;
        box.vy = 1 + Math.random()*2;
        box.move = function() {
            this.y += this.vy;
        };
        box.isOutOfScreen = function() {
            return this.y > HEIGHT;
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

function init() {
    let type = "WebGL";
    if (!PIXI.utils.isWebGLSupported()) {
      type = "canvas";
    }

    PIXI.utils.sayHello(type);
    
    gameScene = new Container();
    app.stage.addChild(gameScene);

    // score display
    score = 0;
    scoreMessage = createScoreDisplay();
    gameScene.addChild(scoreMessage);

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
        right = keyboard('ArrowRight'),
        lefta = keyboard('a'),
        leftA = keyboard('A'),
        rightd = keyboard('d'),
        rightD = keyboard('D');
    
    [left, lefta, leftA].forEach(k => {
      k.press = () => {player.moveLeft()}
      k.hold = () => {player.moveLeft()}
    });
    [right, rightd, rightD].forEach(k => {
      k.press = () => {player.moveRight()}
      k.hold = () => {player.moveRight()}
    });

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
        if (box.isOutOfScreen()) {
            gameScene.removeChild(box);
            boxes.splice(index, 1);
            score++;
            scoreMessage.text = score;
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
