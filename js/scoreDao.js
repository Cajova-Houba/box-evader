/**
 * How many high scores are kept.
 */
const HIGH_SCORE_TABLE_SIZE = 5;

/**
 * Name of the item in localStorage where high score is stored.
 * Also ID of table used to display the high score.
 */
const HIGH_SCORE_ITEM_NAME = "highScoreTable";

/**
 * Obtains and returns the high score table.
 * 
 * @returns {Array} High score table. Nullable.
 */
function getHighScore() {
    return JSON.parse(localStorage.getItem(HIGH_SCORE_ITEM_NAME));
}

/**
 * Store new score. If the score is too low and does not fit in the table,
 * it won't get stored.
 * 
 * @param {number} newScore 
 */
function storeScore(newScore) {
    let highScore = getHighScore();
    const newScoreItem = {
        date: Date.now(),
        score: newScore
    };
    if (highScore == null) {
        // store
        highScore = new Array();
        highScore.push(newScoreItem);
    } else {
        // find position for new score by comparing it with current high scores
        let position = -1;
        for (let index = 0; index < highScore.length; index++) {
            const scoreItem = highScore[index];
            if (scoreItem.score <= newScoreItem.score) {
                position = index;
                break;
            }
        }

        // place the new score into the array or if the
        // new score is the lowest, put it at the end of an array
        if (position == -1) {
            highScore.push(newScoreItem);
        } else {
            highScore.splice(position, 0, newScoreItem);
        }

        // if exceeded the max high score table length, throw out the end
        if (highScore.length > HIGH_SCORE_TABLE_SIZE) {
            highScore = highScore.slice(0, HIGH_SCORE_TABLE_SIZE);
        }

    }

    // store modified high score table
    localStorage.setItem(HIGH_SCORE_ITEM_NAME, JSON.stringify(highScore));
}

function updateHighScoreTable() {
    const table = document.getElementById(HIGH_SCORE_ITEM_NAME);
    const highScore = getHighScore();
    if (table == null) {
        console.warn("No high score table found in page");
        return;
    }

    const tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = "";

    if (highScore != null) {
        for (let index = 0; index < highScore.length; index++) {
            const highScoreItem = highScore[index];
            const highScoreDate = new Date();
            highScoreDate.setTime(highScoreItem.date);
            tbody.innerHTML += `
                <tr>
                    <td>${DATE_FORMATTER.format(highScoreDate)}</td>
                    <td>${highScoreItem.score}</td>
                </tr>
            `;
        }
    }
}