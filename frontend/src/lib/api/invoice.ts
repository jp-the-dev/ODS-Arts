import { API_BASE_URL } from '@/lib/api/client'
import { authHeaders } from '@/lib/store/auth'

/**
 * Download an order's tax invoice PDF.
 *
 * The endpoint authenticates the owner by bearer token, which a plain `<a
 * href>` cannot carry — an anchor would 404 for the very customer the invoice
 * belongs to. So the PDF is fetched with the auth header and handed to the
 * browser as a blob.
 */
export async function downloadInvoice(orderNumber: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/invoice`, {
    headers: { ...authHeaders(), Accept: 'application/pdf' },
  })

  if (!response.ok) {
    throw new Error(
      response.status === 404
        ? 'No invoice is available for this order yet.'
        : 'The invoice could not be downloaded. Please try again.',
    )
  }

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  try {
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice-${orderNumber}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
  } finally {
    // Revoking immediately would cancel the download in some browsers, so give
    // the click a moment to be picked up first.
    setTimeout(() => URL.revokeObjectURL(url), 10_000)
  }
}
