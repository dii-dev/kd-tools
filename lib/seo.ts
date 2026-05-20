import type { Metadata } from 'next'

export const SITE_URL = 'https://kdocr.com'
export const SITE_NAME = 'KD Tools'
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon.svg`

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}

export function createPageMetadata({
  title,
  description,
  path = '/',
  keywords = [],
  category = 'technology',
}: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  category?: string
}): Metadata {
  const url = absoluteUrl(path)

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: SITE_NAME,
      images: [
        {
          url: DEFAULT_OG_IMAGE,
          alt: `${SITE_NAME} logo`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    category,
  }
}
