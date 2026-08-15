import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import { WishlistProvider, useWishlist } from '@/lib/store/wishlist'
import { AuthProvider } from '@/lib/store/auth'

const STORAGE_KEY = 'odsarts_wishlist_v1'

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <WishlistProvider>{children}</WishlistProvider>
  </AuthProvider>
)

const renderWishlist = () => renderHook(() => useWishlist(), { wrapper })

beforeEach(() => {
  // Signed out: server sync stays off, so these cover local behaviour only.
  vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('no network'))))
})

describe('wishlist store', () => {
  it('starts empty', async () => {
    const { result } = renderWishlist()

    await waitFor(() => expect(result.current.slugs).toEqual([]))
    expect(result.current.count).toBe(0)
  })

  it('adds and reports membership', async () => {
    const { result } = renderWishlist()

    act(() => result.current.addToWishlist('classic-box'))

    await waitFor(() => expect(result.current.count).toBe(1))
    expect(result.current.isInWishlist('classic-box')).toBe(true)
    expect(result.current.isInWishlist('something-else')).toBe(false)
  })

  it('defaults an untyped save to a frame', async () => {
    const { result } = renderWishlist()

    act(() => result.current.addToWishlist('classic-box'))

    await waitFor(() => expect(result.current.types['classic-box']).toBe('frame'))
  })

  it('records the catalogue an item came from', async () => {
    const { result } = renderWishlist()

    act(() => {
      result.current.addToWishlist('classic-box', 'frame')
      result.current.addToWishlist('folk-dance', 'art')
    })

    await waitFor(() => expect(result.current.count).toBe(2))

    // Without this the page cannot tell which catalogue to resolve a slug
    // against, and a slug can legitimately exist in both.
    expect(result.current.types['classic-box']).toBe('frame')
    expect(result.current.types['folk-dance']).toBe('art')
  })

  it('does not duplicate a repeated add', async () => {
    const { result } = renderWishlist()

    act(() => {
      result.current.addToWishlist('classic-box')
      result.current.addToWishlist('classic-box')
    })

    await waitFor(() => expect(result.current.count).toBe(1))
  })

  it('toggles on and off, preserving the type on re-add', async () => {
    const { result } = renderWishlist()

    act(() => result.current.toggleWishlist('folk-dance', 'art'))
    await waitFor(() => expect(result.current.count).toBe(1))

    act(() => result.current.toggleWishlist('folk-dance', 'art'))
    await waitFor(() => expect(result.current.count).toBe(0))

    act(() => result.current.toggleWishlist('folk-dance', 'art'))
    await waitFor(() => expect(result.current.types['folk-dance']).toBe('art'))
  })

  it('removes and clears', async () => {
    const { result } = renderWishlist()

    act(() => {
      result.current.addToWishlist('a')
      result.current.addToWishlist('b')
    })
    await waitFor(() => expect(result.current.count).toBe(2))

    act(() => result.current.removeFromWishlist('a'))
    await waitFor(() => expect(result.current.slugs).toEqual(['b']))

    act(() => result.current.clearWishlist())
    await waitFor(() => expect(result.current.count).toBe(0))
  })

  it('survives a reload, keeping both slugs and types', async () => {
    const first = renderWishlist()

    act(() => {
      first.result.current.addToWishlist('folk-dance', 'art')
    })
    await waitFor(() => expect(first.result.current.count).toBe(1))

    first.unmount()

    const second = renderWishlist()

    await waitFor(() => expect(second.result.current.count).toBe(1))
    expect(second.result.current.types['folk-dance']).toBe('art')
  })

  it('reads the older bare-array storage format', async () => {
    // v1 persisted just the slugs; an existing customer must not lose their
    // saved items when the format gains types.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(['classic-box', 'slim-box']))

    const { result } = renderWishlist()

    await waitFor(() => expect(result.current.count).toBe(2))
    expect(result.current.slugs).toEqual(['classic-box', 'slim-box'])
  })

  it('ignores corrupt stored data rather than crashing', async () => {
    localStorage.setItem(STORAGE_KEY, 'not json at all')

    const { result } = renderWishlist()

    await waitFor(() => expect(result.current.slugs).toEqual([]))
  })
})
