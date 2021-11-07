function resolveParams(url: string, params: any = {}) {
    return Object.keys(params).reduce((acc, key) => acc.replace(`{${key}}`, params[key]), url);
  }
  
  function instanceToJson(instance: any) {
    return [...instance].reduce((obj, item) => {
      const prop = {};
      // @ts-ignore prefer-destructuring
      prop[item[0]] = item[1];
      return { ...obj, ...prop };
    }, {});
  }
  
  module.exports = {
    instanceToJson,
    resolveParams,
  };