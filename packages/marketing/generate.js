const jsonfile = require('jsonfile')
const fs = require('fs')
const { capitalCase } = require('capital-case')
const camelCase = require('camelcase')

const integrations = {
    'adroll': '@segment/analytics.js-integration-adroll',
    'adwords': '@segment/analytics.js-integration-adwords',
    'alexa': '@segment/analytics.js-integration-alexa',
    'amplitude': '@segment/analytics.js-integration-amplitude',
    'appcues': '@segment/analytics.js-integration-appcues',
    'atatus': '@segment/analytics.js-integration-atatus',
    'autosend': '@segment/analytics.js-integration-autosend',
    'awesm': '@segment/analytics.js-integration-awesm',
    'bing-ads': '@segment/analytics.js-integration-bing-ads',
    'blueshift': '@segment/analytics.js-integration-blueshift',
    'bronto': '@segment/analytics.js-integration-bronto',
    'bugherd': '@segment/analytics.js-integration-bugherd',
    'bugsnag': '@segment/analytics.js-integration-bugsnag',
    'chameleon': '@segment/analytics.js-integration-chameleon',
    'chartbeat': '@segment/analytics.js-integration-chartbeat',
    'clicktale': '@segment/analytics.js-integration-clicktale',
    'clicky': '@segment/analytics.js-integration-clicky',
    'comscore': '@segment/analytics.js-integration-comscore',
    'crazy-egg': '@segment/analytics.js-integration-crazy-egg',
    'curebit': '@segment/analytics.js-integration-curebit',
    'customerio': '@segment/analytics.js-integration-customerio',
    'drip': '@segment/analytics.js-integration-drip',
    'elevio': '@segment/analytics.js-integration-elevio',
    'errorception': '@segment/analytics.js-integration-errorception',
    'evergage': '@segment/analytics.js-integration-evergage',
    'extole': '@segment/analytics.js-integration-extole',
    'facebook-conversion-tracking': '@segment/analytics.js-integration-facebook-conversion-tracking',
    'facebook-custom-audiences': '@segment/analytics.js-integration-facebook-custom-audiences',
    'foxmetrics': '@segment/analytics.js-integration-foxmetrics',
    'frontleaf': '@segment/analytics.js-integration-frontleaf',
    'fullstory': '@segment/analytics.js-integration-fullstory',
    'gauges': '@segment/analytics.js-integration-gauges',
    'get-satisfaction': '@segment/analytics.js-integration-get-satisfaction',
    'google-analytics': '@segment/analytics.js-integration-google-analytics',
    'google-tag-manager': '@segment/analytics.js-integration-google-tag-manager',
    'gosquared': '@segment/analytics.js-integration-gosquared',
    'heap': '@segment/analytics.js-integration-heap',
    'hellobar': '@segment/analytics.js-integration-hellobar',
    'hittail': '@segment/analytics.js-integration-hittail',
    'hubspot': '@segment/analytics.js-integration-hubspot',
    'improvely': '@segment/analytics.js-integration-improvely',
    'insidevault': '@segment/analytics.js-integration-insidevault',
    'inspectlet': '@segment/analytics.js-integration-inspectlet',
    'intercom': '@segment/analytics.js-integration-intercom',
    'keen-io': '@segment/analytics.js-integration-keen-io',
    'kenshoo': '@segment/analytics.js-integration-kenshoo',
    'kissmetrics': '@segment/analytics.js-integration-kissmetrics',
    'klaviyo': '@segment/analytics.js-integration-klaviyo',
    'livechat': '@segment/analytics.js-integration-livechat',
    'lucky-orange': '@segment/analytics.js-integration-lucky-orange',
    'lytics': '@segment/analytics.js-integration-lytics',
    'mixpanel': '@segment/analytics.js-integration-mixpanel',
    'mojn': '@segment/analytics.js-integration-mojn',
    'mouseflow': '@segment/analytics.js-integration-mouseflow',
    'mousestats': '@segment/analytics.js-integration-mousestats',
    'navilytics': '@segment/analytics.js-integration-navilytics',
    'nudgespot': '@segment/analytics.js-integration-nudgespot',
    'olark': '@segment/analytics.js-integration-olark',
    'optimizely': '@segment/analytics.js-integration-optimizely',
    'outbound': '@segment/analytics.js-integration-outbound',
    'perfect-audience': '@segment/analytics.js-integration-perfect-audience',
    'pingdom': '@segment/analytics.js-integration-pingdom',
    'piwik': '@segment/analytics.js-integration-piwik',
    'preact': '@segment/analytics.js-integration-preact',
    'qualaroo': '@segment/analytics.js-integration-qualaroo',
    'quantcast': '@segment/analytics.js-integration-quantcast',
    'rollbar': '@segment/analytics.js-integration-rollbar',
    'route': '@segment/analytics.js-integration-route',
    'saasquatch': '@segment/analytics.js-integration-saasquatch',
    'satismeter': '@segment/analytics.js-integration-satismeter',
    'segmentio': '@segment/analytics.js-integration-segmentio',
    'sentry': '@segment/analytics.js-integration-sentry',
    'snapengage': '@segment/analytics.js-integration-snapengage',
    'spinnakr': '@segment/analytics.js-integration-spinnakr',
    'supporthero': '@segment/analytics.js-integration-supporthero',
    'taplytics': '@segment/analytics.js-integration-taplytics',
    'tapstream': '@segment/analytics.js-integration-tapstream',
    'trakio': '@segment/analytics.js-integration-trakio',
    'twitter-ads': '@segment/analytics.js-integration-twitter-ads',
    'userlike': '@segment/analytics.js-integration-userlike',
    'uservoice': '@segment/analytics.js-integration-uservoice',
    'vero': '@segment/analytics.js-integration-vero',
    'visual-website-optimizer': '@segment/analytics.js-integration-visual-website-optimizer',
    'webengage': '@segment/analytics.js-integration-webengage',
    'woopra': '@segment/analytics.js-integration-woopra',
    'wootric': '@segment/analytics.js-integration-wootric',
    'yandex-metrica': '@segment/analytics.js-integration-yandex-metrica'
  }

