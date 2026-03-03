# PhysPlay Phase 1 — 역학 실험실 PRD

**Status:** Draft
**Author:** ---
**Last Updated:** 2026-03-03
**Full PRD:** [docs/prd.md](./prd.md)
**Product Brief:** [docs/product-brief.md](./product-brief.md)

---

## 1. Phase 1 목표

**"예측 -> 실험 -> 발견" 코어 루프가 과학 학습 동기를 만든다는 가설을 역학 실험실 3개 스테이션으로 검증한다.**

### What Needs to Be True (Phase 1 완료 시점 검증 항목)

| # | 검증 항목 | 검증 방법 | 통과 기준 |
|---|----------|----------|----------|
| 1 | 코어 루프가 동작한다 | Predict->Play->Discover 퍼널 완주율 측정 | 진입자의 40% 이상이 첫 챌린지 Discover까지 도달 |
| 2 | 예측이 참여를 강제한다 | predict_submit / predict_skip 비율 | 예측 참여율 70% 이상 (스킵율 30% 미만) |
| 3 | 틀림이 호기심을 만든다 | 오답 후 다음 챌린지 진행률 vs 이탈률 | 오답 후 60% 이상이 다음 챌린지 진행 |
| 4 | 맞음이 자신감을 만든다 | 동일 스테이션 내 후반부 예측 정확도 변화 | 20% 향상 |
| 5 | 탐험 동기가 생긴다 | 스테이션 간 이동률 | 30% 이상이 2개 이상 스테이션 방문 |
| 6 | 엔진 기반 챌린지가 수동 제작만큼 효과적이다 | 챌린지 완주율 + 정성 피드백 | 수동 제작 챌린지와 유의미한 차이 없음 |
| 7 | 브라우저 3D 시뮬레이션이 실용적이다 | FPS 측정 | PC mid-range 60fps, 모바일 mid-range 30fps |
| 8 | 무료 웹으로 트래픽 확보 가능하다 | Web analytics | 출시 첫 달 10,000 UV |
| 9 | B2B 교사 시장에 관심이 있다 | 랜딩 페이지 이메일 수집 | 50명 이상 |

---

## 2. 스코핑 근거

### 왜 이 스코프인가

- **코어 루프 검증이 최우선이다.** 예측->실험->발견 루프가 실제로 학습 동기를 만드는지 확인하지 않으면 어떤 확장도 무의미하다. 역학 실험실의 3개 스테이션(투사체, 에너지, 파동)은 3가지 예측 유형(trajectory, binary, pattern)을 모두 커버하여 루프의 범용성을 검증한다.
- **God Hand 인터랙션 검증.** 1인칭 테이블탑 조작이 웹에서 자연스럽게 동작하는지 확인한다. 투사체(던지기), 에너지(발사), 파동(파원 배치)으로 핵심 인터랙션 패턴을 검증한다.
- **엔진 기반 아키텍처 검증.** 챌린지를 JSON 데이터로 정의하고 엔진이 실행하는 구조가 동작하는지, 변수 조합으로 다양한 챌린지를 만들 수 있는지 확인한다.
- **적응형 분기 검증.** 메타데이터 기반 규칙 엔진이 사용자 수준에 맞는 챌린지를 선택하는 구조를 검증한다.

### 왜 지금 이것만 하는가

- 계정 시스템은 로컬 저장으로 대체하여 개발 범위를 축소한다
- XR 모드는 아키텍처만 대비하고 실제 구현은 하지 않는다
- AI 모델 대신 규칙 기반 로직으로 적응형 분기를 구현한다
- B2B 교사 대시보드는 Phase 3로 미루고, Phase 1에서는 이메일 수집으로 관심도만 측정한다

### Phase 2에서 배울 것

Phase 1 데이터(예측 참여율, 스킵율, 정확도 변화, 스테이션 간 이동 패턴, 챌린지별 완주율)를 기반으로:
- 적응형 AI 모델의 학습 데이터로 활용
- 역학 실험실 세로 확장(소리/빛, 전자기 스테이션) 방향 결정
- 코어 루프 UX 개선점 도출

---

## 3. 유저 플로우 상세

### 3.1 온보딩 플로우 (첫 30초)

첫 방문자가 URL을 열었을 때부터 코어 루프 한 바퀴를 완료할 때까지의 플로우.

1. URL 접속 -> 로딩 화면(PhysPlay 로고 + 프로그레스 바, 3초 이내)
2. 로딩 완료 -> **역학 실험실 투사체 스테이션으로 바로 진입** (회원가입/선택 없음)
3. 풀스크린 3D 뷰포트. 실험대 위에 공이 놓여 있다
4. HUD에 첫 번째 가이드 표시: "이 공을 지구에서 45도로 던지면 어디에 떨어질까?"
   - 투사체 궤적 그리기 인터페이스가 활성화됨
   - 짧은 힌트 애니메이션: 손가락/마우스로 궤적을 그리는 제스처 가이드 (1.5초)
5. 사용자가 궤적을 그리면 -> PREDICT 완료
6. "던져보자!" CTA -> 사용자가 God Hand로 공을 던짐 (클릭 드래그 or 터치 스와이프)
   - 공이 날아가며 **예측 궤적(반투명)과 실제 궤적(실선)이 동시에 렌더링**
7. 착지 후 -> DISCOVER HUD 표시
   - 정답/오답 피드백 + 개념 설명 (Level 1: 직관적 비유)
   - "다음 챌린지" CTA
8. 첫 챌린지 완료 -> **연구소 허브(2D)가 처음으로 등장**
   - 역학 실험실(해금됨) + 나머지 공간(실루엣, 잠김)
   - "역학 실험실에서 계속하기" CTA

**핵심 원칙:**
- 첫 30초 안에 반드시 한 번의 예측->실험->발견을 완료해야 한다
- 텍스트를 최소화하고 인터랙션으로 가르친다
- 가이드 힌트는 1회만 표시하고 이후 반복하지 않는다
- 온보딩 챌린지는 가장 직관적인 시나리오(지구 기본 던지기, difficulty 1)를 사용한다

**이탈 위험 지점과 대응:**
- 궤적 그리기에서 막히는 경우 -> 5초 무응답 시 "화면을 드래그해서 궤적을 그려보세요" 힌트 표시
- 던지기 인터랙션에서 막히는 경우 -> 3초 무응답 시 제스처 가이드 재표시

