// ==========================================
// CAPÍTULO 1: SELECTORES Y ESTADO GLOBAL
// ==========================================

// Elementos estructurales de la interfaz
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
let currentView = 'characters'; // Controla la pestaña activa: 'characters', 'episodes', 'favorites'
let currentPage = 1;            // Página actual en la consulta de la API
let maxPages = 1;               // Límite de páginas devuelto de forma dinámica por el servidor
let favoriteIds = [];           // Array numérico de IDs de personajes favoritos persistidos


// ==========================================
// CAPÍTULO 2: ARRANQUE E INICIALIZACIÓN
// ==========================================

// Inicialización de la aplicación al cargar el documento
function init() {
    loadFavoritesFromStorage(); // Recupera los marcadores favoritos desde el almacenamiento persistente (cap 3)
    setupNavigation();         // Configura los escuchadores para el cambio de pestañas principales (cap 7)
    setupFilterEvents();       // Inicializa los escuchadores de los inputs de filtrado y búsqueda (cap 7)
    setupPaginationEvents();   // Conecta los botones de adelantar o atrasar páginas (cap 7)
    setupModalEvents();        // Configura el cierre del panel de detalles flotante (cap 7)
    fetchAndRender();          // Realiza la primera llamada al servidor para renderizar datos iniciales (cap 7)
}


// ==========================================
// CAPÍTULO 3: GESTIÓN DE PERSISTENCIA DE DATOS
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
// CAPÍTULO 4: CONTROLADOR DE FLUJO ASÍNCRONO
// ==========================================

// Funcion que decide de dónde descargar y qué pintar en pantalla según el estado actual
async function fetchAndRender() {
    showLoading(true); // Enciende la interfaz visual del Spinner de carga
    showError(false);   // Oculta mensajes de fallos anteriores
    cardsGrid.innerHTML = ''; // Limpia las tarjetas para recibir el nuevo set de elementos, y dejas todos los demas elementos intactos

    try {
        if (currentView === 'characters') {  //Se agrega hidden pues en las otras pestañas no deben aparecer los filters y se quita pues en characters si deben aparecer
            filtersSection.classList.remove('hidden'); // Muestra los filtros específicos de personaje
            paginationContainer.classList.remove('hidden'); // Muestra los botones de paginación
            await fetchCharacters(); // Llama a la lógica de descarga de personajes (del capitulo 5)
        } else if (currentView === 'episodes') {
            filtersSection.classList.add('hidden'); // Oculta los filtros de personaje (no compatibles)
            paginationContainer.classList.remove('hidden'); 
            await fetchEpisodes(); // Llama a la lógica de descarga de episodios
        } else if (currentView === 'favorites') {
            filtersSection.classList.add('hidden'); // Los favoritos muestran un subset guardado de forma fija
            paginationContainer.classList.add('hidden'); // Oculta paginación ya que resolvemos en lote único local
            await fetchSpecificFavoriteCharacters(); // Llama a la lógica de renderizado de favoritos
        }
    } catch (error) {
        showError(true, error.message); // Muestra el mensaje de error en la caja de control si algo falla
    } finally {
        showLoading(false); // Apaga el Spinner de carga sin importar si la promesa fue exitosa o falló
    }
}


// ==========================================
// CAPÍTULO 5: LLAMADAS A LA API Y PROCESAMIENTO
// ==========================================

//Aqui tendras dos funciones fetchCharacters(), utilizada solamente para obtener los datos de las tarjetas miniatura basicas(que ves al inicio en characters), y fetchSingleCharacterDetails(id), para obtener todos los datos detalle de cada personaje a ser puestos luego en la ventana modal y por lo tanto en su funcion.
//Se hace en dos funciones, ya que en la primera, el servidor te devuelve listas de urls con la informacion de cada personaje y eso para 20 personajes, por lo que ralentizaria la app inecesariamente(tardaria eternidad en cargar) por eso es mejor usarla solo para las tarjetas miniatura, y despues con la otra funcion, ya usar los datos detallados para un personaje para el modal.
  //fetchCharacters() goes to renderCharactersList(data.results); para renderizar las mini tarjetas básicas y fetchSingleCharacterDetails(id) goes to openCharacterModal() que son justo para poner los detalles del personaje en el modal, ambas del capitulo 5 y luego pasan al 6.
  //Obviamente esta funcion renderCharactersList() y esta funcion openCharacterModal se conectan pues la primera tiene un evento que al hacer clic activa los datos de la segunda, los detalles del modal
