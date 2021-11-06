import Head from 'next/head'
// import Header from '@components/Header'
import { Hero } from '@components/website/Hero'
// import { Hero } from '@saaskit/ui'

// import { app } from '../saaskit.config'

export default function Home() {
  //let website = generateWebsite(app)
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
