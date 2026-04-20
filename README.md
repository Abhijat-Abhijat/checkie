# Checkie 

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Checkie** is a high-performance, minimalist task management engine designed through the lens of cognitive ergonomics. It implements a "Zen-mode" workspace that enforces the philosophy of essentialism by strictly separating active cognitive load from historical data.

---

## 🏗️ Technical Architecture

### State Management & Data Persistence
The application utilizes a sophisticated local-first architecture. By leveraging the **Web Storage API**, the app achieves near-zero latency.
* **Derived State Patterns**: Uses `useMemo` hooks to compute active vs. archived collections, preventing unnecessary re-renders and maintaining O(1) performance for UI updates.
* **Persistence Layer**: Implements a robust synchronization effect that mirrors the React state to `localStorage`, ensuring a seamless user experience across session restarts.

### Human-Computer Interaction (HCI)
* **Audio Synthesis**: Instead of traditional assets, the app uses the **Web Audio API** to generate real-time oscillators for haptic-like auditory feedback.
* **Visual Feedback**: Integration of `canvas-confetti` and CSS3 hardware-accelerated transitions to reward task completion, utilizing the "Dopamine Loop" to increase user retention.
* **Responsive Layout**: A mobile-first, fluid grid system built with **Tailwind CSS**, supporting system-level dark mode detection.

---

## 🚀 Key Features

* **Daily Reset Logic**: An automated cron-like check within `useEffect` that detects calendar date changes to reset non-habit tasks, facilitating a "Clean Slate" methodology every morning.
* **Advanced Task Archetypes**: Support for "Habits" (recurring logic), "Priorities" (visual weighting), and "Categories" (logical grouping).
* **Interactive Archive**: A slide-out drawer implementation that acts as a low-priority data store, keeping the main thread focused exclusively on pending objectives.
* **Inline CRUD**: Full Create, Read, Update, and Delete capabilities with optimized inline editing to reduce modal fatigue.

---

## 🛠️ Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

1. **Clone the Repository**
   ```bash
   git clone [https://github.com/your-username/essentialist-focus.git](https://github.com/your-username/essentialist-focus.git)
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Launch Development Environment**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing & Quality Assurance

We prioritize reliability through automated testing. Contributions involving logic changes should include corresponding test cases.
* **Unit Testing**: We utilize `Vitest` and `React Testing Library` to validate component logic.
* **Running Tests**: 
  ```bash
  npm run test
  ```
* **Coverage**: Ensure new features maintain a minimum of 80% code coverage to pass CI/CD checks.

---

## 🤝 Contributing

We welcome open-source contributions, especially regarding new feature modules and robust test suites.

1. **Fork & Branch**: Create a feature branch (`git checkout -b feature/AmazingFeature`).
2. **Feature Proposals**: We are currently seeking:
    * **Advanced Analytics**: Data visualization for completion trends using Recharts.
    * **Keyboard Shortcuts**: Enhanced accessibility via global hotkeys.
    * **Performance Benchmarks**: Profiling re-render cycles under heavy state load.
3. **Commit Standards**: Follow [Conventional Commits](https://www.conventionalcommits.org/) (e.g., `feat:`, `fix:`, `test:`).
4. **Pull Requests**: Ensure your PR description details the problem solved and includes documentation for any new state logic.

---

## 👨‍💻 Interview Discussion Points

* **Why LocalStorage?** I chose a local-first approach to prioritize speed and offline capability, demonstrating an understanding of the "Offline-First" web movement.
* **Performance Optimization**: We can discuss how `useMemo` and the architectural split between active and completed tasks minimize the reconciliation cost in the virtual DOM.
* **UX Philosophy**: The intentional removal of "Done" tasks from the main view is a design choice to reduce visual noise and decision fatigue.

---

Developed with ❤️ for High-Performance Professionals.