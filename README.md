# 🚀 Rick and Morty Universe Explorer

A high-performance, fully responsive single-page web application built with vanilla web technologies. It consumes data from the official Rick and Morty REST API, enabling real-time discovery, advanced filtering, and local data persistence.

## 🌟 Key Features Implemented

* **Dynamic Character Directory:** Real-time search and multi-criteria filtering (status & species) using clean URL Query Strings.
* **Asynchronous Modal Architecture:** Demanded single-resource API fetching (`/character/{id}`) upon user interaction to optimize network performance.
* **Robust State & View Management:** Multi-tab layout orchestrating characters, episodes, locations, and user preferences cleanly.
* **Persistent Favorites System:** Built-in client-side data persistence leveraging the browser's Web Storage API (`localStorage`).
* **UI/UX Resilience:** Comprehensive error boundaries (404 and network fail control) paired with immediate loading indicators.
* **Responsive Layout:** Responsive Grid and Flexbox layouts optimized with a mobile-first approach.

## 🛠️ Tech Stack & Concepts Demonstrated

* **Core Web:** Semantic HTML5, Responsive CSS3 (CSS Grid & Flexbox, CSS Custom Properties).
* **JavaScript (ES6+):** Async/Await, Fetch API, LocalStorage, Event Bubbling/Propagation Control, Dynamic DOM Manipulation.
* **Performance:** Lazy Loading images (`loading="lazy"`), resource isolation, and input sanitization (`encodeURIComponent`).

## ⚙️ Architecture Highlights (Clean Code)

* **Separation of Concerns:** Isolated modular functions handling state orchestration separate from direct DOM rendering.
* **Event Delegation:** Optimized single-execution listener setups preventing memory leaks during dynamic component lifecycle shifts.

## 🌐 Project Link
You can view the live project here: 
👉 https://gaelvasbur.github.io/js-entrega-de-proyecto/
