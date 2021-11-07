import { NextURL } from "next/dist/server/web/next-url"
import { EdgeResponse } from "../response"

export const rewrite = (destination: string | NextURL) => {
    return EdgeResponse.rewrite(destination)
}