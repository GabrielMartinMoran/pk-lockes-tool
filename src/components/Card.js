/**
 * Card component for displaying individual Pokemon cards
 */

import CardService from '../services/CardService.js';
import CoinService from '../services/CoinService.js';

const CardComponent = (container, props = {}) => {
  let state = {
    card: props.card || null,
    showActions: props.showActions !== false,
    compact: props.compact || false,
    ...props
  };
  
  const render = () => {
    if (!state.card) {
      return html`
        <div class="card-error">
          <p>❌ No se pudo cargar la carta</p>
        </div>
      `;
    }
    
    const card = state.card;
    
    return html`
      <div class="pokemon-card ${state.compact ? 'compact' : ''} ${card.used ? 'used' : 'available'}">
        <div class="card-inner">
          <div class="card-header">
            <h3 class="card-name">${card.name}</h3>
            <div class="card-meta">
              <span class="card-rarity rarity-${card.rarity}">${getRarityIcon(card.rarity)} ${getRarityLabel(card.rarity)}</span>
            </div>
          </div>
          
          ${card.image ? html`
            <div class="card-image">
              <img src="${card.image}" alt="${card.name}" loading="lazy">
            </div>
          ` : html`
            <div class="card-image placeholder">
              <span class="placeholder-icon">${getRarityIcon(card.rarity)}</span>
            </div>
          `}
          
          <div class="card-body">
            <p class="card-description">${card.description}</p>
            
            <div class="card-info">
              <div class="card-obtained">
                <small>Obtenida: ${formatDate(card.obtainedAt)}</small>
                ${card.obtainedFrom ? html`
                  <small>De: ${card.obtainedFrom}</small>
                ` : ''}
              </div>
              
              ${card.used ? html`
                <div class="card-used-info">
                  <span class="used-badge">✅ Usada</span>
                  <small>Usada: ${formatDate(card.usedAt)}</small>
                </div>
              ` : ''}
            </div>
          </div>
          
          ${state.showActions ? html`
            <div class="card-actions">
              ${!card.used ? html`
                <div class="primary-action">
                  <button class="action-button use-button" data-action="use">
                    <span class="button-icon">✅</span>
                    <span class="button-text">Usar Carta</span>
                  </button>
                </div>
                
                <div class="secondary-actions">
                  <button class="action-button sell-button" data-action="sell">
                    <span class="button-icon">💰</span>
                    <span class="button-text">Vender por ${getSellPrice(card.rarity)}</span>
                  </button>
                  
                  <button class="action-button delete-button" data-action="delete">
                    <span class="button-icon">🗑️</span>
                    <span class="button-text">Eliminar</span>
                  </button>
                </div>
              ` : html`
                <div class="primary-action">
                  <button class="action-button unuse-button" data-action="unuse">
                    <span class="button-icon">↩️</span>
                    <span class="button-text">Recuperar</span>
                  </button>
                </div>
                
                <div class="secondary-actions">
                  <button class="action-button delete-button" data-action="delete">
                    <span class="button-icon">🗑️</span>
                    <span class="button-text">Eliminar</span>
                  </button>
                </div>
              `}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  };
  
  const mount = () => {
    container.innerHTML = render();
    bindEvents();
  };
  
  const bindEvents = () => {
    const actionButtons = container.querySelectorAll('.action-button[data-action]');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const action = button.getAttribute('data-action');
        handleAction(action);
      });
    });
  };
  
  const handleAction = async (action) => {
    if (!state.card) return;
    
    try {
      let result = null;
      
      switch (action) {
        case 'use':
          result = CardService.useCard(state.card.id);
          if (result) {
            setState({ card: result });
            showNotification('✅ Carta usada correctamente');
          }
          break;
          
        case 'unuse':
          result = CardService.unuseCard(state.card.id);
          if (result) {
            setState({ card: result });
            showNotification('↩️ Carta recuperada');
          }
          break;
          
        case 'sell':
          const sellPrice = getSellPrice(state.card.rarity);
          if (confirm(`¿Estás seguro de que quieres vender "${state.card.name}" por ${sellPrice} monedas?`)) {
            const deleted = CardService.removeCard(state.card.id);
            if (deleted) {
              await CoinService.addCoins(sellPrice);
              showNotification(`💰 Carta vendida por ${sellPrice} monedas`);
              
              // Update navigation coin display
              if (window.navigation && window.navigation.updateCoins) {
                window.navigation.updateCoins();
              }
              
              // Notify parent component
              if (state.onDelete) {
                state.onDelete(state.card.id);
              }
            }
          }
          break;
          
        case 'delete':
          if (confirm('¿Estás seguro de que quieres eliminar esta carta?')) {
            const deleted = CardService.removeCard(state.card.id);
            if (deleted) {
              // Check if this was the last card of this type
              const remainingCards = CardService.getCardsByFilter({
                name: state.card.name,
                type: state.card.type,
                rarity: state.card.rarity
              });
              
              // If no more cards of this type, ask if they want to remove from shop too
              if (remainingCards.length === 0) {
                const removeFromShop = confirm(
                  `Ya no tienes más cartas de "${state.card.name}".\n\n` +
                  '¿También quieres eliminarla de la tienda? Si la eliminas, ya no podrás comprarla nuevamente.'
                );
                
                if (removeFromShop) {
                  CardService.lockCard(state.card);
                  showNotification('🗑️ Carta eliminada y removida de la tienda');
                } else {
                  showNotification('🗑️ Carta eliminada (sigue disponible en la tienda)');
                }
              } else {
                showNotification('🗑️ Carta eliminada');
              }
              
              // Notify parent component
              if (state.onDelete) {
                state.onDelete(state.card.id);
              }
            }
          }
          break;
          
        default:
          console.warn(`Unknown action: ${action}`);
      }
      
      if (!result && action !== 'delete') {
        showNotification('❌ No se pudo realizar la acción');
      }
    } catch (error) {
      console.error('Error handling card action:', error);
      showNotification('❌ Error al procesar la acción');
    }
  };
  
  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };
  
  // Helper function to get rarity label
  const getRarityLabel = (rarity) => {
    const rarityLabels = {
      common: 'Común',
      uncommon: 'Poco común',
      rare: 'Rara',
      epic: 'Épica',
      legendary: 'Legendaria'
    };
    return rarityLabels[rarity] || rarity;
  };

  // Helper function to get sell price (half of buy price)
  const getSellPrice = (rarity) => {
    const rarityPrices = {
      common: 10,
      uncommon: 25,
      rare: 50,
      epic: 100,
      legendary: 200
    };
    const buyPrice = rarityPrices[rarity] || 10;
    const sellPrice = Math.floor(buyPrice / 2);
    return sellPrice;
  };
  
  // Helper function to get rarity icon
  const getRarityIcon = (rarity) => {
    const rarityIcons = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };
    return rarityIcons[rarity] || '⚪';
  };
  
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };
  
  // Helper function to show notifications
  const showNotification = (message) => {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };
  
  return {
    mount,
    setState,
    getState: () => state
  };
};

export default CardComponent;
