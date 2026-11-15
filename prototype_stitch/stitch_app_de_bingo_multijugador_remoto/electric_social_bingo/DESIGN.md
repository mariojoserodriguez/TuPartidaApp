---
name: Electric Social Bingo
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#c7c4d8'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#918fa1'
  outline-variant: '#464555'
  surface-tint: '#c3c0ff'
  primary: '#c3c0ff'
  on-primary: '#1d00a5'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#4d44e3'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-xl:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-number-xl:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.03em
  label-number-grid:
    fontFamily: Space Grotesk
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 24px
  label-md:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.75rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes an electric, festive, and tactile atmosphere engineered for real-time multiplayer social gaming. It blends the anticipation of physical bingo parlors with modern arcade vibrancy and streamlined mobile utility. The visual language balances high-energy party cues—such as glossy spheres, daubing highlights, and celebration states—with crystalline typographic legibility essential for rapid numerical identification under strict countdowns.

The aesthetic fuses **Tactile / Contemporary Glassmorphic Play** with high-contrast functional card layouts:
- **Atmosphere:** Dark, immersive lounge environment using deep indigo and night-sky slate tones, allowing bright daubs and golden reward states to shine like neon arcade fixtures.
- **Physicality:** Skeuomorphic touches including volumetric game balls, inset daub wells, and satisfying press mechanics paired with clean, modern digital typography.
- **Tone & Mood:** Festive, electrifying, friendly, and competitive without visual fatigue.

## Colors

The palette relies on a deep nocturnal canvas punctuated by high-chroma signals engineered for distinct live game states:

- **Primary (`#4F46E5` / `#6366F1`):** Indigo and electric violet represent the core interactive framework, room headers, dynamic sound wave accents, and interactive navigation elements.
- **Secondary (`#F59E0B` / `#FBBF24`):** Golden yellow drives high-stakes moments, caller drop balls, jackpot counters, win celebrations, and power-up meters.
- **Tertiary (`#10B981` / `#34D399`):** Emerald green is dedicated strictly to positive game actions: verified daubs, completed winning lines, ready toggles, and real-time audio/voice indicator statuses.
- **Alert / Accent (`#EF4444` / `#F87171`):** Energetic coral red serves as the countdown urgency signal, disconnect/warning alerts, and missed calls.
- **Surface & Background Slate (`#0F172A`, `#1E293B`, `#334155`):** Midnight blue-tinted slates create structured depth, high visual comfort during prolonged evening play, and seamless separation between the overall game board and floating caller modules.
- **Card Surfaces (`#FFFFFF` with `#0F172A` text):** The bingo game card remains stark white or bright off-white in the center play area to guarantee uncompromising legibility of randomized numerical cells.

## Typography

Typography solves two distinct tasks: delivering instant numerical clarity during high-velocity gameplay, and imparting a lively, rounded personality to party navigation.

- **Headlines (Outfit):** Geometric, buoyant, and friendly. Outfit provides weight and modern festivity to room announcements, winner podiums, and jackpot displays.
- **Game Numbers & Data Labels (Space Grotesk):** Chosen for its monospaced-adjacent geometric proportions, wide apertures, and unmistakable digit differentiation. Figures like `3`, `8`, `6`, and `9` are instantly distinguishable at rapid glances inside bingo grid cells.
- **Body & Dialogue (Plus Jakarta Sans):** Warm and highly legible at micro-sizes. Used across chat sidebars, room rules, system dialogs, and player lists.

## Layout & Spacing

The layout is built around mobile-first live-stream and card constraints.

- **Grid Structure:** A 4-column fluid mobile canvas with standard `16px` outer screen margins. Bingo cards adhere to a strict rigid 5x5 aspect ratio matrix that locks to the available device width minus gutters.
- **Vertical Hierarchy:**
  1. *Header Zone (Top 12%):* Compact room meta, live caller stream audio ticker, and connection signal.
  2. *Caller Ball Rail (Next 18%):* Current active ball displayed in high relief, flanked by the carousel of preceding called numbers.
  3. *Play Canvas (Center 55%):* Dynamic multi-card pager or single full-width bingo card.
  4. *Action Bar (Bottom 15%):* Big "BINGO!" claim button, power-up triggers, voice chat bubble controls, and mini live reactions.
