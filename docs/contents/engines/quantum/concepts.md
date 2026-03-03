# 양자 엔진 — 핵심 개념 v2

> 소스: 4-1~4-6 전체 (Track 4 완전 매핑)
> v2: 3D/XR 관점 추가, 엔진 변수 확장

## 개념 목록

| 개념 | 챌린지 연결 | 3D/XR 관점 |
|------|-----------|-----------|
| 파동-입자 이중성 | #1 이중슬릿: 파동, #2 관측자 효과 | 3D 확률파의 전파와 간섭을 공간에서 관찰 |
| 측정과 파동함수 붕괴 | #2 관측자 효과, #7 슈뢰딩거의 고양이 | 검출기 설치/제거에 따른 결과 변화를 3D로 체험 |
| 양자 터널링 | #3 터널링 런 | 3D 에너지 장벽과 파동함수의 지수적 감쇠를 시각화 |
| 양자수와 오비탈 형태 | #4 오비탈 정원 | s/p/d/f 오비탈의 3D 확률밀도와 노드면 |
| 불확정성 원리 | #5 불확정성 게임 | 3D 파속의 위치/운동량 분포를 동시 시각화 |
| 양자 얽힘 | #6 얽힘 게임 | 블로흐 구의 3D 측정 축 방향에 따른 상관관계 |
| 양자 중첩 | #7 슈뢰딩거의 고양이 | 중첩 상태의 3D 시각화. 결어긋남(decoherence) |
| 상보성 원리 | #8 양자 지우개 | 경로 정보와 간섭의 3D 배치 관계 |
| 양자 게이트와 회로 | #9 양자 회로 빌더 | 블로흐 구의 3D 회전으로 게이트 연산 시각화 |
| 광전효과와 에너지 양자화 | #10 광전효과 | 광자-전자 상호작용의 3D 슬로모션. E=hf |
| 벨 부등식과 비국소성 | #6 얽힘 게임 | 숨은 변수 이론 vs 양자역학의 통계적 차이를 3D 블로흐 구 위에서 비교 |

## 엔진 변수

| 변수 | 타입 | 기본값 | 범위 | 설명 |
|------|------|--------|------|------|
| `slitCount` | int | 2 | 1~5 | 슬릿 수 |
| `particleType` | enum | photon | photon/electron/neutron | 입자 종류 |
| `observe` | bool | false | true/false | 관측 여부 |
| `barrierHeight` | float | 1.0 | 0.1~10 | 터널링 장벽 높이 (eV) |
| `barrierWidth` | float | 1.0 | 0.1~10 | 터널링 장벽 폭 (nm) |
| `particleEnergy` | float | 0.5 | 0.1~10 | 입자 에너지 (eV) |
| `quantumNumbers` | object | {n:1, l:0, m:0} | — | 양자수 (n, l, m) |
| `measureAxis` | enum[] | [Z] | X/Y/Z | 측정 축 (얽힘용) |
| `gates` | string[] | [] | H/X/Z/CNOT/T | 양자 게이트 시퀀스 |
| `qubits` | int | 1 | 1~4 | 큐빗 수 |
| `particleRate` | enum | normal | slow/normal/fast | 입자 발사 속도 — **v2 추가** |
| `detectorPosition` | vec3 | null | - | 검출기 3D 위치 — **v2 추가** |
| `showWavefunction` | bool | true | - | 파동함수 시각화 여부 — **v2 추가** |
| `showProbabilityCloud` | bool | true | - | 확률구름 표시 여부 — **v2 추가** |
| `showNodeSurfaces` | bool | false | - | 노드면 표시 여부 — **v2 추가** |
| `positionUncertainty` | float | 1.0 | 0.01~10 | 위치 불확정성 (nm) — **v2 추가** |
| `showMomentumSpace` | bool | false | - | 운동량 공간 표시 — **v2 추가** |
| `showWavePacket` | bool | false | - | 파속(wave packet) 시각화 — **v2 추가** |
| `entangled` | bool | false | - | 얽힘 쌍 여부 — **v2 추가** |
| `trials` | int | 100 | 1~10000 | 반복 시행 횟수 — **v2 추가** |
| `showBlochSphere` | bool | false | - | 블로흐 구 표시 — **v2 추가** |
| `decayProbability` | float | 0.5 | 0~1 | 방사성 붕괴 확률 — **v2 추가** |
| `eraser` | bool | false | - | 양자 지우개 모드 — **v2 추가** |
| `showCoincidence` | bool | false | - | 동시계수 필터 표시 — **v2 추가** |
| `lightFrequency` | float | 6e14 | 1e14~3e15 | 빛 진동수 (Hz) — **v2 추가** |
| `lightIntensity` | float | 1.0 | 0.1~100 | 빛 세기 — **v2 추가** |
| `metalType` | enum | sodium | sodium/copper/zinc/cesium | 금속 종류 — **v2 추가** |
| `workFunction` | float | auto | 1~6 | 일함수 (eV) — **v2 추가** |
