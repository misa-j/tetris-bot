function countHoles(board) {
  let res = 0;
  let flag = true;
  for (let i = 0; i < board[0].length; i++) {
    for (let j = 0; j < board.length; j++) {
      if (flag && board[j][i] === 0) {
        res++;
        flag = false;
      } else if (board[j][i]) flag = true;
    }
    flag = true;
  }
  return res;
}
