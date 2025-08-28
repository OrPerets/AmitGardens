# 🌱 Gardener Scheduling App – Agile Backlog

This document outlines the **product backlog** for transforming the gardener monthly scheduling app into a **professional, mobile-first, elegant, and delightful experience**.  
The backlog is organized by **Epics** (big goals), **User Stories** (value-focused deliverables), and **Tasks** (technical actions).  

---

## 📌 Epic 1: Core Scheduling Flow (Workers)
**Goal:** Enable gardeners to easily submit their monthly schedules, optimized for mobile-first use.

### User Stories
1. As a gardener, I want to **see my next-month status** (not started / in progress / submitted) so I know if action is needed.  
2. As a gardener, I want to **select availability by day** (available/unavailable/shifts/custom) so I can define my schedule quickly.  
3. As a gardener, I want to **apply patterns (e.g., all Mondays, all weekends)** so I don’t need to tap every day.  
4. As a gardener, I want to **review a summary before submitting** so I avoid mistakes.  

### Tasks
- [ ] Create **mobile-first dashboard** with greeting + status card.  
- [ ] Build **MonthGrid** component (calendar grid with day cells).  
- [ ] Implement **DayCell** with tap → bottom sheet editor.  
- [ ] Add **bulk pattern tool** (apply to weekdays, weekends, all days).  
- [ ] Progress bar (e.g., 18/22 required days filled).  
- [ ] Confirmation screen with final review + Submit button.  
- [ ] Local draft save in case of disconnect or refresh.  

---

## 📌 Epic 2: Manager Review & Approvals
**Goal:** Allow managers to track, review, and approve/reject gardener submissions.

### User Stories
1. As a manager, I want to **filter submissions by worker, status, and month** so I can focus on what matters.  
2. As a manager, I want to **approve or request changes** to schedules so I maintain quality.  
3. As a manager, I want to **see a calendar view of a worker’s submission** so I understand availability at a glance.  

### Tasks
- [ ] Manager dashboard with filters (team, worker, status).  
- [ ] Submission cards with status badges (Pending, Approved, Needs Changes).  
- [ ] Drill-in page for per-day/month approval.  
- [ ] “Approve all” vs. “Request changes” with optional note.  
- [ ] Manager actions trigger **toast notifications** + update status.  

---

## 📌 Epic 3: UI/UX Modernization
**Goal:** Redesign the interface with professional, elegant, and consistent visuals.

### User Stories
1. As a user, I want the app to **look clean and modern** so it feels professional.  
2. As a user, I want **subtle animations and transitions** so interactions feel smooth.  
3. As a user, I want **clear empty states and feedback** so I never feel lost.  

### Tasks
- [ ] Adopt **TailwindCSS** + **shadcn/ui** components.  
- [ ] Create `tokens.ts` for colors, typography, radii, motion.  
- [ ] Apply **brand gradient** (blue → purple) across CTAs.  
- [ ] Add **Framer Motion** animations (page transitions, day selection, submit success).  
- [ ] Success screen animation (checkmark bloom + confetti).  
- [ ] Empty states with illustrations + helpful CTA.  

---

## 📌 Epic 4: Mobile-First & Accessibility
**Goal:** Ensure app is optimized for **mobile-first gardeners** and fully accessible.

### User Stories
1. As a gardener, I want **large tap targets** so I can use the app with one hand.  
2. As a gardener, I want a **bottom sheet editor** for day details so it feels native.  
3. As an accessibility user, I want **keyboard and screen-reader support** so the app is usable for all.  

### Tasks
- [ ] Responsive layout (mobile-first → scale to tablet/desktop).  
- [ ] Implement BottomSheet with ARIA roles & focus trap.  
- [ ] Add ARIA labels for calendar grid (`role="grid"`, `aria-selected`).  
- [ ] Respect `prefers-reduced-motion`.  
- [ ] RTL readiness (Hebrew support).  

---

## 📌 Epic 5: Infrastructure & Performance
**Goal:** Ensure smooth performance, scalability, and future localization.

### User Stories
1. As a developer, I want **lightweight dependencies** so the app loads fast on weak networks.  
2. As a manager, I want **i18n/RTL support** so the app can be used in English & Hebrew.  

### Tasks
- [ ] Use **date-fns** (lightweight) instead of heavy date libraries.  
- [ ] Code-split manager dashboard.  
- [ ] Add i18next with `en.json` + `he.json`.  
- [ ] Add RTL toggle + CSS logical properties.  
- [ ] Lighthouse score: Performance ≥ 90, Accessibility ≥ 95.  

---

## 📌 Epic 6: QA & Acceptance
**Goal:** Deliver a robust, tested app that meets quality standards.

### Tasks
- [ ] Unit tests for MonthGrid keyboard navigation.  
- [ ] Test ARIA compliance (NVDA/VoiceOver).  
- [ ] QA checklist run (mobile tap targets, status flows, accessibility).  
- [ ] Bundle size regression < +100 KB.  
- [ ] Documentation: `README_UIUX.md` + screenshots.  

---

## 🏁 Suggested Agile Phases
- **Sprint 1:** Worker Dashboard + MonthGrid basics.  
- **Sprint 2:** DayCell editor + bulk actions + submit flow.  
- **Sprint 3:** Manager dashboard + approvals.  
- **Sprint 4:** UI polish (tokens, animations, empty states).  
- **Sprint 5:** Accessibility, RTL, and performance tuning.  
- **Sprint 6:** QA, tests, and final docs.  

---

👉 This backlog is **iterative**: each sprint delivers visible value while layering polish & performance.  
