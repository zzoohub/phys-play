# PhysPlay — Software Architecture Design Document

**Status:** Draft
**Author:** —
**Date:** 2026-03-01
**PRD Reference:** [prd.md](./prd.md), [prd-phase-1.md](./prd-phase-1.md)

---

## 1. Context & Scope

### 1.1 Problem Statement

과학 개념은 본질적으로 3차원이지만, 학생들은 2D 교과서와 수동적 영상으로 학습한다. PhysPlay는 브라우저에서 설치 없이 접근할 수 있는 3D 인터랙티브 과학 시뮬레이션 플랫폼이다. 4개 트랙(고전물리, 화학, 우주과학, 양자역학) × 6개 모듈 = 24개 모듈을 제공하며, 수식 대신 직접 조작으로 직관을 형성한다. 1인 개발 체제에서 Phase별로 점진 출시한다.

### 1.2 System Context Diagram

```d2
direction: right

student: 학생 (브라우저) {
  shape: person
}
teacher: 교사 (브라우저) {
  shape: person
}

physplay: PhysPlay {
  style.stroke: "#4A90D9"
  style.stroke-dash: 3

  web: Web App (TanStack Start) {
    shape: rectangle
  }
}

cdn: Cloudflare CDN / Edge {
  shape: cloud
}
posthog: PostHog (Analytics) {
  shape: rectangle
}
sentry: Sentry (Error Tracking) {
  shape: rectangle
}

# Phase 3+
api: API Server {
  shape: rectangle
  style.stroke-dash: 5
}
db: Neon (PostgreSQL) {
  shape: cylinder
  style.stroke-dash: 5
}
oauth: Google OAuth {
  shape: rectangle
  style.stroke-dash: 5
}
external: PDB / NASA API {
  shape: rectangle
  style.stroke-dash: 5
}

student -> cdn: HTTPS
teacher -> cdn: HTTPS
cdn -> physplay.web: Static Assets

physplay.web -> posthog: Events (client-side)
physplay.web -> sentry: Errors (client-side)

physplay.web -> api: REST {style.stroke-dash: 5}
api -> db: SQL {style.stroke-dash: 5}
api -> oauth: OAuth2 {style.stroke-dash: 5}
api -> external: HTTP {style.stroke-dash: 5}
```

### 1.3 Assumptions

| # | Assumption | 틀리면 변경해야 할 것 |
|---|---|---|
| A1 | Phase 1은 백엔드 없이 정적 사이트로 충분하다 (익명 접근, 진도 미저장) | Phase 1에 백엔드 추가 필요 |
| A2 | mid-range 디바이스(2020년 이후 중급)에서 Rapier WASM + R3F로 60fps 달성 가능하다 | 물리 엔진 교체 또는 시뮬레이션 복잡도 대폭 축소 |
| A3 | Three.js WebGPU 렌더러가 2026년 기준 안정적이다 (~95% 브라우저 커버리지). WebGL 폴백이 투명하게 동작한다 | WebGL 전용으로 고정, TSL/Node Material 대신 classic material 사용 |
| A4 | 한국 중고등학생 대부분이 모바일 브라우저(Chrome/Safari)로 접근한다 | 데스크톱 우선 최적화로 전환 |
| A5 | 1인 개발로 Phase 1을 13주 내에 출시 가능하다 | 모듈 수 축소 (2개) 또는 일정 연장 |

---

## 2. Goals & Non-Goals

### 2.1 Goals

- mid-range 디바이스(Galaxy A54, iPhone 12 급)에서 모든 시뮬레이션 60fps 유지 [Phase 1]
- 변수 조작 → 시뮬레이션 반영 지연 100ms 이내 [Phase 1]
- 3G 네트워크에서 첫 의미있는 콘텐츠(FCP) 5초 이내 [Phase 1]
- 시뮬레이션 에셋 lazy-load로 초기 JS 번들 200KB 미만 (gzip) [Phase 1]
- 24개 모듈까지 확장 가능한 모듈러 아키텍처 [Phase 1 설계, 전체 활용]
- ko + en 다국어 지원 [Phase 1], 4개 추가 언어 [Phase 2+]
- 외부 과학 데이터(PDB, NASA API) 통합 [Phase 3~4]
- 사용자 계정, 학습 진도, 교사 대시보드 [Phase 3+]

### 2.2 Non-Goals

- **네이티브 앱**: 브라우저 전용. 네이티브 앱은 데이터로 필요성 판단 후 별도 결정
- **연구용 정밀 시뮬레이션**: 교육적 정확성과 직관이 우선. 수치 정밀도는 교육 목적 수준
- **실시간 멀티플레이어**: 네트워킹 복잡도 대비 교육적 가치 불확실
- **AI 튜터/챗봇**: 인터랙션 중심 정체성에 집중. AI 보조는 별도 Discovery
- **LMS 기능**: 과제 제출, 성적 관리는 기존 LMS와 병행
- **Phase 1에서 백엔드/DB**: 익명 접근, 순수 정적 사이트로 운영
- **SSR**: 3D 콘텐츠는 SSR 불가. 랜딩/모듈 목록 등 SEO 필요 페이지만 TanStack Start SSR로 처리, 3D는 클라이언트 전용

---

## 3. High-Level Architecture

### 3.1 Architecture Style

**System Architecture: 클라이언트 SPA [Phase 1] → 클라이언트-서버 [Phase 3+]**

Phase 1은 백엔드가 없다. 모든 시뮬레이션 로직은 클라이언트에서 실행되고, 정적 에셋으로 CDN에서 서빙한다. Phase 3부터 계정/진도/교사 기능을 위해 백엔드를 추가한다.

**Code Structure:**
- **Frontend**: TanStack Start (Vite) + React Three Fiber + FSD 변형 (3D 특화 레이어 추가)
- **시뮬레이션 엔진**: Rapier WASM (물리) + Koota ECS (상태) — React 외부에서 실행
- **Backend [Phase 3+]**: Rust (Axum) + Hexagonal Architecture

