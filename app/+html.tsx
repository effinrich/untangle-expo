import type { PropsWithChildren } from "react"

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-neutral-950 text-neutral-100 antialiased selection:bg-amber-400 selection:text-neutral-950 font-sans">
        {children}
      </body>
    </html>
  )
}
