# SaaSkit Middleware

This is a collection of highly-opinionated middleware with an abstraction and compatibility layer to make Edge Middleware work with both Cloudflare Workers & Next Edge Functions on Vercel.

There are polyfills going in both directions, so middleware that was originally written for either Cloudflare Workers or Next.js Middleware can work on the other.

There is also a compatibility layer to allow Workers KV to run on Next.js and Vercel for Key Value storage on the edge.

## This module is still in early active development so expect the API to change ... and better yet, make a pull request with any ideas
