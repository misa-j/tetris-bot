const colors = ["", "one", "two", "three", "four", "five", "six", "seven"];

class Board {
  constructor() {
    this.matrix = [];
    this.makeTable();
  }

  makeTable() {
    for (let i = 0; i < 16; i++) {
      this.matrix.push(new Array(10).fill(0));
    }
  }

  printTable(idxs = {}, type = -1) {
    let matrix = this.matrix;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        if (idxs[i + "-" + j]) {
          div.innerHTML += `<div id=${i + "-" + j} class=${
            colors[type]
          }> </div>`;
        } else if (matrix[i][j]) {
          div.innerHTML += `<div id=${i + "-" + j} class=${
            colors[matrix[i][j]]
          }> </div>`;
        } else div.innerHTML += `<div id=${i + "-" + j} > </div>`;
      }
      div.innerHTML += "<br>";
    }
  }

  getBottomIdxs() {
    let res = {};
    for (let i = 0; i < this.matrix[0].length; i++) {
      for (let j = 0; j < this.matrix.length; j++) {
        if (j === this.matrix.length - 1 && this.matrix[j][i] === 0)
          res[j + "-" + i] = 1;
        else if (this.matrix[j][i]) {
          res[j - 1 + "-" + i] = 1;
          break;
        }
      }
    }
    return res;
  }

  checkRow(n) {
    for (let i = 0; i < this.matrix[0].length; i++) {
      if (this.matrix[n][i] === 0) return false;
    }
    return true;
  }

  countClearedRows() {
    let c = 0;
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.checkRow(i)) c++;
    }
    return c;
  }

  checkTetris() {
    let lastEmptyRow;
    let idx;
    let idxs = [];
    for (let i = 0; i < this.matrix.length; i++) {
      if (this.checkRow(i)) idxs.push(i);
    }

    if (idxs.length) {
      for (let i = 0; i < idxs.length; i++) {
        idx = idxs[i];
        for (let j = 0; j < this.matrix[0].length; j++) {
          this.matrix[idx][j] = 0;
        }
      }

      lastEmptyRow = idxs[idxs.length - 1];

      for (let i = this.matrix.length - 1; i >= 0; i--) {
        if (idxs.includes(i) || i > lastEmptyRow) continue;
        for (let j = this.matrix[0].length - 1; j >= 0; j--) {
          this.matrix[lastEmptyRow][j] = this.matrix[i][j];
        }
        lastEmptyRow--;
      }
    }
  }

  isEmptyRow(n) {
    for (let i = 0; i < this.matrix[0].length; i++) {
      if (this.matrix[n][i] !== 0) return false;
    }
    return true;
  }

  findTopIdx() {
    for (let i = this.matrix.length - 1; i >= 0; i--) {
      if (this.isEmptyRow(i)) return i + 1;
    }
  }

  printTable2() {
    const matrix = this.matrix;

    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[0].length; j++) {
        if (matrix[i][j]) {
          comb.innerHTML += `<div  class=${colors[matrix[i][j]]}> </div>`;
        } else comb.innerHTML += `<div  > </div>`;
      }
      comb.innerHTML += `<br  >`;
    }
    comb.innerHTML += `<hr  >`;
  }

  placeShape(idxs, type) {
    for (let idx in idxs) {
      const [x, y] = idx.split("-").map((n) => parseInt(n));
      this.matrix[x][y] = type;
    }
    //console.log(JSON.parse(JSON.stringify(this.matrix)));
    //console.log(this.findTopIdx());
    //this.printTable2();
    //this.checkTetris();
  }

  removeShape(idxs) {
    for (let idx in idxs) {
      const [x, y] = idx.split("-").map((n) => parseInt(n));
      this.matrix[x][y] = 0;
    }
  }

  getBoard() {
    return this.matrix;
  }
}
