/**
 * Cards page - displays user's card collection with filtering and management
 */

import CardService from '../services/CardService.js';
import CardComponent from '../components/Card.js';

const CardsPage = (container) => {
  let state = {
    cards: [],
    filteredCards: [],
    loading: true,
    error: null,
    filters: {
      search: '',
      rarity: 'all',
      status: 'available' // all, available, used
    },
    sortBy: 'obtainedAt', // obtainedAt, name, rarity
    sortOrder: 'desc', // asc, desc
    stats: null
  };
  
  const render = () => html`
    <div class="page cards-page">
      <div class="page-header">
        <h1 class="page-title">
          <span class="title-icon">🃏</span>
          Mis Cartas
        </h1>
        <p class="page-description">
          Administra tu colección de cartas obtenidas de las ruletas
        </p>
      </div>
      
      ${state.loading ? html`
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando cartas...</p>
        </div>
      ` : ''}
      
      ${state.error ? html`
        <div class="error-container">
          <p class="error-message">❌ ${state.error}</p>
          <button class="retry-button">Reintentar</button>
        </div>
      ` : ''}
      
      ${!state.loading && !state.error ? html`
        <div class="cards-container">
          ${state.stats ? html`
            <div class="cards-stats">
              <div class="stat-card">
                <span class="stat-value">${state.stats.total}</span>
                <span class="stat-label">Total</span>
              </div>
              <div class="stat-card available">
                <span class="stat-value">${state.stats.available}</span>
                <span class="stat-label">Disponibles</span>
              </div>
              <div class="stat-card used">
                <span class="stat-value">${state.stats.used}</span>
                <span class="stat-label">Usadas</span>
              </div>
            </div>
          ` : ''}
          
          <div class="cards-controls">
            <div class="cards-filters">
              <div class="filter-group">
                <input 
                  type="text" 
                  class="search-input" 
                  placeholder="Buscar cartas..."
                  value="${state.filters.search}"
                >
              </div>
              

              <div class="filter-group">
                <select class="filter-select" data-filter="rarity">
                  <option value="all">Todas las rarezas</option>
                  <option value="common" ${state.filters.rarity === 'common' ? 'selected' : ''}>Común</option>
                  <option value="uncommon" ${state.filters.rarity === 'uncommon' ? 'selected' : ''}>Poco común</option>
                  <option value="rare" ${state.filters.rarity === 'rare' ? 'selected' : ''}>Rara</option>
                  <option value="epic" ${state.filters.rarity === 'epic' ? 'selected' : ''}>Épica</option>
                  <option value="legendary" ${state.filters.rarity === 'legendary' ? 'selected' : ''}>Legendaria</option>
                </select>
              </div>
              
              <div class="filter-group">
                <select class="filter-select" data-filter="status">
                  <option value="all">Todas</option>
                  <option value="available" ${state.filters.status === 'available' ? 'selected' : ''}>Disponibles</option>
                  <option value="used" ${state.filters.status === 'used' ? 'selected' : ''}>Usadas</option>
                </select>
              </div>
            </div>
            
            <div class="cards-sorting">
              <select class="sort-select" data-sort="by">
                <option value="obtainedAt" ${state.sortBy === 'obtainedAt' ? 'selected' : ''}>Fecha obtenida</option>
                <option value="name" ${state.sortBy === 'name' ? 'selected' : ''}>Nombre</option>
                <option value="rarity" ${state.sortBy === 'rarity' ? 'selected' : ''}>Rareza</option>
              </select>
              
              <button class="sort-order-button ${state.sortOrder}" data-sort="order">
                ${state.sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          
          ${state.cards.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-icon">🃏</div>
              <h3>No tienes cartas aún</h3>
              <p>Ve a las ruletas para obtener tus primeras cartas.</p>
              <button class="go-to-roulettes-button">
                Ir a Ruletas
              </button>
            </div>
          ` : state.filteredCards.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-icon">🔍</div>
              <h3>No se encontraron cartas</h3>
              <p>Prueba ajustando los filtros de búsqueda.</p>
              <button class="clear-filters-button">
                Limpiar Filtros
              </button>
            </div>
          ` : html`
            <div class="cards-grid" id="cards-grid">
              <!-- Cards will be rendered here -->
            </div>
          `}
        </div>
      ` : ''}
    </div>
  `;
  
  const mount = () => {
    container.innerHTML = render();
    bindEvents();
    renderCards();
  };
  
  const init = () => {
    mount();
    loadCards();
  };
  
  const bindEvents = () => {
    // Retry button
    const retryButton = container.querySelector('.retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        setState({ loading: true, error: null });
        loadCards();
      });
    }
    
    // Search input
    const searchInput = container.querySelector('.search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        updateFilter('search', e.target.value);
      });
    }
    
    // Filter selects
    const filterSelects = container.querySelectorAll('.filter-select');
    filterSelects.forEach(select => {
      select.addEventListener('change', (e) => {
        const filterType = e.target.getAttribute('data-filter');
        updateFilter(filterType, e.target.value);
      });
    });
    
    // Sort controls
    const sortSelect = container.querySelector('.sort-select[data-sort="by"]');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        setState({ sortBy: e.target.value });
        applySorting();
      });
    }
    
    const sortOrderButton = container.querySelector('.sort-order-button');
    if (sortOrderButton) {
      sortOrderButton.addEventListener('click', () => {
        const newOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        setState({ sortOrder: newOrder });
        applySorting();
      });
    }
    
    // Navigation buttons
    const goToRoulettesButton = container.querySelector('.go-to-roulettes-button');
    if (goToRoulettesButton) {
      goToRoulettesButton.addEventListener('click', () => {
        // This should be handled by the router
        window.location.hash = 'roulettes';
      });
    }
    
    const clearFiltersButton = container.querySelector('.clear-filters-button');
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener('click', clearFilters);
    }
  };
  
  const loadCards = async () => {
    try {
      setState({ loading: true, error: null });
      
      const cards = CardService.getAllCards();
      const stats = CardService.getCardStats();
      
      setState({ 
        cards: cards,
        stats: stats,
        loading: false,
        error: null 
      });
      
      applyFilters();
    } catch (error) {
      console.error('Error loading cards:', error);
      setState({ 
        loading: false, 
        error: 'No se pudieron cargar las cartas' 
      });
    }
  };
  
  const renderCards = () => {
    const cardsGrid = container.querySelector('#cards-grid');
    if (!cardsGrid || state.filteredCards.length === 0) return;
    
    // Clear existing cards
    cardsGrid.innerHTML = '';
    
    // Render each card
    state.filteredCards.forEach(card => {
      const cardContainer = document.createElement('div');
      cardContainer.className = 'card-container';
      cardsGrid.appendChild(cardContainer);
      
      const cardComponent = CardComponent(cardContainer, {
        card: card,
        showActions: true,
        onDelete: handleCardDelete
      });
      cardComponent.mount();
    });
  };
  
  const updateFilter = (filterType, value) => {
    const newFilters = { ...state.filters, [filterType]: value };
    setState({ filters: newFilters });
    applyFilters();
  };
  
  const applyFilters = () => {
    let filtered = [...state.cards];
    
    // Apply search filter
    if (state.filters.search) {
      const searchTerm = state.filters.search.toLowerCase();
      filtered = filtered.filter(card => 
        card.name.toLowerCase().includes(searchTerm) ||
        card.description.toLowerCase().includes(searchTerm)
      );
    }
    

    // Apply rarity filter
    if (state.filters.rarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === state.filters.rarity);
    }
    
    // Apply status filter
    if (state.filters.status !== 'all') {
      const isUsed = state.filters.status === 'used';
      filtered = filtered.filter(card => card.used === isUsed);
    }
    
    setState({ filteredCards: filtered });
    applySorting();
  };
  
  const applySorting = () => {
    const sorted = [...state.filteredCards].sort((a, b) => {
      let aValue = a[state.sortBy];
      let bValue = b[state.sortBy];
      
      // Handle date strings
      if (state.sortBy === 'obtainedAt' || state.sortBy === 'usedAt') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // Handle string comparison
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      let comparison = 0;
      if (aValue < bValue) comparison = -1;
      if (aValue > bValue) comparison = 1;
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    setState({ filteredCards: sorted });
    renderCards();
  };
  
  const clearFilters = () => {
    setState({
      filters: {
        search: '',
        rarity: 'all',
        status: 'all'
      }
    });
    applyFilters();
  };
  
  const handleCardDelete = (cardId) => {
    // Reload cards after deletion
    loadCards();
  };
  
  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };
  
  return {
    mount,
    init,
    setState,
    getState: () => state
  };
};

export default CardsPage;
