const KvStorage = require('../services/kv-storage');
const constants = require('./constants');
const utils = require('./utils');

function setDefaultLocation(url: string, defaultExtension: string, defaultIndexDocument: string) {
  if (url === '/' && defaultIndexDocument) {
    return defaultIndexDocument;
  }

  const file = url.split('/').pop();
  const extention = file?.split('.').pop();
  if (extention !== file) {
    return url;
  }

  return `${url}.${defaultExtension}`;
}

// module.exports = function kvStorageHandler({
//   kvAccountId: string,
//   kvNamespace: string,
//   kvAuthEmail: string,
//   kvAuthKey: string,
//   kvBasePath = '',
//   kvKey = '{file}',
//   defaultExtension = 'html',
//   defaultIndexDocument: string,
//   defaultErrorDocument: string,
//   mime = {},
//   mode = 'rest',
// }) {
//   const kvStorage = new KvStorage({
//     accountId: kvAccountId,
//     namespace: kvNamespace,
//     authEmail: kvAuthEmail,
//     authKey: kvAuthKey,
//     mode,
//   });

//   const mimeMappings = { ...constants.mime, ...mime };

//   return async (ctx) => {
//     const path = utils.resolveParams(kvKey, ctx.params);

//     const key =
//       path === '' && defaultIndexDocument
//         ? defaultIndexDocument
//         : setDefaultLocation(path, defaultExtension);

//     let result = await kvStorage.get(kvBasePath + key);

//     if (!result && defaultErrorDocument) {
//       result = await kvStorage.get(kvBasePath + defaultErrorDocument);
//     }

//     if (result) {
//       ctx.status = 200;
//       ctx.body = result;
//       ctx.set('Content-Type', mimeMappings[key.split('.').pop()] || 'text/plain');
//     } else {
//       ctx.status = 404;
//       ctx.body = constants.http.statusMessages['404'];
//       ctx.set('Content-Type', 'text/plain');
//     }
//   };
// };