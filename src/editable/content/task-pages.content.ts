import type { TaskKey } from '@/lib/site-config'

export type TaskPageVoice = {
  eyebrow: string
  headline: string
  description: string
  filterLabel: string
  secondaryNote: string
  chips: string[]
}

export const taskPageVoices = {
  article: {
    eyebrow: 'Reading desk',
    headline: 'Long-form writing, kept in one readable stream.',
    description:
      'Essays, guides and explainers with the room they need. Filter by topic, then read without the page fighting you for attention.',
    filterLabel: 'Choose a topic',
    secondaryNote: 'Reading surfaces need space, hierarchy and fewer distractions.',
    chips: ['Editorial pacing', 'Topic filters', 'Built for long reads'],
  },
  classified: {
    eyebrow: 'Notice board',
    headline: 'Current offers, written to be acted on today.',
    description:
      'Price and location lead, the detail follows. Everything here is meant to be scanned quickly and answered quickly.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Prioritise urgency, short summaries and direct browsing.',
    chips: ['Fast scan', 'Clear pricing', 'Direct contact'],
  },
  sbm: {
    eyebrow: 'Saved shelves',
    headline: 'References worth keeping, grouped by theme.',
    description:
      'A working library of links and resources, shelved so the useful one is still findable months later.',
    filterLabel: 'Filter the shelf',
    secondaryNote: 'Curated resources need grouping and calm metadata.',
    chips: ['Collections', 'Resources', 'Easy to revisit'],
  },
  profile: {
    eyebrow: 'People and organisations',
    headline: 'The people behind the work, with the context that matters.',
    description:
      'Each profile leads with who someone is and what they do, then links straight through to everything they have published here.',
    filterLabel: 'Filter profiles',
    secondaryNote: 'Make identity and credibility visible before the grid begins.',
    chips: ['Identity first', 'Role and location', 'Linked to their work'],
  },
  pdf: {
    eyebrow: 'Document library',
    headline: 'Reports, guides and documents, ready to open.',
    description: 'A practical library rather than a feed — preview in place, or take the file with you.',
    filterLabel: 'Filter document type',
    secondaryNote: 'Document surfaces need archive cues, file context and clear browsing.',
    chips: ['Preview in place', 'Downloadable', 'Archive ready'],
  },
  listing: {
    eyebrow: 'Directory',
    headline: 'Organisations described consistently, so they compare cleanly.',
    description:
      'The same fields in the same order for every entry, which makes scanning a page of them genuinely useful.',
    filterLabel: 'Filter by category',
    secondaryNote: 'Prioritise comparison, location and direct action paths.',
    chips: ['Compare quickly', 'Contact details', 'Location aware'],
  },
  image: {
    eyebrow: 'Visual index',
    headline: 'A gallery where the image leads and the words follow.',
    description:
      'Large artwork, quiet captions and a lightbox for a closer look. Filter or sort the set without losing your place.',
    filterLabel: 'Filter the gallery',
    secondaryNote: 'Let images carry the page before long text does.',
    chips: ['Gallery first', 'Lightbox viewing', 'Sort and filter'],
  },
} satisfies Record<TaskKey, TaskPageVoice>
