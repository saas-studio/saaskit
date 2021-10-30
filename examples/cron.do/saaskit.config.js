const saaskit = require('saaskit')
var parser = require('cron-parser')

module.exports = {
  domain: 'CRON.do',
  brand: 'SaaS.Dev',
  nouns: {
    cron: {
      url: saaskit.types.url,
      method: ['GET', 'POST'],
      headers: [],
      minute: '*',
      hour: '*',
      daysOfMonth: '*',
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      parseExpression: expression => parser.parseExpression(expression),
      generateExpression: `* ${minute ?? '*'} ${hours ?? '*'} ${minute ?? '*'} ${minute ?? '*'} `,
      trigger: ({cron}) => fetch(url, {method: cron.method, headers: cron.headers})
    },
  },
}
