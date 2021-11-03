import Head from 'next/head'
import CodeViewer from "../controls/CodeViewer";

export interface Props {
    title?: string
    code?: object
}

export const CodePage = ({title = "API", code = {}}) => {
    return ( 
        <div className="px-4 py-10 max-w-6xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl">
        <Head>
            <title>{title}</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="prose max-w-6xl ">

            <h1 >
            {title}
            </h1>


            <CodeViewer code={{code}} />

            
        </main>

        </div>
     );
}