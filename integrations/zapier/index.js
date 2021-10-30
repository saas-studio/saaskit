// You'll want to set these with either `CLIENT_ID=abc zapier test` or `zapier env 1.0.0 CLIENT_ID abc`
process.env.BASE_URL = process.env.BASE_URL || 'https://auth-json-server.zapier.ninja';
process.env.CLIENT_ID = process.env.CLIENT_ID || '1234';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || 'asdf';

const authentication = require('./authentication');

// To include the Authorization header on all outbound requests, simply define a function here.
// It runs runs before each request is sent out, allowing you to make tweaks to the request in a centralized spot
const includeBearerToken = (request, z, bundle) => {
  if (bundle.authData.access_token) {
    request.headers.Authorization = `Bearer ${bundle.authData.access_token}`;
  }
  return request;
};

const App = {
  // This is just shorthand to reference the installed dependencies you have. Zapier will
  // need to know these before we can upload
  version: require('./package.json').version,
  platformVersion: require('zapier-platform-core').version,

  authentication: authentication,

  beforeRequest: [
    includeBearerToken
  ],

  afterResponse: [
  ],

  resources: {
  },

  // If you want your trigger to show up, you better include it here!
  triggers: {
    [people.key]: people,
    [species.key]: species,
  },

  searches: { [RecipeSearch.key]: RecipeSearch },

  creates: { [RecipeCreate.key]: RecipeCreate },

  searchOrCreates: {
    [RecipeSearch.key]: {
      // The key must match the search
      key: RecipeSearch.key, // same as above
      display: {
        // The label shows up when the search-or-create checkbox is checked.
        // See https://cdn.zappy.app/5fc31d104c6bd0050c44510557b3b98f.png
        label: 'Find or Create a Recipe',
        description: 'x', // this is ignored
      },
      search: RecipeSearch.key,
      create: RecipeCreate.key,
    },
  },
};

// Finally, export the app.
module.exports = App;