import { LandingPage, getSaaS } from '@saaskit/web'
import saas from '../saas.config'

export default function Page(saas) {
    return (
        <LandingPage {...saas} />
    )
}

export async function getStaticProps(context) {
    // const saas = getSaaS(context)
    return {
        props: saas
    }
} 

export async function getStaticPaths() {
    return {
      paths: [],
      fallback: 'blocking' 
    }
  }