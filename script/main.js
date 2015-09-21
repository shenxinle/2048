window.addEventListener('DOMContentLoaded', function () {

var cellAttr = {
    width: '20%',
    spacing: '4%'
}
// numCells 用于记录 16 个 cells 的数字、背景色等信息
var numCells = [], score = 0, bestScore = 0;

// 从 localStorage 读取保存的数据 或者 初始化
if(window.localStorage.getItem('numCells')) {
    numCells = JSON.parse(window.localStorage.getItem('numCells'));
} else {
    for(var i = 0; i < 4; i++) {
        numCells[i] = [];
        for(var j = 0; j < 4; j++) {
            numCells[i][j] = {
                top: '0',
                left: '0',
                num: 0,
                color: '#111',
                bgc: '#eee4da',
                merged: false
            }
        }
    }
}
if(window.localStorage.getItem('score')) {
    var scoreObj = JSON.parse(window.localStorage.getItem('score'));
    score = scoreObj.score;
    bestScore = scoreObj.bestScore;
}

generateBgCells();
if(scoreObj) {
    refreshView();
    updateScore();
} else {
    intialNewGame();
}

/*
*  事件绑定：
*  New Game 按钮初始化新游戏
*  上下左右方向键进行游戏
*  离开页面时 localStorage numCells and score
*/
document.querySelector('.header button.new').addEventListener('click', intialNewGame, false);
window.addEventListener('keydown', function (event) {
    if(numCells.moving) {
        return;
    }
    // console.log(event);
    switch(event.keyCode) {
        case 37: // left arrow
            swipeLeft();
            break;
        case 38: // up arrow
            swipeTop();
            break;
        case 39: // right arrow
            swipeRight();
            break;
        case 40: // down arrow
            swipeBottom();
            break;
        default:
            break;
    }
    if(event.keyCode >= 37 && event.keyCode <= 40 && numCells.moving) {
        updateScore();
        setTimeout(function () {
            generateNewNum();
            refreshView();
            numCells.moving = false;

            if(checkGameOver()) {
                gameOver();
            }
        }, 160);
    }
}, false);
touch(document.querySelector('.main'), function (touchObj) {
    if(numCells.moving) {
        return;
    }
    switch(touchObj.swipeDir) {
        case 'swipeLeft': // left arrow
            swipeLeft();
            break;
        case 'swipeTop': // up arrow
            swipeTop();
            break;
        case 'swipeRight': // right arrow
            swipeRight();
            break;
        case 'swipeBottom': // down arrow
            swipeBottom();
            break;
        default:
            break;
    }
    if(touchObj.swipeDir && numCells.moving) {
        updateScore();
        setTimeout(function () {
            generateNewNum();
            refreshView();
            numCells.moving = false;

            if(checkGameOver()) {
                gameOver();
            }
        }, 160);
    }
});
window.addEventListener('unload', function () {
    window.localStorage.setItem('score', JSON.stringify({score: score, bestScore: bestScore}));
    window.localStorage.setItem('numCells', JSON.stringify(numCells));
}, false);

// 初始化生成背景 cells
function generateBgCells() {
    var cells = document.createDocumentFragment();
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            var cell = document.createElement('div');
            cell.className = 'cell cell-' + i + '-' +j;
            cell.style.width = cellAttr.width;
            cell.style.height = cellAttr.width;
            cell.style.top = i * parseFloat(cellAttr.width) + (i+1) * parseFloat(cellAttr.spacing) + '%';
            cell.style.left = j * parseFloat(cellAttr.width) + (j+1) * parseFloat(cellAttr.spacing) + '%';
            cells.appendChild(cell);

            numCells[i][j].top = cell.style.top;
            numCells[i][j].left = cell.style.left;
        }
    }
    document.querySelector('.main .grid-container').appendChild(cells);
}

// 开始新游戏
function intialNewGame() {
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            numCells[i][j].num = 0;
        }
    }
    generateNewNum();
    generateNewNum();
    refreshView();

    score = 0;
    updateScore();

    document.querySelector('.main .finish').style.display = 'none';
    // console.log(emptyNumCells);
    // console.log(numCells);
}

// 在没有数字的区域随机生成新数字 2 或者 4
function generateNewNum() {
    var emptyNumCells = [];
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            if(!numCells[i][j].num) {
                emptyNumCells.push({i: i, j: j});
            }
        }
    }
    if(!emptyNumCells.length) {
        return false;
    }
    var index = Math.floor(Math.random() * emptyNumCells.length);
    var num = Math.random() > 0.33 ? 2 : 4;
    numCells[emptyNumCells[index].i][emptyNumCells[index].j].num = num;
    numCells[emptyNumCells[index].i][emptyNumCells[index].j].bgc = getNumberBgc(num);
    // emptyNumCells.splice(index, 1);
}

// 根据 numCells 刷新游戏界面
function refreshView() {
    var container = document.querySelector('.main .title-container');
    var cells = document.createDocumentFragment();
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            numCells[i][j].merged = false;
            if(numCells[i][j].num > 0) {
                var cell = document.createElement('div');
                cell.style.width = cellAttr.width;
                cell.style.height = cellAttr.width;
                cell.style.top = numCells[i][j].top;
                cell.style.left = numCells[i][j].left;
                cell.style.color = numCells[i][j].color;
                cell.style.backgroundColor = numCells[i][j].bgc;
                cell.innerHTML = numCells[i][j].num;
                cell.className = 'cell cell-' + i + '-' +j;
                cells.appendChild(cell);
            }
        }
    }
    container.innerHTML = '';
    container.appendChild(cells);
}

