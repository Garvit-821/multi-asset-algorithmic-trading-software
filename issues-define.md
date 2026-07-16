# 🛠️ Issue Tracker & Definitions

This document serves as a repository for tracking platform bugs, layout glitches, and technical issues. It stores the title, description, reproduction steps, and eventual solutions.

---

## 🗂️ Active Issues Log

### 1. [ISSUE-001] GitHub Mobile App Markdown Render Crash
* **Status:** Open / Unresolved
* **Priority:** Low
* **Description:** The repository `README.md` fails to load, displays as a blank screen, or crashes on the native GitHub mobile application.
* **Root Cause:** The mobile app's Markdown parser does not support LaTeX/MathJax mathematical blocks (`$$` and `$`) and hangs when parsing complex formulas or nested equations.
* **Temporary Workaround:** Access the repository via a mobile web browser (Chrome/Safari) where MathJax is correctly initialized, or manually tap the `README.md` file rather than relying on the repository homepage auto-render.

### 2. [ISSUE-002] Implement Login Authentication
* **Status:** New
* **Priority:** High
* **Description:** Add a complete user signup, login, and session persistence authentication flow (e.g., via Supabase Auth) to secure custom strategy data and individual user workspaces.

### 3. [ISSUE-003] Extract Detailed Landing Page Documentation Sub-page
* **Status:** New
* **Priority:** Medium
* **Description:** Migrate comprehensive technical documentation and system guides from the root README into a dedicated standalone documentation view on the frontend, linked directly from the navigation bar.

### 4. [ISSUE-004] Support Email Notifications & Alerts
* **Status:** New
* **Priority:** Medium
* **Description:** Extend the background alert monitor daemon (`alertMonitor.ts`) to dispatch real-time price-crossing signals via email (e.g., using SendGrid, Resend, or SMTP) as an alternative to Telegram bot notifications.

### 5. [ISSUE-005] Add React Native / PWA Mobile Install Add-on
* **Status:** New
* **Priority:** Low
* **Description:** Incorporate progressive web app (PWA) manifest files, service worker configuration, and add-to-home-screen install prompts to allow users to install the dashboard as a native mobile application.

---

## 📋 Issue Log Template

Copy this template to register new issues:

```markdown
### [ISSUE-XXX] Short Descriptive Title
* **Status:** [New / In Progress / Resolved]
* **Priority:** [High / Medium / Low]
* **Description:** Detailed description of the problem, including what part of the application is affected.
* **Reproduction Steps:**
  1. Go to '...'
  2. Click on '...'
  3. See error
* **Root Cause:** (Optional) Technical analysis of why the issue occurs.
* **Proposed Solution / Workaround:** (Optional) Proposed patch or workaround.
```
