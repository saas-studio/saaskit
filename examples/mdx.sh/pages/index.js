// import { Hero, getSaaS } from '@saaskit/web'
// import saas from '../saas.config'
// import { LandingPage } from "../components/LandingPage"

// export default function Page(saas) {
//     return (
//         // <LandingPage {...saas} />
//         <LandingPage {...saas} />
//     )
// }

// export async function getStaticProps(context) {
//     // const saas = { name: 'MDX.sh' } //getSaaS(context)
//     return {
//         props: {saas}
//     }
// } 

import Head from 'next/head'
import { Header } from '../components/Header'
import { Hero } from '../components/Hero'
// import { app } from '../saas.config'

export default function Home(app) {
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
