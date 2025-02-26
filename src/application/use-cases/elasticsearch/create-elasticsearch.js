const { isArray, isDate } = require("lodash");

module.exports = async (repositories, { index, option = {} }, data, isNeedToConvertToInt = false) => {
  const { elasticsearchRepository } = repositories;

  // do validation here

  // modify value to int if possible
  if (isNeedToConvertToInt) {
    if (isArray(data)) data.map((item) => iterateObject(item, modifyValues));
    else iterateObject(data, modifyValues);
  }

  return await elasticsearchRepository.bulk(index, data, option);
};

const modifyValues = (obj, key, value) => (obj[key] = Number(value));

function iterateObject(obj, callback) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        // If the value is an object, recurse
        iterateObject(obj[key], callback);
      } else {
        // If the value is not an object, call the callback
        if (obj[key] && !isNaN(Number(obj[key])) && !isDate(obj[key])) callback(obj, key, obj[key]);
      }
    }
  }
}