// Consume el endpoint de personajes (la ruta de los personajes en la url)aplicando query parameters (?) de filtrado y paginación
async function fetchCharacters() {
    const name = searchInput.value.trim();
    const status = statusFilter.value;
    const species = speciesFilter.value;

    // Construcción dinámica de la URL con query strings (para que el usuario obtenga todos los personajes asi como los buscados sea por nombre estatus o especie para tarjetas miniatura)
    let url = `https://rickandmortyapi.com/api/character/?page=${currentPage}`;
    if (name) url += `&name=${encodeURIComponent(name)}`;
    if (status) url += `&status=${status}`;
    if (species) url += `&species=${species}`;

    const response = await fetch(url);
    
    if (response.status === 404) {
        throw new Error('No characters match your search criteria.'); // Excepción controlada para búsquedas vacías
    }
    if (!response.ok) {
        throw new Error('Network error or server misconfiguration. Please try again.');
    }

    const data = await response.json();
    maxPages = data.info.pages; // Actualiza el número máximo de páginas devuelto por la API
    updatePaginationUI();       // Sincroniza la interfaz de usuario de la paginación (capitulo 8)
    renderCharactersList(data.results); // Envía los objetos limpios a renderizado (capitulo 6)
}

// Consume el endpoint de episodios bajo demanda paginada
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

// Descarga en lote el listado exacto de los IDs guardados en favoritos
async function fetchSpecificFavoriteCharacters() {
    if (favoriteIds.length === 0) {
        cardsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">You have no favorite characters saved yet.</p>`;
        return;
    }

    // La API permite pedir múltiples IDs concatenándolos por comas: /api/character/1,2,3
    const url = `https://rickandmortyapi.com/api/character/${favoriteIds.join(',')}`;
    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('Failed to retrieve your favorite characters.');
    }

    const data = await response.json();
    
    // Si se pide solo 1 ID, la API devuelve un objeto directo en vez de un Array. Normalizamos el dato.
    const normalizedData = Array.isArray(data) ? data : [data];
    renderCharactersList(normalizedData);
}

// Descarga un único personaje por su ID para inyectarlo en el modal, esta ultima funcion no es para favoritos sino para obtener los detalles de cada personaje y pasarselos a openCharacterModal(id) por eso el mismo parametro
async function fetchSingleCharacterDetails(id) {
    const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
    if (!response.ok) throw new Error('Could not load detailed information.');
    return await response.json();
}


