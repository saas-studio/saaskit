import { createContext, useState } from 'react'
import { SaaS } from 'saaskit'

const SaaSContext = createContext<SaaS>({})

export const SaaSProvider = ({saas: SaaS, children: JSX.Element}) => {

    const [saas, setSaaS] = useState(saas)

    return (
        <SaaSContext.Provider value={{saas, setSaaS}}>
            {children}
        </SaaSContext.Provider>
    )
}