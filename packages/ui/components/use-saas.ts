import { useEffect, useState } from "react";
import { SaaS } from "saaskit";

export const isSaaS = (v: any): v is SaaS => typeof v == 'object'

function generateSaaS(saas: SaaS) {
    return { ...saas, state: 'generated' } as SaaS
}

function getSaaS(saas: SaaS) {
    return new Promise<SaaS>((resolve) => resolve({ ...saas }))
}

export default function useSaaS(init: string | SaaS = 'SaaS.Dev') {
    let initialState = isSaaS(init) ? generateSaaS(init) : { solution: init, state: 'loading' } as SaaS
    const [saas, setSaaS] = useState(initialState);

    useEffect(() => {
        getSaaS(saas).then(data => setSaaS(data))
        return () => {
            //cleanup
        }
    }, [])

    return saas;
}
