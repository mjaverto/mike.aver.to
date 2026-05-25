import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'

export const metadata: Metadata = {
  title: 'Speaking',
  description: "Talks, podcasts, and other appearances I've done.",
}

interface Appearance {
  title: string
  show: string
  cue: string
  description: string
  href: string
  cta: string
}

const appearances: Appearance[] = [
  {
    title:
      'Learn How To Build Your Competitive Advantage By Owning The Entire Customer Experience',
    show: 'Ecommerce Fastlane with Steve Hutt',
    cue: 'Episode 49 · June 2019',
    description:
      'A deep-dive into how direct-to-consumer brands can upgrade their fulfillment operations — covering 3PLs, order management, and why owning the customer experience end-to-end is the real competitive moat.',
    href: 'https://ecommercefastlane.com/podcast/episode-49/',
    cta: 'Listen to episode',
  },
  {
    title: 'D2C Academy — Tactics, Marketing, and Trends for D2C Brands',
    show: 'D2C Academy (host)',
    cue: 'Ongoing · 2019',
    description:
      'A podcast series covering everything direct-to-consumer: why established brands should build a D2C channel, inventory forecasting, platform comparisons, customer loyalty, and the difference between D2C and digitally native vertical brands.',
    href: 'https://open.spotify.com/show/1Ilj7Td2QIntrxEoNZDXx6',
    cta: 'Listen on Spotify',
  },
  {
    title: 'How ChannelApe Built a Capital-Efficient SaaS Business',
    show: 'Latka Podcast with Nathan Latka',
    cue: 'SaaS founder interview',
    description:
      'A by-the-numbers founder interview on building ChannelApe — revenue, team size, capital efficiency, and the realities of growing a B2B SaaS business in the ecommerce fulfillment space.',
    href: 'https://getlatka.com/companies/channelape',
    cta: 'See the interview',
  },
]

function SpeakingSection({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="md:border-l md:border-zinc-100 md:pl-6 md:dark:border-zinc-700/40">
      <div className="flex max-w-3xl flex-col space-y-16">{children}</div>
    </div>
  )
}

function AppearanceCard({ appearance }: { appearance: Appearance }) {
  return (
    <article className="md:grid md:grid-cols-4 md:items-baseline">
      <Card className="md:col-span-3">
        <Card.Title href={appearance.href}>{appearance.title}</Card.Title>
        <Card.Eyebrow decorate className="md:hidden">
          {appearance.show} · {appearance.cue}
        </Card.Eyebrow>
        <Card.Description>{appearance.description}</Card.Description>
        <Card.Cta>{appearance.cta}</Card.Cta>
      </Card>
      <Card.Eyebrow className="mt-1 max-md:hidden">
        {appearance.show}
        <br />
        <span className="text-zinc-500">{appearance.cue}</span>
      </Card.Eyebrow>
    </article>
  )
}

export default function Speaking() {
  return (
    <SimpleLayout
      title="Talks and podcasts."
      intro="I've spoken on podcasts about direct-to-consumer commerce, fulfillment operations, and what it takes to build software that scales with a brand."
    >
      <SpeakingSection>
        {appearances.map((appearance) => (
          <AppearanceCard key={appearance.href} appearance={appearance} />
        ))}
      </SpeakingSection>
    </SimpleLayout>
  )
}
