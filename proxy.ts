import { clerkMiddleware } from '@clerk/nextjs/server'

// Sessions for the whole app; route protection lives in the pages
// themselves (see app/dashboard/page.tsx) via `auth.protect()`.
export default clerkMiddleware()

export const config = {
  // Run Clerk on everything except static assets, image optimizer and Next internals.
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
