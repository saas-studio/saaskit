const jsonfile = require('jsonfile')
const fs = require('fs')
const { capitalCase } = require('capital-case')
const camelCase = require('camelcase')

const providers = {
    analytics: {
    'adroll': { 
        packages: {
            '@segment/analytics.js-integration-adroll': 'latest',
        }
    },
    'adwords': { 
        packages: {
            '@segment/analytics.js-integration-adwords': 'latest',
        }     
    },
    'alexa': { 
        packages: {
            '@segment/analytics.js-integration-alexa': 'latest',
        }     
    },
    'amplitude': { 
        packages: {
            '@segment/analytics.js-integration-amplitude': 'latest',
        }     
    },
    'appcues': { 
        packages: {
            '@segment/analytics.js-integration-appcues': 'latest',
        }     
    },
    'atatus': { 
        packages: {
            '@segment/analytics.js-integration-atatus': 'latest',
        }     
    },
    'autosend': { 
        packages: {
            '@segment/analytics.js-integration-autosend': 'latest',
        }     
    },
    'awesm': { 
        packages: {
            '@segment/analytics.js-integration-awesm': 'latest',
        }     
    },
    'bing-ads': { 
        packages: {
            '@segment/analytics.js-integration-bing-ads': 'latest',
        }     
    },
    'blueshift': { 
        packages: {
            '@segment/analytics.js-integration-blueshift': 'latest',
        }     
    },
    'bronto': { 
        packages: {
            '@segment/analytics.js-integration-bronto': 'latest',
        }     
    },
    'bugherd': { 
        packages: {
            '@segment/analytics.js-integration-bugherd': 'latest',
        }     
    },
    'bugsnag': { 
        packages: {
            '@segment/analytics.js-integration-bugsnag': 'latest',
        }     
    },
    'chameleon': { 
        packages: {
            '@segment/analytics.js-integration-chameleon': 'latest',
        }     
    },
    'chartbeat': { 
        packages: {
            '@segment/analytics.js-integration-chartbeat': 'latest',
        }     
    },
    'clicktale': { 
        packages: {
            '@segment/analytics.js-integration-clicktale': 'latest',
        }     
    },
    'clicky': { 
        packages: {
            '@segment/analytics.js-integration-clicky': 'latest',
        }     
    },
    'comscore': { 
        packages: {
            '@segment/analytics.js-integration-comscore': 'latest',
        }     
    },
    'crazy-egg': { 
        packages: {
            '@segment/analytics.js-integration-crazy-egg': 'latest',
        }     
    },
    'curebit': { 
        packages: {
            '@segment/analytics.js-integration-curebit': 'latest',
        }     
    },
    'customerio': { 
        packages: {
            '@segment/analytics.js-integration-customerio': 'latest',
        }     
    },
    'drip': { 
        packages: {
            '@segment/analytics.js-integration-drip': 'latest',
        }     
    },
    'elevio': { 
        packages: {
            '@segment/analytics.js-integration-elevio': 'latest',
        }     
    },
    'errorception': { 
        packages: {
            '@segment/analytics.js-integration-errorception': 'latest',
        }     
    },
    'evergage': { 
        packages: {
            '@segment/analytics.js-integration-evergage': 'latest',
        }     
    },
    'extole': { 
        packages: {
            '@segment/analytics.js-integration-extole': 'latest',
        }     
    },
    'facebook-conversion-tracking': { 
        packages: {
            '@segment/analytics.js-integration-facebook-conversion-tracking': 'latest',
        }     
    },
    'facebook-custom-audiences': { 
        packages: {
            '@segment/analytics.js-integration-facebook-custom-audiences': 'latest',
        }     
    },
    'foxmetrics': { 
        packages: {
            '@segment/analytics.js-integration-foxmetrics': 'latest',
        }     
    },
    'frontleaf': { 
        packages: {
            '@segment/analytics.js-integration-frontleaf': 'latest',
        }     
    },
    'fullstory': { 
        packages: {
            '@segment/analytics.js-integration-fullstory': 'latest',
        }     
    },
    'gauges': { 
        packages: {
            '@segment/analytics.js-integration-gauges': 'latest',
        }     
    },
    'get-satisfaction': { 
        packages: {
            '@segment/analytics.js-integration-get-satisfaction': 'latest',
        }     
    },
    'google-analytics': { 
        packages: {
            '@segment/analytics.js-integration-google-analytics': 'latest',
        }     
    },
    'google-tag-manager': { 
        packages: {
            '@segment/analytics.js-integration-google-tag-manager': 'latest',
        }     
    },
    'gosquared': { 
        packages: {
            '@segment/analytics.js-integration-gosquared': 'latest',
        }     
    },
    'heap': { 
        packages: {
            '@segment/analytics.js-integration-heap': 'latest',
        }     
    },
    'hellobar': { 
        packages: {
            '@segment/analytics.js-integration-hellobar': 'latest',
        }     
    },
    'hittail': { 
        packages: {
            '@segment/analytics.js-integration-hittail': 'latest',
        }     
    },
    'hubspot': { 
        packages: {
            '@segment/analytics.js-integration-hubspot': 'latest',
        }     
    },
    'improvely': { 
        packages: {
            '@segment/analytics.js-integration-improvely': 'latest',
        }     
    },
    'insidevault': { 
        packages: {
            '@segment/analytics.js-integration-insidevault': 'latest',
        }     
    },
    'inspectlet': { 
        packages: {
            '@segment/analytics.js-integration-inspectlet': 'latest',
        }     
    },
    'intercom': { 
        packages: {
            '@segment/analytics.js-integration-intercom': 'latest',
        }     
    },
    'keen-io': { 
        packages: {
            '@segment/analytics.js-integration-keen-io': 'latest',
        }     
    },
    'kenshoo': { 
        packages: {
            '@segment/analytics.js-integration-kenshoo': 'latest',
        }     
    },
    'kissmetrics': { 
        packages: {
            '@segment/analytics.js-integration-kissmetrics': 'latest',
        }     
    },
    'klaviyo': { 
        packages: {
            '@segment/analytics.js-integration-klaviyo': 'latest',
        }     
    },
    'livechat': { 
        packages: {
            '@segment/analytics.js-integration-livechat': 'latest',
        }     
    },
    'lucky-orange': { 
        packages: {
            '@segment/analytics.js-integration-lucky-orange': 'latest',
        }     
    },
    'lytics': { 
        packages: {
            '@segment/analytics.js-integration-lytics': 'latest',
        }     
    },
    'mixpanel': { 
        packages: {
            '@segment/analytics.js-integration-mixpanel': 'latest',
        }     
    },
    'mojn': { 
        packages: {
            '@segment/analytics.js-integration-mojn': 'latest',
        }     
    },
    'mouseflow': { 
        packages: {
            '@segment/analytics.js-integration-mouseflow': 'latest',
        }     
    },
    'mousestats': { 
        packages: {
            '@segment/analytics.js-integration-mousestats': 'latest',
        }     
    },
    'navilytics': { 
        packages: {
            '@segment/analytics.js-integration-navilytics': 'latest',
        }     
    },
    'nudgespot': { 
        packages: {
            '@segment/analytics.js-integration-nudgespot': 'latest',
        }     
    },
    'olark': { 
        packages: {
            '@segment/analytics.js-integration-olark': 'latest',
        }     
    },
    'optimizely': { 
        packages: {
            '@segment/analytics.js-integration-optimizely': 'latest',
        }     
    },
    'outbound': { 
        packages: {
            '@segment/analytics.js-integration-outbound': 'latest',
        }     
    },
    'perfect-audience': { 
        packages: {
            '@segment/analytics.js-integration-perfect-audience': 'latest',
        }     
    },
    'pingdom': { 
        packages: {
            '@segment/analytics.js-integration-pingdom': 'latest',
        }     
    },
    'piwik': { 
        packages: {
            '@segment/analytics.js-integration-piwik': 'latest',
        }     
    },
    'preact': { 
        packages: {
            '@segment/analytics.js-integration-preact': 'latest',
        }     
    },
    'qualaroo': { 
        packages: {
            '@segment/analytics.js-integration-qualaroo': 'latest',
        }     
    },
    'quantcast': { 
        packages: {
            '@segment/analytics.js-integration-quantcast': 'latest',
        }     
    },
    'rollbar': { 
        packages: {
            '@segment/analytics.js-integration-rollbar': 'latest',
        }     
    },
    'route': { 
        packages: {
            '@segment/analytics.js-integration-route': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'firebase': 'latest',
        }     
    },
    'saasquatch': { 
        packages: {
            '@segment/analytics.js-integration-saasquatch': 'latest',
        }     
    },
    'satismeter': { 
        packages: {
            '@segment/analytics.js-integration-satismeter': 'latest',
        }     
    },
    'segmentio': { 
        packages: {
            '@segment/analytics.js-integration-segmentio': 'latest',
        }     
    },
    'sentry': { 
        packages: {
            '@segment/analytics.js-integration-sentry': 'latest',
        }     
    },
    'snapengage': { 
        packages: {
            '@segment/analytics.js-integration-snapengage': 'latest',
        }     
    },
    'spinnakr': { 
        packages: {
            '@segment/analytics.js-integration-spinnakr': 'latest',
        }     
    },
    'supporthero': { 
        packages: {
            '@segment/analytics.js-integration-supporthero': 'latest',
        }     
    },
    'taplytics': { 
        packages: {
            '@segment/analytics.js-integration-taplytics': 'latest',
        }     
    },
    'tapstream': { 
        packages: {
            '@segment/analytics.js-integration-tapstream': 'latest',
        }     
    },
    'trakio': { 
        packages: {
            '@segment/analytics.js-integration-trakio': 'latest',
        }     
    },
    'twitter-ads': { 
        packages: {
            '@segment/analytics.js-integration-twitter-ads': 'latest',
        }     
    },
    'userlike': { 
        packages: {
            '@segment/analytics.js-integration-userlike': 'latest',
        }     
    },
    'uservoice': { 
        packages: {
            '@segment/analytics.js-integration-uservoice': 'latest',
        }     
    },
    'vero': { 
        packages: {
            '@segment/analytics.js-integration-vero': 'latest',
        }     
    },
    'visual-website-optimizer': { 
        packages: {
            '@segment/analytics.js-integration-visual-website-optimizer': 'latest',
        }     
    },
    'webengage': { 
        packages: {
            '@segment/analytics.js-integration-webengage': 'latest',
        }     
    },
    'woopra': { 
        packages: {
            '@segment/analytics.js-integration-woopra': 'latest',
        }     
    },
    'wootric': { 
        packages: {
            '@segment/analytics.js-integration-wootric': 'latest',
        }     
    },
    'yandex-metrica': { 
        packages: {
            '@segment/analytics.js-integration-yandex-metrica': 'latest',
        }     
    }
  },
  api: {
    'twilio': { 
        packages: {
            'twilio': 'latest',
        }     
    },
    'github': { 
        packages: {
            'twilio': 'latest',
        }     
    },
    'sendgrid': { 
        packages: {
            '@sendgrid/client': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'firebase': 'latest',
        }     
    },
    'slack': { 
        packages: {
            'slack': 'latest',
        }     
    },
    'zapier': { 
        packages: {
            'zapier': 'latest',
        }     
    },
  },
  auth: {
    'auth0': { 
        packages: {
            '@segment/analytics.js-integration-adroll': 'nextjs-auth0',
            'auth0-react': 'latest',
        }     
    },
    'clerk': { 
        packages: {
            '@clerk/clerk-js': 'latest',
        }     
    },
    'firebase': { 
        packages: {
            'firebase': 'latest',
        }     
    },
    'next-auth': { 
        packages: {
            'next-auth': 'beta',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'supabase': { 
        packages: {
            '@supabase/supabase-js': 'latest',
        }     
    },
  },
  cms: {
    'formspree': { 
        packages: {
            '@formspree/core': 'latest',
            '@formspree/react': 'latest',
        }     
    },
    'editmode': { 
        packages: {
            'editmode-react': 'latest',
            'editmode-standalone': 'latest',
        }     
    },
    'contentful': { 
        packages: {
            'contentful': 'latest',
        }     
    },
    'sanity': { 
        packages: {
            'sanity': 'latest',
            '@sanity/client': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'datocms': { 
        packages: {
            'react-datocms': 'latest',
            'datocms-client': 'latest',
        }     
    },
    'headlessly': { 
        packages: {
            'headless.ly': 'latest',
        }     
    },
    'buttercms': { 
        packages: {
            'buttercms': 'latest',
        }     
    },
    'graphcms': { 
        packages: {
            '@graphcms/management': 'latest',
            '@graphcms/uix-react-sdk': 'latest',
        }     
    },
  },
  data: {
    'airtable': { 
        packages: {
            'firebase': 'latest',
        }     
    },
    'fauna': { 
        packages: [],
    },
    'firebase': { 
        packages: {
            'firebase': 'latest',
        }     
    },
    'planetscale': { 
        packages: {
            'planetscale-node': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'upstash': { 
        packages: {
            '@upstash/upstash-redis': 'latest',
        }     
    },
  },
  hosting: {
    'aws': { 
        packages: {
            'aws-sdk': 'latest',
        }     
    },
    'azure': { 
        packages: {
            'azure': 'latest',
        }     
    },
    'cloudflare': { 
        packages: {
            'cloudflare': 'latest',
        }     
    },
    'netlify': { 
        packages: {
            'netlify': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'vercel': { 
        packages: {
            'vercel': 'latest',
        }     
    },
  },
  logging: {
    'datadog': { 
        packages: {
            '@datadog/browser-core': 'latest',
            '@datadog/datadog-api-client': 'latest',
        }     
    },
    'logtail': { 
        packages: {
            '@logtail/js': 'latest',
            '@logtail/node': 'latest',
        }     
    },
    'logalert': { 
        packages: {
            'logalert': 'latest',
        }     
    },
    'logg.ng': { 
        packages: {
            'logg.ng': 'latest',
        }     
    },
    'logrocket': { 
        packages: {
            'logrocket': 'latest',
        }     
    },
    'sematext': { 
        packages: {
            '@sematext/sematext-api-client': 'latest',
            '@sematext/logagent': 'latest',
        }     
    },
    'logflare': { 
        packages: {
            'pino-logflare': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'logdna': { 
        packages: {
            'logdna': 'latest',
        }     
    },
  },
  monitoring: {
    'checkly': { 
        packages: {
            'checkly': 'latest',
        }     
    },
    'datadog': { 
        packages: {
            '@datadog/browser-core': 'latest',
            '@datadog/datadog-api-client': 'latest',
        }     
    },
    'debugbear': { 
        packages: {
            'debugbear': 'latest',
        }     
    },
    'logrocket': { 
        packages: {
            'logrocket': 'latest',
        }     
    },
    'saas.dev': { 
        packages: {
            'saas.dev': 'latest',
        }     
    },
    'sentry': { 
        packages: {
            '@sentry/browser': 'latest',
            '@sentry/nextjs': 'latest',
        }     
    },
    'rollbar': { 
        packages: {
            'rollbar': 'latest',
        }     
    },
  },
  repoProviders: {
    'bitbucket': { 
        packages: {
            'bitbucket': 'latest',
        }     
    },
    'github': { 
        packages: {
            'twilio': 'latest',
        }     
    },
    'gitlab': { 
        packages: {
            '@gitbeaker/node': 'latest',
        }     
    },
  }
}

function package(name, category, packages) {
    const saaskit = { "saaskit": "latest" }
    console.log(packages)
    const dependencies = packages
    return {
        "name": `@saaskit/${name}`,
        "version": "0.2.0",
        "private": false,
        "description": `SaaSkit integration with ${capitalCase(name)}`,
        "repository": `saas-studio/saaskit/integrations/${name}`,
        "homepage": `https://saaskit.js.org/integrations/${name}`,
        "keywords": ["saas","saaskit",`saaskit-${name}`, name, category],
        "author": "SaaS.Dev",
        "license": "MIT",
        "main": "index.js",
        "dependencies": {
          ...packages,  
          ...saaskit,
        }
    }
}

function index(name, provider, packages) {
    return `
    import ${camelCase(name)} from '${Object.keys(packages)[0]}'

    export default {
        ${provider}: {
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

for (provider in providers) {
    console.log(provider)
    for (integration in providers[provider]) {
        console.log(providers[provider][integration])
        // console.log(`${capitalCase(integration)},${integration},${camelCase(integration)},${`@saaskit/${integration}`}`)
        const packages = providers[provider][integration].packages
        console.log(packages)
        if (!fs.existsSync(`../../integrations/${integration}`)) {
            fs.mkdirSync(`../../integrations/${integration}`)
        }
        jsonfile.writeFileSync(`../../integrations/${integration}/package.json`, package(integration, provider, packages), { spaces: 2, EOL: '\r\n' })
        fs.writeFileSync(`../../integrations/${integration}/index.js`, index(integration,  provider, packages))
        fs.writeFileSync(`../../integrations/${integration}/README.md`, readme(integration, packages))
    }
}
  