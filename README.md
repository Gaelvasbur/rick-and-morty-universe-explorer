# 🚀 Rick and Morty Universe Explorer

A responsive single-page web application built with vanilla web technologies. It fetches data from the official Rick and Morty API, featuring real-time search, advanced filtering, and a favorites system.

## 🌟 Key Features

* **Dynamic Character Directory:** Real-time search and filtering by status and species using URL query parameters.
* **On-Demand Data Fetching:** Loads detailed character information via API requests only when a user opens a modal, saving network bandwidth.
* **Tab-Based Navigation:** Clean layout to switch between characters, episodes, locations, and user settings.
* **Favorites System:** Saves user preferences locally using the browser's `localStorage`.
* **Error Handling & Loading States:** Built-in UI indicators for loading states and 404/network errors.
* **Responsive Design:** Mobile-first layout built with CSS Grid and Flexbox.

## 🛠️ Tech Stack & Concepts

* **Frontend:** Semantic HTML5, CSS3 (Grid, Flexbox, Custom Properties).
* **JavaScript (ES6+):** Async/Await, Fetch API, LocalStorage, DOM Manipulation.
* **Performance & Security:** Image lazy loading and input sanitization (`encodeURIComponent`).

## ⚙️ Architecture & Best Practices

* **Separation of Concerns:** Independent JavaScript functions handling state logic separate from UI rendering.
* **Event Delegation:** Uses single event listeners on parent elements to manage dynamic components and optimize memory usage.


## 🌐 Project Link
You can view the live project here: 
👉 https://gaelvasbur.github.io/rick-and-morty-universe-explorer/
