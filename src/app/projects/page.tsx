import { type Metadata } from 'next'

import { SimpleLayout } from '@/components/SimpleLayout'

export const metadata: Metadata = {
  title: 'Projects',
  description: "Things I'm working on and have shipped.",
}

export default function Projects() {
  return (
    <SimpleLayout
      title="Things I'm working on."
      intro="I've shipped a handful of projects over the years. More details coming soon — check my GitHub in the meantime."
    >
      <p className="text-zinc-600 dark:text-zinc-400">Coming soon.</p>
    </SimpleLayout>
  )
}
