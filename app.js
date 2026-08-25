// ==========================================
// CHAPTER 1: DOM SELECTORS & GLOBAL STATE
// ==========================================

const cardsGrid = document.getElementById('cards-grid');
const loadingSpinner = document.getElementById('loading-spinner');
const errorMessage = document.getElementById('error-message');

// Selectores de los filtros de control
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const speciesFilter = document.getElementById('species-filter');
const filtersSection = document.getElementById('filters-section');

// Elementos del sistema de paginación
const paginationContainer = document.getElementById('pagination-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageIndicator = document.getElementById('page-indicator');

// Elementos de navegación por pestañas (Tabs)
const tabCharacters = document.getElementById('tab-characters');
const tabEpisodes = document.getElementById('tab-episodes');
const tabFavorites = document.getElementById('tab-favorites');

// Elementos de la ventana modal de detalles
const detailModal = document.getElementById('detail-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalBody = document.getElementById('modal-body');

// Definición de Estados Mutables de la Aplicación
let currentView = 'characters'; 
let currentPage = 1;            
let maxPages = 1;               
let favoriteIds = [];       


// ==========================================
// CHAPTER 2: APPLICATION INITIALIZATION
// ==========================================

// Inicialización de la aplicación al cargar el documento
function init() {
    loadFavoritesFromStorage(); 
    setupNavigation();         
    setupFilterEvents();       
    setupPaginationEvents();   
    setupModalEvents();        
    fetchAndRender();        
}


// ==========================================
// CHAPTER 3: DATA PERSISTENCE MANAGEMENT
// ==========================================

// Carga la lista de favoritos desde el LocalStorage corporativo, solo se manipulan los ids[] que queremos poner en favoritos
function loadFavoritesFromStorage() {
    const savedFavs = localStorage.getItem('rickMortyFavs'); // Recupera los elementos bajo la clave establecida
    if (savedFavs) {
        favoriteIds = JSON.parse(savedFavs); // Transforma la cadena JSON plana en un array numérico manipulable
    }
}

// Guarda la lista de favoritos actualizando el LocalStorage
function saveFavoritesToStorage() {
    localStorage.setItem('rickMortyFavs', JSON.stringify(favoriteIds)); // Sincroniza y serializa el estado
}

// Invierte el estado de favorito de un ID de personaje específico (Interruptor de favorito)
function toggleFavorite(id, event) {
    event.stopPropagation(); // Evita que el clic en la estrella abra también el modal de detalle del personaje
    
    if (favoriteIds.includes(id)) {
        favoriteIds = favoriteIds.filter(favId => favId !== id); // Lo remueve de la lista si ya existía (se recorre la lista con la variable temporal favId, y deja pasar únicamente a los elementos cuyo favId SEA DIFERENTE al id de la estrella que acabo de tocar. A ese que es igual, no lo dejes pasar y déjalo fuera del nuevo arreglo)
    } else {
        favoriteIds.push(id); // Lo incorpora a la lista si es nuevo
    }
    
    saveFavoritesToStorage(); // Persiste el cambio, necesaria para no tener que volver a llamar a toggle para que funcione y quede guardado
    
    // Si el usuario está parado en la pestaña de favoritos, redibuja inmediatamente la vista limpia
    if (currentView === 'favorites') {
        fetchAndRender();
    } else {
        // Si está en personajes normales, solo actualiza la estrella visualmente sin recargar el servidor
        const starBtn = event.currentTarget;
        starBtn.textContent = favoriteIds.includes(id) ? '⭐' : '☆';
    }
}


// ==========================================
//  CHAPTER 4: ASYNC FLOW CONTROLLER
// ==========================================

async function fetchAndRender() {
    showLoading(true); 
    showError(false);   
    cardsGrid.innerHTML = ''; 

    try {
        if (currentView === 'characters') {  
            filtersSection.classList.remove('hidden'); 
            paginationContainer.classList.remove('hidden');
            await fetchCharacters(); 
        } else if (currentView === 'episodes') {
            filtersSection.classList.add('hidden');
            paginationContainer.classList.remove('hidden'); 
            await fetchEpisodes(); 
        } else if (currentView === 'favorites') {
            filtersSection.classList.add('hidden');
            paginationContainer.classList.add('hidden'); 
            await fetchSpecificFavoriteCharacters();
        }
    } catch (error) {
        showError(true, error.message); 
    } finally {
        showLoading(false); 
    }
}


// ==========================================
// CHAPTER 5: API ENDPOINT CONSUMPTION
// ==========================================

async function fetchCharacters() {
    const name = searchInput.value.trim();
    const status = statusFilter.value;
    const species = speciesFilter.value;

    let url = `https://rickandmortyapi.com/api/character/?page=${currentPage}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (status) url += `&status=${status}`;
    if (species) url += `&species=${species}`;

    const response = await fetch(url);
    
    if (response.status === 404) {
        throw new Error('No characters match your search criteria.');
    }
    if (!response.ok) {
        throw new Error('Network error or server misconfiguration. Please try again.');
    }

    const data = await response.json();
    maxPages = data.info.pages; 
    updatePaginationUI();     
    renderCharactersList(data.results);
}

async function fetchEpisodes() {
    const url = `https://rickandmortyapi.com/api/episode/?page=${currentPage}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Could not fetch episodes dataset.');
    }

    const data = await response.json();
    maxPages = data.info.pages;
    updatePaginationUI();
    renderEpisodesList(data.results);
}

async function fetchSpecificFavoriteCharacters() {
    if (favoriteIds.length === 0) {
        cardsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">You have no favorite characters saved yet.</p>`;
        return;
    }

    const url = `https://rickandmortyapi.com/api/character/${favoriteIds.join(',')}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to retrieve your favorite characters.');
    }

    const data = await response.json();
    
    const normalizedData = Array.isArray(data) ? data : [data];
    renderCharactersList(normalizedData);
}

async function fetchSingleCharacterDetails(id) {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
    if (!response.ok) throw new Error('Could not load detailed information.');
    return await response.json();
}


// ==========================================
// CHAPTER 6: DOM COMPONENT RENDERING
// ==========================================

function renderCharactersList(characters) {
    characters.forEach(character => {
        const card = document.createElement('div'); 
        card.className = 'card';
        card.addEventListener('click', () => openCharacterModal(character.id));

        const isFav = favoriteIds.includes(character.id); 

        card.innerHTML = `
            <img src="${character.image}" alt="${character.name}" loading="lazy">
            <div class="card-info">
                <h3>${character.name}</h3>
                <p><strong>Species:</strong> ${character.species}</p>
                <p><strong>Status:</strong> ${character.status}</p>
                <button class="fav-badge-btn" aria-label="Toggle Favorite">
                    ${isFav ? '⭐' : '☆'}
                </button>
            </div>
        `; 

        const favBtn = card.querySelector('.fav-badge-btn');
        favBtn.addEventListener('click', (event) => toggleFavorite(character.id, event)); 

        cardsGrid.appendChild(card); 
    });
}

function renderEpisodesList(episodes) {  
    episodes.forEach(episode => {
        const card = document.createElement('div'); 
        card.className = 'card'; 
        card.style.cursor = 'default';

        card.innerHTML = `
            <div class="card-info" style="gap: 12px;">
                <h3 style="color: var(--accent-color);">${episode.name}</h3>
                <p><strong>Code:</strong> ${episode.episode}</p>
                <p><strong>Air Date:</strong> ${episode.air_date}</p>
                <p style="font-size: 14px; color: var(--text-muted);">${episode.characters.length} Characters participating</p> 
            </div>
        `;
        cardsGrid.appendChild(card); 
    });
}

async function openCharacterModal(id) {
    try {
        modalBody.innerHTML = `<p style="text-align:center; color: var(--accent-color);">Loading details...</p>`; 
        detailModal.classList.remove('hidden'); 

        const character = await fetchSingleCharacterDetails(id); 

        modalBody.innerHTML = `
            <div class="modal-detail-body">
                <img src="${character.image}" alt="${character.name}">
                <h2>${character.name}</h2>
                <p><strong>Status:</strong> ${character.status}</p>
                <p><strong>Species:</strong> ${character.species}</p>
                <p><strong>Gender:</strong> ${character.gender}</p>
                <p><strong>Origin:</strong> ${character.origin.name}</p>
                <p><strong>Last Known Location:</strong> ${character.location.name}</p>
                <p><strong>Featured in:</strong> ${character.episode.length} episodes</p> 
            </div>
        `; 
    } catch (error) {
        modalBody.innerHTML = `<p class="error-box">${error.message}</p>`; 
    }
}


// ===============================================
// CHAPTER 7: EVENT LISTENERS CONFIGURATION
// ===============================================

function setupNavigation() {
    const tabs = [tabCharacters, tabEpisodes, tabFavorites]; 

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            tabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');

            if (e.target === tabCharacters) currentView = 'characters';
            if (e.target === tabEpisodes) currentView = 'episodes';
            if (e.target === tabFavorites) currentView = 'favorites';

            currentPage = 1; 
            fetchAndRender(); 
        });
    });
}

function setupFilterEvents() {
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        fetchAndRender();
    });

    statusFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchAndRender();
    });

    speciesFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchAndRender();
    });
}

function setupPaginationEvents() {
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) { 
            currentPage--; 
            fetchAndRender(); 
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < maxPages) { 
            currentPage++; 
            fetchAndRender(); 
        }
    });
}

function setupModalEvents() {
    closeModalBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden'); 
    });

    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) { 
            detailModal.classList.add('hidden'); 
        }
    });
}

// ===========================================
// CHAPTER 8: INTERFACE UTILITY FUNCTIONS
// ===========================================

function updatePaginationUI() {
    pageIndicator.textContent = `Page ${currentPage} of ${maxPages}`; 
    prevBtn.disabled = currentPage === 1; 
    nextBtn.disabled = currentPage === maxPages; 
}

function showLoading(isVisible) {
    if (isVisible) {
        loadingSpinner.classList.remove('hidden'); 
    } else {
        loadingSpinner.classList.add('hidden'); 
    }
}

function showError(isVisible, message = '') {
    if (isVisible) {
        errorMessage.textContent = message; 
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden'); 
        errorMessage.textContent = ''; 
    }
}


// ==========================================
// EPILOGUE: INITIAL EXECUTION TRIGGER
// ==========================================

init();



                
