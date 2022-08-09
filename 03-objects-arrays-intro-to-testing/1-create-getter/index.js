/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  return function (object) {
    const array = path.split('.');
    return getter(object, array);
  };
}

const getter = function (object, array) {
  const pathPart = array.splice(0, 1);
  if (pathPart.length === 0) {
    return object;
  }
  const value = object[pathPart];
  return value ? getter(value, array) : value;
};
