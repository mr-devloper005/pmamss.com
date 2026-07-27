import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { slot4BrandConfig } from '@/editable/theme/brand.config'

/*
  Sections deliberately kept out of the navigation surfaces (navbar, footer,
  homepage, about, cross-section rails). Their routes, archives and detail pages
  all keep rendering exactly as before — they are simply not linked from the
  shell. Add or remove a key here to change what the site links to.
*/
export const hiddenNavTaskKeys: TaskKey[] = ['profile']

/** Enabled sections that are allowed to appear in navigation surfaces. */
export function getVisibleTaskLinks() {
  return SITE_CONFIG.tasks.filter((task) => task.enabled && !hiddenNavTaskKeys.includes(task.key))
}

export const globalContent = {
  site: {
    name: slot4BrandConfig.siteName,
    tagline: slot4BrandConfig.tagline || 'Work and profiles, indexed',
    domain: slot4BrandConfig.domain,
    baseUrl: slot4BrandConfig.baseUrl,
  },
  nav: {
    tagline: 'Work & profiles, indexed',
    primaryLinks: [
      { label: 'Gallery', href: '/image' },
      { label: 'Search', href: '/search' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
    ],
    actions: {
      primary: { label: 'Browse', href: '/image' },
      secondary: { label: 'Get in touch', href: '/contact' },
    },
  },
  footer: {
    tagline: 'Visual work, indexed',
    description:
      'A single index for image-led posts and everything published alongside them — same structure throughout, searchable from one place.',
    columns: [
      {
        title: 'Sections',
        links: [
          { label: 'Gallery', href: '/image' },
          { label: 'Search', href: '/search' },
        ],
      },
      {
        title: 'Site',
        links: [
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
    ],
    bottomNote: 'Built for clear browsing and easy discovery.',
  },
  commonLabels: {
    readMore: 'Read more',
    viewAll: 'View all',
    explore: 'Explore',
    latest: 'Latest',
    related: 'Related',
    published: 'Published',
  },
} as const
