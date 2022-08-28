const TextStyle = PIXI.TextStyle;

const BIG_TEXT_STYLE = new TextStyle({
    fontFamily: "Futura",
    fontSize: 64,
    fill: "white"
});

const NORMAL_BLACK_TEXT_STYLE = new TextStyle({
    fontFamily: "Futura",
    fontSize: 20,
    fill: "black"
});

const NORMAL_WHITE_TEXT_STYLE = new TextStyle({
    fontFamily: "Futura",
    fontSize: 20,
    fill: "white"
});

function createWelcomeScene(startGame) {
    let scene = new Container();

    // width of the welcomeMessage and welcomeText
    const textWidth = 305;

    // nice line used for aesthetics and measurements
    const line = new Graphics();
    line.lineStyle({width: 2, color: 0xFFFFFF, alpha: 1});
    line.moveTo((WIDTH - textWidth) / 2.0, 60);
    line.lineTo((WIDTH + textWidth) / 2.0, 60);
    line.x = 0;
    line.y = 0;
    scene.addChild(line);

    const welcomeMessage = new Text("Box Evader", BIG_TEXT_STYLE);
    welcomeMessage.x = (WIDTH - textWidth) / 2.0;
    welcomeMessage.y = HEIGHT / 2 - 60;
    scene.addChild(welcomeMessage);

    const welcomeText = new Text("You're Box Evader. You evade boxes.", NORMAL_WHITE_TEXT_STYLE);
    welcomeText.x = (WIDTH - textWidth) / 2.0;
    welcomeText.y = HEIGHT / 2 + 20;
    scene.addChild(welcomeText);

    const startGameButton = new Graphics();
    const startGameButtonWidth = 98;
    const startGameButtonX = (WIDTH - startGameButtonWidth)/2.0;
    const startGameButtonY = welcomeText.y + 35;
    startGameButton.beginFill(0xFFFFFF);
    startGameButton.drawRect(startGameButtonX, startGameButtonY, startGameButtonWidth, 30);
    startGameButton.endFill();
    scene.addChild(startGameButton);
    const enter = keyboard('Enter');
    enter.press = () => {
        if (scene.visible === true) {
            startGame();
        }
    }

    const startGameText = new Text("Press enter", NORMAL_BLACK_TEXT_STYLE);
    startGameText.x = startGameButtonX + 5;
    startGameText.y = startGameButtonY + 5;
    scene.addChild(startGameText);

    scene.visible = false;
    return scene;
}

/**
 * Creates a scene with game over message and button for restarting the game.
 * 
 * @param {function} playAgain Callback for when play again button is clicked.
 * @returns Container with game over scene.
 */
function createGameOverScene(playAgain) {
    let scene = new Container();

    const gameOverMessage = new Text("The End!", BIG_TEXT_STYLE);
    gameOverMessage.x = WIDTH / 2 - 120;
    gameOverMessage.y = HEIGHT / 2 - 32;
    scene.addChild(gameOverMessage);

    const playAgainButton = new Graphics();
    playAgainButton.beginFill(0xFFFFFF);
    playAgainButton.drawRect(gameOverMessage.x + 5, gameOverMessage.y + 70, 230, 30);
    playAgainButton.endFill();
    scene.addChild(playAgainButton);
    const enter = keyboard('Enter');
    enter.press = () => {
        if (scene.visible === true) {
            playAgain();
        }
    }

    const playAgainText = new Text("Press enter to play again", NORMAL_BLACK_TEXT_STYLE);
    playAgainText.x = gameOverMessage.x + 24;
    playAgainText.y = gameOverMessage.y + 75;
    scene.addChild(playAgainText);

    scene.visible = false;
    return scene;
}

function createScoreDisplay() {
    const style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 20,
        fill: "white"
    });
    let msg = new Text("0", style);
    msg.x = 5;
    msg.y = 5;
    return msg;
}