// 上下左右方向键逻辑
function swipeLeft() {
    for(var i = 0; i < 4; i++) {
        for(var j = 1; j < 4; j++) {
            var cell = numCells[i][j];
            if(cell.num) {
                var k = j-1;
                while(k >= 0) {
                    if(numCells[i][k].num) {
                        if((numCells[i][k].num === cell.num) && !numCells[i][k].merged) {
                            merge(i, j, i, k);
                            break;
                        } else {
                            moveTo(i, j, i, k+1);
                            break;
                        }
                    } else {
                        if(k === 0) {
                            moveTo(i, j, i, 0);
                        }
                        k--;
                    }
                }
            }
        }
    }
}
function swipeRight() {
    for(var i = 0; i < 4; i++) {
        for(var j = 2; j >= 0; j--) {
            var cell = numCells[i][j];
            if(cell.num) {
                var k = j+1;
                while(k <= 3) {
                    if(numCells[i][k].num) {
                        if((numCells[i][k].num === cell.num) && !numCells[i][k].merged) {
                            merge(i, j, i, k);
                            break;
                        } else {
                            moveTo(i, j, i, k-1);
                            break;
                        }
                    } else {
                        if(k === 3) {
                            moveTo(i, j, i, 3);
                        }
                        k++;
                    }
                }
            }
        }
    }
}
function swipeTop() {
    for(var j = 0; j < 4; j++) {
        for(var i = 1; i < 4; i++) {
            var cell = numCells[i][j];
            if(cell.num) {
                var k = i-1;
                while(k >= 0) {
                    if(numCells[k][j].num) {
                        if((numCells[k][j].num === cell.num) && !numCells[k][j].merged) {
                            merge(i, j, k, j);
                            break;
                        } else {
                            moveTo(i, j, k+1, j);
                            break;
                        }
                    } else {
                        if(k === 0) {
                            moveTo(i, j, 0, j);
                        }
                        k--;
                    }
                }
            }
        }
    }
}
function swipeBottom() {
    for(var j = 0; j < 4; j++) {
        for(var i = 2; i >= 0; i--) {
            var cell = numCells[i][j];
            if(cell.num) {
                var k = i+1;
                while(k <= 3) {
                    if(numCells[k][j].num) {
                        if((numCells[k][j].num === cell.num) && !numCells[k][j].merged) {
                            merge(i, j, k, j);
                            break;
                        } else {
                            moveTo(i, j, k-1, j);
                            break;
                        }
                    } else {
                        if(k === 3) {
                            moveTo(i, j, 3, j);
                        }
                        k++;
                    }
                }
            }
        }
    }
}

// 数字移动，动画用 transition
function moveTo(fromi, fromj, toi, toj) {
    if(fromi === toi && fromj === toj) {
        return;
    }
    numCells[toi][toj].num = numCells[fromi][fromj].num;
    numCells[toi][toj].bgc = numCells[fromi][fromj].bgc;
    numCells[fromi][fromj].num = 0;

    var cell = document.querySelector('.title-container .cell-' + fromi + '-' +fromj);
    // console.log(fromi, fromj, toi, toj, cell);
    cell.style.top = numCells[toi][toj].top;
    cell.style.left = numCells[toi][toj].left;

    numCells.moving = true;
}

// 数字合并
function merge(fromi, fromj, toi, toj) {
    numCells[toi][toj].num += numCells[fromi][fromj].num;
    numCells[toi][toj].bgc = getNumberBgc(numCells[toi][toj].num);
    numCells[toi][toj].merged = true;
    numCells[fromi][fromj].num = 0;

    var cell = document.querySelector('.title-container .cell-' + fromi + '-' +fromj);
    cell.style.top = numCells[toi][toj].top;
    cell.style.left = numCells[toi][toj].left;

    score += numCells[toi][toj].num;
    if(bestScore < score) {
        bestScore = score;
    }

    numCells.moving = true;
}

// 更新分数
function updateScore() {
    document.querySelector('.header .score .score-num').textContent = score;
    document.querySelector('.header .best .best-num').textContent = bestScore;
}

// 判断游戏是否结束, 所有相邻数字不相等，且都不为0
function checkGameOver() {
    for(var i = 0; i < 4; i++) {
        for(var j = 0; j < 4; j++) {
            if(i === 3 && j===3) {
                if(numCells[i][j].num === 0) {
                    return false;
                }
            } else if (i === 3) {
                if(numCells[i][j].num === numCells[i][j+1].num || numCells[i][j].num === 0) {
                    return false;
                }
            } else if (j === 3) {
                if(numCells[i][j].num === numCells[i+1][j].num || numCells[i][j].num === 0) {
                    return false;
                }
            } else {
                if(numCells[i][j].num === numCells[i][j+1].num || numCells[i][j].num === numCells[i+1][j].num || numCells[i][j].num === 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

// 游戏结束
function gameOver() {
    var finish = document.querySelector('.main .finish');
    finish.querySelector('.score').textContent = score;
    finish.style.display = 'block';

    finish.querySelector('.back').addEventListener('click', function back() {
        finish.style.display = 'none';
        this.removeEventListener('click', back, false);
    }, false);

    finish.querySelector('.new').addEventListener('click', function newGame() {
        finish.style.display = 'none';
        intialNewGame();
        this.removeEventListener('click', newGame, false);
    }, false);
}

// 不同数字对应的背景色设置
function getNumberBgc(number){
    switch(number){
        case 2: return '#eee4da';
        case 4: return '#ede0c8';
        case 8: return '#f2b179';
        case 16: return '#f59563';
        case 32: return '#f67c5f';
        case 64: return '#f65e3b';
        case 128: return '#edcf72';
        case 256: return '#edcc61';
        case 512: return '#9c0';
        case 1024: return '#33b5e5';
        case 2048: return '#09c';
        case 4096: return '#a6c';
        case 8192: return '#93c';
    }
    return 'white';
}


}, false);