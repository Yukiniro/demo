export function sodoku(arr) {
  const cloneArr = JSON.parse(JSON.stringify(arr));
  const check = (i, j, target, value) => {
    for (let m = 0; m < 9; m++) {
      if (target[i][m] === value || target[m][j] === value) {
        return false;
      }
    }

    const boxStartRow = Math.floor(i / 3) * 3;
    const boxStartCol = Math.floor(j / 3) * 3;

    for (let m = boxStartRow; m < boxStartRow + 3; m++) {
      for (let n = boxStartCol; n < boxStartCol + 3; n++) {
        if (target[m][n] === value) {
          return false;
        }
      }
    }

    return true;
  };
  const fillValue = () => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (cloneArr[i][j] === ".") {
          for (let value = 1; value <= 9; value++) {
            const strValue = value.toString();
            if (check(i, j, cloneArr, strValue)) {
              cloneArr[i][j] = strValue;
              if (fillValue()) return true;
              cloneArr[i][j] = ".";
            }
          }
          return false;
        }
      }
    }
    return true;
  };
  fillValue();
  return cloneArr;
}
