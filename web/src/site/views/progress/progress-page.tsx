import { useNavigate } from '@tanstack/react-router'
import styles from './progress-page.module.css'

const i18n = {
  en: {
    back: 'Back to Hub',
    title: 'My Progress',
    completed: 'completed',
    accuracy: 'accuracy',
    conceptMastery: 'Concept Mastery',
    strong: 'Strong',
    growing: 'Growing',
    new: 'New',
    emptyTitle: 'No progress yet.',
    emptyText: 'Start your first experiment!',
    emptyCta: 'Go to Mechanics Lab',
  },
  ko: {
    back: '허브로 돌아가기',
    title: '나의 진도',
    completed: '완료',
    accuracy: '정확도',
    conceptMastery: '개념 숙달도',
    strong: '숙달',
    growing: '성장 중',
    new: '새로움',
    emptyTitle: '아직 진도가 없습니다.',
    emptyText: '첫 번째 실험을 시작하세요!',
    emptyCta: '역학 실험실 가기',
  },
} as const

interface Station {
  name: string
  nameKo: string
  progress: number
  total: number
  completed: number
  accuracy: number
}

interface Concept {
  name: string
  level: 'strong' | 'growing' | 'new'
  pct: number
}

// Mock data — will be replaced with real state
const mockStations: Station[] = [
  {
    name: 'Projectile Station',
    nameKo: '발사체 스테이션',
    progress: 70,
    total: 14,
    completed: 10,
    accuracy: 72,
  },
  {
    name: 'Energy Station',
    nameKo: '에너지 스테이션',
    progress: 45,
    total: 11,
    completed: 5,
    accuracy: 65,
  },
  {
    name: 'Wave Station',
    nameKo: '파동 스테이션',
    progress: 20,
    total: 10,
    completed: 2,
    accuracy: 60,
  },
]

const mockConcepts: Concept[] = [
  { name: 'Gravity', level: 'strong', pct: 85 },
  { name: 'Momentum', level: 'growing', pct: 62 },
  { name: 'Wave Interference', level: 'new', pct: 30 },
]

const totalChallenges = mockStations.reduce((s, st) => s + st.completed, 0)
const overallAccuracy = Math.round(
  mockStations.reduce((s, st) => s + st.accuracy, 0) / mockStations.length,
)

// TODO: replace with real state
const lang: 'en' | 'ko' = 'en'
const hasProgress = true

export function ProgressPage() {
  const navigate = useNavigate()
  const t = i18n[lang]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => void navigate({ to: '/hub' })}
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
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.back}
        </button>
        <span className={styles.headerTitle}>{t.title}</span>
      </header>

      <div className={styles.content}>
        {!hasProgress ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>{t.emptyTitle}</div>
            <p className={styles.emptyText}>{t.emptyText}</p>
            <button
              className={styles.emptyBtn}
              onClick={() => void navigate({ to: '/hub' })}
              type="button"
            >
              {t.emptyCta}
            </button>
          </div>
        ) : (
          <>
            <div className={styles.overview}>
              <div className={styles.overviewStat}>
                <span className={styles.overviewValue}>
                  {totalChallenges}
                </span>
                <span className={styles.overviewLabel}>
                  {t.completed}
                </span>
              </div>
              <div className={styles.overviewStat}>
                <span className={styles.overviewValue}>
                  {overallAccuracy}%
                </span>
                <span className={styles.overviewLabel}>{t.accuracy}</span>
              </div>
            </div>

            <div className={styles.labSection}>
              <div className={styles.labHeader}>
                <div
                  className={styles.labDot}
                  style={{ background: '#4F9CF5' }}
                />
                <span className={styles.labName}>
                  {lang === 'en' ? 'Mechanics Lab' : '역학 실험실'}
                </span>
              </div>

              <div className={styles.stationList}>
                {mockStations.map((station) => (
                  <div key={station.name} className={styles.station}>
                    <div className={styles.stationInfo}>
                      <div className={styles.stationName}>
                        {lang === 'en' ? station.name : station.nameKo}
                      </div>
                      <div className={styles.stationMeta}>
                        {station.completed}/{station.total}
                      </div>
                    </div>
                    <div className={styles.stationProgress}>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${station.progress}%` }}
                        />
                      </div>
                      <span className={styles.progressPct}>
                        {station.progress}%
                      </span>
                    </div>
                    <div className={styles.stationAccuracy}>
                      {t.accuracy}: {station.accuracy}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.conceptSection}>
              <div className={styles.conceptTitle}>{t.conceptMastery}</div>
              <div className={styles.conceptList}>
                {mockConcepts.map((concept) => (
                  <div key={concept.name} className={styles.concept}>
                    <span className={styles.conceptName}>{concept.name}</span>
                    <span
                      className={styles.conceptLevel}
                      data-level={concept.level}
                    >
                      {concept.level === 'strong'
                        ? t.strong
                        : concept.level === 'growing'
                          ? t.growing
                          : t.new}
                    </span>
                    <span className={styles.conceptPct}>{concept.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