**Rationale:**
- 1인 개발에서 서버 운영 부담 최소화. Phase 1은 Cloudflare Workers 정적 서빙으로 운영비 거의 0
- PhysPlay는 본질적으로 클라이언트 사이드 3D 앱. TanStack Start(Vite 기반)는 z-web3d 스킬(Vite + WASM 플러그인)과 100% 호환. Next.js의 webpack → Vite 변환 마찰 없음
- 시뮬레이션의 연산 병목은 클라이언트 GPU/CPU. 서버와 무관한 독립적 문제
- 24개 모듈 확장 시 동일 패턴 반복. 모듈별 코드 스플리팅으로 번들 격리
- Phase 3+ 백엔드 추가 시, 프론트엔드 변경은 API 클라이언트 추가 + auth provider 래핑 수준

### 3.2 Container Diagram

```d2
direction: down

browser: 브라우저 {
  style.stroke: "#333"

  tanstack: TanStack Start App Shell {
    tooltip: "라우팅, i18n, 테마, SSR (SEO 페이지)"
  }
  r3f: React Three Fiber {
    tooltip: "3D 렌더링 레이어 (Three.js WebGPU)"
  }
  rapier: Rapier WASM {
    tooltip: "물리 시뮬레이션 (고정 타임스텝)"
  }
  ecs: Koota ECS {
    tooltip: "시뮬레이션 상태 관리"
  }
  zustand: Zustand {
    tooltip: "UI 상태 (테마, HUD, 모달)"
  }

  tanstack -> r3f: "Canvas 마운트"
  rapier -> ecs: "물리 결과 → ECS 동기화"
  ecs -> r3f: "ECS 쿼리 → R3F 렌더"
  tanstack -> zustand: "UI 상태 읽기"
}

cloudflare: Cloudflare (CDN + Workers) {
  shape: cloud
  tooltip: "정적 HTML/JS/CSS + 3D 에셋 (R2)"
}

posthog: PostHog {
  tooltip: "사용자 행동 분석"
}
sentry: Sentry {
  tooltip: "에러 추적 + 성능 모니터링"
}

# Phase 3+
api: Axum API (Cloud Run) [Phase 3+] {
  style.stroke-dash: 5
}
neon: Neon PostgreSQL [Phase 3+] {
  shape: cylinder
  style.stroke-dash: 5
}

cloudflare -> browser: "HTML + JS + Assets"
browser -> posthog: "이벤트 (비동기)"
browser -> sentry: "에러 + 성능"
browser -> api: "REST API [Phase 3+]" {style.stroke-dash: 5}
api -> neon: "SQL [Phase 3+]" {style.stroke-dash: 5}
```

**각 컨테이너 상세:**

| 컨테이너 | 기술 | 책임 | 통신 |
|---|---|---|---|
| TanStack Start App Shell | TanStack Start (Vite, TanStack Router) | 라우팅, i18n, 테마, SEO 페이지 SSR | Cloudflare Workers에서 서빙 |
| React Three Fiber | @react-three/fiber v9, drei v10 | 3D 장면 렌더링 (WebGPU 우선), 카메라 제어, 에셋 로딩 | Canvas 내부, ECS 훅으로 상태 읽기 |
| Rapier WASM | @dimforge/rapier3d-compat | 물리 시뮬레이션 (강체, 충돌, 조인트) | 고정 타임스텝 루프, ECS로 결과 동기화 |
| Koota ECS | koota | 시뮬레이션 엔티티 상태 관리 (위치, 속도, 힘) | 시스템 함수로 업데이트, R3F 훅으로 읽기 |
| Zustand | zustand | UI 메타 상태 (테마, 모달, HUD 토글, 언어) | React 컨텍스트 외부, 셀렉터로 구독 |
| Cloudflare CDN | Cloudflare Edge + R2 | HTML, JS 번들, 3D 에셋 (glTF, KTX2, WASM) 서빙 | HTTPS, 글로벌 엣지 캐시, 이그레스 무료 |
| PostHog | PostHog Cloud | 사용자 행동 분석 (방문, 인터랙션, 체류) | 클라이언트 SDK, 비동기 이벤트 전송 |
| Sentry | Sentry Cloud | 에러 추적, 성능 모니터링 (Web Vitals, fps) | 클라이언트 SDK |
| Axum API [Phase 3+] | Rust (Axum) on GCP Cloud Run | 인증, 사용자 데이터, 학습 진도, 교사 기능 | REST API, Cloud Run auto-scaling |
| Neon DB [Phase 3+] | PostgreSQL (Neon Serverless) | 사용자 계정, 학습 진도, 학급 데이터 | SQL over TLS |

### 3.3 Component Overview

프론트엔드의 주요 모듈 경계 ([folder-structure.md](./folder-structure.md) 참조):

**app/ — 앱 셸 [Phase 1]**
TanStack Router. 라우팅, 레이아웃, i18n 프로바이더, 테마 프로바이더. 비즈니스 로직 없음.

**scene/ — 3D 렌더링 [Phase 1]**
R3F 컴포넌트. Canvas 설정 (WebGPU 우선 → WebGL 자동 폴백), 공통 환경(조명, 카메라), 공통 머티리얼 팩토리 (TSL Node Material). 각 모듈의 3D 객체는 domains/에서 조합.

**engine/ — 시뮬레이션 코어 [Phase 1]**
React에 의존하지 않는 순수 로직 계층. Koota ECS (컴포넌트, 시스템, 쿼리), Rapier 물리 어댑터, 물리-ECS 동기화, TSL 셰이더 (에너지 시각화, 파동 이펙트, Compute Shader). 이 계층의 코드는 브라우저 환경이면 어디서든 실행 가능.

**domains/ — 모듈별 도메인 [Phase 1 부터 점진 추가]**
각 시뮬레이션 모듈의 독립 영역. `domains/motion-forces/`, `domains/energy-work/`, `domains/waves/` 등. 도메인별로 Scene, config, use-cases, UI를 캡슐화. 새 모듈 추가 = 새 domain 폴더 추가.

