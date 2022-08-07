/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  if (size === 0) {
    return '';
  }
  const arr = string.split('');
  let number = 1;
  return arr.reduce((accumulator, current) => {
    if (accumulator.endsWith(current)) {
      number++;
      return number <= size ? accumulator.concat(current) : accumulator;
    } else {
      number = 1;
      return accumulator.concat(current);
    }
  }, '');
}
