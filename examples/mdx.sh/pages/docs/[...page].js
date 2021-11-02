import { LandingPage, getSaaS } from '@saaskit/web'

export default function Page(saas) {
    return (
        <LandingPage {...saas} />
    )
}

export async function getStaticProps(context) {
    const saas = getSaaS(context)
    return {
        props: {saas}
    }
} 