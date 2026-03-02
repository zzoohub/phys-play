import type { Language } from '#/shared/types'

type I18nStrings = Record<Language, string>

export const t = {
  // Brand
  brandName: { en: 'PhysPlay', ko: 'PhysPlay' } satisfies I18nStrings,
  tagline: { en: 'Touch science, feel it', ko: '과학을 만지고, 느끼세요' } satisfies I18nStrings,

  // Navigation
  backToHome: { en: 'Home', ko: '홈' } satisfies I18nStrings,
  allExperiences: { en: 'All Science Experiences', ko: '모든 과학 체험' } satisfies I18nStrings,

  // Landing
  startExploring: { en: 'Start exploring', ko: '체험 시작' } satisfies I18nStrings,
  moreComingSoon: { en: 'More science experiences coming soon', ko: '더 많은 과학 체험이 곧 제공됩니다' } satisfies I18nStrings,
  comingSoon: { en: 'Coming Soon', ko: '준비 중' } satisfies I18nStrings,

  // Modules
  motionAndForce: { en: 'Motion & Force', ko: '운동과 힘' } satisfies I18nStrings,
  motionAndForceDesc: { en: 'Throw objects and feel the forces that move them', ko: '물체를 던지고 힘을 직접 느껴보세요' } satisfies I18nStrings,
  energyAndWork: { en: 'Energy & Work', ko: '에너지와 일' } satisfies I18nStrings,
  energyAndWorkDesc: { en: 'Design a roller coaster and watch energy transform', ko: '롤러코스터를 만들고 에너지 변환을 관찰하세요' } satisfies I18nStrings,
  waves: { en: 'Waves', ko: '파동' } satisfies I18nStrings,
  wavesDesc: { en: 'Create waves and observe interference patterns', ko: '파동을 만들고 간섭 패턴을 관찰하세요' } satisfies I18nStrings,
  soundAndLight: { en: 'Sound & Light', ko: '소리와 빛' } satisfies I18nStrings,
  electricityAndMagnetism: { en: 'Electricity & Magnetism', ko: '전기와 자기' } satisfies I18nStrings,
  electromagneticWaves: { en: 'Electromagnetic Waves', ko: '전자기파' } satisfies I18nStrings,

  // Tracks
  classicalPhysics: { en: 'Classical Physics', ko: '고전 물리학' } satisfies I18nStrings,
  classicalPhysicsDesc: { en: 'Force & Energy', ko: '힘과 에너지' } satisfies I18nStrings,
  chemistry: { en: 'Chemistry', ko: '화학' } satisfies I18nStrings,
  chemistryDesc: { en: 'World of Molecules', ko: '분자의 세계' } satisfies I18nStrings,
  spaceScience: { en: 'Space Science', ko: '우주 과학' } satisfies I18nStrings,
  spaceScienceDesc: { en: 'Space Exploration', ko: '우주 탐험' } satisfies I18nStrings,
  quantumMechanics: { en: 'Quantum Mechanics', ko: '양자역학' } satisfies I18nStrings,
  quantumMechanicsDesc: { en: 'Quantum World', ko: '양자의 세계' } satisfies I18nStrings,

  // Simulation controls
  forceMagnitude: { en: 'Force magnitude', ko: '힘의 크기' } satisfies I18nStrings,
  frictionCoefficient: { en: 'Friction coeff.', ko: '마찰 계수' } satisfies I18nStrings,
  mass: { en: 'Mass', ko: '질량' } satisfies I18nStrings,
  gravity: { en: 'Gravity', ko: '중력 환경' } satisfies I18nStrings,
  friction: { en: 'Friction', ko: '마찰' } satisfies I18nStrings,
  showVectors: { en: 'Show vectors', ko: '벡터 표시' } satisfies I18nStrings,
  earth: { en: 'Earth', ko: '지구' } satisfies I18nStrings,
  moon: { en: 'Moon', ko: '달' } satisfies I18nStrings,
  zeroG: { en: 'Zero-G', ko: '무중력' } satisfies I18nStrings,

  // Playback
  play: { en: 'Play', ko: '재생' } satisfies I18nStrings,
  pause: { en: 'Pause', ko: '일시정지' } satisfies I18nStrings,
  reset: { en: 'Reset', ko: '초기화' } satisfies I18nStrings,
  nextModule: { en: 'Next module', ko: '다음 모듈' } satisfies I18nStrings,
  showFormula: { en: 'Show formula', ko: '수식 보기' } satisfies I18nStrings,
  share: { en: 'Share', ko: '공유' } satisfies I18nStrings,
  help: { en: 'Help', ko: '도움말' } satisfies I18nStrings,
  settings: { en: 'Settings', ko: '설정' } satisfies I18nStrings,

  // Loading
  preparingExperience: { en: 'Preparing your 3D experience...', ko: '3D 체험을 준비하는 중...' } satisfies I18nStrings,

  // Loading tips per module
  loadingTips: {
    '1-1': [
      { en: 'You can change the force with the slider', ko: '슬라이더로 힘의 크기를 바꿀 수 있어요' },
      { en: 'Try grabbing and throwing the object', ko: '물체를 직접 잡아서 던져보세요' },
      { en: 'Switch gravity to the Moon or zero gravity', ko: '중력 환경을 달이나 무중력으로 바꿔보세요' },
    ] satisfies I18nStrings[],
    '1-2': [
      { en: 'Select a track preset or draw your own', ko: '트랙 프리셋을 선택하거나 직접 그려보세요' },
      { en: 'Watch how energy transforms along the track', ko: '트랙을 따라 에너지가 어떻게 변환되는지 관찰하세요' },
      { en: 'Toggle friction to see energy loss', ko: '마찰을 켜서 에너지 손실을 확인해보세요' },
    ] satisfies I18nStrings[],
    '1-3': [
      { en: 'Adjust amplitude to change wave size', ko: '진폭을 조절해 파동의 크기를 바꿔보세요' },
      { en: 'Add a second source to see interference', ko: '두 번째 파원을 추가해 간섭을 관찰하세요' },
      { en: 'Toggle superposition mode', ko: '중첩 모드를 활성화해보세요' },
    ] satisfies I18nStrings[],
  },

  // Errors
  webglNotSupported: { en: 'Your browser does not support 3D experiences', ko: '이 브라우저에서는 3D 체험을 지원하지 않습니다' } satisfies I18nStrings,
  webglBrowserList: { en: 'Please use one of these browsers:', ko: '다음 브라우저를 사용해주세요:' } satisfies I18nStrings,
  networkError: { en: 'Could not load the 3D scene', ko: '3D 장면을 불러올 수 없습니다' } satisfies I18nStrings,
  networkErrorDesc: { en: 'Please check your network connection.', ko: '네트워크 연결을 확인해주세요.' } satisfies I18nStrings,
  runtimeCrash: { en: 'The simulation encountered an unexpected issue.', ko: '시뮬레이션이 예상치 못한 문제로 중단되었습니다.' } satisfies I18nStrings,
  tryAgain: { en: 'Try again', ko: '다시 시도' } satisfies I18nStrings,
  resetAndRestart: { en: 'Reset and restart', ko: '초기화 후 재시작' } satisfies I18nStrings,
  viewOtherModules: { en: 'View other modules', ko: '다른 모듈 보기' } satisfies I18nStrings,
  comingSoonModule: { en: 'This module is coming soon.', ko: '이 모듈은 아직 준비 중입니다.' } satisfies I18nStrings,
  tryAvailableModule: { en: 'Try an available module first.', ko: '체험 가능한 모듈을 먼저 해보세요.' } satisfies I18nStrings,

  // Footer
  about: { en: 'About', ko: '소개' } satisfies I18nStrings,
  contact: { en: 'Contact', ko: '문의' } satisfies I18nStrings,

  // Misc
  on: { en: 'ON', ko: 'ON' } satisfies I18nStrings,
  off: { en: 'OFF', ko: 'OFF' } satisfies I18nStrings,
  offline: { en: 'You are offline.', ko: '오프라인 상태입니다.' } satisfies I18nStrings,
} as const
