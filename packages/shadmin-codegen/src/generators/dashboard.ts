/**
 * Dashboard Component Generator
 *
 * Generates a Dashboard component that displays resource counts and links.
 *
 * @see saaskit-517
 */

import type { SaaSSchema } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'
import { pluralize } from '../utils'

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a Dashboard component for the schema
 *
 * @param schema - The SaaS schema
 * @returns Generated component with code, imports, and metadata
 */
export function generateDashboard(schema: SaaSSchema): GeneratedComponent {
  const imports = [
    'useDataProvider',
    'useState',
    'useEffect',
    'Card',
    'CardContent',
    'Typography',
    'Grid',
    'Link',
  ]

  const resources = schema.resources
  const resourceNames = resources.map((r) => pluralize(r.name))

  // Generate state declarations for counts
  const stateDeclarations = resources
    .map((r) => `  const [${pluralize(r.name)}Count, set${r.name}Count] = useState<number>(0)`)
    .join('\n')

  // Generate fetch calls in useEffect
  const fetchCalls = resources
    .map(
      (r) => `      dataProvider.getList('${pluralize(r.name)}', { pagination: { page: 1, perPage: 1 } })
        .then(({ total }) => set${r.name}Count(total || 0))`
    )
    .join('\n')

  // Generate resource cards
  const resourceCards = resources
    .map(
      (r) => `        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                {${pluralize(r.name)}Count}
              </Typography>
              <Typography color="textSecondary">
                <Link to="/${pluralize(r.name)}">${r.name}s</Link>
              </Typography>
            </CardContent>
          </Card>
        </Grid>`
    )
    .join('\n')

  const code = `import React, { useState, useEffect } from 'react'
import { useDataProvider, Link } from 'react-admin'
import { Card, CardContent, Typography, Grid } from '@mui/material'

export const Dashboard = () => {
  const dataProvider = useDataProvider()
  const [loading, setLoading] = useState(true)
${stateDeclarations}

  useEffect(() => {
    Promise.all([
${fetchCalls}
    ]).finally(() => setLoading(false))
  }, [dataProvider])

  if (loading) {
    return <Typography>Loading...</Typography>
  }

  return (
    <div style={{ padding: 16 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={2} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
${resourceCards}
      </Grid>
    </div>
  )
}

export default Dashboard
`

  return {
    name: 'Dashboard',
    code,
    imports,
    filePath: 'Dashboard.tsx',
  }
}
