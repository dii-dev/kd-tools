import type { MetadataRoute } from 'next'
import { absoluteUrl } from '@/lib/seo'

const routes = [
  '/',
  '/qr',
  '/tools',
  '/tools/json-pretty',
  '/tools/json-string',
  '/tools/json-diff',
  '/tools/json-format',
  '/tools/xml-to-json',
  '/tools/soap-to-json',
] as const

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return routes.map((route) => ({
    url: absoluteUrl(route),
    lastModified,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/tools' ? 0.9 : 0.8,
  }))
}
