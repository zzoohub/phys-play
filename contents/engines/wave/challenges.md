# 파동 엔진 — 챌린지 시나리오

> 소스: 1-3. 파동 + 1-4. 소리와 빛(소리) + 3-4. 빛과 스펙트럼(스펙트럼)
> 최소 시나리오 수: 8개 (패턴 선택지 예측 유형 검증)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 이중 파원 간섭 | sources=2, freq=같음, distance=1λ | pattern (3 패턴 중 선택) | 보강/상쇄 간섭의 원리 |
| 2 | 파원 3개 간섭 | sources=3, freq=같음 | pattern | 패턴이 더 복잡해진다 |
| 3 | 주파수 다른 파원 | sources=2, freq=[f, 1.5f] | pattern | 맥놀이(beat) 현상 |
| 4 | 공명 찾기 | tube_length=1m, freq=슬라이더 | binary (공명점?) | 관의 길이와 파장의 관계 |
| 5 | 도플러: 다가오는 차 | source_speed=30m/s, approaching | pattern | 다가올수록 파장 짧아짐(높은 소리) |
| 6 | 도플러: 멀어지는 차 | source_speed=30m/s, receding | pattern | 멀어질수록 파장 길어짐(낮은 소리) |
| 7 | 슬릿 회절 | slit_width=λ, wavelength=variable | pattern | 슬릿 폭 ≈ 파장일 때 회절 최대 |
| 8 | 스펙트럼 분석 | star_temp=variable | pattern | 온도가 높을수록 파란색 (빈 법칙) |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| pattern | 7 | 87.5% |
| binary | 1 | 12.5% |

## JSON 스키마 예시

```jsonc
{
  "id": "wave-double-source-interference",
  "engineId": "wave",
  "version": 1,
  "params": {
    "sources": 2,
    "frequency": 440,
    "amplitude": 1.0,
    "phaseDiff": 0,
    "sourceDistance": 1.0
  },
  "predict": {
    "type": "pattern",
    "question": "두 파원에서 같은 진동수의 파동이 나올 때, 만나는 지점의 패턴은?",
    "options": [
      "보강 간섭 줄무늬",
      "균일한 파동",
      "완전 소멸"
    ]
  },
  "discover": {
    "level1": "물에 돌 두 개를 던지면 파문이 만나는 곳에서 물이 솟거나 잔잔해진다",
    "level2": "두 파동이 만나면 진폭이 더해짐(보강) 또는 상쇄됨. 위치에 따라 보강/상쇄가 교대로 나타나 줄무늬 패턴을 만든다",
    "level3": "경로차 = nλ → 보강, (n+½)λ → 상쇄",
    "relatedConcepts": ["interference", "superposition", "wave-source"]
  },
  "difficulty": 2,
  "space": "mechanics-lab",
  "station": "wave",
  "tags": ["interference", "pattern", "double-source"]
}
```
