import mongoose from 'mongoose';
import escapeRegex from './escapeRegex';

/**
 * Create an object composed of the picked object properties
 * @param {Record<string, any>} object
 * @param {string[]} keys
 * @param {string[]} wildCardKeys
 * @param {string[]} objectIdKeys
 * @returns {Object}
 */
const pick = (object: Record<string, any>, keys: string[], wildCardKeys?: string[], objectIdKeys?: string[]) => {
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
        const objectRegex = new RegExp(escapeRegex(object[key]), 'i');
        // eslint-disable-next-line no-param-reassign,
        obj2[key] = objectRegex;
      }
      return obj2;
    }, filter);
  }
  if (objectIdKeys != null) {
    filter = objectIdKeys.reduce((obj3: any, key: string) => {
      if (object && Object.prototype.hasOwnProperty.call(object, key)) {
        obj3[key] = new mongoose.Types.ObjectId(object[key]);
      }
      return obj3;
    }, filter);
  }
  return filter;
};

export default pick;
