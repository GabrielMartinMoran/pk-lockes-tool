/**
 * Component for displaying current coin balance
 */

import CoinService from '../services/CoinService.js';

const CoinDisplay = (container, props = {}) => {
  let state = {
    coins: 0,
    loading: true,
    ...props
  };

  const render = () => html`
    <div class="coin-display">
      <div class="coin-icon">💰</div>
      <span class="coin-amount">
        ${state.loading ? '...' : state.coins.toLocaleString()}
      </span>
      ${props.showLabel !== false ? html`<span class="coin-label">monedas</span>` : ''}
    </div>
  `;

  const mount = () => {
    container.innerHTML = render();
  };

  const loadCoins = async () => {
    try {
      const coins = await CoinService.getCoins();
      setState({ coins, loading: false });
    } catch (error) {
      console.error('Error loading coins:', error);
      setState({ loading: false });
    }
  };

  const updateCoins = async () => {
    await loadCoins();
  };

  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };

  // Initialize
  mount();
  loadCoins();

  return {
    mount,
    updateCoins,
    setState,
    getState: () => state
  };
};

export default CoinDisplay;
