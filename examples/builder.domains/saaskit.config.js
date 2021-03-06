const stripe = require('saaskit-stripe')('pk_live_51IYBWQHednQ8H7dFP774NG71cAhI6Ki72P4l06H1HoDhiE8LGETwx87B6wICk6pMsSrA7ji4pjcSYGpQQrnXl7Ye00gRcLDR4e')

export const app = (saaskit) => { 
  return {
    persona: 'Builder',
    problem: {
      internal: 'More ideas than money',
      external: 'Needs to buy a domain name',
      philosophical: 'Pay up for a premium domain vs Settle for a bad name',
    },
    solution: 'Builder.Domains',
    brand: 'SaaS.Dev',
    offer: 'Infinite Free Domain Names',
    callToAction: {
      build: { domains: 5, monthlyPrice: 0 },
      grow: { domains: 50, monthlyPrice: 10 },
      expand: { domains: 1000, monthlyPrice: 100 },
    },
    failure: 'Years of horrible names',
    success: {
      goal: 'Having domain names for every idea',
      transformation: { from: 'Loser', to: 'Hero' }
    },
    theme: {
      color: 'indigo',
      font: 'san-francisco',
      logo: saaskit.wordmark({font: 'massive'}),
      darkMode: true,
    },
    nouns: {
      domains: {
        name: `${subdomain}.${baseDomain}`,
        url: `https://${subdomain}.${baseDomain}`,
        subdomain: propType.string,
        cname: propType.string,
      },
      baseDomains: [
        'ai.net.ar', 'app.associates', 'app.gr.com', 'app.hu.net', 'as.ls', 'as.wtf', 'dev.mw', 'dev.td', 'dev.cfd', 'for.as', 
        'for.eu.com', 'hm.cfd', 'hq.sb', 'izes.app', 'ing.bj', 'io.mw', 'js.ht', 'kit.mt', 'landingpa.ge', 'ly.com.se', 
        'ly.cfd', 'management.yt', 'ng.mw', 'ng.app', 'pp.sd', 's.works', 'sh.sb', 'site.as', 'site.cfd', 'site.gd', 
        'site.tg', 'studio.sc', 'with.cfd'
      ],
    },
    verbs: {},
    experiments: [],
    prices: [stripe('price_1ImL2WHednQ8H7dFlzZc7Obx'),stripe('price_1ImL3AHednQ8H7dFbmNixzAt')],
    integrations: [
      require('tag-management-studio')('2kN4TuEYatnOex'),
    ],
    plugins: [
      require('@saaskit/api'),
    ],
  }
}

export const api = {
  proxy: ({req, domains}) => {
    const url = new URL(req.url)
    const domain = domains.find({name: url.hostname})
    url.hostname = domain.cname
    return fetch(url.toString(), req)
  }
}