- **Breakpoints:**
  - **Compact Mobile (<390px):** Spacing compresses to `space-xs` and `space-sm`; grid cells maintain minimum touch bounds of 44x44px.
  - **Standard Mobile (390px–480px):** Balanced layout with full 52x52px grid tap targets and dedicated bottom navigation tray.
  - **Tablet / Landscape (>480px):** Dual-pane split screen featuring the caller ball track, party video/audio feeds, and chat on the left (40% width) and dual bingo grids on the right (60% width).

## Elevation & Depth

Visual hierarchy leverages a hybrid of **Deep Indigo Tonal Stacking** paired with **Tactile Emissive Glows**:

- **Layer 0 (Canvas Base):** Deepest slate `#0F172A`, completely non-reflective.
- **Layer 1 (Card Podiums & Containers):** Soft translucent slate `#1E293B` with an inset `1px` translucent border (`rgba(255, 255, 255, 0.08)`).
- **Layer 2 (The Bingo Sheet):** Crisp contrasting surface `#FFFFFF` or bright tinted off-white `#F8FAFC`. Features a dropped shadow of `0 12px 32px -4px rgba(0, 0, 0, 0.45)` to elevate the tactical sheet directly above the gaming stage.
- **Layer 3 (Live Called Balls & Floating Trays):** Dynamic spheres rendered with specular linear gradient highlights (simulating sphere reflection) and contact shadows `0 6px 16px -2px rgba(15, 23, 42, 0.6)`.
- **Layer 4 (The Winning State & Alerts):** Emissive ambient glows (`0 0 24px rgba(245, 158, 11, 0.45)`) that radiate outward when a line or pattern is completed, signaling instant feedback to the player.

## Shapes

The design system employs a roundedness index of `2` (medium-high curvature: standard radius `0.5rem`, large radius `1rem`, extra-large radius `1.5rem`), matching the geometry of game counters, bingo balls, and party confetti:

- **Bingo Grid Cells:** Feature `rounded-md` (8px) corners with a 2px recessed border. When daubed, the inner element morphs into a perfect circle with an organic splat/stamp effect.
- **Action Buttons & Chips:** Utilize high-radius pill styling (`rounded-full`) for quick thumb ergonomics.
- **Modals & Cards:** Stand on `rounded-xl` (24px) corners to preserve a soft, consumer-friendly aesthetic.

## Components

### Bingo Grid Card
- **Structure:** 5x5 column layout (`B-I-N-G-O`), topped by high-contrast colored header labels in indigo `#4F46E5`.
- **Cells:** Pure `#FFFFFF` background with Space Grotesk dark numerals `#0F172A`.
- **States:**
  - *Default:* Crisp white, subtle 1px border `#E2E8F0`.
  - *Daubed (Active):* Transitions to vibrant emerald green `#10B981` with white bold text and an inset inner ring shadow simulating an ink stamp.
  - *Free Space (Center):* Golden yellow `#F59E0B` with an animated star icon.
  - *Win Line:* Pulsing border with golden radiant glow.

### Called Ball Display
- **Active Ball:** High-prominence circular sphere (64px mobile) utilizing a subtle gradient from `#FBBF24` to `#D97706` with white specular top reflection. Letter in micro label style above a prominent centered two-digit number.
- **History Rail:** Horizontal scroll of past called balls at 36px diameter with semi-transparent tinted slate backings `#334155`.

### Buttons
- **Primary "CALL BINGO!":** Oversized, pill-shaped, radiant gradient from `#F59E0B` to `#EF4444`. Features a subtle 3D bottom bevel (`border-b-4 border-amber-700`) that depresses cleanly on active state (`translate-y-1`).
- **Secondary Actions (Cards Pager, Auto-Daub, Audio):** Deep slate `#1E293B` surface with crisp 1px border `#475569`, text in `#F8FAFC`.
- **Ghost/Tertiary:** Pure translucent buttons for chat toggles and room menus.

### Chips & Player Badges
- **Player Pill:** Pill shape featuring live micro-avatars, username, audio speaking waveform in emerald green `#10B981`, and dynamic daub count.
- **Score & Multiplier Chips:** Space Grotesk bold text enclosed in a glossy pill container with translucent primary tinting (`rgba(99, 102, 241, 0.2)`).

### Input Fields & Search
- Low-profile dark slate `#1E293B` containers with subtle borders `#334155`. On active focus, applies an indigo glow (`0 0 0 2px #6366F1`). Text is clear, high-contrast white `#F8FAFC`.

### Social Reactions & Emotes
- Floating glassmorphic dock with 40px circular quick-fire emoji and sound stickers allowing live party interaction without blocking card tap bounds.