export default {
  github: 'https://github.com/saas-studio/saaskit',
  docsRepositoryBase: 'https://github.com/saas-studio/saaskit/blob/master',
  titleSuffix: ' – SaaSkit',
  logo: (
    <>
      <span className="mr-2 hidden md:inline"><span className="font-extrabold">SaaS</span>kit.js</span>
      <span className="text-gray-600 font-normal hidden md:inline">
        Low-Code SaaS Framework
      </span>
    </>
  ),
  head: (
    <>
      <meta name="msapplication-TileColor" content="#ffffff" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en" />
      <meta name="description" content="SaaSkit: Low-Code SaaS Framework" />
      <meta name="og:description" content="SaaSkit: Low-Code SaaS Framework" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content="https://opengraph.studio/**SaaS**kit.png?theme=light&md=1&fontSize=175px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg" />
      <meta name="twitter:site:domain" content="saaskit.js.org" />
      <meta name="twitter:url" content="https://saaskit.js.org" />
      <meta name="og:title" content="SaaSkit: Low-Code SaaS Framework" />
      <meta name="og:image" content="https://opengraph.studio/**SaaS**kit.png?theme=light&md=1&fontSize=175px&images=https%3A%2F%2Fassets.vercel.com%2Fimage%2Fupload%2Ffront%2Fassets%2Fdesign%2Fvercel-triangle-black.svg" />
      <meta name="apple-mobile-web-app-title" content="SaaSkit" />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-icon-180x180.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="192x192"
        href="/android-icon-192x192.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="96x96"
        href="/favicon-96x96.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <meta name="msapplication-TileImage" content="/ms-icon-144x144.png" />
    </>
  ),
  search: true,
  prevLinks: true,
  nextLinks: true,
  footer: true,
  footerEditLink: 'Edit this page on GitHub',
  footerText: <>MIT {new Date().getFullYear()} © <a href="https://saas.dev">SaaS.Dev</a></>,
  unstable_faviconGlyph: '👋',
}
