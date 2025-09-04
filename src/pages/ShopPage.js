/**
 * Shop page for purchasing unlocked cards
 */

import CardService from '../services/CardService.js';
import CoinService from '../services/CoinService.js';

const ShopPage = (container) => {
  let state = {
    unlockedCards: [],
    coins: 0,
    loading: true,
    purchasing: null,
    coinsConfig: null
  };

  const render = () => html`
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">🛒 Tienda de Cartas</h1>
        <p class="page-subtitle">Recompra cartas que ya has desbloqueado</p>
        
        <div class="shop-header">
          <div class="coin-balance">
            <span class="coin-icon">💰</span>
            <span class="coin-amount">${state.coins.toLocaleString()}</span>
            <span class="coin-label">monedas disponibles</span>
          </div>
          
          <div class="shop-actions">
            <button class="manage-coins-button" id="manage-coins-btn">
              <span>⚙️</span>
              Gestionar Monedas
            </button>
          </div>
        </div>
      </div>

      <div class="page-content">
        ${state.loading ? html`
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando tienda...</p>
          </div>
        ` : state.unlockedCards.length === 0 ? html`
          <div class="empty-state">
            <div class="empty-icon">🔒</div>
            <h3>No hay cartas desbloqueadas</h3>
            <p>Gira las ruletas para desbloquear cartas que luego podrás comprar aquí.</p>
          </div>
        ` : html`
          <div class="shop-grid">
            ${state.unlockedCards.map(card => renderShopCard(card)).join('')}
          </div>
        `}
      </div>
      
      ${renderCoinManagementModal()}
    </div>
  `;

  const renderShopCard = (card) => {
    const price = state.coinsConfig?.rarityPrices[card.rarity] || 0;
    const canAfford = state.coins >= price;
    const isPurchasing = state.purchasing === `${card.name}_${card.type}_${card.rarity}`;

    return html`
      <div class="pokemon-card shop-card">
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
              <div class="card-price-info">
                <div class="price-display">
                  <span class="price-icon">💰</span>
                  <span class="price-amount">${price}</span>
                  <span class="price-label">monedas</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-actions">
            <div class="primary-action">
              <button 
                class="action-button purchase-button ${canAfford ? '' : 'disabled'} ${isPurchasing ? 'purchasing' : ''}"
                ${!canAfford || isPurchasing ? 'disabled' : ''}
                data-card-name="${card.name}"
                data-card-type="${card.type}"
                data-card-rarity="${card.rarity}"
                data-price="${price}"
              >
                ${isPurchasing ? html`
                  <span class="button-icon">⏳</span>
                  <span class="button-text">Comprando...</span>
                ` : canAfford ? html`
                  <span class="button-icon">💳</span>
                  <span class="button-text">Comprar</span>
                ` : html`
                  <span class="button-icon">💸</span>
                  <span class="button-text">Sin fondos</span>
                `}
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderCoinManagementModal = () => html`
    <div class="modal-overlay" id="coin-management-modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>💰 Gestionar Monedas</h3>
          <button class="modal-close" id="close-coin-modal">×</button>
        </div>
        
        <div class="modal-body">
          <p>Establece manualmente la cantidad de monedas para pruebas o ajustes.</p>
          
          <div class="coin-input-group">
            <label for="coin-amount-input">Cantidad de monedas:</label>
            <input 
              type="number" 
              id="coin-amount-input" 
              min="0" 
              max="999999" 
              value="${state.coins}"
              placeholder="Ingresa cantidad..."
            >
          </div>
          
          <div class="coin-quick-actions">
            <button class="quick-coin-btn" data-amount="1">+1</button>
            <button class="quick-coin-btn" data-amount="10">+10</button>
            <button class="quick-coin-btn" data-amount="50">+50</button>
            <button class="quick-coin-btn" data-amount="0">Reset</button>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="modal-button secondary" id="cancel-coin-modal">Cancelar</button>
          <button class="modal-button primary" id="save-coins-btn">Guardar</button>
        </div>
      </div>
    </div>
  `;

  const mount = () => {
    container.innerHTML = render();
    bindEvents();
  };

  const init = () => {
    mount();
    loadShopData();
  };

  const loadShopData = async () => {
    try {
      setState({ loading: true });
      
      const [unlockedCards, coins, coinsConfig] = await Promise.all([
        CardService.getUnlockedCards(),
        CoinService.getCoins(),
        CoinService.getConfig()
      ]);
      
      setState({
        unlockedCards,
        coins,
        coinsConfig,
        loading: false
      });
      
    } catch (error) {
      console.error('Error loading shop data:', error);
      setState({ loading: false });
    }
  };

  const bindEvents = () => {
    // Purchase buttons
    const purchaseButtons = container.querySelectorAll('.purchase-button:not(.disabled)');
    purchaseButtons.forEach(button => {
      button.addEventListener('click', handlePurchase);
    });

    // Coin management
    const manageCoinBtn = container.querySelector('#manage-coins-btn');
    if (manageCoinBtn) {
      manageCoinBtn.addEventListener('click', showCoinManagement);
    }

    // Modal events
    bindModalEvents();
  };

  const bindModalEvents = () => {
    const modal = container.querySelector('#coin-management-modal');
    const closeBtn = container.querySelector('#close-coin-modal');
    const cancelBtn = container.querySelector('#cancel-coin-modal');
    const saveBtn = container.querySelector('#save-coins-btn');
    const quickBtns = container.querySelectorAll('.quick-coin-btn');

    if (closeBtn) closeBtn.addEventListener('click', hideCoinManagement);
    if (cancelBtn) cancelBtn.addEventListener('click', hideCoinManagement);
    if (saveBtn) saveBtn.addEventListener('click', saveCoins);

    quickBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const amount = parseInt(e.target.dataset.amount);
        const input = container.querySelector('#coin-amount-input');
        if (input) {
          if (amount === 0) {
            input.value = 0;
          } else {
            input.value = parseInt(input.value || 0) + amount;
          }
        }
      });
    });

    // Close modal on overlay click
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          hideCoinManagement();
        }
      });
    }
  };

  const handlePurchase = async (e) => {
    const button = e.currentTarget;
    const cardName = button.dataset.cardName;
    const cardType = button.dataset.cardType;
    const cardRarity = button.dataset.cardRarity;
    const price = parseInt(button.dataset.price);

    const cardKey = `${cardName}_${cardType}_${cardRarity}`;

    try {
      setState({ purchasing: cardKey });

      // Attempt to spend coins
      const success = await CoinService.spendCoins(price);
      
      if (!success) {
        alert('No tienes suficientes monedas para esta compra.');
        return;
      }

      // Find the full card data
      const cardData = state.unlockedCards.find(card => 
        card.name === cardName && card.type === cardType && card.rarity === cardRarity
      );

      if (!cardData) {
        // Refund coins if card not found
        await CoinService.addCoins(price);
        alert('Error: No se encontró la información de la carta.');
        return;
      }

      // Purchase the card
      await CardService.purchaseCard(cardData);

      // Update coins display
      const newCoins = await CoinService.getCoins();
      setState({ coins: newCoins });

      // Update navigation coin display
      if (window.navigation && window.navigation.updateCoins) {
        window.navigation.updateCoins();
      }

      alert(`¡${cardName} comprada exitosamente por ${price} monedas!`);

    } catch (error) {
      console.error('Error purchasing card:', error);
      alert('Error al comprar la carta. Intenta de nuevo.');
    } finally {
      setState({ purchasing: null });
    }
  };

  const showCoinManagement = () => {
    const modal = container.querySelector('#coin-management-modal');
    if (modal) {
      modal.style.display = 'flex';
    }
  };

  const hideCoinManagement = () => {
    const modal = container.querySelector('#coin-management-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  };

  const saveCoins = async () => {
    const input = container.querySelector('#coin-amount-input');
    if (!input) return;

    const amount = parseInt(input.value) || 0;
    
    try {
      await CoinService.setCoins(amount);
      setState({ coins: amount });
      
      // Update navigation coin display
      if (window.navigation && window.navigation.updateCoins) {
        window.navigation.updateCoins();
      }
      
      hideCoinManagement();
      alert(`Monedas establecidas a ${amount.toLocaleString()}`);
      
    } catch (error) {
      console.error('Error setting coins:', error);
      alert('Error al establecer las monedas.');
    }
  };

  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };

  const getRarityIcon = (rarity) => {
    const icons = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    };
    return icons[rarity] || '⚪';
  };

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

  const getTypeIcon = (type) => {
    const icons = {
      fire: '🔥',
      water: '💧',
      grass: '🌿',
      electric: '⚡',
      psychic: '🔮',
      ice: '❄️',
      dragon: '🐉',
      dark: '🌙',
      fairy: '🧚',
      fighting: '👊',
      poison: '☠️',
      ground: '🌍',
      flying: '🪶',
      bug: '🐛',
      rock: '🗿',
      ghost: '👻',
      steel: '⚔️',
      normal: '⭐'
    };
    return icons[type] || '❓';
  };

  return {
    init,
    mount,
    setState,
    getState: () => state
  };
};

export default ShopPage;
