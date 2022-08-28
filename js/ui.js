function createGameOverScene() {
    let scene = new Container();

    const style = new TextStyle({
        fontFamily: "Futura",
        fontSize: 64,
        fill: "white"
    });
    const gameOverMessage = new Text("The End!", style);
    gameOverMessage.x = WIDTH / 2 - 110;
    gameOverMessage.y = HEIGHT / 2 - 32;
    scene.addChild(gameOverMessage);

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