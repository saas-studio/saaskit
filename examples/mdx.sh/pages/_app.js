import 'tailwindcss/tailwind.css'
import { SessionProvider } from 'next-auth/react'
import { Layout } from '@saaskit/web'

export { reportWebVitals } from '@saaskit/web'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  )
}
