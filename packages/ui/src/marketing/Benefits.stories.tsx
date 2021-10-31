import React from "react"
import { Benefits, Props } from "./Benefits"

import "../tailwind.css"

export default {
  title: "Marketing/Benefits",
  component: Benefits,
  args: {
    text: "Hello",
  },
  argTypes: {
    size: {
      control: {
        type: "select",
        options: ["sm", "md", "lg"],
      },
    },
  },
}

const story = (args: Props) => <Benefits {...args} />

export const Default = story.bind(null)

export const Small = story.bind(null)

// Small.args = { size: "sm" }

export const Large = story.bind(null)

// Large.args = { size: "lg" }