# PhysPlay -- Phase 1 PRD

**Status:** Draft
**Author:** --
**Last Updated:** 2026-03-04
**Full PRD:** [prd.md](./prd.md)

---

## 1. Phase Goal

역학 실험실 안에 3개 스테이션(투사체, 에너지, 파동)이 "예측 -> 실험 -> 발견" 코어 루프 + God Hand 인터랙션 + 엔진 기반 챌린지 생성으로 동작함을 증명하고, 코어 루프가 능동적 참여와 완주를 유도하는지 검증한다.

---

## 2. Scoping Rationale

- **최소 가치 증명:** 엔진 3개(투사체, 충돌/에너지, 파동)가 역학 실험실 하나에서 동작하면 코어 루프, God Hand, 엔진 기반 챌린지 생성의 세 가지 핵심 베팅을 동시에 검증할 수 있다
- **기술 기반 확보:** Phase 1에서 검증하는 엔진 아키텍처, 코어 루프 프레임워크, 적응형 분기 규칙 엔진은 모든 후속 Phase의 기술 기반이 된다
- **외부 의존 없음:** 역학 실험실은 외부 API(NASA, PDB) 없이 순수 물리 엔진만으로 구동 가능하여 빠른 출시가 가능하다
- **Phase 2 학습:** Phase 1의 예측 참여율, 완주율, 이탈 지점 데이터가 세로 확장(Phase 2)과 가로 확장(Phase 3) 방향의 우선순위를 결정한다

---

## 3. Phase Requirements

| Priority | REQ-ID | Requirement | Rationale |
|----------|--------|-------------|-----------|
| P0 | REQ-001 | 챌린지 진입 시 예측 참여 (trajectory, binary, pattern, placement) | 코어 루프의 첫 단계. 없으면 제품이 존재할 수 없다 |
| P0 | REQ-002 | God Hand로 3D 시뮬레이션에서 직접 실험 수행 | 코어 루프의 두 번째 단계 |
| P0 | REQ-003 | 예측 vs 결과 시각적 비교 + 개념 설명 (Discover) | 코어 루프의 세 번째 단계 |
| P0 | REQ-005 | 챌린지 완료 후 다음 챌린지 제시 | 코어 루프 반복을 위한 필수 요소 |
| P0 | REQ-006~009 | 4가지 예측 유형 (trajectory, binary, pattern, placement) | 챌린지 다양성 확보에 필수 |
| P0 | REQ-010~012 | God Hand 인터랙션 -- PC 마우스/키보드 (Primary) | PC가 Phase 1 주요 플랫폼 |
| P0 | REQ-015 | 풀스크린 3D + HUD 오버레이 | 코어 경험의 화면 구성 |
| P0 | REQ-016 | 연구소 허브 2D 페이지 | 공간/스테이션 선택을 위한 진입점 |
| P0 | REQ-017 | 시뮬레이션 엔진 -- 실시간 물리 계산 + 3D 렌더링 | 엔진 없이는 시뮬레이션이 불가 |
| P0 | REQ-018 | 챌린지를 JSON 데이터로 정의 | 엔진 기반 확장 구조의 기초 |
| P0 | REQ-022 | 투사체 엔진 (10개 챌린지) | Phase 1 첫 번째 스테이션 |
| P0 | REQ-023 | 충돌/에너지 엔진 (8개 챌린지) | Phase 1 두 번째 스테이션 |
| P0 | REQ-024 | 파동 엔진 (8개 챌린지) | Phase 1 세 번째 스테이션 |
| P0 | REQ-029 | 역학 실험실 공간 테마 (Skybox, 조명, 사운드, 전환 연출) | 게임 스테이지 경험의 핵심 |
| P0 | REQ-032 | 메타데이터 기반 규칙 엔진으로 적응형 챌린지 선택 | Phase 1은 규칙 기반 |
| P0 | REQ-036 | 첫 방문 온보딩 -- 30초 안에 코어 루프 한 바퀴 | 진입 장벽 제거 |
| P0 | REQ-048~051 | 코어 루프 퍼널, 예측 참여율, 학습 효과, 탐험 패턴 트래킹 | 검증 데이터 수집 필수 |
| P0 | REQ-052~054 | 성능: PC 60fps, 모바일 30fps, 로딩 3초 이내 | 기본 사용성 보장 |
| P0 | REQ-056 | en, ko 다국어 지원 | 한국/글로벌 동시 타깃 |
| P0 | REQ-060 | 로컬 저장(IndexedDB), 오프라인 시뮬레이션 | Phase 1은 계정 없음 |
| P0 | REQ-061 | Chrome, Safari, Firefox 최신 2버전 + WebGPU/WebGL fallback | 브라우저 접근성 |
| P0 | REQ-062 | 사용자 데이터 최소 수집, 계정 없음 | Phase 1 보안 기본 원칙 |
| P1 | REQ-004 | Discover 설명 3단계 깊이 (Level 1/2/3) | 높은 가치이나, Phase 1은 Level 1+2로도 출시 가능 |
| P1 | REQ-013 | 모바일 터치 제스처 매핑 | PC 퍼스트이나, 모바일 접근이 없으면 사용자 실망 |
| P1 | REQ-020 | concept-level Discover 콘텐츠 라이브러리 | 구조화 없이도 챌린지별 설명으로 동작 가능하나, 확장성에 중요 |
| P1 | REQ-030 | 실험실 해금 연출 + 리워드 이펙트 | 게임적 몰입에 중요하나, 없어도 코어 루프는 동작 |
| P1 | REQ-033~034 | 난이도 조절 + 약점 보강 | Phase 1 규칙 엔진의 정교함 수준 |
| P1 | REQ-037 | 첫 챌린지 후 연구소 허브 + 공간 맵 (해금/잠김 표시) | 탐험 동기에 중요 |
| P1 | REQ-039~041 | Visual design direction (Soft-Tech + Portal + Semi-Stylized) | 첫인상에 중요하나, 최소 버전으로도 출시 가능 |
| P1 | REQ-057 | 반응형 레이아웃 | 모바일 지원 |
| P1 | REQ-058 | Light/Dark 테마 | 사용자 편의 |
| P2 | REQ-014 | XR 핸드 트래킹 매핑 | Phase 1은 3D 웹, XR은 Phase 2+ |
| P2 | REQ-019 | 챌린지 데이터에 predict.type 포함 (UGC 대비) | UGC는 Phase 3 |
| P2 | REQ-021 | 런타임 Discover 프레이밍 조합 | Phase 1은 사전 작성 설명으로 동작 가능 |
| P2 | REQ-028 | 크로스 엔진 추천 | Phase 1은 역학 실험실만, 크로스 엔진은 Phase 3+ |
| P2 | REQ-035 | AI 기반 Discover 설명 깊이 자동 선택 | Phase 1은 수동/규칙 기반으로 충분 |
| P2 | REQ-055 | 물리 시뮬레이션 교육적 정확성 검증 | 초기에는 합리적 수준으로 시작 |
| P2 | REQ-059 | 키보드 내비게이션, 스크린 리더, 색약 대응 | 중요하나 Phase 1 출시 필수는 아님 |

