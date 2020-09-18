export * from './addOfRows';
export * from './config';

export const gitChangeRowNumber = (str: string) => {
  const strRows = str.split(/\n/g);
  const okReg = /^\+/g
  const subReg = /^\-/g
  let chunkRow = parseInt(str.split('+')[1].split(',')[0]);
  const rows = [];
  for (let [index, row] of strRows.entries()) {
      if (row.match(okReg)) {
          rows.push(chunkRow + index - 1);
      }
      if (row.match(subReg)) {
          chunkRow = chunkRow - 1;
      }
  };
  return rows;
}
