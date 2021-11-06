import 'tailwindcss/tailwind.css'
// import { SessionProvider } from 'next-auth/react'
// import { UserProvider } from '@auth0/nextjs-auth0'
import { Auth0Provider } from '@auth0/auth0-react'

export default function App({ Component, pageProps }) {
  return (
    // <Component {...pageProps} />
    // <UserProvider>
    //   <Component {...pageProps} />
    // </UserProvider>
    <Auth0Provider
        domain="auth.saas.dev"
        clientId="aAfDBc9nGtqrPEYMMemAubMrovac3QgO"
        redirectUri={typeof window !== 'undefined' && window.location.origin}
        // onRedirectCallback={onRedirectCallback}
      >
      <Component {...pageProps} />
    </Auth0Provider>
  )
}

// export default function App({
//   Component,
//   pageProps: { session, ...pageProps },
// }) {
//   return (
//     <SessionProvider session={session}>
//       <Component {...pageProps} />
//     </SessionProvider>
//   )
// }