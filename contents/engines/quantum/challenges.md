# 양자 엔진 — 챌린지 시나리오

> 소스: 4-1~4-6 전체 (Track 4 완전 매핑)

## 시나리오 풀

| # | 시나리오 | 변수 세팅 | 예측 유형 | Discover 핵심 |
|---|----------|----------|-----------|-------------|
| 1 | 이중슬릿 기본 | slit=2, particle=photon, observe=OFF | pattern (간섭무늬?) | 관측 안 하면 간섭무늬 |
| 2 | 이중슬릿 관측 | slit=2, particle=photon, observe=ON | pattern | 관측하면 무늬 사라짐 |
| 3 | 이중슬릿 전자 | slit=2, particle=electron, observe=OFF | pattern | 전자도 파동처럼 간섭 |
| 4 | 터널링: 낮은 장벽 | barrier_height=low, barrier_width=thin | binary (투과?) | 낮고 얇으면 높은 투과 확률 |
| 5 | 터널링: 높은 장벽 | barrier_height=high, barrier_width=thick | binary | 높고 두꺼우면 거의 투과 안 됨 |
| 6 | 터널링: 에너지 변화 | particle_energy=variable, barrier=고정 | binary | 에너지 높을수록 투과 확률 증가 |
| 7 | 오비탈 시각화 | n=2, l=1, m=0 | pattern (오비탈 모양) | p 오비탈의 아령 모양 |
| 8 | 얽힘: 같은 축 측정 | entangled=true, axis=[Z, Z] | binary (상관관계?) | 100% 반상관 |
| 9 | 얽힘: 다른 축 측정 | entangled=true, axis=[Z, X] | pattern (상관 통계) | 벨 부등식 위반 |
| 10 | 블로흐 구 게이트 | initial=\|0⟩, gate=H | pattern (결과 상태) | 하다마드 → 중첩 상태 |
| 11 | 양자 회로 빌더 | gates=[H, CNOT], qubits=2 | pattern (결과 확률) | 벨 상태 생성 |

## 예측 유형 분포

| 유형 | 시나리오 수 | 비율 |
|------|-----------|------|
| pattern | 7 | 64% |
| binary | 4 | 36% |

## JSON 스키마 예시

```jsonc
{
  "id": "quantum-double-slit-basic",
  "engineId": "quantum",
  "version": 1,
  "params": {
    "slitCount": 2,
    "particleType": "photon",
    "observe": false
  },
  "predict": {
    "type": "pattern",
    "question": "이중슬릿을 통과한 광자가 스크린에 만드는 패턴은?",
    "options": [
      "두 줄 (슬릿 뒤에 각각 하나)",
      "간섭 줄무늬 (밝고 어두운 띠 반복)",
      "균일한 밝기"
    ]
  },
  "discover": {
    "level1": "공을 두 문으로 동시에 던질 수 있는 것처럼, 입자는 두 슬릿을 '동시에' 통과한다",
    "level2": "양자 입자는 측정 전까지 확률파로 존재하며, 두 경로의 확률이 간섭한다",
    "level3": "P(x) = |ψ₁(x) + ψ₂(x)|² ≠ |ψ₁|² + |ψ₂|² (간섭항 존재)",
    "relatedConcepts": ["wave-particle-duality", "superposition", "measurement"]
  },
  "difficulty": 2,
  "space": "quantum-lab",
  "station": "quantum",
  "tags": ["double-slit", "interference", "observation"]
}
```