**ui/ — 2D 인터페이스 [Phase 1]**
HUD 패널 (슬라이더, 토글, 에너지 바), 네비게이션, 디자인 시스템. 3D 장면 위에 오버레이.

**xr/ — WebXR [Phase 2+]**
WebXR 세션 관리, 컨트롤러 매핑, 공간 인터랙션. scene/과 동일한 3D 콘텐츠를 XR 모드로 렌더링.

**shared/ — 공유 인프라 [Phase 1]**
Zustand 스토어, 타입, 상수, 유틸, 에셋 관리.

---

## 4. Data Architecture

### 4.1 Data Flow

**Primary Flow: 학생이 시뮬레이션을 조작한다 [Phase 1]**

```
사용자 입력 (슬라이더 드래그)
    ↓
Zustand (UI 상태: sliderValue = 5.0)
    ↓
Domain use-case (applyForce: sliderValue → ECS Force 컴포넌트 업데이트)
    ↓
Engine ECS (Force 컴포넌트 → Rapier 물리 월드에 힘 적용)
    ↓
Rapier WASM (고정 타임스텝 1/60s: 물리 시뮬레이션 실행)
    ↓
Engine 어댑터 (Rapier 결과 → ECS Position/Velocity 컴포넌트 동기화)
    ↓
R3F 훅 (useQuery로 ECS Position 읽기 → mesh.position 업데이트)
    ↓
Three.js 렌더러 (requestAnimationFrame → GPU 렌더)
    ↓
화면 업데이트 (60fps)
```

**일관성**: 모든 데이터가 단일 클라이언트 내에서 동기적으로 흐른다. 네트워크 호출 없음. Rapier 물리 스텝과 렌더 프레임 사이의 보간(interpolation)으로 시각적 부드러움 보장.

**Secondary Flow: 롤러코스터 트랙 설계 [Phase 1]**

```
사용자 입력 (마우스/터치로 제어점 배치)
    ↓
Domain store (controlPoints: Vec3[])
    ↓
Use-case: generateTrack (제어점 → 스플라인 → Rapier 콜라이더)
    ↓
사용자: "시작" 버튼
    ↓
Engine ECS (Ball 엔티티 생성, 초기 위치/속도 설정)
    ↓
Rapier (중력 + 트랙 콜라이더 위 물리 시뮬레이션)
    ↓
R3F (공 위치 + 에너지 바 오버레이 실시간 렌더)
```

**Analytics Flow [Phase 1]**

```
사용자 행동 (페이지 방문, 슬라이더 조작, 모듈 전환)
    ↓
PostHog SDK (클라이언트에서 이벤트 버퍼링)
    ↓
PostHog Cloud (비동기 전송, 배치)
    ↓
대시보드 (방문자 수, 인터랙션율, 체류 시간, 이탈 지점)
```

**User Data Flow [Phase 3+]**

```
사용자: 로그인 (Google OAuth)
    ↓
Axum API → Neon DB (사용자 레코드 생성/조회)
    ↓
JWT 발급 (access: 15min, refresh: 7d httpOnly cookie)
    ↓
모듈 완료 시: POST /api/progress → Neon (모듈 ID, 체류 시간, 인터랙션 로그)
    ↓
교사 대시보드: GET /api/classes/:id/progress → Neon (학급별 진도 조회)
```

### 4.2 Storage Strategy

**Phase 1: 저장소 없음**

모든 데이터는 클라이언트 메모리에만 존재한다. 세션 종료 시 소멸. 의도적 결정 — Phase 1의 목표는 "만지는 교육" 가치 검증이며, 진도 저장은 Phase 3에서 도입.

유일한 영속 데이터:
- `localStorage`: 테마 설정 (light/dark), 언어 설정 (ko/en)
- PostHog: 익명 행동 데이터 (서버 측)

**Phase 3+: Neon PostgreSQL**

| 데이터 종류 | 저장소 | 일관성 | 근거 |
|---|---|---|---|
| 사용자 계정 | Neon (PostgreSQL) | Strong | 인증/인가의 정확성 필수 |
| 학습 진도 | Neon (PostgreSQL) | Strong | 모듈 완료 상태의 정확성 필요 |
| 학급/교사 데이터 | Neon (PostgreSQL) | Strong | B2B 기능의 데이터 무결성 |
| 세션 리플레이 | 미정 (Phase 3 Discovery) | Eventual | 대용량, 분석 목적 |

Neon 선택 이유: scale-to-zero로 1인 개발 비용 최소화. Phase 1에서 DB가 없으므로 비용 0. Phase 3에서 필요 시점에 프로비저닝.

### 4.3 Caching Strategy

**CDN 캐싱 [Phase 1]**

| 에셋 | TTL | 무효화 전략 |
|---|---|---|
| HTML 페이지 | 짧은 TTL (5min) | 재배포 시 Cloudflare 캐시 퍼지 |
| JS/CSS 번들 | 영구 (content hash) | 빌드 시 새 hash 생성 |
| 3D 에셋 (glTF, KTX2) | 1년 (content hash) | 에셋 변경 시 새 hash. R2에서 서빙 (이그레스 무료) |
| WASM (Rapier) | 1년 (content hash) | 버전 업데이트 시 새 hash |
| 폰트, 아이콘 | 1년 | 변경 드묾 |

**3D 에셋 프리로딩**

모듈 진입 전에 해당 모듈의 3D 에셋을 preload. `useGLTF.preload()` + `useTexture.preload()`로 로딩 지연 최소화. 현재 모듈 로드 완료 후, 다음 추천 모듈의 에셋을 idle 시점에 프리페치.

---

## 5. Infrastructure & Deployment

### 5.1 Compute Platform

**Phase 1: Cloudflare Workers + R2 (정적 호스팅)**

