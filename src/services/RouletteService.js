/**
 * Service for managing roulette configurations and spinning logic
 */

import StorageService from './StorageService.js';
import { RouletteConfig } from '../models/Card.js';
import CardService from './CardService.js';

const RouletteService = (() => {
  const ROULETTES_KEY = 'roulettes';
  let currentRoulettes = []; // Cache for current session roulettes
  
  // Resolve card references in roulette segments
  const resolveCardReferences = async (segments) => {
    const resolvedSegments = [];
    
    for (const segment of segments) {
      const resolvedSegment = { ...segment };
      
      // If segment has cardId instead of card object, resolve it
      if (segment.cardId && !segment.card) {
        try {
          const cardDefinition = await CardService.getCardDefinition(segment.cardId);
          if (cardDefinition) {
            resolvedSegment.card = cardDefinition;
            console.log(`✅ Resolved card reference: ${segment.cardId} -> ${cardDefinition.name}`);
          } else {
            console.warn(`⚠️ Card definition not found for ID: ${segment.cardId}`);
          }
        } catch (error) {
          console.error(`❌ Error resolving card reference ${segment.cardId}:`, error);
        }
      }
      
      resolvedSegments.push(resolvedSegment);
    }
    
    return resolvedSegments;
  };
  
  // Get all roulette configurations
  const getAllRoulettes = () => {
    const roulettesData = StorageService.get(ROULETTES_KEY, []);
    console.log(`📊 Found ${roulettesData.length} roulettes in localStorage`);
    return roulettesData.map(rouletteData => RouletteConfig.fromJSON(rouletteData));
  };
  
  // Save all roulettes to storage
  const saveRoulettes = (roulettes) => {
    const roulettesData = roulettes.map(roulette => roulette.toJSON());
    return StorageService.set(ROULETTES_KEY, roulettesData);
  };
  
  // Add a new roulette configuration
  const addRoulette = (rouletteData) => {
    const roulettes = getAllRoulettes();
    const newRoulette = new RouletteConfig(rouletteData);
    roulettes.push(newRoulette);
    saveRoulettes(roulettes);
    return newRoulette;
  };
  
  // Get roulette by ID from current cache
  const getRouletteById = (rouletteId) => {
    return currentRoulettes.find(roulette => roulette.id === rouletteId) || null;
  };
  
  // Update roulette configuration
  const updateRoulette = (rouletteId, updates) => {
    const roulettes = getAllRoulettes();
    const rouletteIndex = roulettes.findIndex(roulette => roulette.id === rouletteId);
    
    if (rouletteIndex === -1) {
      return null;
    }
    
    Object.assign(roulettes[rouletteIndex], updates);
    saveRoulettes(roulettes);
    return roulettes[rouletteIndex];
  };
  
  // Remove roulette
  const removeRoulette = (rouletteId) => {
    const roulettes = getAllRoulettes();
    const filteredRoulettes = roulettes.filter(roulette => roulette.id !== rouletteId);
    
    if (filteredRoulettes.length !== roulettes.length) {
      saveRoulettes(filteredRoulettes);
      return true;
    }
    
    return false;
  };
  
  // Get active roulettes only - always load from JSON
  const getActiveRoulettes = async () => {
    console.log('🔄 Loading roulettes from JSON (not using localStorage)...');
    
    try {
      const response = await fetch('./config/roulettes-config.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      
      const configData = await response.json();
      
      if (!Array.isArray(configData)) {
        throw new Error('Config must be an array of roulette configurations');
      }
      
      console.log(`✅ Loaded ${configData.length} roulettes from JSON`);
      
      // Resolve card references in each roulette's segments
      const resolvedConfigData = [];
      for (const rouletteData of configData) {
        const resolvedRoulette = { ...rouletteData };
        if (rouletteData.segments) {
          resolvedRoulette.segments = await resolveCardReferences(rouletteData.segments);
        }
        resolvedConfigData.push(resolvedRoulette);
      }
      
      // Convert to RouletteConfig objects and cache them
      currentRoulettes = resolvedConfigData.map(data => RouletteConfig.fromJSON(data));
      return currentRoulettes.filter(roulette => roulette.active !== false);
      
    } catch (error) {
      console.error('❌ Error loading from JSON:', error);
      console.log('⚠️ Falling back to sample roulettes...');
      
      // Fallback to sample roulettes (but don't save them)
      const sampleRoulettes = getSampleRoulettesData();
      currentRoulettes = sampleRoulettes.map(data => RouletteConfig.fromJSON(data));
      return currentRoulettes.filter(roulette => roulette.active !== false);
    }
  };
  
  // Spin a roulette and return the result
  const spinRoulette = (rouletteId) => {
    const roulette = getRouletteById(rouletteId);
    
    if (!roulette || !roulette.active || roulette.segments.length === 0) {
      return null;
    }
    
    // Calculate weighted random selection
    const totalWeight = roulette.segments.reduce((sum, segment) => sum + segment.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedSegment = null;
    for (const segment of roulette.segments) {
      random -= segment.weight;
      if (random <= 0) {
        selectedSegment = segment;
        break;
      }
    }
    
    if (!selectedSegment) {
      selectedSegment = roulette.segments[roulette.segments.length - 1];
    }
    
    // Create result object
    const result = {
      rouletteId: roulette.id,
      rouletteName: roulette.name,
      segment: selectedSegment,
      timestamp: new Date().toISOString(),
      card: null,
      coins: null
    };
    
    // If the segment has card data, prepare card data (but don't add it yet)
    if (selectedSegment.card) {
      result.card = {
        ...selectedSegment.card,
        obtainedFrom: roulette.id,
        obtainedAt: result.timestamp
      };
    }
    
    // If the segment has coin reward, prepare coin data
    if (selectedSegment.coins) {
      result.coins = selectedSegment.coins;
    }
    
    return result;
  };
  
  // Load roulettes from external configuration
  const loadRoulettesFromConfig = async (configUrl) => {
    try {
      console.log(`📥 Loading roulettes from: ${configUrl}`);
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.status}`);
      }
      
      const configData = await response.json();
      
      if (!Array.isArray(configData)) {
        throw new Error('Config must be an array of roulette configurations');
      }
      
      console.log(`✅ Found ${configData.length} roulettes in config`);
      
      // Clear existing roulettes to replace with config
      clearAllRoulettes();
      
      configData.forEach(rouletteData => {
        addRoulette(rouletteData);
        console.log(`➕ Added roulette: ${rouletteData.name}`);
      });
      
      return true;
    } catch (error) {
      console.error('❌ Error loading roulettes from config:', error);
      return false;
    }
  };
  
  // Auto-load roulettes from config on first use
  const autoLoadRoulettes = async () => {
    const currentRoulettes = getAllRoulettes();
    
    // If no roulettes exist, try to load from config
    if (currentRoulettes.length === 0) {
      console.log('🔍 No roulettes found, attempting to load from config...');
      
      // Try to load from the config file
      const configLoaded = await loadRoulettesFromConfig('./config/roulettes-config.json');
      
      if (!configLoaded) {
        console.log('⚠️ Config loading failed, creating sample roulettes...');
        createSampleRoulettes();
      }
    }
    
    return getAllRoulettes();
  };
  
  // Get sample roulettes data (without saving to storage)
  const getSampleRoulettesData = () => {
    return [
      {
        name: 'Ruleta Básica de Pokémon',
        description: 'Ruleta básica con Pokémon comunes',
        segments: [
          {
            label: 'Pikachu',
            value: 'pikachu',
            weight: 2,
            color: '#FFD700',
            card: {
              name: 'Pikachu',
              type: 'electric',
              rarity: 'common',
              description: 'El Pokémon ratón eléctrico más famoso'
            }
          },
          {
            label: 'Charmander',
            value: 'charmander',
            weight: 2,
            color: '#FF6B35',
            card: {
              name: 'Charmander',
              type: 'fire',
              rarity: 'common',
              description: 'Un Pokémon de tipo fuego con una llama en su cola'
            }
          },
          {
            label: 'Squirtle',
            value: 'squirtle',
            weight: 2,
            color: '#4A90E2',
            card: {
              name: 'Squirtle',
              type: 'water',
              rarity: 'common',
              description: 'Un Pokémon tortuga de tipo agua'
            }
          },
          {
            label: 'Bulbasaur',
            value: 'bulbasaur',
            weight: 2,
            color: '#7ED321',
            card: {
              name: 'Bulbasaur',
              type: 'grass',
              rarity: 'common',
              description: 'Un Pokémon de tipo planta con un bulbo en su espalda'
            }
          },
          {
            label: 'Mewtwo',
            value: 'mewtwo',
            weight: 1,
            color: '#9013FE',
            card: {
              name: 'Mewtwo',
              type: 'psychic',
              rarity: 'legendary',
              description: 'Un Pokémon psíquico legendario creado genéticamente'
            }
          }
        ]
      },
      {
        name: 'Ruleta de Tipos',
        description: 'Ruleta que otorga cartas basadas en tipos de Pokémon',
        segments: [
          {
            label: 'Fuego',
            value: 'fire',
            weight: 3,
            color: '#FF6B35',
            card: {
              name: 'Carta de Tipo Fuego',
              type: 'fire',
              rarity: 'common',
              description: 'Una carta que representa el tipo fuego'
            }
          },
          {
            label: 'Agua',
            value: 'water',
            weight: 3,
            color: '#4A90E2',
            card: {
              name: 'Carta de Tipo Agua',
              type: 'water',
              rarity: 'common',
              description: 'Una carta que representa el tipo agua'
            }
          },
          {
            label: 'Planta',
            value: 'grass',
            weight: 3,
            color: '#7ED321',
            card: {
              name: 'Carta de Tipo Planta',
              type: 'grass',
              rarity: 'common',
              description: 'Una carta que representa el tipo planta'
            }
          },
          {
            label: 'Eléctrico',
            value: 'electric',
            weight: 2,
            color: '#FFD700',
            card: {
              name: 'Carta de Tipo Eléctrico',
              type: 'electric',
              rarity: 'uncommon',
              description: 'Una carta que representa el tipo eléctrico'
            }
          }
        ]
      }
    ];
  };
  
  // Create sample roulettes for testing (saves to storage)
  const createSampleRoulettes = () => {
    const sampleRoulettes = getSampleRoulettesData();
    sampleRoulettes.forEach(rouletteData => addRoulette(rouletteData));
  };
  
  // Clear all roulettes
  const clearAllRoulettes = () => {
    console.log('🗑️ Clearing all roulettes from storage');
    return StorageService.set(ROULETTES_KEY, []);
  };
  
  // Force reload from JSON (clears existing and loads from config)
  const forceReloadFromJSON = async () => {
    console.log('🔄 Force reloading roulettes from JSON...');
    clearAllRoulettes();
    const success = await loadRoulettesFromConfig('./config/roulettes-config.json');
    if (success) {
      console.log('✅ Force reload successful');
      return getAllRoulettes();
    } else {
      console.log('❌ Force reload failed');
      return [];
    }
  };
  
  return {
    getAllRoulettes,
    addRoulette,
    getRouletteById,
    updateRoulette,
    removeRoulette,
    getActiveRoulettes,
    spinRoulette,
    loadRoulettesFromConfig,
    autoLoadRoulettes,
    createSampleRoulettes,
    clearAllRoulettes,
    forceReloadFromJSON
  };
})();

export default RouletteService;
