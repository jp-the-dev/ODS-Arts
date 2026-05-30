// Single collection — /collections/[slug]
// Server Component
// Note: params must be awaited in Next.js 16
export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <main />
}
