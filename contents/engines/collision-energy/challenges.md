# 충돌/에너지 엔진 — 챌린지 시나리오

> 소스: 1-2. 에너지와 일의 "3D 콘텐츠" 아이디어를 변수 조합 형태로 변환
> 최소 시나리오 수: 8개 (롤러코스터가 이진 선택 예측 유형 검증)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 롤러코스터 기본 루프 | height=10m, friction=0, loop_r=3m | binary (통과?) | 위치에너지 → 운동에너지 전환 |
| 2 | 마찰 추가 루프 | height=10m, friction=0.3, loop_r=3m | binary | 마찰이 에너지를 "먹는다" |
| 3 | 높이 부족 루프 | height=5m, friction=0, loop_r=3m | binary | 최소 높이 조건: h > 2.5r |
| 4 | 이중 루프 | height=15m, friction=0.1, loop_r=[3m, 2m] | binary | 첫 루프 통과 후 남은 에너지 |
| 5 | 완전 탄성 충돌 | mass=[1,1], velocity=[5,0], elasticity=1.0 | pattern (결과 속도) | 운동량 + 에너지 둘 다 보존 |
| 6 | 비탄성 충돌 | mass=[1,1], velocity=[5,0], elasticity=0 | pattern | 운동량만 보존, 에너지 손실 |
| 7 | 질량 비대칭 충돌 | mass=[10,1], velocity=[5,0], elasticity=1.0 | pattern | 가벼운 물체가 2배 속도로 튕김 |
| 8 | 진자 에너지 변환 | length=2m, angle=45, friction=0 | trajectory | 위치↔운동 에너지 주기적 교환 |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| binary | 4 | 50% |
| pattern | 3 | 37.5% |
| trajectory | 1 | 12.5% |

## JSON 스키마 예시

```jsonc
{
  "id": "collision-energy-roller-basic",
  "engineId": "collision-energy",
  "version": 1,
  "params": {
    "height": 10,
    "friction": 0,
    "loopRadius": 3
  },
  "predict": {
    "type": "binary",
    "question": "높이 10m에서 출발한 공이 반지름 3m 루프를 통과할 수 있을까?",
    "options": ["통과한다", "통과 못 한다"]
  },
  "discover": {
    "level1": "높은 곳의 에너지가 빠른 속도로 바뀌어 루프를 돌 수 있다",
    "level2": "위치에너지(mgh)가 운동에너지(½mv²)로 전환되어 루프 꼭대기에서 충분한 구심력을 제공한다",
    "level3": "h ≥ 2.5r 조건: mgh = ½mv² + mg(2r) → v² = 2g(h-2r), v²/r ≥ g",
    "relatedConcepts": ["potential-energy", "kinetic-energy", "conservation"]
  },
  "difficulty": 1,
  "space": "mechanics-lab",
  "station": "collision-energy",
  "tags": ["energy", "roller-coaster", "binary"]
}
```
