import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import styles from './landing-page.module.css'

const headingWords = {
  en: ['Predict.', 'Experiment.', 'Discover.'],
  ko: ['예측하고,', '실험하고,', '발견하세요.'],
} as const

const i18n = {
  en: {
    subtitle: '예측하고, 실험하고, 발견하세요',
    subtitleLang: 'ko' as const,
    cta: 'Start Experimenting',
    subtext: 'No signup needed. Jump right in.',
  },
  ko: {
    subtitle: 'Predict. Experiment. Discover.',
    subtitleLang: 'en' as const,
    cta: '실험 시작하기',
    subtext: '가입 필요 없음. 바로 시작하세요.',
  },
} as const

type Lang = 'en' | 'ko'

export function LandingPage() {
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>('en')
  const [showCountdown, setShowCountdown] = useState(false)
  const [mounted, setMounted] = useState(false)

  const handleStart = useCallback(() => {
    try {
      localStorage.setItem('phys-play-visited', 'true')
    } catch {
      // Storage unavailable
    }
    void navigate({ to: '/hub' })
  }, [navigate])

  // Check returning vs first-time user
  useEffect(() => {
    try {
      if (localStorage.getItem('phys-play-visited')) {
        void navigate({ to: '/hub' })
        return
      }
    } catch {
      // No localStorage — treat as first visit
    }
    setMounted(true)
    setShowCountdown(true)
  }, [navigate])

  // Auto-start countdown for first-time users
  useEffect(() => {
    if (!showCountdown) return
    const timer = setTimeout(handleStart, 2000)
    return () => clearTimeout(timer)
  }, [showCountdown, handleStart])

  const t = i18n[lang]
  const words = headingWords[lang]

  return (
    <div className={styles.page} data-mounted={mounted || undefined}>
      <div className={styles.bg} aria-hidden="true">
        <div className={styles.glow} />
        <div
          className={styles.ring}
          style={{ '--s': '340px' } as React.CSSProperties}
        />
        <div
          className={styles.ring}
          style={{ '--s': '560px' } as React.CSSProperties}
        />
      </div>

      <header className={styles.header}>
        <div className={styles.logo}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M12 3L21 19H3L12 3Z" fill="var(--accent-primary)" />
            <circle cx="12" cy="13.5" r="2.5" fill="var(--bg-primary)" />
          </svg>
          <span className={styles.logoText}>PhysPlay</span>
        </div>

        <div className={styles.actions}>
          <button
            className={styles.langBtn}
            onClick={() => setLang((l) => (l === 'en' ? 'ko' : 'en'))}
            type="button"
          >
            <span data-active={lang === 'en' || undefined}>EN</span>
            <span className={styles.sep}>/</span>
            <span data-active={lang === 'ko' || undefined}>KO</span>
          </button>
          <button
            className={styles.iconBtn}
            onClick={() => void navigate({ to: '/settings' })}
            type="button"
            aria-label="Settings"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>

      <main className={styles.hero}>
        <h1 className={styles.heading} lang={lang}>
          {words.map((word, i) => (
            <span
              key={i}
              className={styles.word}
              style={{ '--i': i } as React.CSSProperties}
            >
              {word}
            </span>
          ))}
        </h1>

        <p className={styles.subtitle} lang={t.subtitleLang}>
          {t.subtitle}
        </p>

        <div className={styles.ctaWrap}>
          <button className={styles.cta} onClick={handleStart} type="button">
            {t.cta}
          </button>
          {showCountdown && <div className={styles.countdown} />}
        </div>

        <p className={styles.sub}>{t.subtext}</p>
      </main>
    </div>
  )
}
