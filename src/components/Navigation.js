/**
 * Navigation component for the main menu
 */

import Router from '../utils/Router.js';
import CoinDisplay from './CoinDisplay.js';

const NavigationComponent = (container) => {
  let state = {
    currentRoute: null,
    menuItems: [
      { path: 'roulettes', label: 'Ruletas', icon: '🎰' },
      { path: 'cards', label: 'Mis Cartas', icon: '🃏' },
      { path: 'shop', label: 'Tienda', icon: '🛒' },
      { path: 'collection', label: 'Colección', icon: '📚' }
    ],
    coinDisplay: null
  };
  
  const render = () => html`
    <div class="navigation-container">
      <div class="nav-header">
        <h1 class="app-title">
          <span class="title-icon">⚡</span>
          Pokémon Lockes
        </h1>
        <div id="coin-display-container"></div>
      </div>
      
      <nav class="nav-menu">
        ${state.menuItems.map(item => html`
          <button 
            class="nav-item ${state.currentRoute === item.path ? 'active' : ''}"
            data-route="${item.path}"
          >
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-label">${item.label}</span>
          </button>
        `).join('')}
      </nav>
      
      <div class="nav-footer">
        <button class="nav-item nav-settings" data-route="settings">
          <span class="nav-icon">⚙️</span>
          <span class="nav-label">Configuración</span>
        </button>
      </div>
    </div>
  `;
  
  const mount = () => {
    container.innerHTML = render();
    bindEvents();
    initializeCoinDisplay();
  };

  const initializeCoinDisplay = () => {
    const coinContainer = container.querySelector('#coin-display-container');
    if (coinContainer && !state.coinDisplay) {
      state.coinDisplay = CoinDisplay(coinContainer, { showLabel: false });
    }
  };
  
  const bindEvents = () => {
    const navItems = container.querySelectorAll('.nav-item[data-route]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const route = item.getAttribute('data-route');
        Router.navigate(route);
      });
    });
  };
  
  const setCurrentRoute = (route) => {
    state.currentRoute = route;
    mount();
  };
  
  const updateCoins = () => {
    if (state.coinDisplay) {
      state.coinDisplay.updateCoins();
    }
  };

  return {
    mount,
    setCurrentRoute,
    updateCoins
  };
};

export default NavigationComponent;