### 3.2 연구소 허브 (2D)

재방문자의 홈 화면이자 공간/스테이션 탐색의 기지.

1. 연구소 허브는 2D 페이지로 렌더링 (3D 리소스 절약)
2. **해금된 공간:** 역학 실험실 (Phase 1에서 유일하게 해금된 공간)
   - 공간 카드에 완료 현황 표시 (예: "투사체 8/10, 에너지 3/8, 파동 0/8")
3. **잠긴 공간:** 분자 실험실, 우주 관측소, 양자 연구소 (실루엣 + "Coming Soon")
4. 공간 카드 클릭 -> 스테이션 선택 화면 (해당 공간 내 스테이션 목록)
5. 스테이션 선택 -> 전환 연출과 함께 풀스크린 3D 실험실 진입
6. 하단에 전체 진도 요약: 총 챌린지 완료 수, 예측 정확도, 가장 많이 실험한 스테이션

### 3.3 실험실 진입 전환

허브(2D)에서 실험실(3D)로 진입할 때의 전환 연출.

1. 스테이션 선택 -> 화면이 서서히 어두워짐 (0.3초)
2. 3D 뷰포트 로딩 (에셋 프리로드, WebGPU/WebGL 초기화)
3. 역학 실험실 테마 페이드인: 네온 격자 바닥 + 조명 + 앰비언트 사운드 시작 (0.5초)
4. 카메라가 선택한 스테이션의 실험대로 이동 (0.5초)
5. 스테이션 활성화 -> HUD에 현재 챌린지 정보 표시
6. 총 전환 소요 시간 목표: **1.5초 이내** (에셋 캐시 히트 시)

### 3.4 코어 루프 상세 플로우

스테이션 진입 후 챌린지 한 바퀴의 상세 플로우. 모든 단계가 풀스크린 3D + HUD 안에서 완결된다.

#### PREDICT 단계

1. HUD에 챌린지 질문 표시 (i18n: en/ko)
2. 예측 유형에 따른 입력 인터페이스 활성화:
   - **trajectory:** 3D 뷰포트 위에 궤적 그리기. 마우스 드래그 또는 터치로 포인트를 찍어 곡선 생성. 최소 3포인트, 최대 20포인트. 그린 궤적은 반투명 선으로 실시간 표시
   - **binary:** HUD에 2개 선택지 버튼. 선택 시 시각적 확인 피드백
   - **pattern:** HUD에 3개 패턴 이미지 선택지. 각 패턴은 간단한 시각적 미리보기로 표시
3. 예측 제출 -> 다음 단계로 전환. 예측 스킵 옵션은 존재하되 시각적으로 부각하지 않음 (참여 유도)
4. 예측 제출 시 이벤트 기록: `predict_submit` (predict_type, predict_value 포함)

#### PLAY 단계

1. PREDICT 완료 -> 실험 조작 인터페이스 활성화
2. God Hand 인터랙션:
   - **투사체:** 클릭 드래그로 공을 잡아 당겼다 놓기 (새총 UX). 드래그 방향/강도가 발사 각도/속도에 매핑
   - **에너지:** "발사" 버튼으로 카트/진자 시작. 시작 높이/각도는 드래그로 조절
   - **파동:** 파원 위치를 드래그로 배치. "시작" 버튼으로 시뮬레이션 실행
3. 시뮬레이션 실행 중:
   - 물리 엔진(Rapier 또는 커스텀)이 실시간 계산
   - 3D 렌더링으로 결과를 실시간 표시
   - **예측 궤적(반투명)이 실제 결과와 동시에 렌더링** (trajectory 예측 유형일 때)
4. 시뮬레이션 완료 -> 결과 판정 (정답/오답)
5. 이벤트 기록: `play_start`, `play_complete` (duration_ms 포함)

#### DISCOVER 단계

1. 시뮬레이션 완료 -> DISCOVER HUD 활성화
2. **정답 시:**
   - 축하 이펙트 (파티클 버스트, 역학 실험실 테마에 맞는 네온 이펙트)
   - 간결한 개념 확인: "맞았어! [개념 Level 1 설명]"
   - "변수를 바꿔볼까?" -> 다음 챌린지로의 동기 부여
3. **오답 시:**
   - 위로 + 설명: "아쉽지만, 여기서 배울 게 있어!"
   - 예측 vs 실제 결과 오버레이 시각화 (trajectory: 두 궤적 겹침, binary: 결과 하이라이트)
   - 개념 설명 표시 (사용자 수준에 따라 Level 1/2/3 중 선택)
4. **Discover 콘텐츠 구조:**
   - 기본 표시: 해당 챌린지의 `discover.relatedConcepts`에 연결된 개념의 Level 1 설명
   - "더 알아보기" 탭: Level 2 (개념 설명) -> Level 3 (수식 포함) 순차 공개
   - 개념 설명 텍스트는 `docs/contents/engines/*/discover.md`에서 참조
5. **다음 챌린지 전환:**
   - "다음 챌린지" CTA -> 적응형 규칙 엔진이 다음 챌린지를 선택
   - "다른 스테이션 가기" CTA -> 스테이션 전환 (HUD 내 스테이션 메뉴)
   - "허브로 돌아가기" CTA -> 연구소 허브(2D)로 복귀
6. 이벤트 기록: `discover_view` (was_correct), `discover_detail_open` (detail_type)

### 3.5 스테이션 내 이동

3D 실험실 안에서 스테이션 간 이동은 HUD 메뉴로 처리한다.

1. HUD 상단에 스테이션 탭: [투사체] [에너지] [파동]
2. 탭 클릭 -> 카메라가 해당 스테이션의 실험대로 이동 (0.5초 전환)
3. 3D 환경(역학 실험실 테마)은 유지된 채 실험대와 오브젝트만 전환
4. 이벤트 기록: `station_navigate` (from_station_id, to_station_id)

### 3.6 스테이션 완주

스테이션의 모든 챌린지를 완료했을 때의 플로우.

1. 마지막 챌린지의 DISCOVER 완료 후 -> 스테이션 완주 연출
2. 완주 이펙트: 역학 실험실 테마의 대형 파티클 이펙트 + 축하 사운드
3. 스테이션 완주 요약 HUD:
   - 총 챌린지 수, 정답/오답 비율, 가장 많이 틀린 개념
   - 예측 정확도 변화 그래프 (첫 챌린지 -> 마지막 챌린지)
