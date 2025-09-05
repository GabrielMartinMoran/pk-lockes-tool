/**
 * Service for managing cards collection and operations
 */

import StorageService from './StorageService.js';
import { Card } from '../models/Card.js';

const CardService = (() => {
  const CARDS_KEY = 'cards';
  const UNLOCKED_CARDS_KEY = 'unlocked_cards';
  
  // Cache for cards configuration
  let cardsConfig = null;
  
  // Load cards configuration from JSON
  const loadCardsConfig = async () => {
    if (cardsConfig) {
      return cardsConfig;
    }
    
    try {
      console.log('📋 Loading cards configuration...');
      const response = await fetch('/config/cards-config.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      cardsConfig = await response.json();
      console.log(`✅ Loaded ${Object.keys(cardsConfig.cards).length} card definitions`);
      return cardsConfig;
    } catch (error) {
      console.error('❌ Error loading cards config:', error);
      // Return empty config as fallback
      cardsConfig = { cards: {} };
      return cardsConfig;
    }
  };
  
  // Get card definition by ID
  const getCardDefinition = async (cardId) => {
    const config = await loadCardsConfig();
    return config.cards[cardId] || null;
  };
  
  // Get all available card definitions
  const getAllCardDefinitions = async () => {
    const config = await loadCardsConfig();
    return config.cards;
  };

  // Get all cards from storage
  const getAllCards = () => {
    const cardsData = StorageService.get(CARDS_KEY, []);
    return cardsData.map(cardData => Card.fromJSON(cardData));
  };
  
  // Save all cards to storage
  const saveCards = (cards) => {
    const cardsData = cards.map(card => card.toJSON());
    return StorageService.set(CARDS_KEY, cardsData);
  };
  
  // Add a new card to collection by ID or data
  const addCard = async (cardInput) => {
    const cards = getAllCards();
    let cardData;
    
    // If cardInput is a string, treat it as a card ID
    if (typeof cardInput === 'string') {
      cardData = await getCardDefinition(cardInput);
      if (!cardData) {
        throw new Error(`Card with ID "${cardInput}" not found in configuration`);
      }
    } else {
      // Otherwise, use the provided card data directly (for backward compatibility)
      cardData = cardInput;
    }
    
    const newCard = new Card(cardData);
    cards.push(newCard);
    saveCards(cards);
    
    // Also mark this card type as unlocked
    unlockCard(cardData);
    
    console.log('Card added to collection:', newCard.name);
    return newCard;
  };
  
  // Get card by ID
  const getCardById = (cardId) => {
    const cards = getAllCards();
    return cards.find(card => card.id === cardId) || null;
  };
  
  // Update card
  const updateCard = (cardId, updates) => {
    const cards = getAllCards();
    const cardIndex = cards.findIndex(card => card.id === cardId);
    
    if (cardIndex === -1) {
      return null;
    }
    
    // Update the card
    Object.assign(cards[cardIndex], updates);
    saveCards(cards);
    return cards[cardIndex];
  };
  
  // Use a card
  const useCard = (cardId) => {
    const cards = getAllCards();
    const card = cards.find(card => card.id === cardId);
    
    if (card && !card.used) {
      card.use();
      saveCards(cards);
      return card;
    }
    
    return null;
  };
  
  
  // Remove card from collection
  const removeCard = (cardId, isUsed = false) => {
    const cards = getAllCards();
    const cardToRemove = cards.find(card => card.id === cardId);
    const filteredCards = cards.filter(card => card.id !== cardId);
    
    if (filteredCards.length !== cards.length && cardToRemove) {
      // If the card is being removed because it was used, increment the historical count and store it
      if (isUsed) {
        const currentHistoricalCount = StorageService.get('used_cards_count', 0);
        StorageService.set('used_cards_count', currentHistoricalCount + 1);
        
        // Store the used card in historical record
        const historicalUsedCards = StorageService.get('used_cards_history', []);
        cardToRemove.used = true;
        cardToRemove.usedAt = new Date().toISOString();
        historicalUsedCards.push(cardToRemove);
        StorageService.set('used_cards_history', historicalUsedCards);
      }
      
      saveCards(filteredCards);
      return true;
    }
    
    return false;
  };
  
  // Get cards by filter criteria
  const getCardsByFilter = (filter = {}) => {
    const cards = getAllCards();
    
    return cards.filter(card => {
      if (filter.used !== undefined && card.used !== filter.used) {
        return false;
      }
      
      if (filter.type && card.type !== filter.type) {
        return false;
      }
      
      if (filter.rarity && card.rarity !== filter.rarity) {
        return false;
      }
      
      if (filter.obtainedFrom && card.obtainedFrom !== filter.obtainedFrom) {
        return false;
      }
      
      if (filter.name && !card.name.toLowerCase().includes(filter.name.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  // Get available (unused) cards
  const getAvailableCards = () => {
    return getCardsByFilter({ used: false });
  };

  // Get used cards from history
  const getUsedCards = () => {
    return StorageService.get('used_cards_history', []);
  };
  
  
  // Get cards count by type
  const getCardStats = () => {
    const cards = getAllCards();
    const availableCards = cards.filter(card => !card.used);
    const usedCards = cards.filter(card => card.used);
    
    // Get historical used count from storage
    const historicalUsedCount = StorageService.get('used_cards_count', 0);
    
    const stats = {
      total: cards.length + historicalUsedCount, // Include historical used cards in total
      available: availableCards.length,
      used: usedCards.length + historicalUsedCount, // Current used + historical
      byType: {},
      byRarity: {}
    };
    
    availableCards.forEach(card => {
      // Count by type (only available cards)
      stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
      
      // Count by rarity (only available cards)
      stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
    });
    
    return stats;
  };
  
  // Clean up used cards (remove any cards marked as used)
  const cleanupUsedCards = () => {
    const cards = getAllCards();
    const usedCards = cards.filter(card => card.used);
    const availableCards = cards.filter(card => !card.used);
    
    // If there are used cards to clean up, update the historical count and store them
    if (usedCards.length > 0) {
      const currentHistoricalCount = StorageService.get('used_cards_count', 0);
      StorageService.set('used_cards_count', currentHistoricalCount + usedCards.length);
      
      // Store used cards in historical record
      const historicalUsedCards = StorageService.get('used_cards_history', []);
      usedCards.forEach(card => {
        card.usedAt = card.usedAt || new Date().toISOString();
        historicalUsedCards.push(card);
      });
      StorageService.set('used_cards_history', historicalUsedCards);
    }
    
    saveCards(availableCards);
    return availableCards.length !== cards.length; // Return true if any cards were removed
  };

  // Clear all cards
  const clearAllCards = () => {
    StorageService.remove('used_cards_count'); // Clear historical used count
    StorageService.remove('used_cards_history'); // Clear historical used cards
    return StorageService.set(CARDS_KEY, []);
  };
  
  // Get unlocked card types
  const getUnlockedCards = () => {
    return StorageService.get(UNLOCKED_CARDS_KEY, []);
  };
  
  // Save unlocked card types
  const saveUnlockedCards = (unlockedCards) => {
    return StorageService.set(UNLOCKED_CARDS_KEY, unlockedCards);
  };
  
  // Unlock a card type (mark as available for purchase)
  const unlockCard = (cardData) => {
    const unlockedCards = getUnlockedCards();
    
    // Check if already unlocked
    const existingCard = unlockedCards.find(card => 
      card.name === cardData.name && 
      card.type === cardData.type && 
      card.rarity === cardData.rarity
    );
    
    if (!existingCard) {
      unlockedCards.push({
        name: cardData.name,
        type: cardData.type,
        rarity: cardData.rarity,
        description: cardData.description,
        image: cardData.image,
        unlockedAt: new Date().toISOString()
      });
      
      saveUnlockedCards(unlockedCards);
      console.log(`🔓 Card unlocked for purchase: ${cardData.name}`);
    }
  };
  
  // Check if a card type is unlocked
  const isCardUnlocked = (cardData) => {
    const unlockedCards = getUnlockedCards();
    return unlockedCards.some(card => 
      card.name === cardData.name && 
      card.type === cardData.type && 
      card.rarity === cardData.rarity
    );
  };
  
  // Purchase a card (add to collection after spending coins)
  const purchaseCard = async (cardInput) => {
    let cardData;
    
    // If cardInput is a string, treat it as a card ID
    if (typeof cardInput === 'string') {
      cardData = await getCardDefinition(cardInput);
      if (!cardData) {
        throw new Error(`Card with ID "${cardInput}" not found in configuration`);
      }
    } else {
      // Otherwise, use the provided card data directly (for backward compatibility)
      cardData = cardInput;
    }
    
    // This will be called after coin verification in the UI
    const newCard = new Card({
      ...cardData,
      obtainedFrom: 'shop',
      obtainedAt: new Date().toISOString(),
      used: false,
      usedAt: null
    });
    const cards = getAllCards();
    cards.push(newCard);
    saveCards(cards);
    
    console.log(`💳 Card purchased: ${cardData.name}`);
    return newCard;
  };
  
  // Remove a card from unlocked cards (lock it from shop)
  const lockCard = (cardData) => {
    const unlockedCards = getUnlockedCards();
    const filteredCards = unlockedCards.filter(card => 
      !(card.name === cardData.name && 
        card.type === cardData.type && 
        card.rarity === cardData.rarity)
    );
    
    if (filteredCards.length !== unlockedCards.length) {
      saveUnlockedCards(filteredCards);
      console.log(`🔒 Card locked from shop: ${cardData.name}`);
      return true;
    }
    return false;
  };

  // Clear unlocked cards data
  const clearUnlockedCards = () => {
    StorageService.remove(UNLOCKED_CARDS_KEY);
    console.log('🔓 Unlocked cards data cleared');
  };

  return {
    // Cards configuration
    loadCardsConfig,
    getCardDefinition,
    getAllCardDefinitions,
    // Collection management
    getAllCards,
    addCard,
    getCardById,
    updateCard,
    useCard,
    removeCard,
    getCardsByFilter,
    getAvailableCards,
    getUsedCards,
    getCardStats,
    cleanupUsedCards,
    clearAllCards,
    // Unlocked cards functionality
    getUnlockedCards,
    unlockCard,
    lockCard,
    isCardUnlocked,
    purchaseCard,
    clearUnlockedCards
  };
})();

export default CardService;
