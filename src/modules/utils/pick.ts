/**
 * Create an object composed of the picked object properties
 * @param {Record<string, any>} object
 * @param {string[]} keys
 * @returns {Object}
 */
const pick = (object: Record<string, any>, keys: string[], wildCardKeys?: string[]) => {
  let filter: Record<string, any> = {};
  filter = keys.reduce((obj: any, key: string) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = object[key];
    }
    return obj;
  }, {});
  if (wildCardKeys != null) {
    filter = wildCardKeys.reduce((obj2: any, key: string) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        // eslint-disable-next-line security/detect-non-literal-regexp
        const objectRegex = new RegExp(object[key], 'i');
        // eslint-disable-next-line no-param-reassign,
        obj2[key] = objectRegex;
      }
      return obj2;
    }, filter);
  }
  return filter;
};

export default pick;
