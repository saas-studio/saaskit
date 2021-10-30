const saaskit, { ref } = require('saaskit')
const { tweet } = require('saaskit-twitter')
const stripe = require('saaskit-stripe')('pk_live_51IYBWQHednQ8H7dFP774NG71cAhI6Ki72P4l06H1HoDhiE8LGETwx87B6wICk6pMsSrA7ji4pjcSYGpQQrnXl7Ye00gRcLDR4e')

module.exports = {
  domain: 'blogs.sh',
  brand: 'longtail.studio',
  theme: {
    color: 'orange',
    font: 'pacifico',
    logo: saaskit.wordmark({font: 'massive'}),
    darkMode: true,
  },
  nouns: {
    blog: {
      name: 'string',
      tagline: 'string?',
      published: 'date?',
      posts: ref.post
    },
    post: {
      title: 'string',
      subtitle: 'string?',
      content: 'markdown',
      image: 'image',
      author: ref.author,
      tweet: post =>  tweet(post),
    },
    author: {
      name: 'string',
      photo: 'image',
      bio: 'markdown',
      links: ['url'],
    }
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
