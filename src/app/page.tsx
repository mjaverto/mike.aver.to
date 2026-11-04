import { type Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { GitHubIcon, XIcon } from '@/components/SocialIcons'
import portraitImage from '@/images/portrait.jpg'

function SocialLink({
  className,
  href,
  children,
  icon: Icon,
}: {
  className?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
}) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-teal-500 dark:text-zinc-200 dark:hover:text-teal-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-teal-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export const metadata: Metadata = {
  description: "I'm Mike Averto — builder, product engineer, and AI tinkerer.",
}

export default function Home() {
  return (
    <Container className="mt-16 sm:mt-32">
      <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
        <div className="lg:pl-20">
          <div className="max-w-xs px-2.5 lg:max-w-none">
            <Image
              src={portraitImage}
              alt=""
              sizes="(min-width: 1024px) 32rem, 20rem"
              className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
            />
          </div>
        </div>
        <div className="lg:order-first lg:row-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
            I&apos;m Mike Averto — builder, product engineer, and AI tinkerer.
          </h1>
          <div className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
            <p>
              I build software products and spend a lot of time thinking about
              how AI agents change what&apos;s possible for small teams. I care
              about systems that are practical, maintainable, and actually
              useful to real people.
            </p>
            <p className="font-medium text-zinc-800 dark:text-zinc-100">
              Important things to me:
            </p>
            <ul
              role="list"
              className="list-disc space-y-4 pl-5 marker:text-teal-500"
            >
              <li>
                <strong className="font-semibold text-zinc-800 dark:text-zinc-100">
                  Enthusiasm.
                </strong>{' '}
                Love the problem, not just your solution. Craft follows.
              </li>
              <li>
                <strong className="font-semibold text-zinc-800 dark:text-zinc-100">
                  Moving fast.
                </strong>{' '}
                Ship something small, watch what happens, fix it. Speed is how
                you learn, and most decisions are cheaper to undo than to
                agonize over.
              </li>
              <li>
                <strong className="font-semibold text-zinc-800 dark:text-zinc-100">
                  Small teams.
                </strong>{' '}
                Few people, little overhead, everyone owning real work. AI
                agents make this stronger every month.
                <ul
                  role="list"
                  className="mt-2 list-[circle] space-y-2 pl-5 marker:text-teal-500"
                >
                  <li>
                    A small team aligned on a mission can change the world.
                    Alignment beats headcount.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
        <div className="lg:pl-20">
          <ul role="list">
            <SocialLink href="https://x.com/mikeaverto" icon={XIcon}>
              Follow on X
            </SocialLink>
            <SocialLink
              href="https://github.com/mjaverto"
              icon={GitHubIcon}
              className="mt-4"
            >
              Follow on GitHub
            </SocialLink>
          </ul>
        </div>
      </div>
    </Container>
  )
}
