import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'

function SpeakingSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function Appearance({
  title,
  description,
  event,
  cta,
  href,
}: {
  title: string
  description: string
  event: string
  cta: string
  href: string
}) {
  return (
    <Card as="article">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Eyebrow decorate>{event}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      <Card.Cta>{cta}</Card.Cta>
    </Card>
  )
}

export const metadata: Metadata = {
  title: 'Speaking',
  description: "Podcasts and interviews I've done.",
}

export default function Speaking() {
  return (
    <SimpleLayout
      title="Talks and podcasts."
      intro="I've been interviewed on podcasts about direct-to-consumer commerce, fulfillment operations, and what it takes to build software that scales with a brand."
    >
      <div className="space-y-20">
        <SpeakingSection title="Podcasts">
          <Appearance
            href="https://ecommercefastlane.com/podcast/episode-49/"
            title="Learn How To Build Your Competitive Advantage By Owning The Entire Customer Experience"
            description="A deep-dive into how direct-to-consumer brands can upgrade their fulfillment operations — covering 3PLs, order management, and why owning the customer experience end-to-end is the real competitive moat."
            event="Ecommerce Fastlane with Steve Hutt, Episode 49 · June 2019"
            cta="Listen to episode"
          />
          <Appearance
            href="https://open.spotify.com/show/1Ilj7Td2QIntrxEoNZDXx6"
            title="D2C Academy — Tactics, Marketing, and Trends for D2C Brands"
            description="A podcast series I host covering everything direct-to-consumer: why established brands should build a D2C channel, inventory forecasting, platform comparisons, customer loyalty, and the difference between D2C and digitally native vertical brands."
            event="D2C Academy (host) · 2019"
            cta="Listen on Spotify"
          />
        </SpeakingSection>
      </div>
    </SimpleLayout>
  )
}