- TanStack Start (Vinxi/Nitro) on Cloudflare Workers. SEO 필요 페이지만 SSR, 나머지는 정적 서빙
- Cloudflare Edge Network: 글로벌 CDN, 한국 포함 아시아 PoP 다수. Workers는 near-zero cold start
- 3D 에셋(glTF, KTX2, WASM)은 R2에서 서빙. **이그레스 무료** — 3D 앱은 에셋 전송량이 크므로 비용 이점 결정적
- 비용: Workers Free 플랜 또는 $5/월 (Paid). R2 스토리지 무료 10GB/월, 이후 $0.015/GB
- 대안 검토: Vercel은 Next.js에 최적이나 PhysPlay는 Vite 기반 3D 앱. TanStack Start ↔ Vite ↔ z-web3d 스킬이 자연스럽게 호환. Vercel의 에셋 이그레스 비용도 트래픽 증가 시 부담

**Phase 3+: + GCP Cloud Run (API 서버)**

- Rust(Axum) 바이너리 컨테이너. 메모리 10-30MB, 콜드스타트 <100ms
- us-east4 (Virginia) 기본. 한국 사용자 비중이 높으면 asia-northeast3 (Seoul) 추가 검토
- Neon DB와 동일 리전 배치로 DB 지연 최소화
- Auto-scaling: 0 → N (요청 기반). 비사용 시 0으로 스케일다운

### 5.2 Deployment Strategy

**Phase 1:**
```
PR 생성 → GitHub Actions (lint, type-check, build) → Cloudflare Workers Preview 배포
PR 머지 (main) → Cloudflare Workers Production 배포
```

- 롤백: Cloudflare Workers Rollback (이전 배포로 즉시 전환)
- 프리뷰 배포로 모든 PR에서 3D 시뮬레이션 동작 확인 가능

**Phase 3+:**
```
PR 머지 (main) → GitHub Actions → Docker build → Cloud Run 배포 (canary → 100%)
```

### 5.3 Environment Topology

| 환경 | 용도 | 차이점 |
|---|---|---|
| Preview | PR별 프리뷰 | Cloudflare Workers Preview URL. PostHog dev project |
| Production | 실제 서비스 | 커스텀 도메인. PostHog production project |

Phase 1에서는 staging 환경 불필요. Preview 배포가 staging 역할을 충분히 수행.

---

## 6. Cross-Cutting Concerns

### 6.1 Authentication & Authorization [Phase 3+]

Phase 1은 익명 접근 전용. 인증/인가 없음.

**Phase 3+ 설계:**
- Google OAuth2 (소셜 로그인). 한국 학생 대다수 구글 계정 보유
- Access token: 15분, 메모리 (Authorization header)
- Refresh token: 7일, httpOnly secure cookie
- RBAC: `student` (기본), `teacher` (학급 관리 권한)
- 인가 체크: Axum 미들웨어에서 수행

### 6.2 Observability

**Logging [Phase 1]**
- 클라이언트 콘솔 로그만 사용. 구조화된 서버 로깅은 Phase 3+
- Sentry Breadcrumbs로 에러 발생 전 사용자 액션 추적

**Metrics [Phase 1]**
- **비즈니스 메트릭** (PostHog): 모듈별 방문, 인터랙션율, 세션 체류 시간, 이탈 지점, 모듈 간 이동률
- **성능 메트릭** (Sentry): Web Vitals (LCP, FID, CLS), 시뮬레이션 fps, 3D 에셋 로드 시간
- **디바이스 메트릭** (Sentry + PostHog): 브라우저, OS, GPU, 화면 크기별 성능 분포

**Alerting [Phase 1]**
- Sentry: 에러 스파이크, 크래시율 임계치 초과
- GitHub Actions: 빌드 실패 알림

### 6.3 Error Handling & Resilience

**3D 렌더링 실패 대응:**
1. WebGPU 우선 초기화 (`WebGPURenderer.init()`) → 실패 시 WebGL 자동 폴백 (canvas.tsx). `frameloop="never"` → init 완료 후 `"always"` 패턴
2. WebGL도 미지원 → "이 브라우저는 3D를 지원하지 않습니다" 안내 + 권장 브라우저 링크
3. 3D 에셋 로드 실패 → Suspense fallback + 재시도 버튼
4. WASM(Rapier) 로드 실패 → 시뮬레이션 불가 안내. Sentry에 기기 정보 포함 리포트

**물리 시뮬레이션 안정성:**
- 고정 타임스텝 (1/60s). 프레임 드롭 시 물리 스텝 누적 (최대 3스텝/프레임, 초과 시 클램프)
- NaN/Infinity 검출 → 시뮬레이션 자동 리셋 + 사용자에게 "초기화되었습니다" 알림
- 물리 객체 수 상한: 모듈별로 설정 (예: 1-1 운동과 힘 최대 10개 객체)

### 6.4 Security

**Phase 1 (정적 사이트):**
- HTTPS 전용 (Cloudflare 자동)
- CSP 헤더: `script-src 'self'`, 3rd party는 PostHog/Sentry만 허용
- COOP/COEP 헤더: `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Embedder-Policy: require-corp` — SharedArrayBuffer 사용을 위해 필수 (물리/ECS Worker 스레딩)
- WASM 실행: 브라우저 샌드박스 내 (추가 격리 불필요)
- 사용자 입력 없음 (계정 없음) → XSS/CSRF/인젝션 공격면 최소
- `localStorage`에 민감 데이터 저장하지 않음 (테마, 언어 설정만)

**Phase 3+ 추가:**
- API: 입력 검증 (Axum extractor + validator), Rate limiting
- DB: Prepared statements (SQLx compile-time checking)으로 SQL 인젝션 방지
- CORS: 프론트엔드 도메인만 허용
- GDPR/PIPA: 계정 도입 시 개인정보처리방침, 데이터 삭제 기능

### 6.5 Performance & Scalability

**성능 프로파일:**

| 지표 | 목표 | 측정 방법 |
|---|---|---|
| 60fps | mid-range 디바이스에서 95% 프레임 유지 | `requestAnimationFrame` 타이밍 → Sentry 커스텀 메트릭 |
| 입력 지연 | <100ms (변수 조작 → 시뮬레이션 반영) | 이벤트 타임스탬프 비교 |
| FCP | <5s (3G) | Lighthouse / Sentry Web Vitals |
| JS 번들 | <200KB (gzip, 초기 로드) | rollup-plugin-visualizer (Vite) |
| WASM 로드 | <1s (4G), <3s (3G) | Sentry 커스텀 span |

