# 🚀 Rick and Morty Universe Explorer

A responsive single-page web application built with vanilla web technologies. It fetches data from the official Rick and Morty API, featuring real-time search, advanced filtering, and a favorites system.

## 🌟 Key Features

* **Dynamic Character Directory:** Real-time search and multi-criteria filtering (status & species) integrated with dynamic URL tracking.
* **On-Demand Data Fetching:** Minimizes network bandwidth by fetching detailed character resources only when a user interacts with a specific modal.
* **Tab-Based Navigation:** Clean views orchestration to switch seamlessly between characters, episodes, and saved favorites.
* **Persistent Favorites System:** Built-in client-side data persistence leveraging the browser's Web Storage API (`localStorage`).
* **UI/UX Resilience:** Comprehensive error handling for network or search failures paired with immediate global loading indicators.
* **Responsive Layout:** Fluid layout built with CSS Grid and Flexbox using a mobile-first approach.

## 🛠️ Tech Stack & Concepts Demonstrated

* **Core Web:** Semantic HTML5, Responsive CSS3 (CSS Grid, Flexbox, CSS Custom Properties).
* **JavaScript (ES6+):** Async/Await, Fetch API, LocalStorage, Input Sanitization (`encodeURIComponent`), Event Bubbling/Propagation Control.

## ⚙️ Architecture & Best Practices

* **Separation of Concerns:** Independent architecture separating API data fetching, DOM rendering layers, and UI state management functions.
* **State Management:** Centralized global variables tracking application state (`currentView`, `currentPage`) to drive layout changes dynamically.
* **Modular Initialization:** Clean lifecycle setup execution via a core `init()` function to bind all listeners on document load.

## 🌐 Project Link
You can view the live project here: 
👉 https://gaelvasbur.github.io/rick-and-morty-universe-explorer/