function package(name, package) {
    return {
        "name": `@saaskit/${name}`,
        "version": "0.2.0",
        "private": false,
        "description": `SaaSkit integration with ${capitalCase(name)}`,
        "repository": `saas-studio/saaskit/integrations/${name}`,
        "homepage": `https://saaskit.js.org/integrations/${name}`,
        "keywords": ["saas","analytics","saaskit",`saaskit-${name}`, name],
        "author": "SaaS.Dev",
        "license": "MIT",
        "main": "index.js",
        "dependencies": {
          [name]: package,
          "saaskit": "latest"
        }
    }
}

function index(name, package) {
    return `
    import ${camelCase(name)} from '${package}'

    export default {
        analytics: {
            ${camelCase(name)}
        }
    }
    `
}

function readme(name) {
    return `
# **SaaS**kit.js Integration with ${capitalCase(name)}

[**SaaS**kit.js](https://saaskit.js.org) from [SaaS.Dev](https://saas.dev) provides an integration with [${capitalCase(name)}](https://saaskit.js.org/integrations/${name})
`
}

for (integration in integrations) {
    console.log(`${capitalCase(integration)},${integration},${camelCase(integration)},${`@saaskit/${integration}`}`)
    if (!fs.existsSync(`../../integrations/${integration}`)) {
        fs.mkdirSync(`../../integrations/${integration}`)
    }
    jsonfile.writeFileSync(`../../integrations/${integration}/package.json`, package(integration, integrations[integration]), { spaces: 2, EOL: '\r\n' })
    fs.writeFileSync(`../../integrations/${integration}/index.js`, index(integration, integrations[integration]))
    fs.writeFileSync(`../../integrations/${integration}/README.md`, readme(integration, integrations[integration]))
}
  