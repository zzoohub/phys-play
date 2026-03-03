# 투사체 엔진 — 챌린지 시나리오

> 소스: 1-1. 운동과 힘의 "3D 콘텐츠" 아이디어를 변수 조합 형태로 변환
> 최소 시나리오 수: 10개 (온보딩 챌린지 포함, 코어 루프 검증 핵심)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 지구 기본 던지기 | g=9.8, angle=45, drag=0, mass=1kg | trajectory | 포물선 운동의 기본 |
| 2 | 달에서 던지기 | g=1.6, angle=45, drag=0, mass=1kg | trajectory | 중력이 약하면 더 멀리, 더 높이 |
| 3 | 목성에서 던지기 | g=24.8, angle=45, drag=0, mass=1kg | trajectory | 강한 중력의 효과 |
| 4 | 공기저항 ON | g=9.8, angle=45, drag=0.5, mass=1kg | trajectory | 공기저항이 궤적을 비대칭으로 만든다 |
| 5 | 질량 변화 (공기저항 있을 때) | g=9.8, angle=45, drag=0.5, mass=10kg | trajectory | 질량이 크면 공기저항 영향 감소 |
| 6 | 무중력 | g=0, angle=45, drag=0, mass=1kg | trajectory | 중력 없으면 직선 운동 (관성) |
| 7 | 각도 비교 | g=9.8, angle=[30,45,60], drag=0 | trajectory | 45도가 최대 사거리 (공기저항 없을 때) |
| 8 | 자유낙하 | g=9.8, angle=90(수직), drag=ON/OFF | binary | 깃털과 쇠구슬: 공기저항 없으면 동시 낙하 |
| 9 | 화성 탐사 | g=3.7, drag=0.01(얇은 대기) | trajectory | 화성의 약한 중력 + 얇은 대기 |
| 10 | 지구 vs 달 비교 | g=[9.8, 1.6], angle=45, drag=0, mass=1kg | trajectory | 같은 조건에서 중력만 다를 때 직접 비교 |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| trajectory | 9 | 90% |
| binary | 1 | 10% |

## JSON 스키마 예시

```jsonc
{
  "id": "projectile-moon-45",
  "engineId": "projectile",
  "version": 1,
  "params": {
    "gravity": 1.6,
    "angle": 45,
    "mass": 1.0,
    "drag": 0,
    "launchSpeed": 20
  },
  "predict": {
    "type": "trajectory",
    "question": "달에서 이 공을 45도로 던지면 어디에 떨어질까?",
    "tolerance": 0.15
  },
  "discover": {
    "level1": "달의 중력은 지구의 1/6이라 공이 훨씬 멀리, 높이 날아간다",
    "level2": "중력 가속도 g=1.6m/s²에서 포물선의 정점 높이와 수평 도달 거리가 약 6배 증가한다",
    "level3": "R = v₀²sin(2θ)/g → g가 1/6이면 R이 6배",
    "relatedConcepts": ["gravity", "projectile-motion"]
  },
  "difficulty": 2,
  "space": "mechanics-lab",
  "station": "projectile",
  "tags": ["gravity", "moon", "trajectory"]
}
```
