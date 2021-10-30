const saaskit, { ref } = require('saaskit')
const { tweet } = require('@saaskit/twitter')

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
  experiments: [],
  integrations: [
    require('tag-management-studio')('2kN4TuEYatnOex'),
  ],
  plugins: [],
}
