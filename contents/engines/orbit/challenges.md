# 궤도 엔진 — 챌린지 시나리오

> 소스: 3-1. 지구와 달 + 3-2. 태양계 + 3-3. 별의 일생 (중력) + 3-4. 빛과 스펙트럼 (적색편이) + 3-5. 은하 (중력 구조)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 달 궤도 | mass=[Earth, Moon], distance=384400km | trajectory | 공전 주기와 거리의 관계 |
| 2 | 일식 조건 | moon_orbit_tilt=variable | binary (일식 발생?) | 궤도면 기울기가 맞아야 일식 |
| 3 | 행성 속도 비교 | planet=[수성 vs 해왕성] | binary (어느 쪽이 빠른가) | 안쪽 행성이 더 빠르다 (케플러 3법칙) |
| 4 | 탈출 속도 | planet_mass=variable, launch_v=variable | binary (탈출?) | 질량 클수록 탈출 속도 높음 |
| 5 | 2체 충돌 궤도 | mass=[같음], velocity=[교차], distance=variable | trajectory | 만유인력에 의한 궤도 변형 |
| 6 | 3체 문제 | bodies=3, mass=[같음] | trajectory | 카오스적 운동 → 예측 불가 |
| 7 | 조석력 | moon_distance=variable | pattern (밀물 높이) | 가까울수록 조석력 강함 |
| 8 | 적색편이 측정 | galaxy_velocity=variable | pattern (스펙트럼 이동) | 🔗 파동 엔진 크로스 참조 |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| trajectory | 3 | 37.5% |
| binary | 3 | 37.5% |
| pattern | 2 | 25% |

## JSON 스키마 예시

```jsonc
{
  "id": "orbit-eclipse-condition",
  "engineId": "orbit",
  "version": 1,
  "params": {
    "bodies": 3,
    "mass": [1.989e30, 5.972e24, 7.348e22],
    "orbitTilt": 5.14
  },
  "predict": {
    "type": "binary",
    "question": "달의 궤도면 기울기가 5도일 때, 이번 삭망에서 일식이 일어날까?",
    "options": ["일식이 일어난다", "일식이 일어나지 않는다"]
  },
  "discover": {
    "level1": "달이 태양과 지구 사이에 정확히 들어와야 일식이 생긴다",
    "level2": "달의 궤도면이 지구의 공전면과 약 5도 기울어져 있어, 대부분의 삭망에서는 달이 태양 위나 아래를 지나간다",
    "level3": "일식 조건: 달이 승교점/강교점 근처(±18.5°)에서 삭(new moon)을 맞아야 함",
    "relatedConcepts": ["orbital-tilt", "eclipse", "lunar-nodes"]
  },
  "difficulty": 3,
  "space": "space-observatory",
  "station": "orbit",
  "tags": ["eclipse", "moon", "orbital-tilt"]
}
```
