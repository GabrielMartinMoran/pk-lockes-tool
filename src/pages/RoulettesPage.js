/**
 * Roulettes page - displays available roulettes and allows spinning
 */

import RouletteService from '../services/RouletteService.js';
import RouletteComponent from '../components/Roulette.js';

const RoulettesPage = (container) => {
  let state = {
    roulettes: [],
    selectedRoulette: null,
    loading: true,
    error: null
  };
  
  const render = () => html`
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="title-icon">🎰</span>
          Ruletas Disponibles
        </h1>
        <p class="page-subtitle">
          Gira las ruletas para obtener nuevas cartas para tu colección
        </p>
      </div>
      
      <div class="page-content">
      
      ${state.loading ? html`
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Cargando ruletas...</p>
        </div>
      ` : ''}
      
      ${state.error ? html`
        <div class="error-container">
          <p class="error-message">❌ ${state.error}</p>
          <button class="retry-button">Reintentar</button>
        </div>
      ` : ''}
      
      ${!state.loading && !state.error ? html`
        <div class="roulettes-container">
          ${state.roulettes.length === 0 ? html`
            <div class="empty-state">
              <div class="empty-icon">🎰</div>
              <h3>No hay ruletas disponibles</h3>
              <p>No se pudo cargar el archivo config/roulettes-config.json</p>
              <p>Verifica que el archivo existe y está bien formateado.</p>
            </div>
          ` : ''}
          
          ${state.selectedRoulette ? html`
            <div class="roulette-view">
              <div class="roulette-nav">
                <button class="back-button">
                  ← Volver a la lista
                </button>
              </div>
              <div id="selected-roulette"></div>
            </div>
          ` : html`
            <div class="roulettes-grid">
              ${state.roulettes.map(roulette => html`
                <div class="roulette-card" data-roulette-id="${roulette.id}">
                  <div class="roulette-card-header">
                    <h3 class="roulette-card-title">${roulette.name}</h3>
                  </div>
                  
                  <div class="roulette-card-body">
                    <p class="roulette-card-description">${roulette.description}</p>
                    
                    <div class="roulette-preview">
                      ${roulette.segments.slice(0, 4).map(segment => html`
                        <span class="preview-segment" style="background-color: ${segment.color}">
                          ${segment.label}
                        </span>
                      `).join('')}
                      ${roulette.segments.length > 4 ? html`
                        <span class="preview-more">+${roulette.segments.length - 4} más</span>
                      ` : ''}
                    </div>
                  </div>
                  
                  <div class="roulette-card-footer">
                    <button class="select-roulette-button" data-roulette-id="${roulette.id}">
                      <span class="button-icon">🎰</span>
                      <span class="button-text">Usar Ruleta</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      ` : ''}
      </div>
    </div>
  `;
  
  const mount = () => {
    container.innerHTML = render();
    bindEvents();
    
    // Mount selected roulette component if any
    if (state.selectedRoulette) {
      const rouletteContainer = container.querySelector('#selected-roulette');
      if (rouletteContainer) {
        const rouletteComponent = RouletteComponent(rouletteContainer, {
          roulette: state.selectedRoulette
        });
        rouletteComponent.mount();
      }
    }
  };
  
  const init = () => {
    mount();
    loadRoulettes();
  };
  
  const bindEvents = () => {
    // Retry button
    const retryButton = container.querySelector('.retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        setState({ loading: true, error: null });
        loadRoulettes();
      });
    }
    

    
    // Select roulette buttons
    const selectButtons = container.querySelectorAll('.select-roulette-button');
    selectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const rouletteId = e.currentTarget.getAttribute('data-roulette-id');
        handleSelectRoulette(rouletteId);
      });
    });
    
    // Back button
    const backButton = container.querySelector('.back-button');
    if (backButton) {
      backButton.addEventListener('click', () => {
        setState({ selectedRoulette: null });
      });
    }
  };
  
  const loadRoulettes = async () => {
    try {
      setState({ loading: true, error: null });
      
      const roulettes = await RouletteService.getActiveRoulettes();
      
      setState({ 
        roulettes: roulettes,
        loading: false,
        error: null 
      });
    } catch (error) {
      console.error('Error loading roulettes:', error);
      setState({ 
        loading: false, 
        error: 'No se pudieron cargar las ruletas' 
      });
    }
  };
  

  
  const handleSelectRoulette = (rouletteId) => {
    const roulette = state.roulettes.find(r => r.id === rouletteId);
    if (roulette) {
      setState({ selectedRoulette: roulette });
    }
  };
  
  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };
  
  // Helper function to show notifications
  const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };
  
  return {
    mount,
    init,
    setState,
    getState: () => state
  };
};

export default RoulettesPage;
