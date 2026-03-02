import { useLang } from '#/shared/stores'
import type { Language } from '#/shared/types'

interface LanguageToggleProps {
  variant?: 'pill' | 'minimal'
}

export function LanguageToggle({ variant = 'pill' }: LanguageToggleProps) {
  const { lang, setLang } = useLang()
  const options: Language[] = ['ko', 'en']

  if (variant === 'minimal') {
    return (
      <button
        type="button"
        onClick={() => setLang(lang === 'en' ? 'ko' : 'en')}
        className="text-xs font-medium text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-500 light:hover:text-slate-900 transition-colors cursor-pointer uppercase tracking-wider"
        aria-label={`Switch language to ${lang === 'en' ? 'Korean' : 'English'}`}
      >
        {lang === 'en' ? 'ko' : 'en'}
      </button>
    )
  }

  return (
    <div className="inline-flex rounded-md bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200/80 p-0.5" role="radiogroup" aria-label="Language">
      {options.map(l => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={`
            px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider transition-all duration-150 cursor-pointer
            focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cyan-400
            ${lang === l
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-200 light:text-slate-500 light:hover:text-slate-800'
            }
          `}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