// ==========================================
// CAPÍTULO 6: CONSTRUCCIÓN COMPONENTES DEL DOM
// ==========================================
//Tenemos card.innerHTML que pinta la tarjeta principal, openCharacterModal(id) que pinta el spinner y luego los detalles del personaje, y es a esta funcion a la que la funcion anterior fetchSingleCharacterDetails, le entrega los datos del fetch para que puedan ser mostrados en el modal
// Renderiza las tarjetas de personajes en el Grid principal!(o sea en la pestaña de personajes)
function renderCharactersList(characters) {
    characters.forEach(character => {
        const card = document.createElement('div'); // Crea el contenedor de la tarjeta
        card.className = 'card'; // Le asigna la clase CSS para el diseño de tarjeta
        // Al hacer clic en la tarjeta, disparamos la apertura del modal con su ID
        card.addEventListener('click', () => openCharacterModal(character.id));

        const isFav = favoriteIds.includes(character.id); // Revisa si este personaje ya está en favoritos (en el array[])

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
        `; // Inyecta la estructura HTML interna de la tarjeta de personaje

        // Vinculamos el evento del botón de la estrella de forma aislada
        const favBtn = card.querySelector('.fav-badge-btn');
        favBtn.addEventListener('click', (event) => toggleFavorite(character.id, event)); //funcion del capitulo 3

        cardsGrid.appendChild(card); // Mete la tarjeta terminada dentro de la cuadrícula principal
    });
}

// Renderiza las tarjetas de episodios en el Grid principal
function renderEpisodesList(episodes) {  // obtiene los datos del fetch de fetchEpisodes() cap 5
    episodes.forEach(episode => {
        const card = document.createElement('div'); // Crea el contenedor para el episodio
        card.className = 'card'; // Usa la misma clase base de tarjeta
        card.style.cursor = 'default'; // Cambia el cursor a normal ya que los episodios no abren modal

        card.innerHTML = `
            <div class="card-info" style="gap: 12px;">
                <h3 style="color: var(--accent-color);">${episode.name}</h3>
                <p><strong>Code:</strong> ${episode.episode}</p>
                <p><strong>Air Date:</strong> ${episode.air_date}</p>
                <p style="font-size: 14px; color: var(--text-muted);">${episode.characters.length} Characters participating</p> 
            </div>
        `; // Inyecta los datos específicos del episodio (funciona pues recibes un objeto del episodio y una de las claves es personajes cuyo valor son urls que indican cada una un personaje, por lo que al recorrer character, es que obtienes los personajes de ese episodio)
        cardsGrid.appendChild(card); // Mete la tarjeta de episodio en la cuadrícula principal
    });
}

// Abre el modal flotante, muestra el spinner, descarga los datos específicos y finalmente los coloca como indicados en una plantilla (accediendo a cada dato por individual)
//como funciona? pues 1 se pinta el mensaje de carga en el modalBody (div3),  y despues se activan los 3 divs donde o sigue mostrando el loader, o si ya paso el await continua con el codigo para mostrar todos los datos del personaje
async function openCharacterModal(id) {
    try {
        modalBody.innerHTML = `<p style="text-align:center; color: var(--accent-color);">Loading details...</p>`; // Mensaje temporal de carga
        detailModal.classList.remove('hidden'); // Muestra la ventana modal quitando la clase que la oculta

        const character = await fetchSingleCharacterDetails(id); // Espera a que la API traiga los datos de este personaje único

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
        `; // Inyecta la información detallada completa dentro del modal (Aqui recibes un objeto personaje con todos sus datos y la clave episodio tiene urls representando cada episodio, por lo que al hacer episode.length, obtienes el total de episodios por personaje)
    } catch (error) {
        modalBody.innerHTML = `<p class="error-box">${error.message}</p>`; // Si falla la descarga del detalle, muestra el error dentro del modal
    }
}


// ===============================================
// CAPÍTULO 7: ESCUCHADORES DE EVENTOS (LISTENERS)
// ===============================================

//Todas estas funciones de eventos pareciera que se llaman una sola vez y se ejecutan una sola vez, ya que se vuelven a llamar en init() y gracias a ello es que funcionan.
// Configura la barra de navegación de pestañas (Tabs)
function setupNavigation() {
    const tabs = [tabCharacters, tabEpisodes, tabFavorites]; // Agrupa los tres botones en un array

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            // Remueve la clase active de todos los botones para apagarlos
            tabs.forEach(t => t.classList.remove('active'));
            // Añade la clase active únicamente al botón al que se le hizo clic, que unicamente lo que hace es iluminarlo de verde
            e.target.classList.add('active');

            // Cambia el estado de la vista actual según el botón presionado
            if (e.target === tabCharacters) currentView = 'characters';
            if (e.target === tabEpisodes) currentView = 'episodes';
            if (e.target === tabFavorites) currentView = 'favorites';

            currentPage = 1; // Reinicia siempre a la página 1 ante cualquier cambio de sección
            fetchAndRender(); // Vuelve a ejecutar la funcion para quitar o poner filters y paginacion cap 4, y abajo de estas llama a el cap5 para pintar lo de cada pestaña
        });
    });
}

