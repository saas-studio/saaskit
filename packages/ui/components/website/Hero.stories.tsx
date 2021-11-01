import React from "react"
import { Hero } from "./Hero"
import saaskit from "saaskit"

import "../tailwind.css"

export default {
  title: "Marketing/Hero",
  component: Hero,
}

export const Default = (args: saaskit.Hero) => <Hero {...args} />