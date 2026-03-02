# PhysPlay — Software Architecture Design Document

**Status**: Draft
**Date**: 2026-03-02
**PRD Reference**: [PRD](./prd.md) | [Phase 1 PRD](./prd-phase-1.md)
**Related**: [Client Structure](./client-structure.md) | [Product Brief](./product-brief.md) | [UX Design](./ux-design.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

PhysPlay is a 3D physics education game built on a "Predict -> Play -> Discover" core loop. Users predict outcomes, manipulate simulations with God Hand (1st-person tabletop) interaction, then compare predictions against results to build intuitive understanding of physics.

The system must run entirely in the browser with no account requirement (Phase 1), support mobile-first touch interaction, maintain 60fps on mid-range devices, and scale from 3 simulation engines (Phase 1) to 6+ engines across 4 themed spaces. The architecture must separate simulation engines from challenge content (JSON-driven) to enable infinite challenge generation and future UGC.

### 1.2 System Context Diagram

```d2
direction: right

user: User {
  shape: person
}

physplay: PhysPlay Web App {
  style.stroke: "#FF9800"
  style.border-radius: 8
}

indexeddb: IndexedDB (Browser) {
  shape: cylinder
}

vercel: Vercel CDN + Edge {
  style.border-radius: 8
}

posthog: PostHog Analytics {
  style.border-radius: 8
}

sentry: Sentry Error Tracking {
  style.border-radius: 8
}

user -> physplay: "터치/마우스\n3D 인터랙션"
vercel -> physplay: "정적 에셋\nSSG 페이지"
physplay -> indexeddb: "진도 저장/복원\n(로컬)"
physplay -> posthog: "이벤트 트래킹"
physplay -> sentry: "에러 리포팅"
```

**[Phase 3+] 추가 요소:**
- Backend API (Rust/Axum on GCP Cloud Run)
- Neon PostgreSQL (계정, 진도 동기화, UGC)
- NASA Open API, PDB/PubChem (외부 데이터)

### 1.3 Assumptions

| # | Assumption | If Wrong |
|---|-----------|----------|
| 1 | Mid-range 모바일에서 Three.js + Rapier WASM 조합이 60fps를 달성할 수 있다 | 물리 연산을 Web Worker로 분리하거나, 시각적 복잡도를 대폭 축소 |
| 2 | IndexedDB가 Phase 1의 진도/예측 이력 저장에 충분하다 (용량, 성능) | OPFS(Origin Private File System)를 대안으로 검토 |
| 3 | WebGPU 미지원 브라우저에서 WebGL fallback으로 교육적 가치를 유지할 수 있다 | WebGL 전용 셰이더를 별도 작성하거나 시각 품질 타협 |
| 4 | 챌린지를 JSON 데이터로 정의하는 것만으로 충분한 다양성을 확보할 수 있다 | 엔진별 커스텀 로직이 필요해져 데이터 구동 아키텍처가 흔들린다 |
| 5 | 1인 개발자가 3개 물리 엔진을 12주 안에 교육적 정확성 수준으로 구현할 수 있다 | 엔진 수를 2개로 줄이거나, Rapier 내장 기능에 더 의존 |

---

## 2. Goals & Non-Goals

### 2.1 Goals

- **60fps on mid-range mobile** (Galaxy A54, iPhone SE 3): 3D 시뮬레이션이 부드럽게 동작
- **3초 이내 초기 로딩** (4G 기준): URL -> 첫 인터랙션까지
- **엔진-챌린지 분리**: 시뮬레이션 엔진은 JSON 데이터를 받아 실행. 코드 수정 없이 챌린지 추가 가능
- **XR-ready 아키텍처**: Phase 1에서 XR을 구현하지 않되, God Hand 멘탈 모델과 코드 구조가 WebXR 전환 시 입력 레이어만 교체하면 되는 구조
- **Progressive backend**: Phase 1은 서버 없이 동작. Phase 3+ 백엔드 도입 시 클라이언트 대규모 리팩토링 없이 전환
- **i18n 완전 지원**: 모든 사용자 대면 텍스트(UI + Discover 콘텐츠) ko/en 양언어
- **이벤트 트래킹**: Phase 1 성공 지표 측정을 위한 모든 이벤트 수집

### 2.2 Non-Goals

- **Phase 1에서 백엔드 API 구축**: IndexedDB 로컬 저장으로 충분
- **Phase 1에서 XR 모드 구현**: 아키텍처만 XR-ready
- **ML 기반 적응형 AI**: Phase 1은 규칙 기반 분기. Phase 2에서 전환
- **실시간 멀티플레이어**: 범위 밖
- **네이티브 모바일 앱**: 웹 브라우저가 유일한 클라이언트
- **연구 도구 수준 시뮬레이션 정밀도**: 교육적 정확성이면 충분

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**Phase 1은 백엔드가 없는 순수 클라이언트 애플리케이션이다.** 물리 시뮬레이션, 챌린지 시스템, 적응형 분기, 데이터 저장이 모두 브라우저에서 실행된다. 서버는 정적 에셋 서빙과 SSG(랜딩 페이지)만 담당한다.

이 선택의 근거:
- Phase 1의 핵심 가설은 "코어 루프가 학습 동기를 만드는가"이다. 백엔드 구축은 이 가설 검증에 기여하지 않는다
- 계정 없이 URL 접속 -> 즉시 체험이라는 제로 장벽 원칙에 부합
- 1인 개발에서 프론트엔드 + 3D 시뮬레이션에 집중할 수 있다
- IndexedDB가 진도/예측 이력 저장에 충분하다 (수 MB 수준)

**Phase 진화 경로:**
```
Phase 1: Static Web App (Next.js SSG + Client-side 3D)
  |
Phase 2: + Lightweight API (analytics aggregation, ML inference)
  |
Phase 3: + Full Backend (Rust/Axum, Neon, Auth, Progress Sync, UGC)
```

**프론트엔드 구조**: Web 2D+3D 하이브리드. `site/`(2D 페이지: 랜딩, 허브)와 `experience/`(3D 시뮬레이션)가 분리되어 서로 임포트하지 않는다. 상태 공유는 `shared/stores/`를 통해서만.

**코드 구조**: Hexagonal (Ports & Adapters). 시뮬레이션 엔진(`engine/`)은 React를 임포트하지 않는 순수 로직 레이어. React 연동은 `experience/scene/hooks/`의 브릿지 레이어를 통해서만.

### 3.2 Container Diagram

```d2
direction: down

browser: Browser {
  nextjs: Next.js App {
    site: "site/\n(Landing, Hub)\nSSG + CSR"
    experience: "experience/\n(3D Simulation)\nClient-only"
    engine: "engine/\n(ECS + Physics)\nPure Logic"
    domains: "domains/\n(Station Logic)"
    shared: "shared/\n(Stores, i18n)"
    content: "content/\n(Challenge JSON)"
  }

  idb: IndexedDB {
    shape: cylinder
  }

  nextjs -> idb: "진도/예측 이력"
}

vercel: Vercel {
  edge: Edge Network / CDN
  ssr: SSG / SSR
}

posthog: PostHog

sentry: Sentry

browser -> vercel: "정적 에셋"
browser -> posthog: "이벤트"
browser -> sentry: "에러"

# Internal dependency direction
site -> shared
experience -> shared
domains -> experience: "composes"
domains -> engine: "composes"
experience -> engine: "reads via hooks"
domains -> content: "loads JSON"
```

**컨테이너별 책임:**

| Container | Technology | Responsibility |
|-----------|-----------|---------------|
| **Next.js App** | Next.js 15 (App Router) | 라우팅, SSG(랜딩), CSR(3D), i18n, 테마 |
| **site/** | React + CSS | 2D 페이지 — 랜딩, 허브, 설정 |
| **experience/** | React Three Fiber + Drei | 3D 뷰포트 — 시뮬레이션 렌더링, HUD, God Hand |
| **engine/** | Koota ECS + Rapier WASM | 물리 시뮬레이션, ECS 상태, 시스템 로직 |
| **domains/** | Zustand + ECS systems | 스테이션별 비즈니스 로직, 챌린지 관리 |
| **content/** | Static JSON | 챌린지 정의, Discover 콘텐츠 |
| **shared/** | Zustand, i18n, types | 전역 상태, 국제화, 공통 타입 |
| **IndexedDB** | Dexie.js | 진도, 예측 이력, 설정 로컬 저장 |

### 3.3 Component Overview

#### Simulation Engine (Critical Path) [Phase 1]

```
engine/
├── ecs/                    # Koota ECS world
│   ├── components/         # Position, Velocity, Mass, Force, ...
│   ├── systems/            # PhysicsStep, TrajectoryRecord, ...
│   ├── queries/            # Projectiles, RigidBodies, ...
│   └── world.ts
├── physics/                # Rapier WASM wrapper
│   └── rapier-adapter.ts   # Rapier -> ECS sync
└── simulations/            # Per-engine simulation setup
    ├── projectile.ts       # Projectile simulation config
    ├── energy.ts           # Collision/energy simulation config
    └── wave.ts             # Wave simulation (custom math, not Rapier)
```

투사체/에너지 엔진은 Rapier 물리 엔진을 사용하고, 파동 엔진은 자체 수학 연산(파동 방정식)을 사용한다. 파동은 강체(rigid body) 물리가 아니라 필드 시뮬레이션이기 때문.

#### Challenge System [Phase 1]

```
content/
├── challenges/
│   ├── projectile/         # Projectile challenge JSONs
│   ├── energy/             # Energy challenge JSONs
│   └── wave/               # Wave challenge JSONs
└── discover/               # Discover explanation content (i18n)
```

챌린지 데이터는 빌드 타임에 번들되거나 lazy-load된다. 순수 데이터 레이어로 엔진이나 UI에 의존하지 않는다.

#### Domain Logic [Phase 1]

```
domains/
├── projectile/             # Projectile station
│   ├── systems/            # Station-specific ECS systems
│   ├── stores/             # Station state
│   └── hud/                # Station-specific HUD (trajectory drawing, etc.)
├── energy/
├── wave/
├── challenge-runner/       # Challenge execution, branching, scoring
└── hub/                    # Hub state management
```

#### Adaptive Branching Engine [Phase 1]

규칙 기반. 챌린지 JSON의 `branching` 필드를 읽어 다음 챌린지를 결정. 독립 모듈로 분리하여 Phase 2에서 ML 모델로 교체 가능.

```
shared/lib/branching/
├── engine.ts               # Port (interface)
├── rule-based.ts           # Phase 1 Adapter: rule-based implementation
└── types.ts                # BranchingInput, BranchingOutput
```

---

## 4. Data Architecture

### 4.1 Data Flow

#### Core Loop: Predict -> Play -> Discover

```
[User Input]
  |
  v
(1) challenge-runner loads current challenge JSON
  |
  v
(2) PREDICT: UI collects prediction input (trajectory/binary/pattern)
  -> Prediction value stored in challenge-runner store
  -> PostHog: predict_submit event
  |
  v
(3) PLAY: Variables injected into engine/ -> Rapier/custom math executes
  -> ECS systems update physics state each frame
  -> experience/scene/ reads ECS state for rendering
  -> PostHog: play_start, play_complete
  |
  v
(4) DISCOVER: challenge-runner compares prediction vs result
  -> Selects Discover content based on correct/incorrect
  -> Branching engine determines next challenge
  -> PostHog: discover_view, challenge_complete
  |
  v
(5) Progress update: Save challenge result to IndexedDB
  |
  v
(6) Load next challenge -> back to (1)
```

#### Progress Persistence

```
[Challenge Complete]
  -> challenge-runner generates result record
  -> IndexedDB stores:
      station_progress:     { station_id, completed_challenges[], current_challenge_id }
      prediction_history:   { challenge_id, predicted, actual, was_correct, timestamp }
      user_preferences:     { locale, theme }

[Return Visit]
  -> App init reads IndexedDB
  -> Progress exists  -> Hub screen (return flow)
  -> No progress      -> Onboarding first challenge (first visit flow)
```

### 4.2 Storage Strategy

| Store | Type | Data | Why This Store | Consistency |
|-------|------|------|---------------|-------------|
| **IndexedDB** [Phase 1] | Browser local | 진도, 예측 이력, 설정 | 서버 없이 구조화된 데이터 저장. 수 MB면 충분 | Strong (local) |
| **Koota ECS World** | In-memory | 시뮬레이션 상태 (position, velocity, force, trajectory) | 프레임 단위 업데이트. 시뮬레이션 종료 시 폐기 | N/A (ephemeral) |
| **Zustand Stores** | In-memory | UI 상태 (theme, modal, challenge progress) | React 컴포넌트와 자연스러운 연동 | N/A (ephemeral) |
| **Static JSON** | Build-time bundle | 챌린지 정의, Discover 콘텐츠 | 불변 데이터. CDN 캐싱 최적화 | Immutable |
| **Neon PostgreSQL** [Phase 3+] | Managed relational | 계정, 진도 동기화, UGC, 교사 데이터 | 관계형 데이터, 트랜잭션, 서버 동기화 필요 시점에 도입 | Strong |

**IndexedDB 라이브러리: Dexie.js** — 타입 안전 API, 인덱스/쿼리 빌더, 마이그레이션 지원, ~17KB gzip. idb보다 무겁지만 구조화된 쿼리(스테이션별 진도 조회 등)에 필요.

### 4.3 Caching Strategy

| What | Where | TTL | Invalidation |
|------|-------|-----|-------------|
| 3D 에셋 (glTF, textures) | Vercel CDN + Service Worker | 1년 (content-hash) | 빌드 시 해시 변경 |
| 챌린지 JSON | Build-time 번들 or dynamic import | Immutable | 재배포 |
| Discover 콘텐츠 | Build-time 번들 | Immutable | 재배포 |
| Rapier WASM binary | CDN + Service Worker | 1년 | 버전 업 시 해시 변경 |

3D 에셋과 WASM 바이너리가 초기 로딩의 주요 병목이다. Service Worker precaching으로 재방문 시 즉시 로드.

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform [Phase 1]

**Vercel** (Next.js hosting)

| Factor | Decision |
|--------|----------|
| **Why Vercel** | Next.js 네이티브 지원. SSG/ISR, 자동 CDN, 이미지 최적화. Phase 1은 주로 정적 서빙이므로 Pro 티어로 충분 |
| **Why not Cloudflare Pages** | Next.js의 SSR/ISR가 Vercel에서 가장 안정적. @cloudflare/next-on-pages는 일부 기능 제한 |
| **Scaling** | Vercel Edge Network 글로벌 CDN. 정적 에셋은 무한 스케일 |
| **Region** | 한국 타깃 — Vercel 서울 엣지 노드 활용 |

**[Phase 3+] Backend**: GCP Cloud Run (ap-northeast-2). Rust/Axum 컨테이너. Neon PostgreSQL 동일 리전.

### 5.2 Deployment Strategy

```
main branch push
  -> Vercel 자동 빌드
  -> Preview deployment (PR마다 고유 URL)
  -> Production deployment (main merge)
```

- **Preview deployments**: 모든 PR에서 3D 시뮬레이션 실 테스트 가능
- **Rollback**: Vercel 대시보드에서 이전 배포로 즉시 롤백
- **환경 변수**: PostHog API key, Sentry DSN은 Vercel 환경 변수

### 5.3 Environment Topology

| Environment | Purpose | Notes |
|-------------|---------|-------|
| **Development** | 로컬 | `next dev`, HMR, Rapier WASM debug 모드 |
| **Preview** | PR 리뷰 | Vercel Preview URL, 실 3D 렌더링 테스트 |
| **Production** | 사용자 서비스 | PostHog/Sentry 프로덕션 키 |

Phase 1에는 별도 staging이 불필요하다. Preview deployment가 그 역할을 대체.

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization

**Phase 1: 없음.** 계정 없이 즉시 체험. IndexedDB 로컬 저장.

**[Phase 3+] 계획:**
- Google OAuth2 + 자체 JWT
- Access token: 메모리 (15분), Refresh token: httpOnly secure cookie (30일)
- RBAC: student, teacher, admin
- 미들웨어 레이어에서 인가 처리

Phase 1에서 IndexedDB 스키마에 `user_id` placeholder를 포함하여, Phase 3 마이그레이션 비용 최소화.

### 6.2 Observability

**Logging:**
- 클라이언트 사이드 구조화 로깅 (console wrapper)
- Sentry breadcrumbs로 에러 컨텍스트 수집
- 시뮬레이션 성능 로그 (fps, physics step time)

**Metrics (PostHog):**
- 비즈니스: 예측 참여율, 스킵율, 스테이션 완주율, 세션 깊이
- 기술: fps 분포, 로딩 시간, WebGPU/WebGL 비율
- PRD Phase 1 Section 8의 이벤트 카탈로그 전체 구현

**Error Tracking (Sentry):**
- Source map 업로드 (빌드 시)
- 3D 렌더링 에러, 물리 엔진 에러, IndexedDB 에러 분리 태깅
- Performance monitoring: Web Vitals + 커스텀 트랜잭션

**Alerting:**
- Sentry 에러 급증 (이메일)
- PostHog: 예측 스킵율 30% 초과 시 알림

### 6.3 Error Handling & Resilience

| Scenario | Handling |
|----------|---------|
| Rapier WASM 초기화 실패 | 폴백 메시지 + Sentry 리포트. 지원 브라우저 안내 |
| WebGPU 미지원 | WebGL 자동 폴백. `experience/canvas/`에서 감지 |
| IndexedDB 접근 불가 (시크릿 모드 등) | 세션 내 메모리 폴백. "진도가 저장되지 않습니다" 안내 |
| 챌린지 JSON 로드 실패 | 재시도 1회 -> 허브 복귀 + 에러 메시지 |
| 물리 시뮬레이션 NaN/Infinity | 시뮬레이션 리셋 + "다시 시도" 메시지 |
| 3D 렌더링 컨텍스트 유실 | Canvas 재생성. 실패 시 새로고침 안내 |

### 6.4 Security

| Concern | Approach |
|---------|----------|
| Data in transit | HTTPS (Vercel 자동 TLS) |
| Data at rest | IndexedDB는 브라우저 관리. Phase 1에 PII 없음 |
| XSS | React 기본 이스케이핑 + CSP 헤더. Discover 콘텐츠는 빌드 타임 정적 데이터 |
| Input validation | 예측 입력은 클라이언트에서 범위 검증. Phase 1은 서버 없음 |
| Dependencies | npm audit, Dependabot. WASM 직접 빌드 |
| Third-party scripts | PostHog, Sentry SDK만. CSP 허용 도메인 제한 |

### 6.5 Performance & Scalability

**Load profile:**
- Phase 1 목표: 월 10K UV
- 정적 에셋 중심 -> CDN이 트래픽 대부분 처리
- 서버 사이드 연산 없음

**Performance bottlenecks & mitigation:**

| Bottleneck | Mitigation |
|-----------|-----------|
| **초기 로딩 (3초 목표)** | 코드 스플리팅: 랜딩/허브는 3D 번들 미포함. `/play` 진입 시 3D lazy load. Rapier WASM preload. glTF Draco/KTX2 압축 |
| **물리 연산 프레임 버짓** | Rapier fixed timestep (60Hz). substep 제한. 프레임 버짓 초과 시 물리 스텝 스킵 |
| **렌더링 프레임 버짓** | Phase 1 씬은 단순 (LOD 불필요). Instanced rendering for 파동 파티클. WebGPU compute shader for 파동 필드 |
| **메모리** | 스테이션 전환 시 ECS world/씬 dispose. Three.js 리소스 명시적 해제 |
| **번들 크기** | Tree shaking. Three.js 필요 모듈만 임포트. Rapier WASM ~2MB (gzip ~600KB) |

---

## 7. Integration Points

| Service | What It Provides | Protocol | Failure Mode | SLA Dependency |
|---------|-----------------|----------|-------------|----------------|
| **PostHog** [Phase 1] | 이벤트 트래킹, 퍼널 분석 | Client-side JS SDK | 이벤트 유실. 제품 기능 무영향 | Low |
| **Sentry** [Phase 1] | 에러 트래킹, 성능 모니터링 | Client-side JS SDK | 에러 미수집. 제품 기능 무영향 | Low |
| **Vercel CDN** [Phase 1] | 정적 에셋, SSG | HTTPS | 사이트 전체 다운 | High (99.99% SLA) |
| **NASA Open API** [Phase 4] | 실제 행성/궤도 데이터 | REST | 캐싱 데이터 폴백 | Low |
| **PDB/PubChem** [Phase 3] | 분자 구조 데이터 | REST | 내장 데이터 폴백 | Low |

---

## 8. Migration & Rollout

### Phase 1 -> Phase 3 Data Migration

Phase 3에서 계정 시스템 도입 시, IndexedDB 로컬 데이터를 서버로 마이그레이션.

**Strategy: Opt-in Upload**

1. Phase 3에서 계정 생성 UI 추가
2. 기존 로컬 데이터 사용자에게 "진도를 계정에 연결하시겠습니까?" 프롬프트
3. 동의 시 IndexedDB 데이터를 서버 API로 업로드
4. 서버에서 검증 후 저장
5. 이후 양방향 동기화 (서버 = source of truth, IndexedDB = 오프라인 캐시)

**Phase 1에서 준비할 것:**
- IndexedDB 스키마에 `user_id` placeholder 포함
- 모든 레코드에 `created_at`, `updated_at` timestamp 포함
- 데이터 접근을 Repository 패턴으로 추상화 -> Phase 3에서 IndexedDB adapter -> API adapter 교체

---

## 9. Risks & Open Questions

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| Mid-range 모바일 60fps 미달 | High | Medium | Week 1-2 Engine Spike에서 조기 검증. 실패 시 Web Worker 분리, 렌더링 축소 |
| Rapier WASM 번들로 3초 로딩 초과 | Medium | Low | WASM streaming compilation + preload. 코드 스플리팅 |
| 파동 엔진 자체 구현 복잡도 | Medium | Medium | GPU compute (WebGPU)로 성능 확보. WebGL 폴백 시 해상도 축소 |
| WebGPU -> WebGL 시각적 품질 격차 | Low | Medium | TSL이 양쪽 컴파일 지원. 파동의 해상도/파티클 수만 조절 |
| Three.js 메모리 누수 (스테이션 전환) | Medium | Medium | dispose 유틸리티. useEffect cleanup. 메모리 프로파일링 |
| IndexedDB 데이터 유실 | Low | High | 명시적 안내 UI. Phase 3 계정으로 근본 해결 |

### 9.2 Open Questions

1. **파동 엔진 렌더링**: 2D top-down vs 3D 물결 표면. 성능과 직관성 트레이드오프. Engine Spike에서 검증 필요
2. **궤적 그리기 터치 UX**: 3D 공간에서 2D 터치로 궤적을 그리는 입력 방식은? 화면 평면 투영 vs 별도 2D 오버레이
3. **WebGPU compute for 파동**: WebGPU 미지원 시 CPU 폴백 성능이 교육적 최소 품질을 만족하는가?
4. **Rapier timestep**: fixed vs variable. 교육적 정확성과 성능의 균형점
5. **3D 에셋 포맷**: glTF + Draco 충분한가? KTX2 텍스처 압축 필요 여부
6. **Service Worker 범위**: Phase 1은 에셋 캐싱만 vs 풀 오프라인

---

## 10. Architecture Decision Records (ADRs)

### ADR-1: Next.js for Frontend Framework [Phase 1]

- **Status**: Accepted
- **Context**: PhysPlay는 2D+3D 하이브리드 웹 앱이다. 랜딩(`/`)은 SEO 필요, 3D 시뮬레이션(`/play`)은 순수 클라이언트 렌더링. i18n(ko/en) 필수.
- **Decision**: Next.js 15 (App Router) + Vercel
- **Alternatives Considered**:
  - **TanStack Start + Cloudflare Workers**: 클라이언트 앱에 최적. 그러나 랜딩의 SSG/SEO 처리가 Next.js 대비 미성숙. PhysPlay는 SSG + CSR 혼합이므로 Next.js가 자연스럽다 -> Rejected
  - **Vite SPA + 별도 랜딩**: 개발/배포 복잡도 증가, 공유 코드 관리 어려움 -> Rejected
- **Consequences**:
  - (+) SSG(랜딩) + CSR(3D)이 한 앱에서 동작
  - (+) next-intl로 i18n 지원
  - (+) Vercel Preview Deployment로 PR별 3D 테스트
  - (-) 서버 컴포넌트 패러다임이 3D 앱에는 불필요한 복잡도. `'use client'` 경계 관리 필요
  - (-) Three.js 번들이 서버 빌드에 포함되지 않도록 dynamic import 필요

### ADR-2: Three.js + React Three Fiber for 3D Rendering [Phase 1]

- **Status**: Accepted
- **Context**: 브라우저에서 3D 물리 시뮬레이션 렌더링. WebGPU 우선, WebGL 폴백. React 생태계 통합 필수.
- **Decision**: Three.js (WebGPU-first) + React Three Fiber + Drei + TSL shaders
- **Alternatives Considered**:
  - **Babylon.js**: 풍부한 내장 기능이나 React 통합이 R3F 대비 약함. 번들이 큼 -> Rejected
  - **PlayCanvas**: 에디터 기반 워크플로 최적화. 코드 퍼스트에는 R3F가 적합 -> Rejected
  - **Raw WebGPU/WebGL**: 씬 그래프, 로더, 후처리를 직접 구현. 1인 개발에 비현실적 -> Rejected
- **Consequences**:
  - (+) R3F 선언적 씬 그래프 + React 자연스러운 통합
  - (+) Drei 헬퍼로 개발 속도 향상
  - (+) TSL로 WebGPU/WebGL 단일 셰이더 코드
  - (+) @react-three/xr로 Phase 2+ WebXR 전환 경로 확보
  - (-) Three.js WebGPU 지원은 아직 진화 중. 일부 안정성 이슈 가능

### ADR-3: Rapier WASM for Physics Simulation [Phase 1]

- **Status**: Accepted
- **Context**: 투사체/에너지 스테이션에 실시간 물리 필요. 60fps on mid-range mobile. 교육적 정확성.
- **Decision**: Rapier (Rust WASM) for projectile/energy. Wave engine uses custom math.
- **Alternatives Considered**:
  - **Cannon.js / cannon-es**: 순수 JS. WASM 대비 2-5x 느림. 60fps 마진 축소 -> Rejected
  - **Ammo.js (Bullet WASM)**: 번들 ~1.5MB gzip, C++ 스타일 API. Rapier가 더 깔끔 -> Rejected
  - **자체 구현**: 충돌 감지/응답 엣지 케이스 비용이 큼. Rapier가 이미 해결 -> Rejected
- **Consequences**:
  - (+) WASM 성능: JS 대비 2-5x
  - (+) Deterministic simulation, fixed timestep 지원
  - (+) 충돌/에너지 보존이 엔진 레벨에서 보장
  - (-) WASM 번들 ~2MB (gzip ~600KB). 초기 로딩 비용
  - (-) 파동에 부적합 -> 별도 구현 필요

### ADR-4: Koota for ECS [Phase 1]

- **Status**: Accepted
- **Context**: 시뮬레이션 상태를 프레임 단위로 관리. React 렌더링 사이클과 분리된 게임 루프 필요.
- **Decision**: Koota ECS
- **Alternatives Considered**:
  - **Miniplex**: React 통합 양호. sparse set 방식으로 대량 엔티티 성능에서 Koota 열세 -> Rejected
  - **bitECS**: 매우 빠르나 React 바인딩 없음. TypeScript 타입 약함 -> Rejected
  - **Zustand만**: 프레임 단위 업데이트에 구독 모델 비효율적 -> Rejected
- **Consequences**:
  - (+) TypeScript-native 타입 안전성
  - (+) R3F 통합 패턴 확립
  - (+) 시뮬레이션(systems)과 렌더링(React) 깔끔한 분리
  - (-) 생태계 작음, 커뮤니티 제한적

### ADR-5: No Backend in Phase 1 [Phase 1]

- **Status**: Accepted
- **Context**: Phase 1 목표는 코어 루프 가설 검증. 백엔드가 이에 기여하는가?
- **Decision**: Phase 1은 서버 없이 순수 클라이언트 앱. IndexedDB 로컬 저장.
- **Alternatives Considered**:
  - **최소 백엔드 (Auth + Sync)**: 기기 간 동기화 가능하나 불필요한 복잡도 -> Rejected
  - **BaaS (Supabase/Firebase)**: 빠른 백엔드이나 계정 필수 -> "제로 장벽" 위반. Phase 3 전환 시 마이그레이션 비용 -> Rejected
- **Consequences**:
  - (+) 3D 시뮬레이션 + 코어 루프에 개발 집중
  - (+) 운영 비용 최소
  - (+) 제로 장벽: 회원가입 없이 즉시 체험
  - (-) 기기 간 동기화 불가
  - (-) 브라우저 정리 시 진도 유실

### ADR-6: Vercel for Hosting [Phase 1]

- **Status**: Accepted
- **Context**: Next.js 앱 호스팅. 3D 에셋/WASM 서빙 성능 중요.
- **Decision**: Vercel
- **Alternatives Considered**:
  - **Cloudflare Pages**: 저렴하나 Next.js SSR/ISR 지원이 불완전 -> Rejected
  - **AWS Amplify**: Vercel 대비 빌드 속도, DX 열세 -> Rejected
- **Consequences**:
  - (+) Next.js 네이티브, 최적 성능
  - (+) 글로벌 CDN + 서울 엣지
  - (+) Preview Deployment, 즉시 롤백
  - (-) 대규모 트래픽 시 비용 증가 (Phase 1에서는 무관)

### ADR-7: Rule-Based Adaptive Branching [Phase 1]

- **Status**: Accepted
- **Context**: PRD의 AI 시스템(챌린지 생성, 난이도 조절, 학습 경로 분기)을 Phase 1에서 어떻게 구현하는가?
- **Decision**: 규칙 기반 if/else. 챌린지 JSON `branching` 필드에 정답/오답 시 다음 챌린지 명시.
- **Alternatives Considered**:
  - **LLM 기반 생성**: 서버 필요, 지연 시간이 코어 루프를 저해, 교육적 정확성 검증 어려움 -> Rejected for Phase 1
  - **Client-side ML (TF.js)**: 학습 데이터 없는 Phase 1에서 무의미 -> Rejected for Phase 1
- **Consequences**:
  - (+) 서버 의존성 제로
  - (+) 예측 가능한 행동, 디버깅 용이
  - (+) Port/Adapter 분리로 Phase 2 ML 전환 비용 최소
  - (-) 분기가 기계적으로 느껴질 수 있음
  - (-) 개인화 수준 낮음

### ADR-8: Dexie.js for IndexedDB [Phase 1]

- **Status**: Accepted
- **Context**: IndexedDB에 진도, 예측 이력, 설정 저장. Raw API는 복잡.
- **Decision**: Dexie.js
- **Alternatives Considered**:
  - **idb**: ~1KB. 쿼리 빌더 없음. 구조화된 쿼리(스테이션별 진도 등)에 불편 -> Rejected
  - **localForage**: IndexedDB 외 폴백 불필요. key-value만 지원 -> Rejected
- **Consequences**:
  - (+) 타입 안전 테이블, 인덱스, 복합 쿼리
  - (+) 마이그레이션 버전 관리 내장
  - (+) ~17KB gzip
  - (-) idb 대비 16KB 추가

---

## 11. AI/LLM Architecture

### Phase 1: Rule-Based System (No LLM)

Phase 1의 "AI"는 챌린지 JSON의 `branching` 필드를 실행하는 상태 머신이다.

```
[Challenge Result]
  |
  v
  Correct? --YES--> branching.on_correct -> harder challenge
  |
  NO
  |
  Check consecutive failures
  ├── 1: branching.on_incorrect -> same/easier challenge
  ├── 2: Show hint + retry
  └── 3+: Branch to more basic challenge
```

**구현**: `shared/lib/branching/` 모듈. Port(인터페이스)와 Adapter(구현) 분리.

```typescript
// Port (stable across phases)
interface BranchingEngine {
  getNextChallenge(input: BranchingInput): BranchingOutput;
}

// Phase 1 Adapter
class RuleBasedBranching implements BranchingEngine { ... }

// Phase 2+ Adapter (future)
class MLBranching implements BranchingEngine { ... }
```

### Phase 2+ Evolution

| Phase | AI Level | Approach |
|-------|----------|----------|
| Phase 1 | Rule-based | Client-side if/else. No server |
| Phase 2 | ML model v1 | Phase 1 data로 학습. Client(ONNX Runtime) or Server(Cloud Run) |
| Phase 3+ | LLM integration | Discover 설명 개인화. Anthropic API (Tier 1 Direct). Haiku급 모델 |

LLM을 도입한다면 Discover 단계에서만. 코어 루프(Predict -> Play)에 LLM을 넣지 않는다 -- 지연 시간이 게임 경험을 파괴.

---

## Phase Implementation Summary

### Phase 1 (Mechanics Lab)
- **Components**: Next.js App, experience/ (R3F + Drei), engine/ (Koota + Rapier), domains/ (projectile, energy, wave, challenge-runner, hub), site/ (landing, hub), shared/ (stores, i18n, branching), content/ (challenge JSON)
- **Infrastructure**: Vercel, PostHog, Sentry
- **Storage**: IndexedDB (Dexie.js)
- **Key ADRs**: ADR-1 ~ ADR-8

### Phase 2 (Mechanics Expansion + AI)
- **New Components**: ML branching adapter, sound/light station, electromagnetic station, experience/xr/ (WebXR input layer)
- **New Infrastructure**: GCP Cloud Run (if ML server-side) or ONNX Runtime WASM (if client-side)
- **Key Changes**: BranchingEngine adapter swap (rule-based -> ML)

### Phase 3 (Molecular Lab + Accounts)
- **New Components**: Molecular engine, molecular station domain, auth system, teacher dashboard, UGC challenge editor
- **New Infrastructure**: Rust/Axum API (GCP Cloud Run), Neon PostgreSQL, Google OAuth2
- **Key Changes**: IndexedDB -> server sync. Repository adapter swap. PDB/PubChem integration

### Phase 4 (Observatory)
- **New Components**: Orbital engine, observatory domain, UGC station/mission editor
- **New Integrations**: NASA Open API

### Phase 5 (Quantum Lab)
- **New Components**: Quantum engine, quantum lab domain, UGC space editor
- **Key Changes**: Viral optimization (share features)
