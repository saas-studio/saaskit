/**
 * Resource component - defines a data model in the app
 * Stub - to be implemented in GREEN phase
 */
import type React from 'react'

export interface ResourceProps {
	name: string
	children?: React.ReactNode
	// Shorthand field props will be parsed from additional props
	[key: string]: unknown
}

export function Resource(_props: ResourceProps): React.ReactElement {
	// TODO: Implement in GREEN phase
	throw new Error('Not implemented')
}
