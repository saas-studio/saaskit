import Auth from '@saaskit/auth'
import GithubProvider from '@saaskit/auth/providers/github'

export default Auth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
})