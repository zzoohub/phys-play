# 파동 엔진 — 핵심 개념 v2

> 소스: 1-3. 파동 + 1-4. 소리와 빛 + 3-4. 빛과 스펙트럼 + 3D/XR 필수 확장

## 개념 목록

| 개념 | 챌린지 연결 | 3D/XR 관점 |
|------|-----------|-----------|
| 정상파 (노드와 배) | #1 소리의 방, #8 악기 물리학 | 3D 공간에서 노드/배의 위치를 걸어다니며 탐색 |
| 보강/상쇄 간섭 | #1 소리의 방, #2 노이즈 캔슬링 | 3D 간섭 패턴 안에서 이동하며 세기 변화 체감 |
| 공명 (resonance) | #4 와인잔 깨기 | 3D 변형 모드(타원→파괴)를 슬로모션으로 관찰 |
| 종파와 횡파 | #5 지구 내부 지진파 | P파(종파)와 S파(횡파)의 3D 전파 차이 |
| 도플러 효과 | #6 3D 도플러 비행 | 3D 경로에서의 복잡한 도플러 패턴 |
| 마하 콘과 충격파 | #3 소닉 붐 | 마하 콘은 본질적으로 3D 원뿔 |
| 반사와 초점 | #7 속삭임의 방 | 3D 타원체의 반사 기하학 |
| 진동 모드 (고조파) | #8 악기 물리학 | 3D 표면의 진동 모드 시각화 |
| 상쇄 간섭의 응용 | #2 노이즈 캔슬링 | 3D 공간에서 안티 소스 배치 최적화 |
| 파동의 매질 의존성 | #5 지구 내부 지진파 | 매질(고체/액체)에 따른 파동 전파 차이 |
| 배음과 음색 | #8 악기 물리학 | 타격점→활성 모드→배음→음색의 연쇄 |
| 건축 음향학 | #1 소리의 방, #7 속삭임의 방 | 3D 공간 형태가 소리 경험을 결정 |

## 엔진 변수

| 변수 | 타입 | 기본값 | 범위 | 설명 |
|------|------|--------|------|------|
| `waveType` | enum | transverse | transverse/longitudinal | 파동 유형 |
| `frequency` | float | 440 | 1~10000 | 진동수 (Hz) |
| `amplitude` | float | 1.0 | 0.1~10 | 진폭 |
| `wavelength` | float | — | auto | 파장 (v/f로 자동 계산) |
| `sources` | int | 1 | 1~5 | 파원 수 |
| `phaseDiff` | float | 0 | 0~2π | 파원 간 위상차 |
| `slitWidth` | float | 1.0 | 0.1~10 | 슬릿 폭 (λ 단위) |
| `sourceSpeed` | float | 0 | -1000~1000 | 음원 이동 속도 (m/s) |
| `starTemp` | float | 5778 | 2000~30000 | 별 표면 온도 (K) |
| `roomDimensions` | vec3 | [6,4,3] | 1~50 (m) | 방 크기 — **v2 추가** |
| `wallMaterial` | enum | concrete | concrete/wood/glass/foam | 벽 재질 — **v2 추가** |
| `antiSources` | array | [] | - | 안티 스피커 [{position, frequency, phase}] — **v2 추가** |
| `objectSpeed` | float | 0 | 0~1000 | 이동 물체 속도 (m/s) — **v2 추가** |
| `mediumSpeed` | float | 343 | 100~10000 | 매질 내 파동 속도 (m/s) — **v2 추가** |
| `resonantObject` | object | null | - | 공명 대상 {type, naturalFreq, damping} — **v2 추가** |
| `earthLayers` | array | [] | - | 지구 내부 구조 [{type, density, radius}] — **v2 추가** |
| `sourcePath3D` | array | [] | - | 음원 3D 비행 경로 [vec3] — **v2 추가** |
| `roomShape` | enum | rectangular | rectangular/elliptical/circular | 방 형태 — **v2 추가** |
| `instrumentType` | enum | drum | drum/guitar/bell/cymbal | 악기 종류 — **v2 추가** |
| `strikePoint` | vec3 | [0,0,0] | - | 악기 타격 위치 — **v2 추가** |
