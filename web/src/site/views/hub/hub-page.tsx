import { useNavigate } from '@tanstack/react-router'
import styles from './hub-page.module.css'

const i18n = {
  en: {
    title: 'Research Hub',
    welcome: 'Welcome back, Researcher.',
    resume: 'Continue where you left off?',
    challenges: 'challenges',
    accuracy: 'accuracy',
    enterLab: 'Enter Lab',
    locked: 'Locked',
    stations: 'stations',
    progress: 'Progress',
  },
  ko: {
    title: '연구소 허브',
    welcome: '연구원님, 돌아오셨네요.',
    resume: '이어서 실험할까요?',
    challenges: '도전',
    accuracy: '정확도',
    enterLab: '실험실 입장',
    locked: '잠김',
    stations: '스테이션',
    progress: '진도',
  },
} as const

interface Lab {
  id: string
  nameEn: string
  nameKo: string
  locked: boolean
  lockPhase?: number
  accentColor: string
  secondaryColor: string
  icon: string
  progress: number
  stationCount: number
}

const labs: Lab[] = [
  {
    id: 'mechanics',
    nameEn: 'Mechanics Lab',
    nameKo: '역학 실험실',
    locked: false,
    accentColor: '#4F9CF5',
    secondaryColor: '#F5A623',
    icon: '⚙',
    progress: 0,
    stationCount: 3,
  },
  {
    id: 'molecular',
    nameEn: 'Molecular Lab',
    nameKo: '분자 실험실',
    locked: true,
    lockPhase: 3,
    accentColor: '#7C3AED',
    secondaryColor: '#06B6D4',
    icon: '⚛',
    progress: 0,
    stationCount: 3,
  },
  {
    id: 'space',
    nameEn: 'Space Observatory',
    nameKo: '우주 관측소',
    locked: true,
    lockPhase: 4,
    accentColor: '#1E3A5F',
    secondaryColor: '#F59E0B',
    icon: '✦',
    progress: 0,
    stationCount: 3,
  },
  {
    id: 'quantum',
    nameEn: 'Quantum Lab',
    nameKo: '양자 연구소',
    locked: true,
    lockPhase: 5,
    accentColor: '#EC4899',
    secondaryColor: '#06B6D4',
    icon: '◈',
    progress: 0,
    stationCount: 3,
  },
]

// TODO: replace with real state management
const lang: 'en' | 'ko' = 'en'
const sessionChallenges = 12
const sessionAccuracy = 68

export function HubPage() {
  const navigate = useNavigate()
  const t = i18n[lang]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
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
          <span className={styles.headerTitle}>{t.title}</span>
        </div>

        <div className={styles.headerActions}>
          <button
            className={styles.navBtn}
            onClick={() => void navigate({ to: '/progress' })}
            type="button"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
            {t.progress}
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

      <div className={styles.content}>
        <section className={styles.welcome}>
          <div className={styles.welcomeText}>
            <h2>{t.welcome}</h2>
            <p>{t.resume}</p>
          </div>
          <div className={styles.welcomeStats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{sessionChallenges}</span>
              <span className={styles.statLabel}>{t.challenges}</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{sessionAccuracy}%</span>
              <span className={styles.statLabel}>{t.accuracy}</span>
            </div>
          </div>
        </section>

        <div className={styles.labGrid}>
          {labs.map((lab) => (
            <LabCard key={lab.id} lab={lab} t={t} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LabCard({ lab, t }: { lab: Lab; t: (typeof i18n)[keyof typeof i18n] }) {
  return (
    <article
      className={styles.card}
      data-locked={lab.locked || undefined}
    >
      <div className={styles.cardThumb}>
        <div
          className={styles.cardGradient}
          style={{
            background: `linear-gradient(135deg, ${lab.accentColor}, ${lab.secondaryColor})`,
          }}
        />
        <span className={styles.cardIcon}>{lab.icon}</span>
        {lab.locked && (
          <span className={styles.lockBadge}>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Phase {lab.lockPhase}
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div>
          <div className={styles.cardTitle}>
            {lang === 'en' ? lab.nameEn : lab.nameKo}
          </div>
          <div className={styles.cardSubtitle}>
            {lang === 'en' ? lab.nameKo : lab.nameEn}
          </div>
        </div>

        {!lab.locked && (
          <div className={styles.cardMeta}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${lab.progress}%` }}
              />
            </div>
            <span className={styles.progressText}>{lab.progress}%</span>
          </div>
        )}
      </div>

      <div className={styles.cardAction}>
        {lab.locked ? (
          <button className={styles.lockedBtn} disabled type="button">
            {t.locked}
          </button>
        ) : (
          <button className={styles.enterBtn} type="button">
            {t.enterLab}
          </button>
        )}
        <span className={styles.stationCount}>
          {lab.stationCount} {t.stations}
        </span>
      </div>
    </article>
  )
}
