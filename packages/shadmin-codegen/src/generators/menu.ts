/**
 * Menu/Navigation Component Generator
 *
 * Generates a Menu component that lists all resources from the schema.
 *
 * @see saaskit-asn, saaskit-ncy9
 */

import type { SaaSSchema, Resource } from '@saaskit/schema'
import type { GeneratedComponent } from '../types'
import { pluralize } from '../utils'

/**
 * Get an appropriate icon name for a resource based on its name
 */
function getResourceIcon(name: string): string {
  const iconMap: Record<string, string> = {
    user: 'People',
    users: 'People',
    post: 'Article',
    posts: 'Article',
    order: 'ShoppingCart',
    orders: 'ShoppingCart',
    product: 'Inventory',
    products: 'Inventory',
    customer: 'Person',
    customers: 'Person',
    invoice: 'Receipt',
    invoices: 'Receipt',
    category: 'Category',
    categories: 'Category',
    tag: 'Label',
    tags: 'Label',
    comment: 'Comment',
    comments: 'Comment',
    setting: 'Settings',
    settings: 'Settings',
  }
  const lower = name.toLowerCase()
  return iconMap[lower] || 'Folder'
}

// ============================================================================
// Main Generator
// ============================================================================

/**
 * Generates a Menu component for the schema
 *
 * @param schema - The SaaS schema
 * @returns Generated component with code, imports, and metadata
 */
export function generateMenu(schema: SaaSSchema): GeneratedComponent {
  const imports = [
    'Menu',
    'MenuItemLink',
    'useSidebarState',
  ]

  const resources = schema.resources

  // Collect unique icons
  const iconImports = new Set<string>()
  resources.forEach((r: Resource) => {
    iconImports.add(getResourceIcon(r.name))
  })
  iconImports.add('Dashboard') // Always include dashboard icon

  // Generate menu items
  const menuItems = resources
    .map((r: Resource) => {
      const pluralName = pluralize(r.name)
      const icon = getResourceIcon(r.name)
      return `        <MenuItemLink
          to="/${pluralName}"
          primaryText="${r.name}s"
          leftIcon={<${icon} />}
          sidebarIsOpen={open}
        />`
    })
    .join('\n')

  const iconImportList = Array.from(iconImports).join(', ')

  const code = `import React from 'react'
import { Menu, MenuItemLink, useSidebarState } from 'react-admin'
import { ${iconImportList} } from '@mui/icons-material'

export const AppMenu = () => {
  const [open] = useSidebarState()

  return (
    <Menu>
      <MenuItemLink
        to="/"
        primaryText="Dashboard"
        leftIcon={<Dashboard />}
        sidebarIsOpen={open}
      />
${menuItems}
    </Menu>
  )
}

export default AppMenu
`

  return {
    name: 'AppMenu',
    code,
    imports,
    filePath: 'AppMenu.tsx',
  }
}
