import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'

function LinkIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M15.712 11.823a.75.75 0 1 0 1.06 1.06l-1.06-1.06Zm-4.95 1.768a.75.75 0 0 0 1.06-1.06l-1.06 1.06Zm-2.475-1.414a.75.75 0 1 0-1.06-1.06l1.06 1.06Zm4.95-1.768a.75.75 0 1 0-1.06 1.06l1.06-1.06Zm3.359.53-.884.884 1.06 1.06.885-.883-1.061-1.06Zm-4.95-2.12 1.414-1.415L12 6.344l-1.415 1.413 1.061 1.061Zm0 3.535a2.5 2.5 0 0 1 0-3.536l-1.06-1.06a4 4 0 0 0 0 5.656l1.06-1.06Zm4.95-4.95a2.5 2.5 0 0 1 0 3.535L17.656 12a4 4 0 0 0 0-5.657l-1.06 1.06Zm1.06-1.06a4 4 0 0 0-5.656 0l1.06 1.06a2.5 2.5 0 0 1 3.536 0l1.06-1.06Zm-7.07 7.07.176.177 1.06-1.06-.176-.177-1.06 1.06Zm-3.183-.353.884-.884-1.06-1.06-.884.883 1.06 1.061Zm4.95 2.121-1.414 1.414 1.06 1.06 1.415-1.413-1.06-1.061Zm0-3.536a2.5 2.5 0 0 1 0 3.536l1.06 1.06a4 4 0 0 0 0-5.656l-1.06 1.06Zm-4.95 4.95a2.5 2.5 0 0 1 0-3.535L6.344 12a4 4 0 0 0 0 5.656l1.06-1.06Zm-1.06 1.06a4 4 0 0 0 5.657 0l-1.061-1.06a2.5 2.5 0 0 1-3.536 0l-1.06 1.06Zm7.07-7.07-.176-.177-1.06 1.06.176.178 1.06-1.061Z"
        fill="currentColor"
      />
    </svg>
  )
}

function project(name: string, description: string, repo = `mjaverto/${name}`) {
  return {
    name,
    description,
    link: {
      href: `https://github.com/${repo}`,
      label: `github.com/${repo}`,
    },
  }
}

function site(name: string, description: string, href: string) {
  return {
    name,
    description,
    link: { href, label: new URL(href).host },
  }
}

const groups = [
  {
    heading: 'Built',
    projects: [
      site(
        'Waycar',
        'Talk to your phone and the coding agents on your own Mac or Linux box keep building. Step away, then pick right back up. Native for iPhone and iPad.',
        'https://waycar.dev',
      ),
      project(
        'infinite-recall',
        'Local-first macOS rewind/recorder. Always-on capture, on-device transcription (WhisperKit), on-device diarization (MFCC), local LLM via mlx-lm.server, Omi-shaped REST API for MCP clients.',
      ),
      project('yearbird', 'Year-at-a-glance view for Google Calendar.'),
      project(
        'panynj-crossings',
        'Bridge and tunnel crossing times for PANYNJ, with auto-refresh and dark mode.',
      ),
      project(
        'park-slope-heroes',
        "Browser beat-'em-up built with Phaser 3: pixel-art stages, bosses, touch controls.",
      ),
      project(
        'messaging-markdown-exporter',
        'Export conversations from multiple messaging apps into a shared Markdown format.',
      ),
      project(
        'ace',
        'Agent Conversation Exporter: render Claude Code, Codex, Pi, and opencode transcripts to Markdown.',
      ),
      project(
        'squid-proxy-lockdown',
        "OpenClaw skill: monitor and lock down your AI agent's outbound network traffic with Squid.",
      ),
    ],
  },
  {
    heading: 'Forks I build on',
    projects: [
      project(
        'paperclip',
        'Open-source orchestration for zero-human companies. My fork carries 150 commits of my own work.',
      ),
      project(
        'Lidless',
        'macOS menu-bar app that keeps the Mac awake with the lid closed, for coding agents.',
      ),
      project('mcp-proxy', 'Streamable HTTP and stdio bridge for MCP.'),
      project('MeetingBar', 'macOS menu-bar meetings. PR open upstream.'),
    ],
  },
  {
    heading: 'Merged upstream',
    projects: [
      project(
        'CodexBar',
        'Added a Claude Platform provider (#4510) and an SSH usage cache (#4554).',
        'steipete/CodexBar',
      ),
      project(
        'qmd',
        'Fix: load the legacy adoption sample body by rowid instead of a per-chunk GROUP BY.',
        'tobi/qmd',
      ),
      project(
        'Heeler',
        'Native iOS agent console for herdr. Four PRs: agent tab labels, swipe to close, and send reliability fixes.',
        'ZingerLittleBee/Heeler',
      ),
      project(
        'LibreChat',
        'Auto-submit for URL query params, plus the matching docs update.',
        'LibreChat-AI/LibreChat',
      ),
      project(
        'vagrant',
        'Fixed a Windows 10 Enterprise error.',
        'hashicorp/vagrant',
      ),
      project(
        'FoundationPress',
        'Added a data-offcanvas attribute to the WordPress starter theme.',
        'olefredrik/FoundationPress',
      ),
      project(
        'grunt-shopify',
        'Fixed Windows file path handling in the Shopify theme plug-in.',
        'wilr/grunt-shopify',
      ),
    ],
  },
]

export const metadata: Metadata = {
  title: 'Projects',
  description:
    "Things I've built, forks I've shipped to, and fixes I've landed upstream.",
}

export default function Projects() {
  return (
    <SimpleLayout
      title="Projects."
      intro="Things I've built, forks I've shipped to, and fixes I've landed upstream."
    >
      <div className="space-y-20">
        {groups.map((group) => (
          <section key={group.heading}>
            <h2 className="mb-10 text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              {group.heading}
            </h2>
            <ul
              role="list"
              className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
            >
              {group.projects.map((project) => (
                <Card as="li" key={project.name}>
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                    <LinkIcon className="h-6 w-6 text-zinc-500 dark:text-zinc-400" />
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
                    <Card.Link href={project.link.href}>
                      {project.name}
                    </Card.Link>
                  </h3>
                  <Card.Description>{project.description}</Card.Description>
                  <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-teal-500 dark:text-zinc-200">
                    <LinkIcon className="h-6 w-6 flex-none" />
                    <span className="ml-2">{project.link.label}</span>
                  </p>
                </Card>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </SimpleLayout>
  )
}
