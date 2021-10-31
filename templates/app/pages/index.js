import Head from 'next/head'
import { Wordmark } from '@saaskit/ui'

export default function Home() {
  return (
    <div>
      <Head>
        <title>SaaSkit App</title>
        <link rel="icon" href="https://favicon.ninja/favicon.ico" />
      </Head>

      <Wordmark name="SaaSKit.js.org" />

      {/* <Benefits /> */}

    </div>
  )
}
