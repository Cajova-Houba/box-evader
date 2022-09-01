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
    initializeGenericInfoScene(scene, 
        {text:"Box Evader", width:305}, 
        {text:"You're Box Evader. You evade boxes.", width:305},
        {text:"Press enter", width: 88},
        () => {
            if (scene.visible === true) {
                startGame();
            }
        }
    );

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
    initializeGenericInfoScene(scene, {text: "The End!", width: 240}, 
        {text:"Your final score was: 999", width: 210}, 
        {text:"Press enter to play again", width: 195}, 
        () => {
            if (scene.visible === true) {
                playAgain();
            }
        }
    );
    scene.showScore = function(score) {
        this.smallMessage.text = "Your final score was: "+score;
    }
    return scene;
}

function initializeGenericInfoScene(scene, bigText, smallText, buttonText, buttonPressCallback) {
    const textWidth = bigText.width;

    // nice line used for aesthetics and measurements
    const line = new Graphics();
    line.lineStyle({width: 2, color: 0xFFFFFF, alpha: 1});
    line.moveTo((WIDTH - textWidth) / 2.0, (HEIGHT / 2) - 60);
    line.lineTo((WIDTH + textWidth) / 2.0, (HEIGHT / 2) - 60);
    line.x = 0;
    line.y = 0;
    scene.addChild(line);

    const bigMessage = new Text(bigText.text, BIG_TEXT_STYLE);
    bigMessage.x = (WIDTH - textWidth) / 2.0;
    bigMessage.y = HEIGHT / 2 - 60;
    scene.addChild(bigMessage);
    
    const smallTextWidth = smallText.width;
    const smallMessage = new Text(smallText.text, NORMAL_WHITE_TEXT_STYLE);
    smallMessage.x = (WIDTH - smallTextWidth) / 2.0;
    smallMessage.y = HEIGHT / 2 + 20;
    scene.addChild(smallMessage);
    scene.smallMessage = smallMessage;
    
    const wannabeButton = new Graphics();
    const wannabeButtonWidth = buttonText.width + 10;
    const wannabeButtonX = (WIDTH - wannabeButtonWidth)/2.0;
    const wannabeButtonY = smallMessage.y + 35;
    wannabeButton.beginFill(0xFFFFFF);
    wannabeButton.drawRect(wannabeButtonX, wannabeButtonY, wannabeButtonWidth, 30);
    wannabeButton.endFill();
    scene.addChild(wannabeButton);
    const enter = keyboard('Enter');
    enter.press = () => {
        buttonPressCallback();
    }

    const buttonLabel = new Text(buttonText.text, NORMAL_BLACK_TEXT_STYLE);
    buttonLabel.x = wannabeButtonX + 5;
    buttonLabel.y = wannabeButtonY + 5;
    scene.addChild(buttonLabel);

    scene.visible = false;
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