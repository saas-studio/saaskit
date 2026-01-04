import React, { createContext, useContext } from 'react'

export interface AppProps {
  name: string
  description?: string
  version?: string
  children?: React.ReactNode
}

export interface AppMetadata {
  name: string
  description?: string
  version?: string
  resources: string[]
}

const AppContext = createContext<AppMetadata | null>(null)

function AppProvider({ name, description, version, children }: AppProps): React.ReactElement {
  const metadata: AppMetadata = {
    name,
    description,
    version,
    resources: []
  }

  return (
    <AppContext.Provider value={metadata}>
      {children}
    </AppContext.Provider>
  )
}

// Make App a callable that validates props and returns an element
// This allows <App /> syntax while throwing on missing props
export function App(props: AppProps): React.ReactElement<AppProps> {
  if (!props || !props.name) {
    throw new Error('App requires a name prop')
  }
  return <AppProvider {...props} />
}

export function useApp(): AppMetadata | null {
  return useContext(AppContext)
}

export function getAppMetadata(app: React.ReactElement<AppProps>): AppMetadata {
  const { name, description, version } = app.props

  if (!name) {
    throw new Error('App requires a name prop')
  }

  return {
    name,
    description,
    version,
    resources: []
  }
}
