# 분자 엔진 — 챌린지 시나리오

> 소스: 2-1. 원자와 결합 + 2-2. 분자의 형태 + 2-3. 화학반응 + 2-4. 생체분자 (구조)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 물 분자 만들기 | elements=[H, H, O] | pattern (분자 모양) | 공유결합, 104.5도 결합각 |
| 2 | CO₂ vs H₂O | elements=[C,O,O] vs [H,O,H] | pattern (극성?) | 대칭 → 비극성, 비대칭 → 극성 |
| 3 | 메탄 기하학 | elements=[C,H,H,H,H], electron_pairs=4 | pattern (형태) | 사면체, 109.5도 |
| 4 | 이온결합 형성 | elements=[Na, Cl] | pattern | Na→전자 줌→Cl, 정전기적 인력 |
| 5 | 반응 온도 변화 | reactants=[H₂,O₂], temp=variable | binary (반응 발생?) | 활성화 에너지 임계값 |
| 6 | 촉매 효과 | reaction=같음, catalyst=ON/OFF | binary (반응 속도) | 활성화 에너지 낮춤 |
| 7 | 평형 이동 | reaction=N₂+3H₂⇌2NH₃, pressure=UP | pattern (이동 방향) | 르샤틀리에: 압력↑ → 분자 수 감소 쪽 |
| 8 | DNA 염기쌍 매칭 | sequence=[A,T,G,?] | pattern (빈칸 채우기) | A-T, G-C 상보적 결합 |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| pattern | 6 | 75% |
| binary | 2 | 25% |

## JSON 스키마 예시

```jsonc
{
  "id": "molecular-water",
  "engineId": "molecular",
  "version": 1,
  "params": {
    "elements": ["H", "H", "O"],
    "electronPairs": 4
  },
  "predict": {
    "type": "pattern",
    "question": "수소 2개와 산소 1개가 결합하면 어떤 모양의 분자가 될까?",
    "options": [
      "직선형 (180도)",
      "꺾인형 (약 105도)",
      "삼각형 (120도)"
    ]
  },
  "discover": {
    "level1": "물 분자는 일직선이 아니라 '꺾인' 모양이다",
    "level2": "산소의 비공유 전자쌍 2개가 수소를 밀어내 결합각이 104.5도가 된다 (VSEPR 이론)",
    "level3": "전자쌍 반발: 비공유 > 공유 → 이상적 사면체(109.5°)보다 좁은 104.5°",
    "relatedConcepts": ["vsepr", "covalent-bond", "polarity"]
  },
  "difficulty": 1,
  "space": "molecular-lab",
  "station": "molecular",
  "tags": ["water", "vsepr", "bond-angle"]
}
```
