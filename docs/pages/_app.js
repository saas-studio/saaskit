import 'tailwindcss/tailwind.css'
import 'nextra-theme-docs/style.css'
import { Auth0Provider } from '@auth0/auth0-react';

import Analytics from 'analytics'
import googleTagManager from '@analytics/google-tag-manager'
import { AnalyticsProvider, useAnalytics } from 'use-analytics'
import * as Sentry from "@sentry/react";
import { Integrations } from "@sentry/tracing";

const analytics = Analytics({
  app: 'saaskit',
  plugins: [
    googleTagManager({
      containerId: 'GTM-MQ38JVM'
    }),
  ]
})


Sentry.init({
  dsn: "https://5faf1f20e332476c9d5556131eaec338@o1059257.ingest.sentry.io/6052767",
  integrations: [new Integrations.BrowserTracing()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

export default function Nextra({ Component, pageProps }) {
  return (
    <AnalyticsProvider instance={analytics}>
      <Auth0Provider
        domain="auth.saas.dev"
        clientId="WNVD31oeygTWHjNsWrq4Ru8QcOiN2ScS"
        redirectUri={'https://saaskit.js.org'}
      >
        <Component {...pageProps} />
      </Auth0Provider>
    </AnalyticsProvider>
  )}
