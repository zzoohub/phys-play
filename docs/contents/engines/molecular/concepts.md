# 분자 엔진 — 핵심 개념 v2

> 소스: 2-1. 원자와 결합 + 2-2. 분자의 형태 + 2-3. 화학반응 + 2-4. 생체분자
> v2: 3D/XR 관점 추가, 엔진 변수 확장

## 개념 목록

| 개념 | 챌린지 연결 | 3D/XR 관점 |
|------|-----------|-----------|
| VSEPR 이론과 분자 기하학 | #1 분자 조각가 | 전자쌍 반발을 3D로 체감. 결합각의 물리적 의미 |
| 입체화학과 카이랄성 | #2 약물 도킹 | 거울상 이성질체를 3D로 비교. 왼손/오른손 장갑 |
| 극성과 비극성 | #3 극성 배틀 | 3D 분자 대칭이 극성을 결정. 쌍극자 벡터 시각화 |
| 활성화 에너지와 촉매 | #4 반응 극장 | 3D 에너지 지형 위에서 반응 경로를 시각화 |
| 단백질 접힘 (소수성 상호작용) | #5 단백질 접기 레이스 | 아미노산 사슬의 3D 접힘. 소수성 코어의 공간적 배치 |
| DNA 이중나선 구조 | #6 DNA 이중나선 탐험 | 나선 내부를 걸어다니며 상보적 결합 체험 |
| 화학 평형과 르샤틀리에 | #7 르샤틀리에의 시소 | 3D 반응기 안에서 분자 수 변화를 실시간 관찰 |
| 결정 구조와 물성 | #8 결정 격자 건축가 | 3D 단위셀 배열이 물성을 결정. FCC/BCC/HCP |
| 공유결합과 이온결합 | #1, #8 | 전자 공유/이동의 3D 전자 구름 시각화 |
| 배향 효과 (반응 속도론) | #4 반응 극장 | 3D 충돌 방향이 반응 성공률을 결정 |
| 수소결합과 분자간 힘 | #3, #5, #6 | 3D 공간에서 분자 사이 약한 힘의 방향성 |

## 엔진 변수

| 변수 | 타입 | 기본값 | 범위 | 설명 |
|------|------|--------|------|------|
| `elements` | string[] | — | 주기율표 원소 | 조합할 원소 목록 |
| `electronPairs` | int | auto | 1~6 | 전자쌍 수 (VSEPR) |
| `bondType` | enum | auto | covalent/ionic/metallic | 결합 유형 |
| `temperature` | float | 298 | 100~5000 | 온도 (K) |
| `pressure` | float | 1.0 | 0.1~100 | 압력 (atm) |
| `concentration` | float | 1.0 | 0.01~10 | 농도 (mol/L) |
| `catalyst` | bool | false | true/false | 촉매 존재 여부 |
| `sequence` | string | — | A/T/G/C | DNA/RNA 서열 |
| `targetMolecule` | string | — | - | 목표 분자 식별자 — **v2 추가** |
| `availableAtoms` | string[] | [] | - | 사용 가능한 원자 목록 — **v2 추가** |
| `showElectronPairs` | bool | true | - | 전자쌍 표시 여부 — **v2 추가** |
| `enzyme` | string | null | - | 효소 종류 (도킹용) — **v2 추가** |
| `drugCandidates` | array | [] | - | 약물 후보 분자 목록 — **v2 추가** |
| `bindingPocket` | object | null | - | 3D 결합 포켓 메시 — **v2 추가** |
| `solvent` | enum | water | water/oil/ethanol | 용매 종류 — **v2 추가** |
| `showDipoles` | bool | false | - | 쌍극자 화살표 표시 — **v2 추가** |
| `reactants` | string[] | [] | - | 반응물 목록 — **v2 추가** |
| `showEnergyLandscape` | bool | false | - | 3D 에너지 지형 표시 — **v2 추가** |
| `aminoSequence` | string[] | [] | - | 아미노산 서열 (단백질 접힘용) — **v2 추가** |
| `targetStructure` | object | null | - | 목표 3D 구조 메시 — **v2 추가** |
| `latticeType` | enum | null | fcc/bcc/hcp/nacl | 결정 격자 유형 — **v2 추가** |
| `reaction` | string | null | - | 화학 반응식 (평형용) — **v2 추가** |
| `perturbation` | enum | null | pressure_up/pressure_down/temp_up/temp_down/conc_up/conc_down | 평형 교란 — **v2 추가** |
