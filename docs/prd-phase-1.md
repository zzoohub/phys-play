# PhysPlay Phase 1 PRD — 역학 실험실 (Mechanics Lab)

**Status:** Draft
**Last Updated:** 2026-03-04
**Parent PRD:** [prd.md](./prd.md) | **Product Brief:** [product-brief.md](./product-brief.md)
**Client Structure:** [client-structure.md](./client-structure.md)

---

## 1. Phase 1 Overview

### 1.1 Goal

Phase 1은 PhysPlay의 코어 베팅을 검증하기 위한 최소 릴리스다. **"예측 -> 실험 -> 발견" 코어 루프 + God Hand 인터랙션 + 엔진 기반 챌린지 생성**이 역학 실험실 안에서 동작하는 것을 증명한다.

### 1.2 What Needs to Be True

Phase 1 출시 시점에 다음이 모두 참이어야 한다:

1. URL을 열면 30초 안에 첫 챌린지(온보딩)를 완주할 수 있다 (회원가입 없음)
2. 역학 실험실 안에 3개 스테이션(투사체, 에너지, 파동)이 동작한다
3. 각 스테이션에서 코어 루프(Predict -> Play -> Discover -> Next Challenge)가 완결된다
4. 3개 시뮬레이션 엔진이 챌린지 JSON을 읽어 실행한다
5. 메타데이터 기반 규칙 엔진이 사용자 수준에 맞는 다음 챌린지를 선택한다
6. 진도와 예측 이력이 로컬(IndexedDB)에 저장되어 재방문 시 유지된다
7. PC mid-range에서 60fps, 모바일 mid-range에서 30fps 이상
8. 한국어/영어 i18n 지원
9. PostHog 이벤트 트래킹이 동작한다

### 1.3 Success Criteria