4. "다른 스테이션으로!" CTA -> 스테이션 이동
5. 이벤트 기록: `station_complete` (total_challenges, correct_count)

---

## 4. 스테이션별 상세 요구사항

### 4.1 투사체 스테이션

-> 챌린지 시나리오 상세: [docs/contents/engines/projectile/challenges.md](./contents/engines/projectile/challenges.md)
-> 개념 목록: [docs/contents/engines/projectile/concepts.md](./contents/engines/projectile/concepts.md)
-> Discover 소재: [docs/contents/engines/projectile/discover.md](./contents/engines/projectile/discover.md)

**구현 요구사항:**

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| PRJ-001 | 5개 변수(gravity, angle, launchSpeed, mass, drag)의 실시간 물리 시뮬레이션 | P0 |
| PRJ-002 | 궤적 그리기(trajectory) 예측 입력: 마우스 드래그로 포인트 기반 곡선 생성, 최소 3포인트 | P0 |
| PRJ-003 | 예측 궤적(반투명)과 실제 궤적(실선)의 오버레이 렌더링 | P0 |
| PRJ-004 | God Hand 던지기: 클릭 드래그 방향/강도 -> 발사 각도/속도 매핑 | P0 |
| PRJ-005 | 중력 환경 전환 시 시각적 배경 변화 (지구: 하늘+구름, 달: 회색 표면+지구 배경, 목성: 가스 대기) | P1 |
| PRJ-006 | 공기저항 시각화: drag > 0일 때 궤적 비대칭 + 공기 입자 파티클 표시 | P1 |
| PRJ-007 | 자유낙하(scenario #8) 이진 선택 예측: 깃털과 쇠구슬 동시 낙하 시뮬레이션 | P0 |
| PRJ-008 | 지구 vs 달 비교(scenario #10): 분할 화면 또는 동시 렌더링으로 직접 비교 | P1 |
| PRJ-009 | 모바일 터치: 스와이프 제스처로 던지기 매핑, 핀치 줌으로 뷰 조절 | P1 |

**예측 정답 판정:**

- trajectory 예측: 사용자가 그린 궤적과 실제 궤적 간 DTW(Dynamic Time Warping) 또는 영역 기반 오차 측정
- tolerance 값: 챌린지 JSON의 `predict.tolerance` 필드로 정의 (기본값 0.15 = 15% 오차 허용)
- 오차 범위 내 -> 정답, 범위 초과 -> 오답

### 4.2 에너지 스테이션

-> 챌린지 시나리오 상세: [docs/contents/engines/collision-energy/challenges.md](./contents/engines/collision-energy/challenges.md)
-> 개념 목록: [docs/contents/engines/collision-energy/concepts.md](./contents/engines/collision-energy/concepts.md)
-> Discover 소재: [docs/contents/engines/collision-energy/discover.md](./contents/engines/collision-energy/discover.md)

**구현 요구사항:**

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| ENG-001 | 롤러코스터 물리: 높이, 마찰, 루프 반지름 기반의 에너지 전환 시뮬레이션 | P0 |
| ENG-002 | 이진 선택(binary) 예측 입력: "통과한다/못 한다" 2개 버튼 | P0 |
| ENG-003 | 패턴 선택(pattern) 예측 입력: 결과 속도 패턴 3개 중 선택 | P0 |
| ENG-004 | 에너지 바 시각화: 위치에너지(파랑)와 운동에너지(빨강) 실시간 바 그래프를 HUD에 표시 | P0 |
| ENG-005 | 충돌 시뮬레이션: 2개 물체의 탄성/비탄성 충돌 물리 | P0 |
| ENG-006 | 진자 시뮬레이션: 길이, 초기 각도 기반의 주기적 에너지 교환 | P0 |
| ENG-007 | God Hand 조작: 카트 시작 높이를 드래그로 조절, 충돌 물체를 드래그로 위치/속도 설정 | P0 |
| ENG-008 | 마찰 시각화: friction > 0일 때 트랙에 열 파티클 표시 + 에너지 바에서 열에너지(주황) 추가 | P1 |
| ENG-009 | 이중 루프 트랙 렌더링: 연속 루프 구조의 3D 트랙 | P1 |

### 4.3 파동 스테이션

-> 챌린지 시나리오 상세: [docs/contents/engines/wave/challenges.md](./contents/engines/wave/challenges.md)
-> 개념 목록: [docs/contents/engines/wave/concepts.md](./contents/engines/wave/concepts.md)
-> Discover 소재: [docs/contents/engines/wave/discover.md](./contents/engines/wave/discover.md)

**구현 요구사항:**

| ID | 요구사항 | 우선순위 |
|----|---------|---------|
| WAV-001 | 2D 수면 파동 시뮬레이션: 파원에서 동심원 파동 확산, 실시간 간섭 패턴 계산 | P0 |
| WAV-002 | 패턴 선택(pattern) 예측 입력: 간섭 패턴 이미지 3개 중 선택 | P0 |
| WAV-003 | God Hand 파원 배치: 드래그로 파원 위치 설정, 파원 수 조절 | P0 |
| WAV-004 | 도플러 효과 시뮬레이션: 이동하는 파원의 파장 변화 시각화 (앞쪽 압축, 뒤쪽 확장) | P0 |
| WAV-005 | 슬릿 회절 시뮬레이션: 슬릿 폭과 파장에 따른 회절 패턴 | P1 |
| WAV-006 | 스펙트럼 분석: 별 표면 온도에 따른 흑체복사 스펙트럼 시각화 | P1 |
| WAV-007 | 공명 챌린지(scenario #4): 주파수 슬라이더로 공명점 찾기 이진 선택 | P0 |
| WAV-008 | 파동 시각화: 컬러맵(보강=밝음, 상쇄=어두움)으로 간섭 패턴을 직관적으로 표시 | P0 |

---

## 5. 챌린지 JSON 스키마

### 5.1 스키마 정의

```jsonc
{
  // === 필수 필드 ===
  "id": "string",                    // 유일 식별자. 형식: {engineId}-{scenario}-{variant}
  "engineId": "string",              // 엔진 식별자: "projectile" | "collision-energy" | "wave"
  "version": "number",               // 스키마 버전 (정수, 현재 1)
  "params": {                        // 엔진별 시뮬레이션 파라미터 (엔진마다 다름)
    // -> 각 엔진의 concepts.md "엔진 변수" 섹션 참조
  },
  "predict": {
    "type": "string",                // "trajectory" | "binary" | "pattern"
    "question": "string",            // 사용자에게 표시할 예측 질문 (i18n 키 또는 직접 텍스트)
    "tolerance": "number",           // trajectory 유형 전용: 오차 허용 범위 (0~1, 기본 0.15)
    "options": ["string"]            // binary/pattern 유형 전용: 선택지 배열
  },
  "discover": {
    "relatedConcepts": ["string"],   // 연관 개념 ID 배열 (concept-level 라이브러리 참조)
    "level1": "string",              // 직관적 비유 (정답/오답 공통)
    "level2": "string",              // 개념 설명
    "level3": "string"               // 수식 포함 설명
  },
  "difficulty": "number",            // 난이도 (1~5, 정수)
  "space": "string",                 // 공간 ID: "mechanics-lab"
  "station": "string",               // 스테이션 ID: "projectile" | "collision-energy" | "wave"
  "tags": ["string"],                // 메타데이터 태그 (적응형 규칙 엔진이 사용)

  // === 선택 필드 ===
  "prerequisite": "string | null",   // 선행 챌린지 ID (null이면 바로 접근 가능)
  "hints": ["string"],               // 예측 단계 힌트 (순차 공개)
  "contextHint": "string | null"     // Discover 런타임 프레이밍을 위한 맥락 힌트
}
```

### 5.2 버전 관리 전략

- `version` 필드는 스키마 구조 변경 시 증가 (1 -> 2 -> ...)
- 하위 호환성 유지: 새 필드 추가 시 optional로, 기존 필드 제거/변경 시 마이그레이션 로직 포함
- Phase 1에서는 `version: 1`로 고정
- 챌린지 데이터는 `content/challenges/{engineId}/` 디렉토리에 JSON 파일로 저장
- 빌드 타임에 스키마 유효성 검증 (JSON Schema 또는 Zod)

### 5.3 Phase 1 챌린지 ID 목록

총 26개 챌린지 (투사체 10 + 에너지 8 + 파동 8).

-> 각 챌린지의 상세 시나리오와 변수 세팅: `docs/contents/engines/*/challenges.md` 참조

---

## 6. 적응형 규칙 엔진 상세

### 6.1 Phase 1 규칙 엔진 개요

Phase 1에서는 ML 모델 대신 **메타데이터 필터링 + 우선순위 규칙**으로 다음 챌린지를 선택한다.

**입력 데이터:**
- 사용자의 챌린지 완료 이력 (IndexedDB에서 읽기)
- 태그별 예측 정확도 (누적)
- 현재 difficulty 레벨
- 연속 정답/오답 횟수

**출력:**
- 다음 추천 챌린지 ID

### 6.2 태그별 정확도 추적

각 챌린지 완료 시 해당 챌린지의 `tags`에 대한 정확도를 업데이트한다.

```
tagAccuracy = {
  "gravity": { correct: 5, total: 8, rate: 0.625 },
  "trajectory": { correct: 7, total: 9, rate: 0.778 },
  "air-resistance": { correct: 1, total: 3, rate: 0.333 },
  ...
}
```

- 새 챌린지 완료 시 해당 태그의 correct/total을 갱신
- rate = correct / total (소수점 3자리)

### 6.3 다음 챌린지 선택 알고리즘

다음 챌린지 선택은 아래 순서로 필터링 + 우선순위를 적용한다:

**Step 1 — 후보 필터링:**
- 현재 스테이션의 미완료 챌린지만 후보로 선택
- `prerequisite`가 있는 챌린지는 선행 챌린지 완료 여부 확인

**Step 2 — Difficulty 범위 필터:**
- 기본 범위: 현재 difficulty +/- 1
- 연속 3회 정답 -> 상한을 +1 확장 (더 어려운 챌린지 포함)
- 연속 2회 오답 -> 하한을 -1 확장 (더 쉬운 챌린지 포함)
- 범위 최소값: 1, 최대값: 5

**Step 3 — 약점 보강 우선순위:**
- 후보 챌린지의 `tags`에서 사용자의 tagAccuracy.rate가 가장 낮은 태그를 가진 챌린지를 우선 배치
- 정확도 0.5 미만인 태그가 있으면 해당 태그 챌린지를 70% 확률로 선택
- 모든 태그 정확도가 0.5 이상이면 difficulty 순으로 정렬하여 다음 단계 챌린지 제시

**Step 4 — 반복감 방지:**
- 직전 챌린지와 같은 변수 세트(동일 gravity, 동일 angle 등)의 챌린지는 배제
- 같은 예측 유형이 3회 연속되면 다른 예측 유형의 챌린지를 우선 선택

**Step 5 — 최종 선택:**
- 위 필터를 통과한 후보 중 가장 높은 우선순위의 챌린지를 선택
- 후보가 없으면(모든 챌린지 완료) 스테이션 완주 처리

### 6.4 Discover 설명 깊이 선택

사용자의 해당 개념 태그 정확도에 따라 설명 깊이를 자동 선택한다:

| 조건 | 설명 깊이 | 근거 |
|------|----------|------|
| tagAccuracy.rate < 0.4 | Level 1 (직관적 비유) | 기초부터 시작 |
| 0.4 <= rate < 0.7 | Level 2 (개념 설명) | 변수 간 관계 이해 |
| rate >= 0.7 | Level 3 (수식 포함) | 정량적 이해 가능 |

사용자가 "더 알아보기"를 클릭하면 다음 레벨을 순차 공개한다 (Level 1 -> 2 -> 3).

---

## 7. HUD 상세

### 7.1 공통 HUD 요소

실험실 내 모든 단계에서 항상 표시되는 HUD 요소:

| 위치 | 요소 | 설명 |
|------|------|------|
| 좌상단 | 스테이션 탭 | [투사체] [에너지] [파동] — 클릭으로 스테이션 전환 |
| 우상단 | 설정 아이콘 | 사운드, 언어(en/ko), 테마(Light/Dark), 허브로 돌아가기 |
| 우상단 | 진도 표시 | 현재 스테이션 "3/10" 형태 |
| 좌하단 | 현재 단계 인디케이터 | PREDICT / PLAY / DISCOVER 3단계 중 현재 위치 표시 |

### 7.2 PREDICT 단계 HUD

| 위치 | 요소 | 설명 |
|------|------|------|
| 상단 중앙 | 질문 텍스트 | 챌린지의 `predict.question` 표시. 반투명 배경 패널 위 |
| 중앙~하단 | 예측 입력 영역 | trajectory: 3D 뷰포트 위 드로잉 레이어 / binary: 2개 버튼 / pattern: 3개 이미지 카드 |
| 하단 | 변수 정보 | 현재 챌린지의 핵심 변수 표시 (예: "중력: 1.6 m/s^2 (달)", "각도: 45도") |
| 우하단 | 스킵 버튼 | "건너뛰기" (작게, 시각적으로 부각하지 않음) |

### 7.3 PLAY 단계 HUD

| 위치 | 요소 | 설명 |
|------|------|------|
| 상단 중앙 | 액션 프롬프트 | "드래그해서 던져보세요!" / "발사!" 등 인터랙션 가이드 |
| 우측 | 변수 패널 | 현재 시뮬레이션 변수 실시간 표시 (속도, 높이, 에너지 등) |
| 우측 (에너지 스테이션) | 에너지 바 | 위치에너지(파랑) / 운동에너지(빨강) 실시간 바 그래프 |
| 하단 | 리플레이 버튼 | 시뮬레이션 완료 후 "다시 보기" 버튼 활성화 |

### 7.4 DISCOVER 단계 HUD

| 위치 | 요소 | 설명 |
|------|------|------|
| 상단 중앙 | 정답/오답 피드백 | 정답: 축하 텍스트 + 이펙트 / 오답: 위로 텍스트 |
| 중앙 | 개념 설명 패널 | 반투명 패널에 Level 1/2/3 설명. 탭으로 깊이 전환 |
| 중앙 (trajectory) | 궤적 비교 뷰 | 예측 궤적과 실제 궤적 오버레이, 오차 지점 하이라이트 |
| 하단 | 액션 버튼 그룹 | "다음 챌린지" (Primary CTA) / "다른 스테이션" / "허브로" |

### 7.5 HUD 반응형 규칙

| 화면 크기 | HUD 조정 |
|-----------|---------|
| PC (>= 1024px) | 전체 HUD 표시. 변수 패널은 우측 사이드 |
| 태블릿 (768-1023px) | 변수 패널을 하단 접이식으로 이동 |
| 모바일 (< 768px) | 변수 패널 접기 기본. 질문/버튼 크기 확대. 터치 타겟 최소 44px |

---

## 8. 역학 실험실 공간 테마 상세

### 8.1 비주얼 테마: "네온 실험 놀이터"

| 요소 | 상세 |
|------|------|
| **Skybox** | 어두운 남색 배경 + 미세한 그리드 패턴 (Tron 스타일). 먼 곳에 추상적인 기하학적 구조물 실루엣 |
| **바닥** | 반투명 네온 격자 바닥. 스테이션 영역에 원형 하이라이트 표시 |
| **조명** | 주 조명: 쿨 화이트 디렉셔널 라이트 (그림자 생성). 보조: 네온 블루/그린 포인트 라이트로 실험대 강조 |
| **머티리얼** | 실험 오브젝트: 세미 광택 머티리얼 (물리 시뮬레이션 가시성 우선). 환경: 메탈릭 + 이미시브 네온 라인 |
| **파티클** | 유휴 시: 미세한 부유 파티클 (먼지 같은 느낌). 시뮬레이션 중: 궤적을 따라 트레일 파티클. 완료: 결과 지점에 버스트 파티클 |
| **색상 팔레트** | Primary: 네온 블루(#00D4FF). Accent: 네온 그린(#39FF14). Warm: 네온 핑크(#FF6EC7). Background: 다크 네이비(#0A0E27) |

### 8.2 사운드

| 요소 | 상세 |
|------|------|
| **BGM** | 경쾌한 일렉트로닉/신스웨이브. 루프 재생. 템포: 100-120 BPM. 음량: 배경 수준 (대화/효과음을 방해하지 않음) |
| **앰비언트** | 미세한 전자 험(hum) + 간헐적인 데이터 비프음. 실험실 분위기 연출 |
| **효과음 — 투사체** | 던지기: "휙" 바람 소리 + 속도에 비례한 피치 변화. 착지: "탁" 충격음. 정답: 상승 아르페지오. 오답: 낮은 톤 2음 |
| **효과음 — 에너지** | 카트 출발: "드르륵" 가속음. 루프 통과: "슈웅" + 환호 소리. 충돌: 탄성에 따라 "딱!"(탄성) vs "퍽"(비탄성). 진자: 주기적 "쉬이익" |
| **효과음 — 파동** | 파원 생성: "뚝" 물방울음. 간섭: 보강 지점에서 밝은 톤, 상쇄 지점에서 무음 영역. 도플러: 실시간 피치 변화 (다가옴 -> 높은 톤, 멀어짐 -> 낮은 톤) |
| **UI 효과음** | 버튼 클릭: 가벼운 "틱". 스테이션 전환: 짧은 트랜지션 사운드. 스킵: 없음 (청각적 보상 제거) |

### 8.3 전환 연출

| 전환 | 소요 시간 | 연출 |
|------|----------|------|
| 허브 -> 실험실 진입 | 1.5초 | 화면 디졸브 -> 네온 격자 바닥 페이드인 -> 카메라가 스테이션으로 하강 |
| 스테이션 간 이동 | 0.5초 | 카메라 수평 이동 + 실험대 오브젝트 크로스페이드 |
| 챌린지 성공 리워드 | 1초 | 결과 지점에서 네온 파티클 버스트 + 화면 가장자리 글로우 + 사운드 |
| 스테이션 완주 리워드 | 2초 | 대형 파티클 폭발 + 바닥 격자 전체 라이트업 + 축하 사운드 시퀀스 |
| 실험실 -> 허브 복귀 | 0.5초 | 카메라 상승 -> 화면 디졸브 -> 허브 2D 전환 |

### 8.4 Light/Dark 테마 적응

| 요소 | Dark (기본) | Light |
|------|-----------|-------|
| Skybox | 다크 네이비(#0A0E27) | 밝은 그레이(#F0F2F5) |
| 네온 라인 | 발광 (이미시브) | 채도 낮춘 실선 |
| HUD 배경 | 반투명 검정 (rgba 0,0,0,0.7) | 반투명 백색 (rgba 255,255,255,0.85) |
| HUD 텍스트 | 백색 | 검정 |
| 파티클 | 밝은 네온 컬러 | 채도 낮춘 파스텔 컬러 |

---

## 9. 로컬 저장 스키마 (IndexedDB)

### 9.1 DB 구조

Phase 1에서는 계정 없이 IndexedDB에 모든 사용자 데이터를 로컬 저장한다.

**DB Name:** `physplay-local`
**Version:** 1

### 9.2 Object Stores

#### `user_profile`

사용자 기본 정보. 단일 레코드.

```typescript
interface UserProfile {
  id: string;                    // crypto.randomUUID()로 생성
  createdAt: string;             // ISO 8601
  lastActiveAt: string;          // ISO 8601
  locale: "en" | "ko";
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  soundVolume: number;           // 0~1
  onboardingCompleted: boolean;
}
```

#### `challenge_results`

챌린지 완료 이력. 키: `{challengeId}_{timestamp}`.

```typescript
interface ChallengeResult {
  id: string;                    // auto-generated
  challengeId: string;           // 챌린지 JSON의 id
  engineId: string;
  stationId: string;
  timestamp: string;             // ISO 8601
  predictType: "trajectory" | "binary" | "pattern";
  predictValue: unknown;         // 사용자 예측값 (궤적 좌표 배열, 선택지 인덱스 등)
  wasCorrect: boolean;
  accuracy: number | null;       // trajectory 유형: 오차율 (0~1). binary/pattern: null
  playDurationMs: number;        // PLAY 단계 소요 시간
  discoverDepthViewed: number;   // 확인한 최대 설명 깊이 (1, 2, 3)
  difficulty: number;
}
```

#### `tag_accuracy`

태그별 정확도 누적. 키: tag 이름.

```typescript
interface TagAccuracy {
  tag: string;
  correct: number;
  total: number;
  rate: number;                  // correct / total
  lastUpdated: string;           // ISO 8601
}
```

#### `station_progress`

스테이션별 진행 상황. 키: stationId.

```typescript
interface StationProgress {
  stationId: string;
  spaceId: string;
  completedChallenges: string[]; // 완료한 challengeId 배열
  totalChallenges: number;
  currentDifficulty: number;     // 현재 difficulty 레벨
  consecutiveCorrect: number;    // 연속 정답 수
  consecutiveWrong: number;      // 연속 오답 수
  isCompleted: boolean;
  completedAt: string | null;    // ISO 8601
}
```

#### `session_meta`

세션 메타데이터. 키: sessionId.

```typescript
interface SessionMeta {
  sessionId: string;
  startedAt: string;             // ISO 8601
  deviceType: "pc" | "mobile";
  referrer: string | null;
}
```

### 9.3 용량 관리

- IndexedDB 할당량: 브라우저별로 다르나, 일반적으로 디스크 공간의 50% 이하
- Phase 1 예상 데이터: 사용자당 최대 수백 KB (26개 챌린지 x 반복 시도 포함)
- 용량 초과 시: 가장 오래된 session_meta 레코드부터 삭제 (challenge_results, tag_accuracy는 보존)

### 9.4 데이터 이전 대비

Phase 3에서 계정 시스템 도입 시 로컬 데이터를 서버로 이전해야 한다:
- `user_profile.id`를 임시 식별자로 사용
- 모든 레코드에 타임스탬프가 있으므로 충돌 해결 가능
- 이전 시 사용자 동의 플로우 필요 (Phase 3 PRD에서 정의)

---

## 10. 랜딩 페이지 요구사항

### 10.1 목적

Phase 1 랜딩 페이지는 두 가지 목적을 동시에 달성한다:
1. **B2C:** 사용자를 실험실로 즉시 유도
2. **B2B:** 교사/교육자 이메일 수집

### 10.2 랜딩 페이지 구성

랜딩 페이지는 2D 페이지(`site/`)로 구현한다.

| 섹션 | 내용 | 우선순위 |
|------|------|---------|
| Hero | "예측하고, 실험하고, 발견하라" 타이틀 + 3D 시뮬레이션 미리보기 GIF/영상 (자동 재생, 무음) + "지금 시작하기" CTA (실험실 직행) | P0 |
| Core Loop 소개 | Predict -> Play -> Discover 3단계를 시각적으로 설명. 각 단계 스크린샷/GIF | P0 |
| 스테이션 소개 | 투사체/에너지/파동 3개 스테이션의 대표 챌린지 미리보기 | P1 |
| 교사용 CTA | "교실에서 PhysPlay를 사용해보세요" + 이메일 입력 폼 + "교사 얼리액세스 신청" 버튼 | P0 |
| FAQ | "PhysPlay란?", "무료인가요?", "어떤 디바이스에서?", "교사로서 어떻게?" | P1 |
| Footer | 언어 전환(en/ko), 개인정보 처리 방침 링크, 문의 이메일 | P0 |

### 10.3 교사 이메일 수집

- 이메일 입력 + 선택 항목: 학교명, 과목, 학년
- 제출 시 로컬에 저장 (Phase 1은 서버 없음) + 외부 폼 서비스(예: Google Forms 또는 Tally) 연동으로 수집
- 제출 확인 메시지: "감사합니다! 교사용 기능이 준비되면 가장 먼저 알려드리겠습니다."
- 이벤트 기록: `teacher_email_submit`

### 10.4 SEO 기본

- 각 랜딩 페이지 언어별(en/ko) 메타 태그 (title, description, og:image)
- JSON-LD 구조화 데이터 (EducationalApplication 타입)
- sitemap.xml 생성

---

## 11. Phase 1 이벤트 트래킹

PRD SS10의 이벤트 중 Phase 1에 해당하는 이벤트와 Phase 1 추가 이벤트.

### 11.1 Phase 1 활성 이벤트

| 이벤트 | 설명 | Properties | Phase 1 비고 |
|--------|------|-----------|-------------|
| `session_start` | 세션 시작 | device_type (pc/mobile), referrer | xr 타입 제외 |
| `onboarding_start` | 온보딩 진입 | - | Phase 1 추가 |
| `onboarding_complete` | 첫 챌린지 완료 | duration_ms, was_correct | - |
| `hub_view` | 허브 화면 조회 | unlocked_spaces, total_progress | Phase 1 추가 |
| `station_enter` | 스테이션 진입 | station_id, space_id | space_id = "mechanics-lab" 고정 |
| `predict_submit` | 예측 제출 | station_id, challenge_id, predict_type, predict_value | - |
| `predict_skip` | 예측 스킵 | station_id, challenge_id | - |
| `play_start` | 실험 시작 | station_id, challenge_id | - |
| `play_complete` | 실험 완료 | station_id, challenge_id, duration_ms | - |
| `discover_view` | 발견 화면 진입 | station_id, challenge_id, was_correct | - |
| `discover_detail_open` | 상세 설명 열기 | station_id, challenge_id, detail_level (1/2/3) | detail_type -> detail_level로 세분화 |
| `challenge_complete` | 챌린지 완료 | station_id, challenge_id, was_correct, attempt_count | - |
| `station_complete` | 스테이션 완주 | station_id, space_id, total_challenges, correct_count | - |
| `station_navigate` | 스테이션 간 이동 | from_station_id, to_station_id | - |
| `teacher_email_submit` | 교사 이메일 제출 | has_school_name, has_subject | Phase 1 추가 |
| `settings_change` | 설정 변경 | setting_key, old_value, new_value | Phase 1 추가 (언어/테마/사운드) |

### 11.2 Phase 1에서 비활성인 이벤트

| 이벤트 | 비활성 사유 |
|--------|-----------|
| `space_unlock` | Phase 1에서 역학 실험실만 해금됨. Phase 2+에서 활성화 |
| `xr_mode_enter` | Phase 1에서 XR 모드 없음 |

### 11.3 수집 방식

- Phase 1은 서버가 없으므로, 클라이언트 사이드 이벤트 수집
- 선택지 1: 외부 분석 서비스 (Plausible, Umami 등 프라이버시 친화적 서비스)
- 선택지 2: IndexedDB에 이벤트 로그 저장 + 추후 배치 전송
- 이벤트 스키마는 공통 포맷을 따른다: `{ event, properties, timestamp, sessionId }`

---

## 12. Phase 1 성공 지표 & 검증 방법

### 12.1 핵심 지표

-> Product Brief SS4의 성공 지표에서 Phase 1 타깃을 정의한다.

| 목표 | 지표 | Phase 1 타깃 | Full Product 타깃 | 측정 이벤트 | Counter-metric |
|------|------|-------------|------------------|-----------|----------------|
| 트래픽 확보 | 월간 UV | 10,000 | - | session_start | - |
| 코어 루프 작동 | 예측 참여율 | 70% | 70% | predict_submit / (predict_submit + predict_skip) | 예측 스킵율 < 30% |
| 학습 몰입 | 스테이션 완주율 | 40% | 40% | station_complete / station_enter | 세션 체류 시간 >= 5분 (강제 지속이 아닌 자발적 몰입) |
| 학습 효과 | 예측 정확도 향상률 | 20% | 20% | challenge_complete 시계열 (was_correct) | - |
| 탐험 동기 | 스테이션 간 이동률 | 30% | 30% | station_navigate (2개 이상 방문 사용자 비율) | - |
| B2B 관심 | 교사 이메일 수집 | 50명 | - | teacher_email_submit | - |
| 온보딩 효과 | 첫 챌린지 완료율 | 60% | - | onboarding_complete / session_start (첫 방문자) | - |
| 재방문 | 7일 재방문율 | 15% | - | session_start (재방문 세션) | - |

### 12.2 분석 뷰

| 뷰 | 목적 | 구성 이벤트 |
|----|------|-----------|
| 온보딩 퍼널 | 첫 방문 -> 첫 예측 -> 첫 실험 -> 첫 발견 -> 허브 진입 단계별 이탈률 | session_start -> onboarding_start -> predict_submit -> play_complete -> discover_view -> hub_view |
| 코어 루프 퍼널 | Predict -> Play -> Discover 단계별 이탈률 (온보딩 이후) | predict_submit -> play_start -> play_complete -> discover_view |
| 스테이션별 학습 효과 | 각 스테이션 내 예측 정확도 시계열 | challenge_complete (station_id별 was_correct 시계열) |
| 챌린지별 난이도 적정성 | 챌린지별 정답률 분포 | challenge_complete (challenge_id별 was_correct 비율) |
| 탐험 패턴 | 스테이션 간 이동 흐름 (산키 다이어그램) | station_navigate |
| Discover 깊이 | 사용자가 어느 깊이까지 개념 설명을 확인하는지 | discover_detail_open (detail_level 분포) |

### 12.3 검증 방법

| 검증 항목 | 방법 | 타이밍 |
|----------|------|--------|
| 코어 루프 가설 | 정량: 위 지표 측정. 정성: 사용자 5명 인터뷰 (코어 루프 경험 피드백) | 출시 후 2주 |
| 교사 시장 관심 | 이메일 수집 수 + 교사 5명 심층 인터뷰 | 출시 후 4주 |
| 엔진 기반 챌린지 효과 | 챌린지별 정답률 분석 + 완주율 + 정성 피드백 ("같은 느낌" 여부) | 출시 후 2주 |
| 기술 성능 | FPS 모니터링 (PC/모바일 분리), 로딩 시간 측정 | 출시 즉시 |

---

## 13. Phase 1 구현 마일스톤

### 13.1 타임라인

전체 기간: 약 10-12주 (Discovery 포함)

| 마일스톤 | 기간 | 주요 산출물 |
|----------|------|-----------|
| **Discovery** | 2-3주 | 투사체 엔진 프로토타입, God Hand 인터랙션 프로토타입, 코어 루프(Predict->Play->Discover) 1회 순환 동작, WebGPU/WebGL 렌더링 파이프라인 검증, 교사 5명 인터뷰 |
| **Alpha** | 3-4주 | 투사체 스테이션 전체 챌린지(10개), 에너지 엔진 + 에너지 스테이션(8개 챌린지), 적응형 규칙 엔진 v1, HUD 시스템, IndexedDB 로컬 저장, 챌린지 JSON 파이프라인 |
| **Beta** | 3-4주 | 파동 엔진 + 파동 스테이션(8개 챌린지), 역학 실험실 공간 테마(비주얼, 사운드, 전환 연출), 연구소 허브(2D), 온보딩 플로우, i18n(en/ko), Light/Dark 테마, 반응형 모바일 레이아웃 |
| **Launch Prep** | 1-2주 | 랜딩 페이지 + 교사 이메일 수집, 이벤트 트래킹 연동, 성능 최적화 (60fps PC / 30fps 모바일), 브라우저 호환성 테스트 (Chrome/Safari/Firefox), SEO 기본, 배포 |

### 13.2 Discovery 완료 조건

Discovery 마일스톤은 다음 조건을 모두 충족해야 Alpha로 진행:

1. 투사체 엔진에서 "지구 기본 던지기" 챌린지가 동작한다 (물리 시뮬레이션 + 3D 렌더링)
2. God Hand 던지기(클릭 드래그)가 자연스럽게 동작한다
3. 궤적 그리기(trajectory) 예측 입력이 동작한다
4. 예측 궤적과 실제 궤적의 오버레이 비교가 동작한다
5. Discover 설명이 HUD에 표시된다
6. WebGPU에서 60fps, WebGL fallback에서 30fps 이상 확인
7. 교사 5명 인터뷰 완료 — "게임 같은 과학 수업"에 대한 긍정/부정 피드백 정리

### 13.3 Alpha 완료 조건

1. 투사체 스테이션 10개 챌린지 전체 플레이 가능
2. 에너지 스테이션 8개 챌린지 전체 플레이 가능
3. 3가지 예측 유형(trajectory, binary, pattern) 모두 동작
4. 적응형 규칙 엔진이 태그별 정확도 기반으로 다음 챌린지를 선택
5. IndexedDB에 챌린지 결과, 태그 정확도, 스테이션 진도가 저장/조회됨

### 13.4 Beta 완료 조건

1. 파동 스테이션 8개 챌린지 전체 플레이 가능
2. 26개 전체 챌린지를 연속으로 플레이할 수 있음
3. 역학 실험실 공간 테마(비주얼, 사운드, 전환 연출) 적용 완료
4. 온보딩 플로우가 30초 이내 첫 루프를 완료시킴
5. 연구소 허브에서 스테이션 선택 -> 실험실 진입 -> 플레이 -> 허브 복귀 전체 플로우 동작
6. i18n(en/ko) 전체 텍스트 번역 완료
7. 모바일 브라우저에서 터치 인터랙션 동작 확인

---

## 14. Phase 1에서 명시적으로 제외하는 것

| 항목 | 사유 | 예정 Phase |
|------|------|-----------|
| 계정/로그인 시스템 | 진입 장벽 제거, 로컬 저장으로 대체 | Phase 3 |
| XR 모드 | 아키텍처만 대비 (God Hand 멘탈 모델 + 동일 코드베이스) | Phase 2+ |
| ML 기반 적응형 AI | 규칙 기반 로직으로 대체, Phase 1 데이터 축적 후 전환 | Phase 2 |
| 교사 대시보드 | 이메일 수집으로 관심도만 측정 | Phase 3 |
| UGC (챌린지 제작/공유) | JSON 데이터 구조만 설계, 에디터는 미구현 | Phase 3 |
| 추가 공간 (분자/우주/양자) | 역학 실험실에서 핵심 가설 검증 후 확장 | Phase 3-5 |
| 크로스 엔진 추천 | 역학 실험실 내 3개 엔진만 존재, 엔진 간 개념 연결은 Phase 3+ | Phase 3+ |
| 포인트/배지/리더보드 | 핵심 동기는 인지적 갈등, 외적 보상은 후순위 | Phase 2+ |
| 멀티플레이어/소셜 | 1인 체험에 집중 | Phase 4+ |
| 오프라인 모드 완전 지원 | 오프라인 시뮬레이션은 가능하나, Service Worker 캐싱은 P2 | Phase 2 |

---

## 15. Phase 1 리스크

| 리스크 | 영향 | 확률 | 완화 전략 |
|--------|------|------|----------|
| 궤적 그리기 UX가 직관적이지 않아 사용자가 예측 단계에서 이탈 | High | Medium | Discovery에서 프로토타입 사용자 테스트 3명. 스킵 옵션 제공하되 참여 유도. 힌트 가이드 추가 |
| 브라우저 물리 시뮬레이션이 모바일에서 30fps 미달 | High | Medium | Discovery에서 모바일 성능 벤치마크. LOD(Level of Detail) + 파티클 감소 등 성능 폴백 |
| 26개 챌린지가 "같은 것을 반복하는 느낌" 제공 | Medium | Medium | 챌린지 간 변수 전환 규칙 적용 (SS6.3 Step 4). 정성 테스트에서 확인 |
| IndexedDB 데이터 유실 (브라우저 캐시 클리어 등) | Medium | High | 명시적 경고 UI ("브라우저 데이터를 지우면 진도가 초기화됩니다"). Phase 3에서 서버 동기화로 해결 |
| 온보딩에서 3D 로딩이 3초를 초과 | Medium | Medium | 에셋 경량화, 코드 스플리팅, WebGPU/WebGL 선택적 파이프라인. 로딩 중 인터랙티브 프로그레스 표시 |
| 교사 이메일 수집이 50명 미달 | Low | Medium | 교사 커뮤니티(인디스쿨 등) 직접 공유 + Product Hunt 출시 + SNS 노출 |

---

## Appendix

- [Full PRD](./prd.md) — 전체 제품 비전
- [Product Brief](./product-brief.md) — 전략적 문제 정의와 방향
- [Client Structure](./client-structure.md) — 프론트엔드 코드 구조
- [Engine Contents](./contents/engines/README.md) — 엔진별 콘텐츠 구조
- [투사체 엔진 챌린지](./contents/engines/projectile/challenges.md)
- [충돌/에너지 엔진 챌린지](./contents/engines/collision-energy/challenges.md)
- [파동 엔진 챌린지](./contents/engines/wave/challenges.md)
