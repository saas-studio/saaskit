import React from 'react'
import Head from 'next/head'
import CodeViewer from "./CodeViewer";
import Header from './Header';

export const CodePage = (props: any) => {
    return ( 
        <div className="px-4 py-10 max-w-6xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl">
        <Head>
            <title>SaaS.Dev API</title>
            <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className="prose max-w-6xl ">

            <Header/>

            <h1 >
            SaaS.Dev API
            </h1>


            <CodeViewer code={props} />

            
        </main>

        </div>
     );
}