### Phase 1 Station Details

**투사체 스테이션**
- 엔진: 투사체 엔진 -- 10개 챌린지
- 예측 유형: trajectory 70%, placement 20%, pattern 10%
- God Hand 패턴: 던지기/발사, 배치, 경로 설계
- 챌린지 시나리오 상세: [projectile/challenges.md](./contents/engines/projectile/challenges.md)
- 개념/변수: [projectile/concepts.md](./contents/engines/projectile/concepts.md)

**에너지 스테이션**
- 엔진: 충돌/에너지 엔진 -- 8개 챌린지
- 예측 유형: binary ~40%, pattern ~40%, placement ~10%
- God Hand 패턴: 조립/빌딩, 던지기, 당기기
- 챌린지 시나리오 상세: [collision-energy/challenges.md](./contents/engines/collision-energy/challenges.md)
- 개념/변수: [collision-energy/concepts.md](./contents/engines/collision-energy/concepts.md)

**파동 스테이션**
- 엔진: 파동 엔진 -- 8개 챌린지
- 예측 유형: placement 50%, pattern 37.5%, binary 12.5%
- God Hand 패턴: 배치/설치, 공간 이동, 당기기
- 챌린지 시나리오 상세: [wave/challenges.md](./contents/engines/wave/challenges.md)
- 개념/변수: [wave/concepts.md](./contents/engines/wave/concepts.md)

---

## 4. What This Phase Explicitly Defers

| REQ-ID | Requirement | Why Deferred |
|--------|-------------|--------------|
| REQ-025~027 | 분자/궤도/양자 엔진 | Phase 3, 4, 5에서 각각 구현. Phase 1에서 엔진 아키텍처를 검증한 후 확장 |
| REQ-014 | XR 핸드 트래킹 | XR 대응 아키텍처는 확보하되, 실제 XR 구현은 Phase 2+ |
| REQ-028 | 크로스 엔진 추천 | Phase 1은 역학 실험실만. 크로스 엔진은 공간이 2개 이상일 때 의미 |
| REQ-044~046 | UGC (챌린지/스테이션/공간 제작) | Phase 3+. JSON 데이터 구조(REQ-018)로 기반을 마련하되, 에디터 UI는 나중 |
| REQ-059 | 접근성 (키보드 내비, 스크린 리더, 색약) | Phase 2에서 사용자 피드백과 함께 구현. 3D 뷰포트 접근성은 별도 연구 필요 |
| 계정/진도 시스템 | Phase 1은 로컬 저장. 계정과 서버 동기화는 Phase 3 |

