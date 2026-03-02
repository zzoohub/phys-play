import { useLang } from '#/shared/stores'
import { t } from '#/shared/constants'
import { LanguageToggle } from './language-toggle'

export function Footer() {
  const { lang } = useLang()

  return (
    <footer className="border-t border-slate-800/50 dark:border-slate-800/50 light:border-slate-200 bg-slate-950/50 dark:bg-slate-950/50 light:bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between md:px-6">
        <div className="flex items-center gap-6 text-xs text-slate-500">
          <a href="#" className="hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 transition-colors">
            {t.about[lang]}
          </a>
          <a href="#" className="hover:text-slate-300 dark:hover:text-slate-300 light:hover:text-slate-700 transition-colors">
            {t.contact[lang]}
          </a>
        </div>
        <LanguageToggle />
      </div>
    </footer>
  )
}
