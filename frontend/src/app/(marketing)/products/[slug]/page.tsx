// Product detail — /products/[slug]
// Server Component
// Note: params must be awaited in Next.js 16
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <main />
}