---

## 5. Phase User Journeys

### Journey: First Visit (Phase 1 Scope)

1. 사용자가 URL을 연다 -> 회원가입 없이 바로 역학 실험실 "공 던지기" 챌린지로 진입
2. **[Predict]** "이 공을 던지면 어디에 떨어질까?" -- 궤적을 그린다
   - 스킵 가능하지만 가벼운 유도 메시지로 참여 유도
3. **[Play]** 마우스 클릭 드래그(God Hand)로 공을 던진다
4. **[Discover]** 예측 궤적 vs 실제 궤적 겹쳐 표시
   - 틀렸다면 -> Level 1 직관적 비유 + 변수 조절 유도
   - 맞았다면 -> 축하 + 더 어려운 변수(다른 중력 환경 등)
5. 챌린지 완료 -> 규칙 엔진이 메타데이터 기반으로 다음 챌린지 제시
6. 첫 챌린지 완료 후 연구소 허브(2D) 등장
7. 역학 실험실 내 3개 스테이션(투사체/에너지/파동) 표시
   - *Full vision과의 차이: Phase 1에서는 역학 실험실만 해금. 다른 공간은 실루엣으로 표시*

### Journey: Returning User (Phase 1 Scope)

1. 연구소 허브(2D) 진입
2. 역학 실험실 선택 -> 전환 연출과 함께 3D 실험실 진입
3. HUD에서 스테이션 선택 (이전 진도 이어서)
4. 코어 루프 반복 (Predict -> Play -> Discover)
5. 적응형 규칙 엔진: difficulty 조정 + 약점 태그 우선 배치
6. 스테이션 완주 시 다른 스테이션 시도 유도
   - *Full vision과의 차이: Phase 1에서는 공간 해금이 아닌 스테이션 간 이동만. 진도는 IndexedDB에 로컬 저장*

---

## 6. Phase Success Criteria

| Goal | Metric | Phase 1 Target | Full Product Target |
|------|--------|---------------|---------------------|
| 코어 루프가 능동적 참여를 유도한다 | 예측 참여율 | 70% | 70% |
| 자기강화 루프가 완주를 이끈다 | 스테이션 완주율 | 40% | 40% |
| 무료 웹 접근으로 트래픽 확보 | 월간 방문자 (UV) | 10,000 (첫 달) | -- |
| 온보딩이 즉시 코어 루프를 전달한다 | 첫 챌린지 30초 내 완료 비율 | 60% | -- |
| 엔진 기반 구조가 챌린지 다양성을 확보한다 | 3개 엔진에서 총 26개 이상 챌린지 제공 | 26개 | -- |

---

## 7. Phase Timeline & Milestones

| Milestone | Target | Description |
|-----------|--------|-------------|
| Discovery complete | +2-3주 | 투사체 엔진 프로토타입 + God Hand + 코어 루프 통합 검증. 60fps 확인 |
| Engine alpha | +4-6주 | 3개 엔진(투사체, 충돌/에너지, 파동) 기본 동작 |
| Core loop beta | +6-8주 | Predict -> Play -> Discover 전체 플로우 동작 + 규칙 기반 적응형 분기 |
| Content complete | +8-10주 | 26개 챌린지 + 역학 실험실 공간 테마 + Discover 콘텐츠 |
| Launch | +10-12주 | 랜딩 + i18n + 트래킹 + 공개 출시 |

---

## 8. Phase Risks

| Risk | Severity | Likelihood | Mitigation |
|------|----------|------------|------------|
| 브라우저에서 3개 엔진 동시 구동 시 60fps 미달 | High | Medium | Discovery에서 가장 무거운 파동 엔진까지 60fps 확인. 엔진별 독립 로딩으로 동시 구동 불필요 |
| 26개 챌린지의 교육적 품질이 고르지 않다 | Medium | High | 엔진별 핵심 챌린지 5개씩 먼저 완성, 나머지는 변수 조합으로 생성 |
| 첫 30초 온보딩에서 예측 단계가 부담스러워 이탈 | High | Medium | 첫 챌린지의 예측을 극도로 직관적으로 설계 (궤적 그리기, 정답 범위 넓게). 스킵 허용 |
| 규칙 기반 적응형 분기가 너무 단순하여 반복감 발생 | Medium | Medium | 변수 전환 규칙 + 최소 연속 동일 유형 방지 로직 구현 |
| 1인 개발로 12주 일정 달성 불가 | High | Medium | P0만으로 최소 출시 가능하도록 스코프 관리. P1 항목은 출시 후 빠르게 추가 |
