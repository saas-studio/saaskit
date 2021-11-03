import { NextWebVitalsMetric } from "next/dist/next-server/lib/utils"

export { CodePage } from './components/CodePage'
export { Hero } from './components/Hero'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  const body = JSON.stringify(metric)
  const url = 'https://saas.dev/api/analytics'

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body)
  } else {
    fetch(url, { body, method: 'POST', keepalive: true })
  }
}