import { createContext, useState } from "react"
import { SaaS } from 'saaskit'

export type SaaSContent = {
    saas: SaaS
    setSaaS:(saas: SaaS) => void
}

export const SaaSProvider = (init: SaaS, children: JSX.Element) => {

    const [saas, setSaaS] = useState<SaaS>(init)
    const SaaSContext = createContext<SaaSContent>({saas, setSaaS})

    return (
        <SaaSContext.Provider value={{saas, setSaaS}}>
            {children}
        </SaaSContext.Provider>
    )
}