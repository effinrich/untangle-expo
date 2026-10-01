import React from "react"
import { BrandMark } from "./brand-mark"

const BEATS: { name: string; detail: string }[] = [
  {
    name: "Dump",
    detail: "Everything on your mind, in any order. Type it or say it.",
  },
  {
    name: "Untangle",
    detail: "It comes back as short steps, with an energy level on each.",
  },
  {
    name: "Do one",
    detail: "Take the first step, or let Unstick me pick one for you.",
  },
]

// A first-run visitor has no steps and no idea what this is. The old hero gave
// that context but sat in front of the work; this renders only when there is no
// work yet, so it never buries a list that already exists.
export const FirstRunEntry: React.FC = () => {
  return (
    <section className="border-t border-neutral-800 pt-9">
      <BrandMark className="w-8 h-8 text-amber-400" />

      <h1 className="mt-4 text-2xl leading-tight text-neutral-100 max-w-prose">
        An ADHD brain dump, untangled into steps you can start
      </h1>

      <p className="mt-3 text-base text-neutral-400 max-w-prose">
        Write or say everything in your head, in any order. Untangle breaks it into short steps,
        each with one small physical move to begin.
      </p>

      <ol className="mt-8 divide-y divide-neutral-800 border-y border-neutral-800">
        {BEATS.map((beat, index) => (
          <li key={beat.name} className="flex gap-4 py-4">
            <span className="shrink-0 w-5 text-sm tabular-nums text-neutral-600" aria-hidden="true">
              {index + 1}
            </span>
            <div className="min-w-0">
              <h2 className="text-base text-neutral-100">{beat.name}</h2>
              <p className="mt-1 text-sm text-neutral-400">{beat.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-sm text-neutral-400 max-w-prose">
        If you still want to stop after two minutes, you can. No streaks, no shame.
      </p>
      <p className="mt-2 text-sm text-neutral-500">Your steps stay on this device.</p>
    </section>
  )
}
