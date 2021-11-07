import 'tailwindcss/tailwind.css'
import 'nextra-theme-docs/style.css'
import { Auth0Provider } from '@auth0/auth0-react';


export default function Nextra({ Component, pageProps }) {
  return (
    <Auth0Provider
      domain="auth.saas.dev"
      clientId="WNVD31oeygTWHjNsWrq4Ru8QcOiN2ScS"
      redirectUri={'https://saaskit.js.org'}
    >
      <Component {...pageProps} />
    </Auth0Provider>
  )}
