/**
 * Service for managing coins and coin-related operations
 */

import StorageService from './StorageService.js';

const CoinService = (() => {
  const COINS_KEY = 'pokemon_lockes_coins';
  const CONFIG_URL = './coins-config.json';
  
  let coinsConfig = null;
  
  // Load coins configuration
  const loadCoinsConfig = async () => {
    if (coinsConfig) return coinsConfig;
    
    try {
      console.log('💰 Loading coins configuration...');
      const response = await fetch(CONFIG_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to load coins config: ${response.status}`);
      }
      
      coinsConfig = await response.json();
      console.log('✅ Coins configuration loaded:', coinsConfig);
      return coinsConfig;
    } catch (error) {
      console.error('❌ Error loading coins config:', error);
      
      // Fallback configuration
      coinsConfig = {
        rarityPrices: {
          common: 10,
          uncommon: 25,
          rare: 50,
          epic: 100,
          legendary: 200
        },
        coinRewards: {
          small: 5,
          medium: 15,
          large: 30,
          huge: 75
        },
        initialCoins: 50
      };
      
      console.log('🔄 Using fallback coins configuration');
      return coinsConfig;
    }
  };
  
  // Get current coin balance
  const getCoins = async () => {
    const config = await loadCoinsConfig();
    const coins = StorageService.get(COINS_KEY);
    
    if (coins === null) {
      // First time - set initial coins
      const initialCoins = config.initialCoins || 50;
      StorageService.set(COINS_KEY, initialCoins);
      console.log(`💰 Initial coins set: ${initialCoins}`);
      return initialCoins;
    }
    
    return parseInt(coins, 10) || 0;
  };
  
  // Add coins
  const addCoins = async (amount) => {
    if (amount <= 0) return;
    
    const currentCoins = await getCoins();
    const newTotal = currentCoins + amount;
    
    StorageService.set(COINS_KEY, newTotal);
    console.log(`💰 Added ${amount} coins. New total: ${newTotal}`);
    
    return newTotal;
  };
  
  // Subtract coins (for purchases)
  const spendCoins = async (amount) => {
    if (amount <= 0) return false;
    
    const currentCoins = await getCoins();
    
    if (currentCoins < amount) {
      console.log(`❌ Insufficient coins. Have: ${currentCoins}, Need: ${amount}`);
      return false;
    }
    
    const newTotal = currentCoins - amount;
    StorageService.set(COINS_KEY, newTotal);
    console.log(`💸 Spent ${amount} coins. New total: ${newTotal}`);
    
    return true;
  };
  
  // Set coins manually (for admin/debugging)
  const setCoins = async (amount) => {
    const newAmount = Math.max(0, parseInt(amount, 10) || 0);
    StorageService.set(COINS_KEY, newAmount);
    console.log(`💰 Coins set manually to: ${newAmount}`);
    return newAmount;
  };
  
  // Get price for a card rarity
  const getCardPrice = async (rarity) => {
    const config = await loadCoinsConfig();
    return config.rarityPrices[rarity] || 0;
  };
  
  // Get coin reward amount by type
  const getCoinReward = async (rewardType) => {
    const config = await loadCoinsConfig();
    return config.coinRewards[rewardType] || 0;
  };
  
  // Check if player can afford a card
  const canAffordCard = async (rarity) => {
    const currentCoins = await getCoins();
    const price = await getCardPrice(rarity);
    return currentCoins >= price;
  };
  
  // Get all coin-related configuration
  const getConfig = async () => {
    return await loadCoinsConfig();
  };
  
  // Clear all coin data (for reset)
  const clearCoins = () => {
    StorageService.remove(COINS_KEY);
    console.log('💰 All coin data cleared');
  };
  
  return {
    getCoins,
    addCoins,
    spendCoins,
    setCoins,
    getCardPrice,
    getCoinReward,
    canAffordCard,
    getConfig,
    clearCoins
  };
})();

export default CoinService;
