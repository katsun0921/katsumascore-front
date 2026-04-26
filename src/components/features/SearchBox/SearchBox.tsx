'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/router'
import { useLocale } from '@/i18n/provider'
import { t } from '@/i18n/t'
import { messages } from './i18n'
export const SearchBox = () => {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const locale = useLocale()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    router.push(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <div className='sidebar-search-box'>
      <p className='sidebar-search-box__heading'>
        {t(messages, ['heading', 'label'], locale)}
      </p>
      <form
        className='sidebar-search-box__form'
        onSubmit={handleSubmit}
        role='search'
      >
        <input
          className='sidebar-search-box__input'
          type='search'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t(messages, ['input', 'placeholder'], locale)}
          aria-label={t(messages, ['input', 'ariaLabel'], locale)}
        />
        <button
          className='sidebar-search-box__button'
          type='submit'
          aria-label={t(messages, ['button', 'ariaLabel'], locale)}
        >
          {t(messages, ['button', 'label'], locale)}
        </button>
      </form>
    </div>
  )
}
