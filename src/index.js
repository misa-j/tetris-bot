const div = document.querySelector(".container");
const comb = document.querySelector(".combinations");
const spawn = document.getElementById("spawn");
const play = document.getElementById("play");
const board = new Board();

board.printTable();

window.onkeydown = function (e) {
  if (!e) e = window.event;
  if (e.keyCode === 32) allCombinations();
  else if (e.keyCode === 38) spawnShape();
};

spawn.addEventListener("click", () => {
  spawnShape();
});

play.addEventListener("click", () => {
  allCombinations();
});

class Shape {
  constructor(matrix, type) {
    this.shape = [];
    this.matrix = matrix;
    this.type = type;
    this.makeShape();
  }

  getType() {
    return this.type;
  }

  getCurrentState() {
    return this.shape;
  }

  resetShape(state) {
    this.shape = JSON.parse(state);
  }

  rotate() {
    let matrix = this.matrix;
    for (let i = 0; i < 4; i++) {
      for (let j = i; j < 4; j++) {
        [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
      }
    }

    for (let i = 0; i < 4; i++) {
      matrix[i].reverse();
    }

    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        this.shape[i][j].val = 0;
        this.shape[i][j].val = matrix[i][j];
      }
    }
  }

  makeShape() {
    let matrix = this.matrix;
    let row;
    for (let i = 0; i < this.matrix.length; i++) {
      row = [];
      for (let j = 0; j < matrix[0].length; j++) {
        row.push({ x: i, y: j + 3, val: this.matrix[i][j] });
      }
      this.shape.push(row);
    }

    //console.log(this.shape);
  }

  moveDown() {
    let matrix = this.shape;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        matrix[i][j].x++;
      }
    }
  }

  moveUp() {
    let matrix = this.shape;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        matrix[i][j].x--;
      }
    }
  }

  dropDown(boardIdxs) {
    let c = 0;
    while (!hasKey(boardIdxs, this.getIdxs())) {
      this.moveDown();
      c++;
    }
    return c;
  }

  canMove(n, board) {
    let matrix = this.shape;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (
          matrix[i][j].val &&
          (matrix[i][j].y + n > 9 ||
            matrix[i][j].y + n < 0 ||
            board[matrix[i][j].x][matrix[i][j].y + n])
        )
          return false;
      }
    }

    return true;
  }

  moveLeftRight(n, board) {
    if (!this.canMove(n, board)) return false;
    let matrix = this.shape;
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        matrix[i][j].y += n;
      }
    }

    return true;
  }

  getIdxs() {
    let matrix = this.shape;
    let res = {};
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (matrix[i][j].val) res[matrix[i][j].x + "-" + matrix[i][j].y] = 1;
      }
    }
    return res;
  }
}

function randomShape() {
  const copy = JSON.parse(JSON.stringify(shapes));
  return copy[Math.floor(Math.random() * copy.length)];
}

let copy = JSON.parse(JSON.stringify(shapes));
let shape, shapeCopy, shapeIdxs;

function spawnShape() {
  copy = JSON.parse(JSON.stringify(shapes));
  shape = new Shape(...randomShape());
  shapeCopy = JSON.stringify(shape.getCurrentState());
  shapeIdxs = shape.getIdxs();
  div.innerHTML = "";
  board.printTable(shapeIdxs, shape.getType());
}

function allCombinations() {
  let movesComb = {};
  let rotations = 0;
  let moveIdx = 0;
  let idx = 0;
  let bestScore = -Infinity;
  for (let i = 0; i < 4; i++) {
    let leftRight = 0;
    let currentShape = JSON.stringify(shape.getCurrentState());
    while (shape.moveLeftRight(leftRight, board.getBoard())) {
      let down = shape.dropDown(board.getBottomIdxs());
      board.placeShape(shape.getIdxs(), shape.getType());
      let score = scoreBoard(board);
      console.log(JSON.parse(JSON.stringify(board.getBoard())), score);
      if (score > bestScore) {
        bestScore = score;
        idx = moveIdx;
      }

      board.removeShape(shape.getIdxs());
      shape.resetShape(currentShape);
      movesComb[moveIdx] = [rotations, leftRight, down];
      leftRight++;
      moveIdx++;
    }

    leftRight = -1;

    while (shape.moveLeftRight(leftRight, board.getBoard())) {
      let down = shape.dropDown(board.getBottomIdxs());
      board.placeShape(shape.getIdxs(), shape.getType());
      let score = scoreBoard(board);
      console.log(JSON.parse(JSON.stringify(board.getBoard())), score);
      if (score > bestScore) {
        bestScore = score;
        idx = moveIdx;
      }

      board.removeShape(shape.getIdxs());
      shape.resetShape(currentShape);
      movesComb[moveIdx] = [rotations, leftRight, down];
      leftRight--;
      moveIdx++;
    }

    rotations++;
    shape.rotate();
    console.log("----------------");
  }
  console.log(movesComb);
  console.log("chosen move", idx);

  shape.resetShape(shapeCopy);

  for (let i = 0; i < movesComb[idx][0]; i++) {
    shape.rotate();
  }

  shape.moveLeftRight(movesComb[idx][1], board.getBoard());
  shape.dropDown(board.getBottomIdxs());
  board.placeShape(shape.getIdxs(), shape.getType());
  shapeIdxs = shape.getIdxs();
  div.innerHTML = "";
  board.printTable(shapeIdxs, shape.getType());
  board.checkTetris();
  div.innerHTML = "";
  board.printTable();
}

function scoreBoard(board) {
  const b = 0.7;
  const c = -0.3;
  const d = -6;
  const e = -0.3;

  const brd = board.getBoard();
  const gaps = findGaps(brd);
  const holes = countHoles(board.getBoard());
  const clearedRows = board.countClearedRows();

  return e * (15 - board.findTopIdx()) + b * clearedRows + c * gaps + holes * d;
}

function findGaps(board) {
  let res = 0;
  let flag = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      if (flag && board[i][j] === 0) {
        res++;
        flag = false;
      } else if (board[i][j]) flag = true;
    }
    flag = true;
  }
  return res;
}

function hasKey(m1, m2) {
  for (let key in m1) {
    if (m2[key]) return true;
  }
  return false;
}
