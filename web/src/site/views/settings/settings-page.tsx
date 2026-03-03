import { useState, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import styles from "./settings-page.module.css";

type Lang = "en" | "ko";
type Theme = "light" | "dark" | "system";
type Graphics = "auto" | "low" | "medium" | "high";
type Motion = "full" | "reduced";

const i18n = {
  en: {
    back: "Back to Hub",
    title: "Settings",
    language: "Language",
    languageAlt: "언어",
    theme: "Theme",
    themeAlt: "테마",
    themLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    sound: "Sound",
    soundAlt: "사운드",
    master: "Master",
    sfx: "SFX",
    bgm: "BGM",
    ambient: "Ambient",
    graphics: "Graphics",
    graphicsAlt: "그래픽",
    motion: "Motion",
    motionAlt: "모션",
    motionFull: "Full",
    motionReduced: "Reduced",
    data: "Data",
    dataAlt: "데이터",
    clearProgress: "Clear Local Progress",
  },
  ko: {
    back: "허브로 돌아가기",
    title: "설정",
    language: "언어",
    languageAlt: "Language",
    theme: "테마",
    themeAlt: "Theme",
    themLight: "라이트",
    themeDark: "다크",
    themeSystem: "시스템",
    sound: "사운드",
    soundAlt: "Sound",
    master: "마스터",
    sfx: "SFX",
    bgm: "BGM",
    ambient: "환경음",
    graphics: "그래픽",
    graphicsAlt: "Graphics",
    motion: "모션",
    motionAlt: "Motion",
    motionFull: "전체",
    motionReduced: "축소",
    data: "데이터",
    dataAlt: "Data",
    clearProgress: "로컬 진도 삭제",
  },
} as const;

export function SettingsPage() {
  const navigate = useNavigate();

  const [lang, setLang] = useState<Lang>("en");
  const [theme, setTheme] = useState<Theme>("system");
  const [graphics, setGraphics] = useState<Graphics>("auto");
  const [motion, setMotion] = useState<Motion>("full");
  const [masterVol, setMasterVol] = useState(80);
  const [sfxVol, setSfxVol] = useState(80);
  const [bgmVol, setBgmVol] = useState(50);
  const [ambientVol, setAmbientVol] = useState(60);

  const t = i18n[lang];

  const handleThemeChange = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    const html = document.documentElement;
    if (newTheme === "system") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", newTheme);
    }
  }, []);

  const handleClearProgress = useCallback(() => {
    if (
      window.confirm(
        lang === "en"
          ? "Delete all your progress? This removes all challenge history, accuracy data, and unlocks. This cannot be undone."
          : "모든 진도를 삭제하시겠습니까? 모든 도전 기록, 정확도 데이터, 잠금 해제가 삭제됩니다. 이 작업은 되돌릴 수 없습니다.",
      )
    ) {
      try {
        localStorage.removeItem("phys-play-visited");
        localStorage.removeItem("phys-play-progress");
      } catch {
        // Ignore storage errors
      }
    }
  }, [lang]);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.backBtn}
          onClick={() => void navigate({ to: "/hub" })}
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
        {/* Language */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t.language}
            <span className={styles.sectionLabelAlt}>{t.languageAlt}</span>
          </div>
          <div className={styles.segmented}>
            <button
              className={styles.segBtn}
              data-active={lang === "en" || undefined}
              onClick={() => setLang("en")}
              type="button"
            >
              EN
            </button>
            <button
              className={styles.segBtn}
              data-active={lang === "ko" || undefined}
              onClick={() => setLang("ko")}
              type="button"
            >
              KO
            </button>
          </div>
        </div>

        {/* Theme */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t.theme}
            <span className={styles.sectionLabelAlt}>{t.themeAlt}</span>
          </div>
          <div className={styles.segmented}>
            {(["light", "dark", "system"] as const).map((v) => (
              <button
                key={v}
                className={styles.segBtn}
                data-active={theme === v || undefined}
                onClick={() => handleThemeChange(v)}
                type="button"
              >
                {v === "light"
                  ? t.themLight
                  : v === "dark"
                    ? t.themeDark
                    : t.themeSystem}
              </button>
            ))}
          </div>
        </div>

        {/* Sound */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t.sound}
            <span className={styles.sectionLabelAlt}>{t.soundAlt}</span>
          </div>
          <div className={styles.sliderGroup}>
            <SliderRow
              label={t.master}
              value={masterVol}
              onChange={setMasterVol}
            />
            <SliderRow label={t.sfx} value={sfxVol} onChange={setSfxVol} />
            <SliderRow label={t.bgm} value={bgmVol} onChange={setBgmVol} />
            <SliderRow
              label={t.ambient}
              value={ambientVol}
              onChange={setAmbientVol}
            />
          </div>
        </div>

        {/* Graphics */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t.graphics}
            <span className={styles.sectionLabelAlt}>{t.graphicsAlt}</span>
          </div>
          <div className={styles.segmented}>
            {(["auto", "low", "medium", "high"] as const).map((v) => (
              <button
                key={v}
                className={styles.segBtn}
                data-active={graphics === v || undefined}
                onClick={() => setGraphics(v)}
                type="button"
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Motion */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>
            {t.motion}
            <span className={styles.sectionLabelAlt}>{t.motionAlt}</span>
          </div>
          <div className={styles.segmented}>
            <button
              className={styles.segBtn}
              data-active={motion === "full" || undefined}
              onClick={() => setMotion("full")}
              type="button"
            >
              {t.motionFull}
            </button>
            <button
              className={styles.segBtn}
              data-active={motion === "reduced" || undefined}
              onClick={() => setMotion("reduced")}
              type="button"
            >
              {t.motionReduced}
            </button>
          </div>
        </div>

        {/* Data / Danger zone */}
        <div className={`${styles.section} ${styles.dangerSection}`}>
          <div className={styles.sectionLabel}>
            {t.data}
            <span className={styles.sectionLabelAlt}>{t.dataAlt}</span>
          </div>
          <button
            className={styles.dangerBtn}
            onClick={handleClearProgress}
            type="button"
          >
            {t.clearProgress}
          </button>
        </div>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className={styles.sliderRow}>
      <span className={styles.sliderLabel}>{label}</span>
      <input
        className={styles.slider}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={styles.sliderValue}>{value}%</span>
    </div>
  );
}
