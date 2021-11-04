const jsonfile = require('jsonfile')
const fs = require('fs')
const { capitalCase } = require('capital-case')
const camelCase = require('camelcase')

const integrations = {
    'adroll': 'analytics.js-integration-adroll',
    'adwords': 'analytics.js-integration-adwords',
    'alexa': 'analytics.js-integration-alexa',
    'amplitude': 'analytics.js-integration-amplitude',
    'appcues': 'analytics.js-integration-appcues',
    'atatus': 'analytics.js-integration-atatus',
    'autosend': 'analytics.js-integration-autosend',
    'awesm': 'analytics.js-integration-awesm',
    'bing-ads': 'analytics.js-integration-bing-ads',
    'blueshift': 'analytics.js-integration-blueshift',
    'bronto': 'analytics.js-integration-bronto',
    'bugherd': 'analytics.js-integration-bugherd',
    'bugsnag': 'analytics.js-integration-bugsnag',
    'chameleon': 'analytics.js-integration-chameleon',
    'chartbeat': 'analytics.js-integration-chartbeat',
    'clicktale': 'analytics.js-integration-clicktale',
    'clicky': 'analytics.js-integration-clicky',
    'comscore': 'analytics.js-integration-comscore',
    'crazy-egg': 'analytics.js-integration-crazy-egg',
    'curebit': 'analytics.js-integration-curebit',
    'customerio': 'analytics.js-integration-customerio',
    'drip': 'analytics.js-integration-drip',
    'elevio': 'analytics.js-integration-elevio',
    'errorception': 'analytics.js-integration-errorception',
    'evergage': 'analytics.js-integration-evergage',
    'extole': 'analytics.js-integration-extole',
    'facebook-conversion-tracking': 'analytics.js-integration-facebook-conversion-tracking',
    'facebook-custom-audiences': 'analytics.js-integration-facebook-custom-audiences',
    'foxmetrics': 'analytics.js-integration-foxmetrics',
    'frontleaf': 'analytics.js-integration-frontleaf',
    'fullstory': 'analytics.js-integration-fullstory',
    'gauges': 'analytics.js-integration-gauges',
    'get-satisfaction': 'analytics.js-integration-get-satisfaction',
    'google-analytics': 'analytics.js-integration-google-analytics',
    'google-tag-manager': 'analytics.js-integration-google-tag-manager',
    'gosquared': 'analytics.js-integration-gosquared',
    'heap': 'analytics.js-integration-heap',
    'hellobar': 'analytics.js-integration-hellobar',
    'hittail': 'analytics.js-integration-hittail',
    'hubspot': 'analytics.js-integration-hubspot',
    'improvely': 'analytics.js-integration-improvely',
    'insidevault': 'analytics.js-integration-insidevault',
    'inspectlet': 'analytics.js-integration-inspectlet',
    'intercom': 'analytics.js-integration-intercom',
    'keen-io': 'analytics.js-integration-keen-io',
    'kenshoo': 'analytics.js-integration-kenshoo',
    'kissmetrics': 'analytics.js-integration-kissmetrics',
    'klaviyo': 'analytics.js-integration-klaviyo',
    'livechat': 'analytics.js-integration-livechat',
    'lucky-orange': 'analytics.js-integration-lucky-orange',
    'lytics': 'analytics.js-integration-lytics',
    'mixpanel': 'analytics.js-integration-mixpanel',
    'mojn': 'analytics.js-integration-mojn',
    'mouseflow': 'analytics.js-integration-mouseflow',
    'mousestats': 'analytics.js-integration-mousestats',
    'navilytics': 'analytics.js-integration-navilytics',
    'nudgespot': 'analytics.js-integration-nudgespot',
    'olark': 'analytics.js-integration-olark',
    'optimizely': 'analytics.js-integration-optimizely',
    'outbound': 'analytics.js-integration-outbound',
    'perfect-audience': 'analytics.js-integration-perfect-audience',
    'pingdom': 'analytics.js-integration-pingdom',
    'piwik': 'analytics.js-integration-piwik',
    'preact': 'analytics.js-integration-preact',
    'qualaroo': 'analytics.js-integration-qualaroo',
    'quantcast': 'analytics.js-integration-quantcast',
    'rollbar': 'analytics.js-integration-rollbar',
    'route': 'analytics.js-integration-route',
    'saasquatch': 'analytics.js-integration-saasquatch',
    'satismeter': 'analytics.js-integration-satismeter',
    'segmentio': 'analytics.js-integration-segmentio',
    'sentry': 'analytics.js-integration-sentry',
    'snapengage': 'analytics.js-integration-snapengage',
    'spinnakr': 'analytics.js-integration-spinnakr',
    'supporthero': 'analytics.js-integration-supporthero',
    'taplytics': 'analytics.js-integration-taplytics',
    'tapstream': 'analytics.js-integration-tapstream',
    'trakio': 'analytics.js-integration-trakio',
    'twitter-ads': 'analytics.js-integration-twitter-ads',
    'userlike': 'analytics.js-integration-userlike',
    'uservoice': 'analytics.js-integration-uservoice',
    'vero': 'analytics.js-integration-vero',
    'visual-website-optimizer': 'analytics.js-integration-visual-website-optimizer',
    'webengage': 'analytics.js-integration-webengage',
    'woopra': 'analytics.js-integration-woopra',
    'wootric': 'analytics.js-integration-wootric',
    'yandex-metrica': 'analytics.js-integration-yandex-metrica'
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
        ${camelCase(name)}
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
    console.log(integration)
    if (!fs.existsSync(`../../integrations/${integration}`)) {
        fs.mkdirSync(`../../integrations/${integration}`)
    }
    jsonfile.writeFileSync(`../../integrations/${integration}/package.json`, package(integration, integrations[integration]), { spaces: 2, EOL: '\r\n' })
    fs.writeFileSync(`../../integrations/${integration}/index.js`, index(integration, integrations[integration]))
    fs.writeFileSync(`../../integrations/${integration}/README.md`, readme(integration, integrations[integration]))
}
  