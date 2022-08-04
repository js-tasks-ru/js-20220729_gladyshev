/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let newArray = [];
  for (let value of arr) {
    newArray.push(value);
  }
  let sortType = param === 'asc' ? 1 : -1;
  newArray.sort((a, b) => a.localeCompare(b, ['ru-RU-u-kf-upper', 'en-EN-u-kf-upper']) * sortType);
  return newArray;
}