**성능 전략:**

1. **코드 스플리팅**: 모듈별 dynamic import. `/motion-forces` 진입 시 해당 도메인 코드만 로드
2. **에셋 최적화**: glTF → Draco 압축, 텍스처 → KTX2 (GPU 압축), LOD(Level of Detail) 미지원 기기용 저폴리 에셋
3. **물리 최적화**: Rapier WASM (순수 JS 물리 엔진 대비 5-10x 성능). 고정 타임스텝으로 결정론적 시뮬레이션
4. **렌더 최적화**: 인스턴스드 메시, 프러스텀 컬링, Three.js 자동 배칭. 오버레이 UI는 별도 렌더 패스 (HTML → CSS로 3D 위에 오버레이, R3F `<Html>` 컴포넌트 미사용)
5. **모바일 적응**: GPU 티어 감지 (Detect GPU 라이브러리) → 저사양 시 파티클 수 감소, 그림자 해상도 하향, post-processing 비활성화
6. **GPU Compute** (TSL): 파티클 시스템, 파동 시각화 등 대량 병렬 연산은 TSL Compute Shader로 GPU에서 실행. CPU 부하 제거

**Threading Strategy (점진적 적용):**

Phase 1은 메인 스레드에서 모든 로직을 실행한다. 시뮬레이션 복잡도가 증가하면 Worker로 점진 분리:

| 단계 | 아키텍처 | 적용 시점 |
|---|---|---|
| **Phase 1 시작** | 메인 스레드: R3F 렌더 + Rapier 물리 + ECS | 3개 모듈, 물체 수 ≤10 |
| **Phase 1 최적화** | 물리 → Dedicated Worker (SharedArrayBuffer) | 프로파일링에서 물리가 프레임 예산 30% 초과 시 |
| **Phase 2+** | 물리 Worker + ECS Worker + 메인 스레드(렌더 전용) | 6개 모듈, 물체 수 증가, XR 도입 |

Worker 분리 시 데이터 전송 패턴:
- Workers가 시뮬레이션 결과를 `SharedArrayBuffer`에 기록
- 메인 스레드가 매 프레임 읽어서 Three.js 트랜스폼 업데이트
- `SharedArrayBuffer` 사용을 위해 COOP/COEP 헤더 필수 (6.4 Security 참조)

**스케일링:**
- Phase 1: CDN 서빙. 트래픽 증가에 자동 대응 (Cloudflare Edge). 3D 에셋은 R2 (이그레스 무료)
- Phase 3+: Cloud Run auto-scaling (0→N). Neon auto-scaling (compute units)

---

## 7. Integration Points

### PostHog (Analytics) [Phase 1]

- **제공**: 사용자 행동 분석, 퍼널, 세션 리플레이
- **프로토콜**: 클라이언트 JS SDK, HTTPS POST
- **실패 모드**: 네트워크 오류 시 이벤트 드롭 (치명적이지 않음). 시뮬레이션 체험에 영향 없음
- **SLA 의존**: 없음 (분석은 비동기)

### Sentry (Error Tracking) [Phase 1]

- **제공**: 에러 추적, 성능 모니터링, Web Vitals
- **프로토콜**: 클라이언트 JS SDK, HTTPS POST
- **실패 모드**: 네트워크 오류 시 에러 리포트 드롭 (치명적이지 않음)
- **SLA 의존**: 없음

### PDB (Protein Data Bank) [Phase 3]

- **제공**: 단백질 3D 구조 데이터 (PDB/mmCIF 형식)
- **프로토콜**: HTTPS REST API
- **실패 모드**: API 다운 시 캐시된 인기 구조 폴백. 오프라인 번들에 필수 구조 10개 내장
- **SLA 의존**: 낮음 (빌드 시 프리페치 + CDN 캐시)

### NASA Open API [Phase 4]

- **제공**: 천체 이미지, 궤도 데이터
- **프로토콜**: HTTPS REST API (API Key)
- **실패 모드**: 정적 폴백 데이터 (태양계 궤도 파라미터는 변하지 않음). 이미지는 CDN 캐시
- **SLA 의존**: 낮음 (정적 데이터 중심)

### Google OAuth [Phase 3+]

- **제공**: 사용자 인증
- **프로토콜**: OAuth 2.0 Authorization Code Flow
- **실패 모드**: OAuth 서비스 다운 시 로그인 불가 (기존 세션 유지). 익명 접근은 항상 가능
- **SLA 의존**: 중간 (로그인 시에만)

---

## 8. Migration & Rollout

해당 없음. 신규 프로젝트이며 기존 시스템 없음.

**Phase 간 전환 전략:**

Phase 1 → Phase 3 (백엔드 추가) 전환 시:
1. 프론트엔드에 API 클라이언트 레이어 추가 (`shared/api/`)
2. AuthProvider 래핑 (기존 익명 접근 유지 + 로그인 옵션 추가)
3. `localStorage` 테마/언어 설정 → 로그인 사용자는 DB 동기화, 비로그인은 기존 유지
4. 점진적 출시: 계정 기능을 feature flag로 제어. 비로그인 체험은 항상 가능

---

## 9. Risks & Open Questions

### 9.1 Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| 모바일 브라우저에서 Rapier WASM + R3F 조합이 60fps 미달 | High | Medium | Discovery 기술 스파이크에서 Galaxy A54/iPhone 12로 검증. 실패 시 시뮬레이션 복잡도 축소 또는 canvas 해상도 동적 조절 |
| Three.js WebGPU 렌더러 특정 기기 호환성 이슈 | Medium | Low | WebGPU 우선으로 개발하되, WebGL 자동 폴백을 항상 보장 (~5% 미지원 브라우저). TSL Node Material은 WebGPU/WebGL 모두 호환 |
| 롤러코스터 트랙 그리기 인터랙션이 터치 디바이스에서 자연스럽지 않음 | High | Medium | Discovery 프로토타입에서 터치 UX 검증. 프리셋 트랙 + 제어점 드래그 방식 병행 |
| 24개 모듈 확장 시 번들 사이즈 관리 실패 | Medium | Low | 모듈별 코드 스플리팅 아키텍처를 Phase 1에서 검증. 각 모듈은 독립 dynamic import |
| Koota ECS 라이브러리 성숙도 부족 | Medium | Low | Koota는 R3F 생태계에서 활발히 사용 중. 최악의 경우 순수 TypeScript 상태 관리로 대체 가능 (ECS 패턴 유지) |

