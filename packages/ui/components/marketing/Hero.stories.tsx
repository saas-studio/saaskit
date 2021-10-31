import React from "react"
import { Hero } from "./Hero"
import saaskit from "saaskit"

import "../tailwind.css"

export default {
  title: "Marketing/Hero",
  component: Hero,
  args: {
    title: "Low-Code SaaS for the Modern Developer",
  },
  argTypes: {
    title: {
      control: {
        type: 'text',
      },
    },
  },
}

const story = (args: saaskit.Hero) => <Hero {...args} />

export const Default = story.bind(null)

export const Small = story.bind(null)

// Small.args = { size: "sm" }

export const Large = story.bind(null)

// Large.args = { size: "lg" }