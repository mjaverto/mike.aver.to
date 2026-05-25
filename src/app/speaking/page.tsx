import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'

export const metadata: Metadata = {
  title: 'Speaking',
  description: "Talks, podcasts, and other appearances I've done.",
}

export default function Speaking() {
  return (
    <SimpleLayout
      title="Talks and podcasts."
      intro="I haven't done much public speaking yet, but I'm open to it. More to come."
    >
      <p className="text-zinc-600 dark:text-zinc-400">Coming soon.</p>
    </SimpleLayout>
  )
}