### 9.2 Open Questions

1. **물리 시뮬레이션의 정확도 수준은?**
   - 옵션 A: 시각적으로 "맞아 보이는" 수준 (교육 직관 우선)
   - 옵션 B: 교과서 수식과 수치적으로 일치하는 수준
   - 필요한 정보: 교사 인터뷰 (5명) 피드백
   - 결정자: PM + 교사 자문

2. **오버레이 UI (HUD) 렌더링 방식은?**
   - 옵션 A: HTML/CSS 오버레이 (R3F 외부, 성능 좋음, 반응형 용이)
   - 옵션 B: R3F `<Html>` 컴포넌트 (3D 좌표 연동 가능, 성능 비용)
   - 옵션 C: 하이브리드 (고정 HUD는 HTML, 3D 부착 라벨은 `<Html>`)
   - 결정자: 개발자 (Discovery에서 성능 비교 후)

---

## 10. Architecture Decision Records (ADRs)

### ADR-1: Frontend Framework — TanStack Start (Vite)

- **Status**: Accepted
- **Context**: PhysPlay는 본질적으로 클라이언트 사이드 3D 앱이다. 모든 핵심 가치(시뮬레이션, 인터랙션)가 브라우저 GPU/CPU에서 실행된다. SEO는 랜딩 페이지와 모듈 목록 페이지 정도만 필요하며, 3D 콘텐츠 자체는 SSR 불가능하다. z-web3d 개발 스킬은 Vite + WASM 플러그인 기반이다.
- **Decision**: TanStack Start (Vite 기반, TanStack Router) + Cloudflare Workers 배포. SEO 필요 페이지만 SSR, 3D는 클라이언트 전용.
- **Alternatives Considered**:
  - **Next.js (SSG) + Vercel**: SSG/SSR 생태계 최성숙. 그러나 PhysPlay에서 SSG가 실질적으로 유리한 부분이 없음 — 3D 에셋(glTF, KTX2, WASM)은 정적 파일이며 어떤 CDN에서든 동일하게 서빙. Next.js의 webpack은 z-web3d 스킬의 Vite 기반 도구체인(vite-plugin-wasm, vite-plugin-top-level-await)과 마찰 발생. `'use client'` 경계 관리 필요. Vercel 에셋 이그레스 비용
  - **Vite + React (순수 SPA)**: 가장 가벼운 선택. 그러나 SEO 완전 불가. 교사/학생이 검색으로 유입되는 시나리오를 포기해야 함
  - **Astro + React Islands**: 정적 콘텐츠에 최적이나, R3F/Three.js의 복잡한 클라이언트 상태 관리와 궁합이 검증되지 않음
- **Consequences**:
  - (+) Vite 네이티브 → z-web3d 스킬과 100% 호환 (WASM 플러그인, top-level-await, COOP/COEP 헤더)
  - (+) TanStack Router의 타입 안전 라우팅 + 빌트인 데이터 로딩
  - (+) `'use client'` 마찰 없음. 모든 컴포넌트가 기본적으로 클라이언트
  - (+) Cloudflare Workers 배포로 비용 절감 ($5/월 vs $20/월+), R2 이그레스 무료
  - (-) TanStack Start의 SSR 생태계가 Next.js보다 작음 (하지만 PhysPlay는 SSR 의존도 낮음)
  - (-) 커뮤니티/레퍼런스가 Next.js보다 적음

### ADR-2: 3D 렌더링 — React Three Fiber + Three.js (WebGPU-First)

- **Status**: Accepted
- **Context**: 브라우저에서 60fps 3D 인터랙티브 시뮬레이션을 구현해야 한다. 24개 모듈을 일관된 패턴으로 개발해야 한다. 2026년 기준 WebGPU 브라우저 커버리지 ~95%.
- **Decision**: React Three Fiber v9 + Three.js (WebGPU-first, `import * as THREE from 'three/webgpu'`) + Drei v10. 머티리얼은 TSL(Three Shader Language) Node Material 사용 (`MeshStandardNodeMaterial` 등). WebGPU 미지원 브라우저는 WebGL 2 자동 폴백.
- **Alternatives Considered**:
  - **순수 Three.js (imperative)**: R3F 오버헤드 없이 최대 성능. 그러나 24개 모듈의 UI 컴포넌트(슬라이더, 토글, HUD)와 3D 장면 간 상태 동기화를 수동으로 관리해야 함. 1인 개발에서 생산성 치명적
  - **Babylon.js**: Three.js와 동급 기능. 그러나 React 바인딩 생태계가 Three.js/R3F보다 작고, 커뮤니티/리소스 차이가 큼
  - **WebGL 전용 (WebGPU 보류)**: 안정성 최우선. 그러나 2026년 기준 WebGPU가 주류이며, TSL Node Material은 WebGPU/WebGL 모두 호환. WebGL 전용으로 시작하면 이후 마이그레이션 비용 발생
- **Consequences**:
  - (+) React 컴포넌트 모델로 3D 장면 구성 → 모듈화, 재사용성, 1인 개발 생산성
  - (+) WebGPU-first: 향상된 렌더링 성능, GPU Compute Shader(파티클 시스템, 파동 시뮬레이션) 활용 가능
  - (+) TSL Node Material: WebGPU/WebGL 단일 코드 경로. 커스텀 셰이더(에너지 시각화, 파동 이펙트)를 JS/TS로 작성
  - (+) Drei v10 (카메라 제어, 로더, 헬퍼)로 반복 작업 최소화
  - (+) 대규모 생태계 (postprocessing, physics bindings, XR 지원)
  - (-) R3F의 React 리렌더 오버헤드. 고빈도 업데이트는 `useFrame` + ref 직접 조작으로 우회 필요
  - (-) WebGPURenderer 초기화가 async — `frameloop="never"` → init 완료 후 `"always"`로 전환 패턴 필요