[Product Brief -- Success Criteria](./product-brief.md#4-success-criteria) 참조. Phase 1 핵심 지표:

| Metric | Target | How Measured |
|--------|--------|-------------|
| 예측 참여율 | 스테이션 진입자의 70%가 1회 이상 예측 | `predict_submit` / `station_enter` |
| 예측 스킵율 | 30% 미만 | `predict_skip` / (`predict_submit` + `predict_skip`) |
| 스테이션 완주율 | 진입자의 40%가 챌린지 시퀀스 완료 | `station_complete` / `station_enter` |
| 평균 세션 체류 시간 | 5분 이상 | `session_start` ~ 마지막 이벤트 |
| 스테이션 간 이동률 | 30% 이상 2개+ 스테이션 방문 | `station_navigate` distinct count |
| 예측 정확도 향상률 | 동일 스테이션 후반부에서 20% 향상 | `challenge_complete.was_correct` 시계열 |
| 온보딩 완료율 | 첫 방문자의 80% | `onboarding_complete` / `session_start` (first visit) |

### 1.4 Phase 1 Non-Goals (Out of Scope)

| Non-Goal | 근거 |
|----------|------|
| 계정/로그인 시스템 | 로컬 저장으로 시작. 계정은 Phase 3 |
| XR 모드 구현 | 아키텍처는 XR-ready, 실제 구현은 Phase 2+ |
| UGC (챌린지 에디터/공유) | Phase 3+. 단, 데이터 구조는 UGC-ready JSON |
| 다른 공간 (분자/우주/양자) | Phase 3~5에서 순차적 해금 |
| ML 기반 적응형 AI | Phase 1은 규칙 기반. ML은 Phase 2+ |
| B2B 교사 대시보드 | B2C 개인 사용자 경험에 집중 |
| 네이티브 앱 (iOS/Android) | 웹 기반 (PWA 가능성은 Phase 2+ 검토) |
| 포인트/배지/리더보드 | Phase 2+에서 외적 보상 요소 검토 |
| AI 챗봇/튜터 | AI는 디렉터 역할(챌린지 선택)에 한정 |
| 소셜 기능 (공유/멀티플레이) | Phase 3+ |
| 오디오 (BGM/SFX/앰비언트) | Phase 2에서 사운드 레이어 추가. Phase 1은 비주얼 중심 |

---

## 2. User Flows

### 2.1 첫 방문 사용자 (First-Time User Flow)

```
1. URL 접속
   ├── 랜딩 페이지(2D) — PhysPlay 소개 + "실험 시작" CTA
   │   브랜드 로고, 한 줄 태그라인, 역학 실험실 미리보기 비주얼
   │   CTA 버튼: "바로 실험 시작" (계정 불필요)
   │
2. CTA 클릭 → 온보딩 챌린지 진입
   ├── Portal Transition (2D -> 3D 전환 연출)
   │   깊이감 있는 전환으로 "실험실에 들어가는" 느낌
   │
3. 온보딩 챌린지 (투사체 스테이션 #1 단순 버전)
   ├── 3a. PREDICT — "타깃을 맞추려면 어디를 조준?" (placement)
   │   └── HUD에 조준점 선택 UI. 스킵 불가 (온보딩)
   ├── 3b. PLAY — God Hand로 새총 발사
   │   └── 클릭 드래그로 조준 + 발사. 실시간 궤적 표시
   ├── 3c. DISCOVER — 예측 vs 결과 비교
   │   └── 정답/오답에 따른 concept 설명 (Level 1)
   │   └── "다음 챌린지" CTA
   │
4. 온보딩 완료 → 연구소 허브 진입
   ├── 3D -> 2D 전환 (역 Portal Transition)
   ├── 연구소 허브(2D) 첫 노출
   │   └── 역학 실험실(해금) + 잠긴 공간 3개(실루엣)
   │   └── 역학 실험실 안의 3개 스테이션 미리보기
   │   └── 투사체 스테이션에 "1/10 완료" 표시
   │
5. 스테이션 선택 → 실험실 진입
   ├── Portal Transition → 풀스크린 3D + HUD
   └── 첫 챌린지 시작 (온보딩에서 이미 1개 완료)
```

### 2.2 재방문 사용자 (Returning User Flow)

```
1. URL 접속
   ├── IndexedDB에서 진도 데이터 감지
   │
2. 연구소 허브(2D) — 홈 화면
   ├── 해금된 역학 실험실 표시
   │   └── 각 스테이션의 진행률 (n/10, n/8, n/8)
   │   └── 마지막으로 플레이한 스테이션 하이라이트
   ├── 잠긴 공간 3개 (실루엣 + "Coming Soon")
   │
3. 스테이션 선택 → 실험실 진입
   ├── Portal Transition → 풀스크린 3D + HUD
   ├── 적응형 엔진이 다음 챌린지 선택
   │   └── 메타데이터(tags, difficulty) + 사용자 이력 기반
   │
4. 코어 루프 반복
   ├── Predict → Play → Discover → Next Challenge
   ├── 스테이션 내 모든 챌린지 완주 시:
   │   └── 완주 축하 연출
   │   └── "다른 스테이션 도전" 추천 (HUD)
   │
5. 스테이션 간 이동 (HUD 내비게이션)
   ├── 3D 환경 내에서 스테이션 전환
   │   └── HUD 메뉴로 스테이션 선택
   │   └── 같은 역학 실험실 공간이므로 3D를 벗어나지 않음
   │
6. 세션 종료
   └── 브라우저 닫기 → IndexedDB에 자동 저장
```

### 2.3 코어 루프 상세 플로우 (단일 챌린지)

```
[챌린지 시작]
│
├── PREDICT Phase
│   ├── HUD에 질문 표시 (챌린지의 predict.question)
│   ├── 예측 인풋 (predict.type에 따라):
│   │   ├── trajectory: 3D 공간에 궤적 드로잉
│   │   ├── binary: 선택지 2~3개 중 택1
│   │   ├── pattern: 시각적 패턴 3~4개 중 택1
│   │   └── placement: 3D 공간에 마커/오브젝트 배치
│   ├── "예측 제출" 버튼 → predict_submit 이벤트
│   └── [선택] "스킵" 버튼 (온보딩 제외) → predict_skip 이벤트
│
├── PLAY Phase
│   ├── God Hand 인터랙션 활성화
│   │   ├── 챌린지별 God Hand 패턴 (던지기/조립/당기기/설치 등)
│   │   └── play_start 이벤트
│   ├── 시뮬레이션 실행
│   │   └── 엔진이 params 기반으로 물리 계산 + 3D 렌더링
│   ├── 결과 시각화 (궤적, 충돌, 파면 등)
│   └── play_complete 이벤트 (duration_ms 포함)
│
├── DISCOVER Phase
│   ├── 예측 vs 결과 비교 시각화 (겹쳐 보이기)
│   │   ├── trajectory: 내 궤적(파랑) vs 실제 궤적(빨강)
│   │   ├── binary/pattern: 내 선택 vs 정답 하이라이트
│   │   └── placement: 내 마커 vs 정답 위치
│   ├── 정답 여부에 따른 분기:
│   │   ├── 정답 → "정확해요!" + Level 1 설명 (간결)
│   │   └── 오답 → "왜 다를까?" + Level 1~2 설명 (상세)
│   ├── "더 알아보기" 펼침 → Level 2~3 설명 (선택)
│   │   └── discover_detail_open 이벤트
│   ├── discover_view 이벤트 (was_correct 포함)
│   └── challenge_complete 이벤트
│
├── NEXT CHALLENGE
│   ├── 적응형 엔진이 다음 챌린지 선택
│   │   ├── 정답 → difficulty 유지 또는 상향
│   │   ├── 오답 → 관련 tags 챌린지 우선 배치 (약점 보강)
│   │   └── 동일 difficulty 내 미완료 챌린지 우선
│   ├── "다음 챌린지" CTA → 다음 챌린지로 전환
│   └── [선택] "허브로 돌아가기" → 연구소 허브(2D)
│
└── [스테이션 완주 시]
    ├── 완주 축하 연출 (HUD)
    ├── station_complete 이벤트
    └── 다른 스테이션 추천 또는 허브로 복귀
```

---

## 3. Feature Specifications

### 3.1 Landing / Onboarding (첫 30초)

**Landing Page (2D)**

- 단일 페이지, 반응형
- 콘텐츠:
  - PhysPlay 로고 + 태그라인 ("예측하고, 실험하고, 발견하라")
  - 역학 실험실 3D 미리보기 (정적 이미지 또는 짧은 루프 영상)
  - "바로 실험 시작" CTA (primary, 화면 중앙)
  - 간략한 3단계 소개 (Predict / Play / Discover 아이콘 + 한 줄 설명)
- 계정/로그인 버튼 없음 (Phase 1)
- 언어 전환 토글 (ko/en)
- Light/Dark 모드 자동 감지 + 수동 토글

**Portal Transition (2D -> 3D)**

- CTA 클릭 시 2D -> 3D 전환 연출
- 목적: "실험실에 들어간다"는 심리적 게이트. 몰입 전환을 극적으로
- 기술: 카메라가 랜딩 페이지에서 3D 뷰포트로 zoom-in + 환경 변화
- 소요 시간: 1~2초 (스킵 가능)

**온보딩 챌린지**

- 투사체 스테이션 #1 "원숭이와 사냥꾼"의 단순 버전:
  - 타깃 고정 (낙하 OFF), 거리 짧게
  - "3D에서 타깃 맞추기"만 체험
  - 성공 후 → 본격 챌린지 시작 (타깃 낙하 ON)
- 예측 스킵 불가 (온보딩에서는 코어 루프를 반드시 체험)
- 30초 안에 Predict -> Play -> Discover 1회 완주 목표
- 온보딩 완료 시 `onboarding_complete` 이벤트

### 3.2 연구소 허브 (Hub)

**구성 (2D Page)**

허브는 실험실 바깥이므로 2D로 처리하여 3D 리소스를 절약한다.

- **역학 실험실 카드** (해금 상태):
  - 3개 스테이션 미리보기 (투사체 / 에너지 / 파동)
  - 각 스테이션 진행률 표시 (완료/전체 챌린지 수)
  - 마지막 플레이 스테이션 하이라이트
  - "실험 시작" CTA → Portal Transition → 3D
- **잠긴 공간 3개** (실루엣/비활성):
  - 분자 실험실, 우주 관측소, 양자 연구소
  - "Coming Soon" 라벨
  - 실루엣 + 반투명 처리로 호기심 유발
- **글로벌 네비게이션**:
  - 언어 전환 (ko/en)
  - Light/Dark 모드 토글
  - 진도 초기화 (로컬 데이터 삭제 확인 다이얼로그)

**스테이션 미리보기 정보:**

| 스테이션 | 표시 정보 |
|---------|----------|
| 투사체 | 아이콘, 이름, "n/10 챌린지 완료", 마지막 플레이 시각 |
| 에너지 | 아이콘, 이름, "n/8 챌린지 완료", 마지막 플레이 시각 |
| 파동 | 아이콘, 이름, "n/8 챌린지 완료", 마지막 플레이 시각 |

### 3.3 Core Loop Implementation

코어 루프의 4단계(Predict -> Play -> Discover -> Next Challenge)는 모두 3D 뷰포트 + HUD 오버레이 안에서 완결된다. 2D 페이지로 이동하지 않는다.

**Phase 전환 (HUD 상태 기계):**

```
IDLE → PREDICT → PLAY → DISCOVER → IDLE (next challenge)
```

각 Phase에서 HUD가 표시하는 UI가 달라진다:

| Phase | HUD 표시 | 3D 뷰포트 상태 |
|-------|---------|--------------|
| PREDICT | 질문 텍스트, 예측 인풋 UI, 제출/스킵 버튼 | 챌린지 세팅 표시 (오브젝트, 환경). 카메라 자유 이동 가능 |
| PLAY | God Hand 컨트롤 힌트, 실행 버튼 | God Hand 인터랙션 활성. 시뮬레이션 대기 |
| DISCOVER | 비교 오버레이, 정답/오답 피드백, concept 설명 패널, "다음" CTA | 예측 vs 결과 겹쳐 표시. 카메라 자유 이동 |
| IDLE | 스테이션 메뉴, 허브 복귀 버튼 | 환경 배경만 |

### 3.4 시뮬레이션 엔진

3개 엔진은 각각 독립적이며, 챌린지 JSON의 `params`를 읽어 물리 계산 + 3D 렌더링을 수행한다.

#### 3.4.1 투사체 엔진 (Projectile Engine)

- **커버 범위:** 포물선 운동, 중력, 마그누스 효과, 코리올리 힘, 중력 보조, 시공간 곡률 시각화
- **챌린지:** 10개 시나리오 -> [projectile/challenges.md](./contents/engines/projectile/challenges.md) 참조
- **핵심 변수:** gravity, launchSpeed, angle(vec2), mass, drag, spinRate, spinAxis, rotationRate, gravitySources, obstacles, targetPosition, targetDropOnLaunch, environmentPreset
- **상세:** [projectile/concepts.md](./contents/engines/projectile/concepts.md) 참조

**God Hand 패턴:**

| 패턴 | 적용 챌린지 | 웹 인터랙션 |
|------|-----------|-----------|
| 던지기/발사 | #1, #2, #3, #4, #5, #6, #7, #9, #10 | 클릭 드래그로 방향/강도 설정 → 릴리스로 발사 |
| 3D 조준 | #1, #6 | 마우스로 3D 공간의 조준점 선택 |
| 배치/설정 | #5, #10 | 드래그로 오브젝트 위치 설정 |

**예측 유형 분포:** trajectory 70% / placement 20% / pattern 10%
**난이도 분포:** Level 1(2개) / Level 2(2개) / Level 3(3개) / Level 4(2개) / Level 5(1개)

#### 3.4.2 충돌/에너지 엔진 (Collision-Energy Engine)

- **커버 범위:** 에너지 보존, 운동량 보존, 탄성/비탄성 충돌, 진자 운동, 충격량, 에너지 변환
- **챌린지:** 8개 시나리오 -> [collision-energy/challenges.md](./contents/engines/collision-energy/challenges.md) 참조
- **핵심 변수:** height, friction, loopRadius, mass[], velocity[], elasticity, pendulumLength, pendulumAngle, trackPieces, structure, balls3D, pendulums, latitude, vehicles, chainElements, protectionMaterials, dropHeight
- **상세:** [collision-energy/concepts.md](./contents/engines/collision-energy/concepts.md) 참조

**에너지 시각화 시스템:**
- 실시간 에너지 바: PE(파랑) / KE(빨강) / 열(주황)
- 에너지 전환 시 바 간 애니메이션 (한쪽 줄면 다른 쪽 늘어남)
- 마블런, 철거 공, 루브 골드버그 등에서 핵심 시각화 요소

**God Hand 패턴:**

| 패턴 | 적용 챌린지 | 웹 인터랙션 |
|------|-----------|-----------|
| 조립/빌딩 | #1 마블런, #7 루브 골드버그, #8 달걀 보호 | 드래그로 조각 배치, 스냅 결합 |
| 던지기/밀기 | #3 우주 당구 | 클릭 드래그로 방향/강도 |
| 당기기 | #2 철거 공, #4 진자 웨이브, #5 푸코 진자 | 드래그로 높이/각도 설정 → 릴리스 |
| 속도 조절 | #6 트럭 vs 경차 | 드래그 슬라이더 → 충돌 트리거 |

**예측 유형 분포:** binary ~40% / pattern ~40% / placement ~10%
**난이도 분포:** Level 1(1개) / Level 2(3개) / Level 3(3개) / Level 4(1개)

#### 3.4.3 파동 엔진 (Wave Engine)

- **커버 범위:** 정상파, 간섭, 도플러, 마하 콘, 공명, 건축 음향, 악기 물리, 지진파
- **챌린지:** 8개 시나리오 -> [wave/challenges.md](./contents/engines/wave/challenges.md) 참조
- **핵심 변수:** waveType, frequency, amplitude, sources, phaseDiff, slitWidth, sourceSpeed, roomDimensions, wallMaterial, antiSources, objectSpeed, mediumSpeed, resonantObject, earthLayers, sourcePath3D, roomShape, instrumentType, strikePoint
- **상세:** [wave/concepts.md](./contents/engines/wave/concepts.md) 참조

**파동 시각화 시스템:**
- 3D 파면 시각화 (동심구, 마하 콘, 간섭 패턴)
- 파동 세기 맵 (3D 공간 내 세기를 컬러맵으로)
- 정상파 노드/배 위치 표시

**God Hand 패턴:**

| 패턴 | 적용 챌린지 | 웹 인터랙션 |
|------|-----------|-----------|
| 배치/설치 | #1 소리의 방, #2 노이즈 캔슬링, #7 속삭임의 방 | 드래그로 마커/스피커 배치 |
| 주파수 조절 | #4 와인잔 깨기 | 슬라이더 드래그 |
| 속도 조절 | #3 소닉 붐 | 슬라이더 드래그 |
| 지점 터치/타격 | #5 지진파, #8 악기 물리 | 클릭으로 타격 위치 지정 |
| 경로 설계 | #6 도플러 비행 | 웨이포인트 클릭 배치 |

**예측 유형 분포:** placement 50% / pattern 37.5% / binary 12.5%
**난이도 분포:** Level 1(1개) / Level 2(3개) / Level 3(3개) / Level 4(1개)

### 3.5 Challenge Data Schema

모든 챌린지는 다음 JSON 스키마를 따른다. 이 구조는 UGC와 AI 자동 생성을 위한 데이터 계약이다.

```jsonc
{
  // === 식별 ===
  "id": "string",                    // 고유 ID (engineId-kebab-name)
  "engineId": "string",              // "projectile" | "collision-energy" | "wave"
  "version": "number",               // 스키마 버전 (현재: 2)

  // === 시뮬레이션 파라미터 ===
  "params": {
    // 엔진별로 다른 변수 세트
    // 투사체: gravity, launchSpeed, angle, mass, drag, spinRate, ...
    // 충돌/에너지: height, friction, mass[], velocity[], elasticity, ...
    // 파동: frequency, amplitude, roomDimensions, wallMaterial, ...
  },

  // === 예측 ===
  "predict": {
    "type": "string",                // "trajectory" | "binary" | "pattern" | "placement"
    "question": "string",            // 사용자에게 표시할 질문 (i18n key)
    "options": ["string"],           // binary/pattern인 경우 선택지 배열
    "tolerance": "number | null"     // trajectory/placement의 오차 허용 범위 (0~1, 비율)
  },

  // === 발견 ===
  "discover": {
    "relatedConcepts": ["string"],   // concept ID 배열 (knowledge graph 노드 참조)
    "level1": "string",              // 직관적 비유 (i18n key)
    "level2": "string",              // 개념 설명 (i18n key)
    "level3": "string"               // 수식 포함 설명 (i18n key)
  },

  // === 메타데이터 (적응형 엔진 입력) ===
  "difficulty": "number",            // 1~5
  "space": "string",                 // "mechanics-lab"
  "station": "string",               // "projectile" | "collision-energy" | "wave"
  "tags": ["string"],                // 물리 개념 태그 (예: "gravity", "momentum")
  "contextHint": "string | null"     // 실생활 연결 힌트 (i18n key)
}
```

**Required fields:** `id`, `engineId`, `version`, `params`, `predict`, `discover.relatedConcepts`, `difficulty`, `space`, `station`, `tags`

**Optional fields:** `predict.tolerance`, `predict.options`, `contextHint`, `discover.level1~3` (없으면 relatedConcepts에서 concept-level library 참조)

**i18n 전략:** `question`, `options`, `level1~3`, `contextHint` 필드는 i18n key를 값으로 가진다. 런타임에 locale에 맞는 텍스트로 치환. JSON 파일에 직접 텍스트를 넣지 않는다.

### 3.6 Prediction System

4가지 예측 유형의 구현 상세:

#### trajectory (궤적 그리기)

- **인풋:** 3D 공간에서 마우스 클릭+드래그로 경유점(waypoint) 배치 → 스플라인 보간으로 궤적 생성
- **PC:** 마우스 클릭으로 경유점 추가, 드래그로 이동, 더블클릭으로 완료
- **모바일:** 터치로 경유점 추가, 드래그로 이동, "완료" 버튼
- **시각화:** 사용자 궤적은 파랑 점선, 확정 후 실선
- **판정:** 실제 궤적과 사용자 궤적 사이의 평균 오차(normalized). `predict.tolerance` 이내면 정답
- **Discover 시 비교:** 파랑(예측) vs 빨강(실제) 궤적을 동일 뷰포트에 겹쳐 표시

#### binary (이진/삼진 선택)

- **인풋:** HUD에 선택지 버튼 2~3개 표시. 클릭으로 선택
- **PC/모바일:** 동일 (HUD 버튼)
- **시각화:** 선택한 옵션 하이라이트
- **판정:** 정답 옵션 매칭
- **Discover 시 비교:** 정답 옵션에 체크마크, 오답 시 사용자 선택에 X 표시 + 왜 다른지 설명

#### pattern (패턴 선택지)

- **인풋:** HUD에 3~4개 패턴 미리보기(이미지 또는 짧은 3D 애니메이션 미리보기) 표시. 클릭으로 선택
- **PC/모바일:** 동일 (HUD 카드 UI)
- **시각화:** 선택한 패턴 카드 하이라이트
- **판정:** 정답 패턴 매칭
- **Discover 시 비교:** 정답 패턴 재생 + "왜 이 패턴인지" 설명

#### placement (3D 배치)

- **인풋:** 3D 공간에 마커 또는 오브젝트를 드래그하여 배치
- **PC:** 마우스 드래그로 3D 위치 설정. 축 제한 가능 (챌린지에 따라 XZ 평면만, 또는 자유 3D)
- **모바일:** 터치 드래그. 2-finger로 높이(Y) 조절
- **시각화:** 사용자 배치 마커는 파랑, 확정 시 고정
- **판정:** 정답 위치와의 3D 거리. `predict.tolerance` 이내면 정답
- **Discover 시 비교:** 파랑(예측 위치) vs 빨강(정답 위치) 동시 표시 + 거리 표시

### 3.7 Discover System (Concept-Level Library)

Discover 콘텐츠는 챌린지별로 하드코딩하지 않고, **concept-level 라이브러리**로 구조화한다.

**구조:**

```
concept ID (string, kebab-case)
├── level1: string     // 직관적 비유 (일상 경험에 비유한 한 줄)
├── level2: string     // 개념 설명 (변수 간 관계를 자연어로)
├── level3: string     // 수식 포함 (정량적 관계)
├── relatedConcepts: string[]  // 연결된 다른 concept
└── engines: string[]  // 이 concept을 다루는 엔진 목록
```

**런타임 Discover 조합 로직:**

1. 챌린지의 `discover.relatedConcepts`로 관련 concept 목록 획득
2. 사용자의 정답/오답 상태에 따라 프레이밍 결정:
   - 정답 → 축하 + 간결한 설명 (Level 1)
   - 오답 → "왜 다를까?" + 상세 설명 (Level 1 + Level 2)
3. 사용자 수준(태그별 정확도 기반)에 따라 기본 설명 깊이 결정:
   - 초보(정확도 < 40%) → Level 1
   - 중급(40~70%) → Level 2
   - 고급(> 70%) → Level 3
4. "더 알아보기" 펼침으로 다음 Level 접근 가능 (항상)
5. 챌린지 JSON의 `contextHint`가 있으면 실생활 연결 힌트로 추가 표시

**Phase 1 concept 수:** 약 33개 (투사체 11 + 충돌/에너지 10 + 파동 12)
각 엔진의 concepts.md에 정의된 개념 목록을 concept-level library로 변환.

### 3.8 Adaptive Challenge Selection (적응형 챌린지 선택)

Phase 1은 ML이 아닌 **메타데이터 기반 규칙 엔진**으로 구현한다.

#### 입력 데이터

사용자 로컬 상태에서 추출:

```typescript
interface UserStationState {
  stationId: string;
  completedChallenges: string[];          // 완료한 챌린지 ID 목록
  tagAccuracy: Record<string, {           // 태그별 정확도
    correct: number;
    total: number;
    accuracy: number;                     // correct / total
  }>;
  currentDifficulty: number;              // 현재 difficulty 수준 (1~5)
  consecutiveCorrect: number;             // 연속 정답 수
  consecutiveWrong: number;               // 연속 오답 수
  lastPlayedAt: number;                   // 마지막 플레이 timestamp
}
```

#### 선택 알고리즘

다음 챌린지를 선택할 때, 스테이션의 챌린지 풀에서 아래 순서로 필터링 + 우선순위를 적용한다:

```
Step 1: 기본 필터
  - 현재 스테이션의 챌린지만
  - 아직 완료하지 않은 챌린지만 (재도전은 별도 UI)

Step 2: Difficulty 필터
  - currentDifficulty +/- 1 범위 내 챌린지만
  - 범위 내 챌린지가 없으면 범위를 확장

Step 3: 약점 보강 우선순위
  - 사용자의 tagAccuracy에서 accuracy < 50%인 태그 추출
  - 해당 태그를 가진 챌린지에 가중치 부여 (약점 태그 수 * 2)

Step 4: 다양성 보장
  - 직전 3개 챌린지와 동일한 predict.type인 챌린지에 감점 (-1)
  - 직전 챌린지와 동일한 tags만 가진 챌린지에 감점 (-1)

Step 5: 최종 선택
  - 가중치가 가장 높은 챌린지 선택
  - 동점이면 difficulty가 currentDifficulty에 가까운 것 우선
```

#### Difficulty 조절 규칙

```
연속 정답 3회 → currentDifficulty += 1 (최대 5)
연속 오답 2회 → currentDifficulty -= 1 (최소 1)
그 외 → currentDifficulty 유지
```

#### 스테이션 완주 판정

- 스테이션의 모든 챌린지를 1회 이상 완료하면 완주
- 완주 후에도 재도전 가능 (자유 선택 모드)

### 3.9 God Hand Interaction Model

모든 엔진에서 공통으로 사용하는 God Hand 인터랙션 패턴과 디바이스별 매핑.

**공통 원칙:**
- "나(실험자) -> 내 앞의 대상 -> 손으로 조작"이라는 프레임 일관성
- 슬라이더 조작이 아닌 물리적/체감적 조작
- 조작 전 카메라 자유 이동으로 상황 파악 가능

**디바이스별 인터랙션 매핑:**

| 패턴 | PC (마우스/키보드) | 모바일 (터치) |
|------|-------------------|-------------|
| **던지기/발사** | 클릭 드래그: 방향 설정 (반대 방향으로 당기기), 드래그 길이 = 강도. 릴리스 = 발사 | 스와이프: 방향/강도 → 릴리스 = 발사 |
| **3D 조준** | 마우스 이동 = 조준점 이동. 클릭 = 확정 | 터치 = 조준점. 탭 = 확정 |
| **조립/배치** | 드래그로 위치, Shift+드래그로 높이. 스냅 결합 자동 | 드래그로 XZ 위치, 2-finger 드래그로 높이. 스냅 결합 자동 |
| **당기기** | 클릭+드래그로 당김 방향/거리. 릴리스 = 놓기 | 터치+드래그. 릴리스 = 놓기 |
| **슬라이더 조절** | 드래그 좌우 | 드래그 좌우 |
| **타격/터치** | 클릭 = 타격 위치. 드래그 강도 = 타격 세기 | 탭 = 타격 위치. 길게 누르기 = 세게 |

**카메라 컨트롤 (God Hand와 독립):**

| 조작 | PC | 모바일 |
|------|-----|--------|
| 회전 (Orbit) | 우클릭 + 드래그 | 2-finger 회전 |
| 줌 | 스크롤 휠 | 핀치 |
| 팬 | 미들 클릭 + 드래그 | 3-finger 드래그 |
| 리셋 | `R` 키 | 더블 탭 빈 공간 |

### 3.10 HUD System

HUD(Head-Up Display)는 3D 뷰포트 위에 떠 있는 오버레이 UI다.

**레이아웃 영역:**

```
┌──────────────────────────────────────────────┐
│  [top-left]                    [top-right]   │
│  스테이션 이름                  설정 / 허브    │
│  챌린지 진행률 (3/10)          언어 / 테마     │
│                                              │
│              [3D Viewport]                   │
│                                              │
│  [center]                                    │
│  질문 텍스트 (Predict Phase)                  │
│  개념 설명 (Discover Phase)                   │
│                                              │
│  [bottom-center]                             │
│  예측 인풋 / 선택지 버튼                       │
│  "다음 챌린지" CTA                            │
│  God Hand 힌트                               │
│                                              │
│  [bottom-right]                              │
│  에너지 바 (에너지 엔진)                       │
└──────────────────────────────────────────────┘
```

**HUD 디자인 원칙:**

- 반투명 배경 (3D 뷰포트 가시성 확보)
- 최소 면적 원칙: 현재 Phase에 필요한 UI만 표시, 나머지 숨김
- 클릭/터치 관통: HUD가 없는 영역의 입력은 3D로 전달
- 반응형: PC에서는 여유롭게, 모바일에서는 접기/펼치기

**Phase별 HUD 활성 영역:**

| Phase | top-left | top-right | center | bottom-center | bottom-right |
|-------|----------|-----------|--------|---------------|--------------|
| PREDICT | station + progress | settings | question text | 예측 인풋 + 제출/스킵 | - |
| PLAY | station + progress | settings | - | God Hand 힌트 | 에너지 바 (해당 시) |
| DISCOVER | station + progress | settings | concept 설명 패널 | "다음" CTA + "더 알아보기" | - |

### 3.11 역학 실험실 Space Theme

Phase 1의 유일한 공간인 역학 실험실의 비주얼 테마.

**컨셉:** "현대적 실험실 + 약간의 SF"

| 요소 | 설명 |
|------|------|
| **Skybox** | 밝은 실험실 배경. 큰 창문으로 도시/자연 풍경이 보임. Light/Dark 모드에 따라 낮/밤 전환 |
| **바닥** | 밝은 회색 격자 바닥 (물리 좌표 감각 지원) |
| **조명** | 부드러운 스튜디오 조명. 그림자 최소화 (교육적 가시성 우선) |
| **머티리얼** | Semi-stylized. 과도한 리얼리즘보다 가독성. 오브젝트는 밝은 색상으로 배경과 대비 |
| **파티클** | 궤적 표시용 트레일 파티클. 충돌/파괴 시 이펙트 파티클 |
| **오브젝트** | 챌린지별 오브젝트 (공, 새총, 트랙, 진자, 차량, 악기 등). 일관된 스타일 언어 |

**스테이션별 구분:**

3개 스테이션은 같은 역학 실험실 공간 안에 있지만, 스테이션 전환 시 환경 소품/조명 톤이 약간 변하여 구분감을 제공:

| 스테이션 | 조명 톤 | 특징적 소품 |
|---------|---------|----------|
| 투사체 | 주황/따뜻한 톤 | 발사대, 타깃, 장애물 |
| 에너지 | 파랑/초록 톤 | 트랙, 에너지 바 시각화, 구조물 |
| 파동 | 보라/시안 톤 | 파면 시각화, 스피커, 악기 |

---

## 4. Progress & State (Local Storage)

Phase 1은 계정 없이 IndexedDB로 모든 사용자 데이터를 로컬에 저장한다.

### 4.1 저장 대상

| 데이터 | 설명 | 용량 추정 |
|--------|------|----------|
| 사용자 프로필 | 언어, 테마, 온보딩 완료 여부 | < 1KB |
| 스테이션 진도 | 스테이션별 완료 챌린지, 완주 여부 | < 5KB |
| 챌린지 이력 | 챌린지별 정답/오답, 시도 횟수, 예측 유형 | < 50KB |
| 적응형 엔진 상태 | 태그별 정확도, currentDifficulty, 연속 정답/오답 | < 10KB |
| 세션 메타 | 마지막 방문 시각, 마지막 스테이션/챌린지 | < 1KB |

**총 예상 용량:** < 100KB (IndexedDB 제한 대비 극히 작음)

### 4.2 IndexedDB Schema

```typescript
// DB name: "physplay"
// Version: 1

interface PhysPlayDB {
  // Store: "userProfile"
  userProfile: {
    id: "default";               // Phase 1은 단일 유저
    locale: "ko" | "en";
    theme: "light" | "dark" | "system";
    onboardingCompleted: boolean;
    createdAt: number;           // timestamp
    lastVisitAt: number;
  };

  // Store: "stationProgress"
  // Key: stationId
  stationProgress: {
    stationId: string;           // "projectile" | "collision-energy" | "wave"
    completedChallenges: string[];  // challenge IDs
    isCompleted: boolean;        // 모든 챌린지 완료 여부
    currentDifficulty: number;   // 1~5
    consecutiveCorrect: number;
    consecutiveWrong: number;
    lastPlayedAt: number;
  };

  // Store: "challengeHistory"
  // Key: challengeId
  challengeHistory: {
    challengeId: string;
    stationId: string;
    attempts: Array<{
      attemptedAt: number;       // timestamp
      wasCorrect: boolean;
      predictType: string;
      predictValue: any;         // 사용자의 예측 값 (궤적 좌표, 선택지 등)
      durationMs: number;        // play phase 소요 시간
      skippedPredict: boolean;
    }>;
  };

  // Store: "tagAccuracy"
  // Key: stationId + "/" + tag
  tagAccuracy: {
    key: string;                 // "projectile/gravity"
    stationId: string;
    tag: string;
    correct: number;
    total: number;
  };
}
```

### 4.3 데이터 라이프사이클

- **생성:** 온보딩 완료 시 `userProfile` 생성. 첫 챌린지 완료 시 `stationProgress`, `challengeHistory`, `tagAccuracy` 생성
- **갱신:** 매 챌린지 완료 시 관련 store 업데이트 (동기적, 실패 시 재시도)
- **삭제:** 허브의 "진도 초기화" 기능으로 전체 DB 삭제 (확인 다이얼로그 필수)
- **마이그레이션:** DB version 변경 시 `onupgradeneeded`에서 스키마 마이그레이션

### 4.4 Phase 2+ 마이그레이션 전략

Phase 3에서 계정 시스템 도입 시, 로컬 데이터를 서버로 마이그레이션하는 경로가 필요하다. Phase 1에서 준비할 것:

- IndexedDB 스키마가 서버 스키마와 호환 가능하도록 설계 (위 스키마가 이미 그에 맞춤)
- 로컬 데이터 export/import 유틸리티 함수 준비 (JSON 직렬화)
- `userProfile.id`를 Phase 3에서 서버 user ID로 교체하는 마이그레이션 로직

---

## 5. Non-functional Requirements

| 카테고리 | 요구사항 | 상세 |
|---------|---------|------|
| **Performance** | PC mid-range: 60fps | GTX 1060 / M1 MacBook Air 급에서 측정 |
| | 모바일 mid-range: 30fps+ | Galaxy A53 / iPhone 12 급에서 측정 |
| | 초기 로딩: 3초 이내 | First Contentful Paint 기준. 3D 에셋은 lazy load |
| | 메모리: 200MB 이하 | GPU 메모리 포함. 스테이션 전환 시 이전 에셋 해제 |
| **Rendering** | WebGPU 우선, WebGL fallback | 런타임 감지 후 자동 전환. 시각적 품질 차이 최소화 |
| | Semi-stylized 3D | 과도한 리얼리즘 X. 가독성/교육적 명확성 우선 |
| **i18n** | ko, en 지원 | 모든 사용자 대면 텍스트 (HUD, 챌린지 질문, Discover 설명, 랜딩, 허브) |
| | 런타임 언어 전환 | 페이지 리로드 없이 전환 |
| | i18n key 기반 | 챌린지 JSON 포함 모든 텍스트 |
| **Responsive** | PC-first | 1280px+ 기본 디자인. 마우스/키보드 최적 |
| | 모바일 지원 | 360px~768px 반응형. 터치 제스처 매핑 |
| | 태블릿 | 768px~1280px. PC 레이아웃 축소 |
| **Dark Mode** | Light / Dark / System | 허브, 랜딩: CSS 테마 전환. 3D 실험실: skybox + 조명 전환 |
| **Accessibility** | 키보드 내비게이션 | 2D UI (허브, 랜딩) 전체. HUD 버튼/선택지 |
| | 스크린 리더 | 2D UI. 3D 인터랙션은 시각적 피드백 + aria-live 알림 |
| | 색약 대응 | 예측 vs 결과 비교 시 컬러+패턴(점선/실선) 이중 부호화 |
| | 텍스트 크기 | 최소 14px. Discover 설명은 조절 가능 |
| **Offline** | 오프라인 시뮬레이션 | 챌린지 JSON + 엔진 로직은 클라이언트 번들에 포함. 네트워크 없이 실행 가능 |
| | 오프라인 저장 | IndexedDB는 오프라인에서도 동작 |
| | 온라인 필요 항목 | 초기 로딩, analytics 이벤트 전송 (오프라인 큐잉 후 재전송) |
| **Browser** | Chrome 최신 2버전 | WebGPU 지원 기준 |
| | Safari 최신 2버전 | WebGL fallback 포함 |
| | Firefox 최신 2버전 | WebGL fallback 포함 |
| | Edge | Chrome과 동일 (Chromium 기반) |

---

## 6. Analytics (Event Tracking Plan)

[PRD -- Event Tracking Plan](./prd.md#10-analytics--metrics) 정의를 Phase 1 구현 범위로 한정한 상세 스펙.

**도구:** PostHog (self-hosted 또는 cloud)

### 6.1 이벤트 목록

| 이벤트 | Trigger | Properties |
|--------|---------|-----------|
| `session_start` | 앱 로드 시 | `device_type` (pc/mobile), `locale`, `theme`, `is_first_visit`, `referrer` |
| `onboarding_start` | 온보딩 챌린지 진입 | `device_type` |
| `onboarding_complete` | 온보딩 챌린지 완료 | `duration_ms`, `was_correct` |
| `hub_view` | 허브 페이지 진입 | `completed_stations` (number) |
| `station_enter` | 스테이션 진입 (3D 로드 완료) | `station_id`, `space_id`, `completed_challenges` (number) |
| `predict_submit` | 예측 제출 | `station_id`, `challenge_id`, `predict_type`, `predict_value` (요약), `time_to_predict_ms` |
| `predict_skip` | 예측 스킵 | `station_id`, `challenge_id` |
| `play_start` | 시뮬레이션 시작 | `station_id`, `challenge_id` |
| `play_complete` | 시뮬레이션 완료 | `station_id`, `challenge_id`, `duration_ms` |
| `discover_view` | Discover 화면 진입 | `station_id`, `challenge_id`, `was_correct`, `concept_level_shown` (1/2/3) |
| `discover_detail_open` | "더 알아보기" 펼침 | `station_id`, `challenge_id`, `concept_id`, `target_level` (2 or 3) |
| `challenge_complete` | 챌린지 완료 (Discover 단계 종료) | `station_id`, `challenge_id`, `was_correct`, `attempt_count`, `total_duration_ms` |
| `station_complete` | 스테이션 완주 | `station_id`, `space_id`, `total_challenges`, `correct_count`, `total_duration_ms` |
| `station_navigate` | 스테이션 간 이동 | `from_station_id`, `to_station_id`, `navigation_source` (hud/hub) |
| `settings_change` | 설정 변경 | `setting_key` (locale/theme), `old_value`, `new_value` |
| `progress_reset` | 진도 초기화 | `stations_cleared` (number) |
| `error` | 런타임 에러 | `error_type`, `message`, `stack` (truncated) |

### 6.2 핵심 분석 뷰

| 뷰 | 목적 | 구성 이벤트 |
|----|------|-----------|
| **온보딩 퍼널** | 랜딩 -> 온보딩 -> 허브 전환율 | `session_start` -> `onboarding_start` -> `onboarding_complete` -> `hub_view` |
| **코어 루프 퍼널** | Predict -> Play -> Discover 단계별 이탈률 | `predict_submit` -> `play_start` -> `play_complete` -> `discover_view` |
| **예측 참여 대시보드** | 예측 참여율 & 스킵율 | `predict_submit`, `predict_skip` |
| **학습 효과 추적** | 스테이션 내 예측 정확도 변화 곡선 | `challenge_complete.was_correct` 시계열 |
| **탐험 패턴** | 스테이션 간 이동 흐름 | `station_navigate`, `station_complete` |
| **세션 분석** | 체류 시간, 세션당 챌린지 수 | `session_start` ~ `challenge_complete` 집계 |

---

## 7. Technical Constraints

### 7.1 렌더링

- **WebGPU -> WebGL fallback:** `navigator.gpu` 감지. WebGPU 미지원 시 WebGL 2.0 fallback. Three.js WebGPURenderer / WebGLRenderer 분기
- **물리 엔진:** Rapier WASM. 교육적 정확성 수준 (연구 도구급 정밀도 불필요)
- **폴리곤 예산:** 챌린지 당 총 100K 삼각형 이내. 환경(실험실) + 오브젝트 + 파티클 합산
- **텍스처:** KTX2 압축. 최대 2K 해상도. 총 VRAM 100MB 이내

### 7.2 프레임워크 스택

[Client Structure](./client-structure.md) 참조:

- **3D:** Three.js (WebGPU-first) + React Three Fiber + Drei
- **ECS:** Koota ECS (시뮬레이션 상태)
- **물리:** Rapier WASM
- **상태:** Zustand (UI/meta), Koota (시뮬레이션)
- **2D:** React + TanStack Start (또는 Next.js)
- **구조:** Web 2D + 3D 구조 (`site/` + `experience/`)

### 7.3 XR-Ready 아키텍처

Phase 1에서 XR 모드를 구현하지는 않지만, 아키텍처가 XR 전환을 차단하지 않아야 한다:

- God Hand 인터랙션을 입력 추상화 레이어로 분리 (마우스/터치/XR controller를 동일 인터페이스로)
- `experience/xr/` 폴더 구조 예약 (빈 상태 유지)
- HUD 레이아웃이 3D 공간 고정 패널로 전환 가능한 구조
- 카메라 컨트롤이 XR 세션 모드에서 비활성화 가능한 구조

### 7.4 챌린지 데이터 관리

- 챌린지 JSON 파일은 `content/` 디렉토리에 정적 파일로 번들
- 엔진은 챌린지 JSON을 import하여 params를 물리 시뮬레이션에 주입
- 런타임에 JSON을 동적 로드하지 않음 (Phase 1). 향후 UGC를 위해 동적 로드 경로 예약

---

## 8. Open Questions

구현 착수 전 결정이 필요한 항목:

- [ ] **예측 오차 판정 기준:** trajectory/placement의 `tolerance` 기본값은? 시나리오별로 다르게 할 것인가, 통일할 것인가?
- [ ] **패턴 선택지 생성:** pattern 예측의 오답 선택지를 어떻게 생성하는가? (수동 제작 vs 알고리즘 변형)
- [ ] **HUD 투명도/위치:** 3D 시뮬레이션 가시성을 방해하지 않는 HUD 투명도와 위치의 최적값은?
- [ ] **Portal Transition 구현:** 2D -> 3D 전환 연출의 기술적 접근은? (CSS 애니메이션 -> Canvas mount vs 단일 Canvas에 2D 모드)
- [ ] **에너지 바 시각화:** 에너지 바의 정확한 위치, 크기, 색상 사양은? (bottom-right HUD vs 오브젝트 부착)
- [ ] **파동 시각화 성능:** 3D 파면 시각화 (소리의 방, 노이즈 캔슬링 등)의 resolution과 성능 트레이드오프는?
- [ ] **챌린지 순서 커스텀:** 사용자가 적응형 추천을 무시하고 원하는 챌린지를 직접 선택할 수 있어야 하는가?
- [ ] **모바일 3D 조작:** 모바일에서 trajectory 드로잉과 placement 배치의 UX가 충분히 직관적인지 프로토타입 검증 필요
- [ ] **WebGPU -> WebGL 시각 차이:** fallback 시 허용 가능한 시각적 품질 차이 범위는?
- [ ] **오프라인 analytics 큐:** 오프라인 상태에서 쌓인 이벤트의 최대 보관량과 재전송 전략은?
- [ ] **i18n 챌린지 텍스트:** 26개 챌린지 x 4~5개 텍스트 필드 x 2개 언어 = ~250개 번역 항목. 번역 워크플로우는?
- [ ] **concept-level library 범위:** Phase 1에서 level3 (수식) 설명을 모든 concept에 제공할 것인가, 핵심 concept만?

전략 레벨 질문은 [Product Brief -- Open Questions](./product-brief.md#7-open-questions) 참조.
구현 레벨 추가 질문은 [PRD -- Open Questions](./prd.md#15-open-questions) 참조.

---

## Appendix

### A. 챌린지 총 목록 (Phase 1)

| Station | # | Challenge | Difficulty | Predict Type | Tags (Primary) |
|---------|---|-----------|------------|-------------|----------------|
| 투사체 | 1 | 원숭이와 사냥꾼 | 1 | placement | gravity, independence-of-motion |
| 투사체 | 2 | 뉴턴의 대포 | 3 | trajectory | gravity, orbital-mechanics |
| 투사체 | 3 | 커브볼 연구소 | 3 | trajectory | magnus-effect, spin |
| 투사체 | 4 | 우주 정거장 캐치볼 | 4 | trajectory | coriolis, rotating-frame |
| 투사체 | 5 | 중력 슬링샷 | 4 | trajectory | multi-body-gravity, slingshot |
| 투사체 | 6 | 3D 장애물 사격장 | 2 | trajectory | trajectory, spatial-reasoning |
| 투사체 | 7 | 무중력 파괴왕 | 3 | placement + pattern | zero-gravity, momentum |
| 투사체 | 8 | 관성 좌표계 스위치 | 2 | pattern | frame-of-reference, relativity |
| 투사체 | 9 | 달 표면 골프 | 1 | trajectory | gravity, vacuum, lunar |
| 투사체 | 10 | 시공간 구슬치기 | 5 | trajectory | spacetime, general-relativity |
| 에너지 | 1 | 3D 마블런 빌더 | 3 | binary + pattern | energy-conservation, friction |
| 에너지 | 2 | 철거 공 | 2 | pattern | potential-energy, kinetic-energy |
| 에너지 | 3 | 우주 당구 | 3 | pattern | momentum, elastic-collision |
| 에너지 | 4 | 진자 웨이브 머신 | 2 | pattern | pendulum, harmonic-motion |
| 에너지 | 5 | 푸코 진자 | 4 | pattern | foucault, earth-rotation |
| 에너지 | 6 | 트럭 vs 경차 | 1 | binary | newtons-third-law, force |
| 에너지 | 7 | 루브 골드버그 체인 | 3 | placement + binary | energy-conservation, chain-reaction |
| 에너지 | 8 | 달걀 낙하 보호 | 2 | binary + pattern | impulse, collision-time |
| 파동 | 1 | 소리의 방 | 2 | placement | standing-wave, room-acoustics |
| 파동 | 2 | 노이즈 캔슬링 엔지니어 | 3 | placement | destructive-interference, noise-cancellation |
| 파동 | 3 | 소닉 붐 | 3 | pattern | sonic-boom, mach-cone |
| 파동 | 4 | 와인잔 깨기 | 1 | binary | resonance, natural-frequency |
| 파동 | 5 | 지구 내부 지진파 | 4 | placement | p-wave, s-wave, seismology |
| 파동 | 6 | 3D 도플러 비행 | 3 | pattern | doppler, frequency-shift |
| 파동 | 7 | 속삭임의 방 | 2 | placement | reflection, ellipse-focus |
| 파동 | 8 | 악기의 물리학 | 2 | pattern | vibration-mode, harmonics |

**합계:** 26개 챌린지 (투사체 10 + 에너지 8 + 파동 8)

### B. Concept-Level Library 목록 (Phase 1)

투사체 엔진 11개, 충돌/에너지 엔진 10개, 파동 엔진 12개 = 총 33개 concept.
상세 목록은 각 엔진의 `concepts.md` 참조:
- [projectile/concepts.md](./contents/engines/projectile/concepts.md)
- [collision-energy/concepts.md](./contents/engines/collision-energy/concepts.md)
- [wave/concepts.md](./contents/engines/wave/concepts.md)

### C. 참조 문서

- [Product Brief](./product-brief.md) -- 전략적 문제 정의와 방향
- [PRD (Full)](./prd.md) -- 전체 제품 비전
- [Client Structure](./client-structure.md) -- 프론트엔드 코드 구조
- Engine Docs: [engines/README.md](./contents/engines/README.md)
