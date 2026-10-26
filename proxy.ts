import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Auth gate: operations pages require a signed-in user. Unauthenticated
// visitors are redirected to /sign-in (Clerk preserves the original URL so the
// user can be sent back after authenticating).
const hasClerk =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) ||
  Boolean(process.env.CLERK_SECRET_KEY)

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/detect(.*)',
  '/estimate(.*)',
  '/review(.*)',
  '/release(.*)',
  '/deliver(.*)',
  '/report(.*)',
  '/ledger(.*)',
  '/events(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (hasClerk && isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