### ADR-3: 물리 엔진 — Rapier WASM

- **Status**: Accepted
- **Context**: 운동과 힘, 에너지와 일, 파동 모듈에서 실시간 물리 시뮬레이션이 필요하다. mid-range 디바이스에서 60fps를 유지해야 한다.
- **Decision**: Rapier 3D (WASM 빌드, `@dimforge/rapier3d-compat`). Phase 1은 `@react-three/rapier`로 시작, 성능 필요 시 imperative API로 점진 전환.
- **Alternatives Considered**:
  - **cannon-es (순수 JS)**: 설정 간단. 그러나 성능이 Rapier WASM의 1/5~1/10. 모바일 60fps 달성 불확실
  - **Ammo.js (Bullet Physics WASM)**: 성숙한 물리 엔진. 그러나 API가 C++ 스타일, TypeScript 타입 지원 미흡, 번들 사이즈 큼 (~1.5MB)
  - **커스텀 물리 (오일러 적분 등)**: 가장 가볍지만, 충돌 감지/해결이 복잡. 롤러코스터(스플라인 콜라이더), 물결통(유체 근사) 등 다양한 모듈 대응 불가
- **Consequences**:
  - (+) Rust로 작성된 WASM → JS 대비 5-10x 물리 성능
  - (+) 강체, 콜라이더, 조인트, 레이캐스트 등 풍부한 기능
  - (+) `@react-three/rapier`로 R3F 통합 용이. 필요 시 imperative로 전환 가능
  - (+) 결정론적 시뮬레이션 (고정 타임스텝) → 재현 가능한 교육 체험
  - (-) WASM 번들 ~500KB (gzip). 초기 로딩 비용. lazy-load로 완화
  - (-) 파동 시뮬레이션(1-3)은 강체 물리가 아닌 수학적 파동 함수로 구현해야 함. Rapier는 이 모듈에서 불필요

### ADR-4: 상태 관리 — Zustand + Koota ECS

- **Status**: Accepted
- **Context**: UI 상태(테마, HUD)와 시뮬레이션 상태(물체 위치, 속도, 힘)는 성격이 완전히 다르다. UI 상태는 React 렌더 사이클에 맞게 갱신. 시뮬레이션 상태는 매 프레임(16ms) 갱신되며 React 리렌더를 트리거하면 안 된다.
- **Decision**: UI 메타 상태 → Zustand. 시뮬레이션 상태 → Koota ECS.
- **Alternatives Considered**:
  - **Zustand만**: 단순하지만, 매 프레임 갱신되는 시뮬레이션 데이터를 Zustand에 넣으면 불필요한 React 리렌더 발생. `useFrame` + ref로 우회하면 Zustand의 의미가 없어짐
  - **Jotai/Valtio**: Zustand과 유사한 트레이드오프. ECS 패턴에 맞지 않음
  - **순수 TypeScript 클래스 (World, Entity)**: 가능하지만 쿼리, 시스템 스케줄링 등을 직접 구현해야 함. Koota가 이를 제공
- **Consequences**:
  - (+) 관심사 분리: UI 상태와 시뮬레이션 상태가 완전히 독립
  - (+) ECS 패턴: 새 시뮬레이션 모듈 추가 시 컴포넌트 + 시스템 조합으로 확장. 24개 모듈에 일관된 패턴
  - (+) 성능: ECS 데이터는 React 외부에서 관리. R3F `useFrame`에서 ECS 쿼리로 직접 읽어 mesh 업데이트
  - (-) 학습 곡선: ECS 패턴에 익숙해져야 함
  - (-) Zustand ↔ ECS 간 브릿지가 필요한 경우(예: 슬라이더 값 → ECS 힘 적용) 도메인 use-case 레이어에서 처리해야 함

### ADR-5: 호스팅 — Cloudflare Workers + R2 [Phase 1]

- **Status**: Accepted
- **Context**: Phase 1은 클라이언트 사이드 3D 앱. 글로벌 CDN 필요 (한국 사용자 우선, 영어권 확장 예정). 3D 에셋(glTF, KTX2, WASM)의 전송량이 크므로 이그레스 비용이 중요. 1인 개발이므로 운영 부담 최소화가 핵심.
- **Decision**: Cloudflare Workers (TanStack Start 호스팅) + R2 (3D 에셋 스토리지).
- **Alternatives Considered**:
  - **Vercel**: Next.js에 최적. 그러나 PhysPlay는 TanStack Start(Vite). Vercel의 핵심 이점(빌드 캐시, ISR, 이미지 최적화)이 3D 앱에서는 활용 불가. Pro 플랜 $20/월 + 에셋 이그레스 비용 추가 부담
  - **GitHub Pages**: 무료. 그러나 커스텀 빌드 파이프라인 필요, CDN 성능 미흡, Workers 실행 불가
  - **AWS S3 + CloudFront**: 최대 유연성. 그러나 설정/관리 복잡. 1인 개발에 부적합. CloudFront 이그레스 비용 발생
- **Consequences**:
  - (+) R2 이그레스 무료 → 3D 에셋 서빙 비용 예측 가능. 트래픽 증가 시에도 비용 폭발 없음
  - (+) Workers near-zero cold start. 글로벌 Edge Network, 한국 PoP 포함
  - (+) Workers Free 또는 $5/월(Paid)로 Phase 1 충분
  - (+) TanStack Start(Vinxi/Nitro)의 Cloudflare Workers 배포 네이티브 지원
  - (-) Phase 3+에서 API 서버는 Cloudflare가 아닌 Cloud Run으로 분리 (Rust 바이너리 → Workers는 V8만 지원)
  - (-) Workers의 CPU 시간 제한 (Free: 10ms, Paid: 30s). SSR 페이지가 복잡해지면 제한 주의 (PhysPlay SSR은 랜딩/목록뿐이므로 충분)

