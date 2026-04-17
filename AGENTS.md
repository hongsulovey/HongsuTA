# Hongsu Portfolio — Agent Context

테크니컬 아티스트 포트폴리오 사이트. Next.js 15 App Router, TypeScript, React Three Fiber.
배포: Vercel → https://hongsu.dev (primary), www/ hongsu-ta.vercel.app 리다이렉트.

## 실행

```powershell
npm.cmd install
npm.cmd run dev     # http://localhost:3000
npm.cmd run build   # 타입체크 + 빌드
```

Windows PowerShell 환경이라 `npm.cmd` 사용. 실행 정책 이슈 있으면 `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`.

## 구조

```
src/
  app/                          # App Router (RSC 기본)
    layout.tsx                  # <HeroNav/> 전역 + RootLayout
    page.tsx                    # <HeroSection/> 단독 (풀스크린 히어로)
    about|contact|projects/     # 서브 페이지
    globals.css                 # 모든 비주얼 스타일 집중
  features/
    home/
      components/
        HeroAmbientGlyphs.tsx   # 떠다니는 코드 글립 (DOM, CSS 애니메이션)
        HeroAnimatedTitle.tsx   # 2줄 타이틀 + 스크램블 + 상시 글리치 ghost
        HeroCanvas.tsx          # R3F Canvas (perspective), 효과 registry 조립
        HeroController.tsx      # 스크롤 진행률 트래킹
        HeroNav.tsx             # 상단 네비 (fixed, 전역 사용)
        HeroOverlay.tsx         # eyebrow/title/tagline/CTA
        HeroShapes.tsx          # R3F 와이어프레임 도형들 (sphere/box/tetra/octa/icosa)
      sections/HeroSection.tsx  # 전체 합성 + 상태 관리
      data/homeContent.ts       # 이름, role, tagline, 스킬, 연락처
    projects/data/projects.ts   # 프로젝트 목록
  shared/
    effects/
      presets.ts                # defaultEffects 설정
      registry.ts               # EffectKey → Renderer 매핑
      renderers/ScanlinePlane.tsx  # GLSL 배경 셰이더 (CRT barrel + RGB split)
      types.ts                  # EffectConfig, RendererProps
    hooks/useUiHoverTrigger.ts  # UI hover 이벤트 펍섭 (타이틀 글리치 트리거용)
```

## 핵심 동작 로직

### 타이틀 글리치
- `HeroAnimatedTitle`은 `lines: ["CHOI", "HONGSU"]` 를 받아 라인별로 마운트 시 스크램블 → settle
- `.is-settled::before/::after` 에 cyan/magenta 고스트가 `heroGlitchSliceTop/Bottom 720/820ms`로 **상시 루프** (기본 상태부터)
- `hovered` prop이 true면 `.is-breaking` 추가 → `heroBreakShake` 라인 흔들림 + JS 텍스트 스크램블 (70ms 간격)

### UI hover → 타이틀 글리치 연동
- 타이틀 자체의 `onMouseEnter` 없음
- `hero-glitch-hover` 클래스 붙은 모든 UI (네비 링크, 브랜드, CTA 버튼)가 `useUiHoverTrigger()`로 `ta-ui-hover-start/end` 이벤트 발행
- `HeroSection`이 `useUiHoverListener(setIsTitleHovered)`로 카운터 집계 → 하나라도 hover 중이면 hovered = true
- hovered 전파: 타이틀 breaking, HeroShapes 수축, HeroAmbientGlyphs 수축, 셰이더 highlight uniform

### 배경 셰이더 (`ScanlinePlane.tsx`)
- Full-screen plane (scale = viewport.width/height)
- CRT barrel curvature + mild swirl noise + horizontal glitch shift on hover
- RGB split per channel (edge/highlight 기반 증가)
- Off-bounds 블랙 마스크 + edge vignette
- **마우스 포인터 반응 제거됨** (과거 pointerGlow/warp 모두 제거)

### R3F 도형 (`HeroShapes.tsx`)
- Perspective camera `[0,0,5] fov 55`
- 14개 와이어프레임 메시 (sphere/box/tetra/octa/icosa)
- 2단 구조: main wire (opacity 0.95) + outer glow (scale 1.08, opacity 0.25), AdditiveBlending
- 톤 3종: cyan `#65e0ff`, magenta `#ff6ec7`, white-blue `#9ec0ff`
- hovered=true → 전부 `(0,0,0)`으로 lerp + scale→0, 상위 group 회전 가속

### 글라스 UI
- `.hero-glass-panel`, `.hero-glass-button`: `backdrop-filter: blur + saturate + brightness`, 배경 `rgba(255,255,255, 0.03~0.1)`, border 없음
- hover 시 글리치 슬라이스(`.hero-glitch-hover::before/after` clip-path 애니메이션) + 레이블 shake

## 주요 CSS 키프레임 (`globals.css`)

- `heroGlitch`, `heroBreakShake` — 라인 흔들림
- `heroGlitchSliceTop/Bottom` — ghost 클립 슬라이스 (상시 + hover 공용)
- `heroLineSettle` — 마운트 후 letter-spacing/blur 수렴
- `heroFadeUp`, `heroGlyphRise` — 서브 요소 등장

## 작업할 때 주의

1. **Hydration**: `HeroAmbientGlyphs`는 pseudo-random 위치 때문에 SSR 시 mismatch. `mounted` flag로 클라이언트 렌더만 하도록 되어있음. 비슷한 패턴 쓸 때 주의.
2. **Windows PowerShell**: `&&` 체이닝 불가. 명령 따로 돌리거나 `;` 사용.
3. **Timer 타입**: `setInterval` 리턴값은 `number | undefined`로 명시 (빌드 시 `NodeJS.Timeout` 추론 에러 방지).
4. **@types/three**: dev dep으로 설치되어 있어야 빌드 통과.
5. **Effect registry**: 새 효과 추가 시 `registry.ts` + `presets.ts` + `types.ts` 순서로 업데이트.

## 진행 중/다음 할 일

- [ ] 프로젝트 상세 페이지(`/projects/[slug]`) 콘텐츠 채우기 (문제/해결/결과 서사)
- [ ] 실제 프로젝트 썸네일 이미지 추가
- [ ] About/Contact 실제 문구 다듬기
- [ ] SEO: OG 이미지, favicon, `metadata` 확장
- [ ] 모바일 레이아웃 재검증 (특히 2줄 헤드라인, 네비 캡슐)
- [ ] `HeroController` 스크롤 progress가 현재 효과에 반영되지만 더 적극적으로 쓸지 결정
