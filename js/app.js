const Graphics = PIXI.Graphics;
const Application = PIXI.Application;
const Container = PIXI.Container;
const loader = PIXI.Loader.shared;
const Text = PIXI.Text;


const WHITE_COLOR = 0xFFFFFF;
const BLACK_COLOR = 0x000000;

const WIDTH = 512;
const HEIGHT = 256;

const PLAYER_WIDTH = 20;
const PLAYER_HEIGHT = 50;
const PLAYER_MAX_VX = 2;
// in ms
const PLAYER_MOVEMENT_DELAY = 10;
const PLAYER_VX = 5;

const PLAYER_INIT_X = 10;
const PLAYER_INIT_Y = HEIGHT - 20 - PLAYER_HEIGHT;

//Create a Pixi Application
const app = new Application({width: WIDTH, height: HEIGHT});
//Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// game objects
let player, floor, boxes, boxSpawner, score;

// game 'infrastructure' objects
let gameScene, gameOverScene, state, scoreMessage, welcomeScene;

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

function GameObject(x, y, width, height, color, lineStyle) {
    let gameObj = new Graphics();
    gameObj.x = x;
    gameObj.y = y;
    gameObj.width = width;
    gameObj.height = height;
    if (lineStyle) {
      gameObj.lineStyle(lineStyle);
    }
    gameObj.beginFill(color);
    gameObj.drawRect(0, 0, width, height);
    gameObj.endFill();
    return gameObj;
}

function createFloor() {
    return GameObject(0, HEIGHT - 20, WIDTH, 5, WHITE_COLOR);
}

function createPlayer() {
    let p = GameObject(PLAYER_INIT_X, PLAYER_INIT_Y, 
      PLAYER_WIDTH, PLAYER_HEIGHT, 
      BLACK_COLOR, {width: 4, color: WHITE_COLOR, alpha: 1}
    );
    p.hp = 100;
    p.vx = 0.0;
    p.lastMove = -1;

    /**
     * Actual movement. Called once per game loop.
     * @returns Nothing
     */
    p.move = function() {
        const now = Date.now();
        if ((now - this.lastMove) < PLAYER_MOVEMENT_DELAY) {
            return;
        }
        this.x += this.vx;
        this.lastMove = now;
        if (this.x < 0) {
            this.x = 0;
        } else if (this.x > (WIDTH - PLAYER_WIDTH)) {
            this.x = (WIDTH - PLAYER_WIDTH);
        }
    };


    /**
     * Sets player's movement direction to right.
     */
    p.moveRight = function() {
        this.vx = PLAYER_VX;
    }
    /**
     * Sets player's movement direction to left.
     */
    p.moveLeft = function() {
        this.vx = -PLAYER_VX;
    }
    /**
     * Sets player's movement direction to 0, thus stopping
     * the movement.
     */
    p.stopMovement = function() {
        this.vx = 0;
    }
    p.reset = function() {
        this.hp = 100;
        this.vx = 0.0;
        this.x = PLAYER_INIT_X;
        this.y = PLAYER_INIT_Y;
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
      k.release = () => {player.stopMovement()}
    });
    [right, rightd, rightD].forEach(k => {
      k.press = () => {player.moveRight()}
      k.hold = () => {player.moveRight()}
      k.release = () => {player.stopMovement()}
    });

    // game over scene
    gameOverScene = createGameOverScene(() => {state = initGame});
    app.stage.addChild(gameOverScene);

    // welcome scene
    welcomeScene = createWelcomeScene(() => {state = initGame});
    app.stage.addChild(welcomeScene);

    state = welcome;

    // game loop
    app.ticker.add((delta) => gameLoop(delta));
}

function gameLoop(delta) {
    state(delta);
}

function welcome() {
    gameScene.visible = false;
    gameOverScene.visible = false;
    welcomeScene.visible = true;
}

function initGame() {
  // reset player 
  player.reset();

  // reset score
  updateScore(0);

  // remove boxes if any
  for(let index = boxes.length - 1; index >= 0; index--) {
      const box = boxes[index];
      gameScene.removeChild(box);
  }
  boxes = new Array();
  
  // setup ui
  gameScene.visible = true;
  gameOverScene.visible = false;
  welcomeScene.visible = false;
  
  state = play;
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
            updateScore(score+1);
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

function updateScore(newScore) {
  score = newScore;
  scoreMessage.text = score;
}