// Configura los filtros de búsqueda en tiempo real
function setupFilterEvents() {
    // Escuchador de escritura en la barra de búsqueda por nombre
    searchInput.addEventListener('input', () => {
        currentPage = 1; // Resetea la página a la 1 porque el set de resultados cambió debido a la búsqueda
        fetchAndRender(); // Ejecuta la búsqueda de inmediato mientras el usuario escribe
    });

    // Escuchador para el cambio de opción en el filtro desplegable de Estado
    statusFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchAndRender();
    });

    // Escuchador para el cambio de opción en el filtro desplegable de Especie
    speciesFilter.addEventListener('change', () => {
        currentPage = 1;
        fetchAndRender();
    });
}

// Configura los controles para los botones de la paginación
function setupPaginationEvents() {
    // Escucha el clic en el botón de página Anterior
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) { // Valida que no intentemos ir abajo de la página 1
            currentPage--; // Resta uno a la página actual
            fetchAndRender(); // Descarga y dibuja los datos de la página anterior
        }
    });

    // Escucha el clic en el botón de página Siguiente
    nextBtn.addEventListener('click', () => {
        if (currentPage < maxPages) { // Valida que no superemos el límite de páginas del servidor
            currentPage++; // Suma uno a la página actual
            fetchAndRender(); // Descarga y dibuja los datos de la página siguiente
        }
    });
}

// Configura los eventos para cerrar la ventana modal de detalles (pareciera que solo se llama una vez en toda la app y es gracias a que la volvemos a llamar en init)
function setupModalEvents() {
    // Cierre al presionar el botón físico de la equis (X)
    closeModalBtn.addEventListener('click', () => {
        detailModal.classList.add('hidden'); // Oculta el modal añadiendo la clase de CSS
    });

    // Cierre inteligente al hacer clic en el fondo oscuro translúcido fuera de la caja de detalles
    detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) { // Si el clic ocurrió en el fondo y no adentro de la caja blanca
            detailModal.classList.add('hidden'); // Oculta el modal de inmediato
        }
    });
}

// ===========================================
// CAPÍTULO 8: FUNCIONES AUXILIARES DE INTERFAZ
// ===========================================

// Actualiza los estados de habilitación de los botones de paginación e indicadores numéricos
function updatePaginationUI() {
    pageIndicator.textContent = `Page ${currentPage} of ${maxPages}`; // Actualiza el texto en pantalla (ej: Page 2 of 42)
    prevBtn.disabled = currentPage === 1; // Desactiva el botón 'Previous' si el usuario ya está parado en la página 1
    nextBtn.disabled = currentPage === maxPages; // Desactiva el botón 'Next' si el usuario ya llegó a la última página disponible
}

// Muestra u oculta el spinner de carga de datos en la pantalla
function showLoading(isVisible) {
    if (isVisible) {
        loadingSpinner.classList.remove('hidden'); // Quita la clase oculta para que el mensaje de "Loading..." aparezca
    } else {
        loadingSpinner.classList.add('hidden'); // Añade la clase oculta para tapar el spinner cuando los datos ya llegaron
    }
}

// Enciende o apaga la visualización del bloque de alerta por errores de red o filtros vacíos
function showError(isVisible, message = '') {
    if (isVisible) {
        errorMessage.textContent = message; // Inyecta el texto del error que capturamos en el bloque try/catch
        errorMessage.classList.remove('hidden'); // Hace visible la caja de error de color rojo
    } else {
        errorMessage.classList.add('hidden'); // Oculta la caja de error si no hay fallos activos
        errorMessage.textContent = ''; // Limpia el texto residual del error anterior
    }
}


// ==========================================
// EPÍLOGO: EJECUCIÓN DEL DISPARO INICIAL
// ==========================================

// Ejecución Inicial: Arranca de forma automática todo el mecanismo (todo el codigo escrito) llamando al Capítulo 2 apenas se abre la página web
init();



                
