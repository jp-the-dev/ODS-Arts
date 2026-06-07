// Auth layout — completely clean, no nav/footer/cart
// Only for /auth/* pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
