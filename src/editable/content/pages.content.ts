import { slot4BrandConfig } from '@/editable/theme/brand.config'

export const pagesContent = {
  home: {
    metadata: {
      title: 'Visual work and the people behind it',
      description:
        'A single place to browse image-led posts, profiles and published work, organised so anything worth finding stays one click away.',
      openGraphTitle: 'Visual work and the people behind it',
      openGraphDescription:
        'Browse image-led posts, profiles and published work through one clear, connected experience.',
      keywords: ['visual directory', 'profiles', 'image gallery', 'content discovery', 'published work'],
    },
    hero: {
      badge: `${slot4BrandConfig.siteName} — Image & Profile index`,
      title: ['One place to see the work', 'and the people behind it.'],
      description:
        'Image-led posts and profiles, published side by side and kept in order — so finding the right piece of work, or the right person, takes seconds rather than searching.',
      primaryCta: { label: 'Browse the gallery', href: '/image' },
      secondaryCta: { label: 'Meet the profiles', href: '/profile' },
      searchPlaceholder: 'Search work, people, topics',
      focusLabel: 'In focus',
      featureCardBadge: 'Latest published',
      featureCardTitle: 'Recent posts set the tone of the front page.',
      featureCardDescription:
        'New work moves to the front automatically, so the homepage reflects what is actually being published.',
    },
    intro: {
      badge: 'All in one',
      title: 'One platform connecting every part of the work.',
      paragraphs: [
        'Visual posts, profiles and supporting material sit on the same surface, with one navigation, one search and one consistent way of presenting information.',
        'That means a visitor who arrives for a single image can follow it to the person behind it, and on to everything else they have published.',
        'Nothing is buried in a separate silo — each section keeps its own rhythm while sharing the same structure.',
      ],
      sideBadge: 'At a glance',
      sidePoints: [
        'A gallery-first index where the image leads and the caption follows.',
        'Profiles with the context that actually helps someone decide.',
        'Filters, sorting and search that work on what is already on screen.',
        'A layout that stays readable on a phone as well as a wide display.',
      ],
      primaryLink: { label: 'Start browsing', href: '/image' },
      secondaryLink: { label: 'How this works', href: '/about' },
    },
    cta: {
      badge: 'Start exploring',
      title: 'Find the work, then find the people.',
      description:
        'Move between visual posts, profiles and everything else through one connected index — no dead ends, no duplicated searching.',
      primaryCta: { label: 'Open the gallery', href: '/image' },
      secondaryCta: { label: 'Get in touch', href: '/contact' },
    },
    taskSection: {
      heading: 'Latest {label}',
      descriptionSuffix: 'Browse the newest posts in this section.',
    },
  },
  about: {
    badge: 'Our approach',
    title: 'A clearer way to publish work and the people behind it.',
    description: `${slot4BrandConfig.siteName} exists to make visual work and the profiles connected to it easy to browse, compare and return to.`,
    paragraphs: [
      'Every post is captured with the same fields, so sections stay comparable no matter who published them or when.',
      'Navigation, search and filtering behave the same way everywhere, which means visitors learn the site once and keep moving.',
      'The result is a site that stays useful as it grows, instead of becoming a pile of pages nobody can search.',
    ],
    values: [
      {
        title: 'Structure before decoration',
        description:
          'Consistent fields and consistent layout, so two posts published months apart still read as part of the same index.',
      },
      {
        title: 'The image leads',
        description:
          'Visual posts are given the room they need, with captions and detail kept out of the way until they are wanted.',
      },
      {
        title: 'People stay connected',
        description:
          'Profiles link back to the work and the work links back to profiles, so context is never more than a click away.',
      },
    ],
  },
  contact: {
    eyebrow: `Contact ${slot4BrandConfig.siteName}`,
    title: 'Tell us what you are trying to publish, fix or launch.',
    description:
      'Send the detail and it goes to the right lane rather than a generic inbox. Submissions, corrections and partnership questions are all welcome.',
    formTitle: 'Send a message',
  },

  search: {
    metadata: {
      title: 'Search',
      description: 'Search posts, profiles, topics and categories across the whole site.',
    },
    hero: {
      badge: 'Search everything',
      title: 'Find the post, the profile or the topic.',
      description:
        'One field across every published section. Narrow by category or content type when the result set gets wide.',
      placeholder: 'Search by keyword, title, topic or category',
    },
    resultsTitle: 'Latest across the site',
  },
  create: {
    metadata: {
      title: 'Create',
      description: 'Prepare and submit new content for the site.',
    },
    locked: {
      badge: 'Contributor access',
      title: 'Sign in to open the publishing workspace.',
      description:
        'Accounts on this device unlock the drafting workspace, where posts can be prepared for any active section of the site.',
    },
    hero: {
      badge: 'Publishing workspace',
      title: 'Prepare a post for any active section.',
      description:
        'Pick the section, add the detail, and build a clean draft with images, links, a summary and the main body.',
    },
    formTitle: 'Post details',
    submitLabel: 'Save this draft',
    successTitle: 'Draft saved on this device.',
  },
  auth: {
    login: {
      metadataDescription: 'Sign in to the contributor workspace.',
      badge: 'Contributor access',
      title: 'Welcome back to your workspace.',
      description: 'Sign in to keep drafting, reviewing and preparing posts for the site.',
      formTitle: 'Sign in',
      submitLabel: 'Continue',
      noAccount: 'No account matched those details. Create one first, then sign in.',
      success: 'Signed in. Redirecting...',
      createCta: 'Create an account',
    },
    signup: {
      metadataDescription: 'Create a contributor account for this site.',
      badge: 'New here',
      title: 'Create an account and start preparing posts.',
      description: 'An account unlocks the drafting workspace and keeps your details ready for the next submission.',
      formTitle: 'Create account',
      submitLabel: 'Create account',
      passwordShort: 'Use at least 4 characters for the password.',
      success: 'Account created. Redirecting...',
      loginCta: 'Sign in',
    },
  },
  detailPages: {
    article: {
      relatedTitle: 'Related reading',
      fallbackTitle: 'Post details',
    },
    listing: {
      relatedTitle: 'Related listings',
      fallbackTitle: 'Listing details',
    },
    image: {
      relatedTitle: 'More visuals',
      fallbackTitle: 'Image details',
    },
    profile: {
      relatedTitle: 'More profiles',
      fallbackDescription: 'Profile details will appear here once available.',
      visitButton: 'Visit official site',
    },
  },
} as const