### ADR-6: Analytics — PostHog

- **Status**: Accepted
- **Context**: Phase 1 성공 기준(UV 10K, 체류 3분, 인터랙션율 60%)을 측정해야 한다. 시뮬레이션 내 세부 인터랙션(어떤 슬라이더를 몇 번 조작했는지)까지 추적해야 한다.
- **Decision**: PostHog Cloud.
- **Alternatives Considered**:
  - **Google Analytics 4**: 무료, 보편적. 그러나 커스텀 이벤트 분석이 제한적이고, 시뮬레이션 인터랙션 같은 고빈도 이벤트에 부적합. 세션 리플레이 없음
  - **Mixpanel**: 이벤트 분석 우수. 그러나 유료 구간 진입 빠름. PostHog와 기능 유사하되 비용 높음
  - **Plausible/Umami**: 프라이버시 중심, 가벼움. 그러나 퍼널 분석, 세션 리플레이 등 부재. Phase 1 성공 기준 측정에 불충분
- **Consequences**:
  - (+) 이벤트 분석 + 퍼널 + 세션 리플레이 + Feature Flag 통합
  - (+) 자체 호스팅 가능 (추후 비용 최적화)
  - (+) 관대한 무료 티어 (1M events/월)
  - (-) 클라이언트 SDK 번들 (~25KB gzip). 초기 로딩에 포함되지만, 시뮬레이션 로드 대비 무시할 수준

### ADR-7: Backend — Rust (Axum) on Cloud Run [Phase 3+]

- **Status**: Proposed (Phase 3에서 활성화)
- **Context**: Phase 3부터 사용자 계정, 학습 진도, 교사 대시보드가 필요하다. API 서버가 필요해진다.
- **Decision**: Rust (Axum) + Hexagonal Architecture, GCP Cloud Run 배포, Neon PostgreSQL.
- **Alternatives Considered**:
  - **TanStack Start Server Functions + Cloudflare Workers**: 프론트엔드와 동일 인프라에서 API 관리 가능. 그러나 V8 런타임 제약 (Rust 바이너리 실행 불가), CPU 시간 제한, Workers 생태계에서 PostgreSQL 직접 접속 제한
  - **Python (FastAPI)**: AI 기능이 있다면 고려하지만, PhysPlay는 AI 기능이 없음(Non-Goal). Python 전용 라이브러리 필요 없음
  - **Node.js (Hono/Express)**: 프론트엔드와 동일 언어. 그러나 성능/메모리 효율은 Rust가 10x+. 1인 개발에서 서버 비용 최소화가 중요
- **Consequences**:
  - (+) Cloud Run scale-to-zero → 비사용 시 비용 0
  - (+) Rust 바이너리: 메모리 10-30MB, cold start <100ms
  - (+) SQLx compile-time query checking → 런타임 SQL 에러 방지
  - (-) Phase 3까지 백엔드 코드 없음. 그때 가서 구현 시작
  - (-) Rust 학습 곡선 (이미 기술 스택에 포함되어 있다고 가정)

---

## Phase Implementation Summary

### Phase 1 (고전물리 핵심 — 13주)

**컴포넌트:**
- TanStack Start App Shell (TanStack Router, Vite)
- 3개 시뮬레이션 도메인: `domains/motion-forces/`, `domains/energy-work/`, `domains/waves/`
- Engine: Koota ECS + Rapier WASM 어댑터
- Scene: R3F Canvas (WebGPU 우선 → WebGL 자동 폴백), TSL Node Material
- UI: HUD (슬라이더, 토글, 에너지 바, 벡터 오버레이), 랜딩 페이지, 네비게이션
- Shared: Zustand (테마, 언어), i18n (ko + en), 디자인 토큰

**인프라:**
- Cloudflare Workers + R2 (호스팅 + 에셋 스토리지)
- PostHog Cloud (analytics)
- Sentry Cloud (error tracking)
- GitHub Actions (CI: lint, type-check, build)

**핵심 ADR:**
- ADR-1 (TanStack Start), ADR-2 (R3F + WebGPU), ADR-3 (Rapier), ADR-4 (Zustand + ECS), ADR-5 (Cloudflare), ADR-6 (PostHog)

### Phase 2 (고전물리 완성 — 1~2개월)

**컴포넌트 추가:**
- 3개 시뮬레이션 도메인: `domains/sound-light/`, `domains/electricity-magnetism/`, `domains/electromagnetic-waves/`
- xr/: WebXR 세션 관리 (Discovery 결과에 따라)
- i18n: es, pt-BR, id, ja 추가

**인프라 변경:** 없음

### Phase 3 (화학 + 백엔드 — 3~4개월)

**컴포넌트 추가:**
- 6개 화학 도메인: `domains/atoms-bonds/`, `domains/molecular-shapes/`, `domains/chemical-reactions/`, `domains/biomolecules/`, `domains/cell-interior/`, `domains/genetic-info/`
- Backend: Axum API (Cloud Run)
- Auth: Google OAuth2 + JWT
- DB: Neon PostgreSQL (users, progress, classes)
- Frontend: AuthProvider, API 클라이언트, 교사 대시보드 UI

**인프라 추가:**
- GCP Cloud Run (us-east4)
- Neon PostgreSQL (us-east-1)
- Google OAuth 설정

**새 인테그레이션:**
- PDB (Protein Data Bank) — 단백질 구조 데이터
- PubChem — 분자 데이터

**핵심 ADR:**
- ADR-7 (Rust/Axum/Cloud Run)

### Phase 4 (우주과학 — 3~4개월)

**컴포넌트 추가:**
- 6개 우주과학 도메인

**새 인테그레이션:**
- NASA Open API — 천체 이미지, 궤도 데이터

### Phase 5 (양자역학 — 3~4개월)

**컴포넌트 추가:**
- 6개 양자역학 도메인
- 수학적 시뮬레이션 특화 (파동함수, 확률, 블로흐 구)

**인프라 변경:** 없음. 기존 스택으로 충분.
