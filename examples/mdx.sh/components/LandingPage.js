import Head from 'next/head'
import Header from './Header'
import Hero from './Hero'

export function LandingPage(app) {
    return (
    <div>
      <Head>
        <title>{app.solution}: {app.offer}</title>
        <link rel="icon" href={`https://saas.dev/${app.solution}/favicon.ico`} />
      </Head>

      {/* <Hero {...app} /> */}

      <Header/>
      <Hero/>

    </div>
    )
}