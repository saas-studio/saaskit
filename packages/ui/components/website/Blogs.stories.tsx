import React from "react"
import Blog from "./Blog"

import "../tailwind.css"

export default {
  title: "Website/Blog",
  component: Blog,
}

export const Default = (args: any) => <Blog {...args} />