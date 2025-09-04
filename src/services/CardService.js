/**
 * Service for managing cards collection and operations
 */

import StorageService from './StorageService.js';
import { Card } from '../models/Card.js';

const CardService = (() => {
  const CARDS_KEY = 'cards';
  const UNLOCKED_CARDS_KEY = 'unlocked_cards';
  
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
  
  // Add a new card to collection
  const addCard = (cardData) => {
    const cards = getAllCards();
    const newCard = new Card(cardData);
    cards.push(newCard);
    saveCards(cards);
    
    // Also mark this card type as unlocked
    unlockCard(cardData);
    
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
  
  // Unuse a card
  const unuseCard = (cardId) => {
    const cards = getAllCards();
    const card = cards.find(card => card.id === cardId);
    
    if (card && card.used) {
      card.unuse();
      saveCards(cards);
      return card;
    }
    
    return null;
  };
  
  // Remove card from collection
  const removeCard = (cardId) => {
    const cards = getAllCards();
    const filteredCards = cards.filter(card => card.id !== cardId);
    
    if (filteredCards.length !== cards.length) {
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
  
  // Get used cards
  const getUsedCards = () => {
    return getCardsByFilter({ used: true });
  };
  
  // Get cards count by type
  const getCardStats = () => {
    const cards = getAllCards();
    const stats = {
      total: cards.length,
      available: cards.filter(card => !card.used).length,
      used: cards.filter(card => card.used).length,
      byType: {},
      byRarity: {}
    };
    
    cards.forEach(card => {
      // Count by type
      stats.byType[card.type] = (stats.byType[card.type] || 0) + 1;
      
      // Count by rarity
      stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
    });
    
    return stats;
  };
  
  // Clear all cards
  const clearAllCards = () => {
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
  const purchaseCard = async (cardData) => {
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
    getAllCards,
    addCard,
    getCardById,
    updateCard,
    useCard,
    unuseCard,
    removeCard,
    getCardsByFilter,
    getAvailableCards,
    getUsedCards,
    getCardStats,
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
