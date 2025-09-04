/**
 * Main application entry point
 */

import Router from './utils/Router.js';
import NavigationComponent from './components/Navigation.js';
import RoulettesPage from './pages/RoulettesPage.js';
import CardsPage from './pages/CardsPage.js';
import ShopPage from './pages/ShopPage.js';

console.log('📦 Modules loaded successfully');

// Debug: Log any uncaught errors
window.addEventListener('error', (e) => {
  console.error('🚨 Uncaught error:', e.error);
});

// Debug: Log any unhandled promise rejections  
window.addEventListener('unhandledrejection', (e) => {
  console.error('🚨 Unhandled promise rejection:', e.reason);
});

// Initialize the application
const App = (() => {
  let navigation = null;
  
  const init = () => {
    try {
      console.log('🔧 Setting up app components...');
      
      // Check if required DOM elements exist
      const app = $('#app');
      const navContainer = $('#navigation');
      const mainContent = $('#main-content');
      const loadingScreen = $('#initial-loading');
      
      console.log('🔍 DOM elements check:', {
        app: !!app,
        navigation: !!navContainer,
        mainContent: !!mainContent,
        loadingScreen: !!loadingScreen
      });
      
      if (!app || !navContainer || !mainContent) {
        throw new Error('Required DOM elements not found');
      }
      
      // Hide initial loading screen
      if (loadingScreen) {
        loadingScreen.style.display = 'none';
        console.log('✅ Loading screen hidden');
      }
      
      // Initialize navigation
      console.log('🔧 Initializing navigation...');
      navigation = NavigationComponent(navContainer);
      navigation.mount();
      
      // Expose navigation globally for coin updates
      window.navigation = navigation;
      console.log('✅ Navigation initialized');
      
      // Setup routes
      console.log('🔧 Setting up routes...');
      setupRoutes();
      console.log('✅ Routes configured');
      
      // Initialize router
      console.log('🔧 Initializing router...');
      Router.setDefaultRoute('roulettes');
      Router.init();
      console.log('✅ Router initialized');
      
      console.log('🚀 Pokémon Lockes App initialized successfully!');
      
    } catch (error) {
      console.error('💥 Error during app initialization:', error);
      
      // Show error to user
      const app = $('#app');
      if (app) {
        app.innerHTML = html`
          <div style="padding: 2rem; text-align: center; color: #ef4444; font-family: Arial, sans-serif; background: #1e293b; min-height: 100vh; display: flex; align-items: center; justify-content: center;">
            <div>
              <h1 style="color: #f8fafc;">💥 Error de Inicialización</h1>
              <p style="color: #cbd5e1;">La aplicación no pudo iniciarse correctamente.</p>
              <p style="color: #94a3b8; font-family: monospace;">${error.message}</p>
              <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-size: 1rem; margin-top: 1rem;">
                🔄 Reintentar
              </button>
            </div>
          </div>
        `;
      }
    }
  };
  
  const setupRoutes = () => {
    const mainContent = $('#main-content');
    
    if (!mainContent) {
      console.error('Main content container not found');
      return;
    }
    
    // Roulettes page
    Router.addRoute('roulettes', () => {
      updateNavigation('roulettes');
      const roulettesPage = RoulettesPage(mainContent);
      roulettesPage.init();
    });
    
    // Cards page
    Router.addRoute('cards', () => {
      updateNavigation('cards');
      const cardsPage = CardsPage(mainContent);
      cardsPage.init();
    });
    
    // Shop page
    Router.addRoute('shop', () => {
      updateNavigation('shop');
      const shopPage = ShopPage(mainContent);
      shopPage.init();
    });
    
    // Collection page (alias for cards with different filter)
    Router.addRoute('collection', () => {
      updateNavigation('collection');
      const cardsPage = CardsPage(mainContent);
      cardsPage.init();
    });
    
    // Settings page (placeholder)
    Router.addRoute('settings', () => {
      updateNavigation('settings');
      mainContent.innerHTML = html`
        <div class="page settings-page">
          <div class="page-header">
            <h1 class="page-title">
              <span class="title-icon">⚙️</span>
              Configuración
            </h1>
          </div>
          <div class="settings-content">
            <div class="setting-group">
              <h3>Almacenamiento</h3>
              <button class="danger-button" id="clear-all-data">
                🗑️ Limpiar todos los datos
              </button>
              <p class="setting-description">
                Elimina todas las cartas y configuraciones guardadas.
              </p>
            </div>
          </div>
        </div>
      `;
      
      // Bind settings events
      const clearButton = $('#clear-all-data');
      if (clearButton) {
        clearButton.addEventListener('click', handleClearAllData);
      }
    });
  };
  
  const updateNavigation = (currentRoute) => {
    if (navigation) {
      navigation.setCurrentRoute(currentRoute);
    }
  };
  
  const handleClearAllData = () => {
    if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
      try {
        // Clear localStorage with our prefix
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith('pokemon_lockes_')
        );
        keys.forEach(key => localStorage.removeItem(key));
        
        showNotification('✅ Todos los datos han sido eliminados');
        
        // Redirect to roulettes page
        setTimeout(() => {
          Router.navigate('roulettes');
        }, 1500);
      } catch (error) {
        console.error('Error clearing data:', error);
        showNotification('❌ Error al limpiar los datos');
      }
    }
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
    init
  };
})();

// Initialize app when DOM is ready
const initializeApp = () => {
  try {
    console.log('🚀 Initializing Pokémon Lockes App...');
    
    // Add a small delay to ensure DOM is fully ready
    setTimeout(() => {
      App.init();
    }, 100);
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: #ef4444; font-family: Arial, sans-serif;">
        <h1>❌ Error al cargar la aplicación</h1>
        <p>Hubo un problema al inicializar la aplicación:</p>
        <pre style="background: #1e293b; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0; text-align: left;">${error.message}</pre>
        <p>Por favor, revisa la consola del navegador para más detalles.</p>
        <button onclick="location.reload()" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.375rem; cursor: pointer;">
          Recargar Página
        </button>
      </div>
    `;
  }
};

if (document.readyState === 'loading') {
  console.log('⏳ DOM is loading, waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  console.log('✅ DOM already loaded, initializing immediately...');
  initializeApp();
}

// Additional fallback timeout in case something goes wrong
setTimeout(() => {
  if (!window.navigation) {
    console.log('⏰ Fallback timeout: Force initializing app...');
    initializeApp();
  } else {
    console.log('✅ App already initialized, fallback not needed');
  }
}, 3000);
