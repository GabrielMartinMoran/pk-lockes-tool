/**
 * Roulette component using Winwheel.js for spinning wheels and getting cards
 */

import RouletteService from '../services/RouletteService.js';
import CardService from '../services/CardService.js';
import CoinService from '../services/CoinService.js';

const RouletteComponent = (container, props = {}) => {
  let state = {
    roulette: props.roulette || null,
    spinning: false,
    result: null,
    showResult: false,
    wheel: null,
    pendingResult: null,
    ...props
  };
  
  const render = () => {
    if (!state.roulette) {
      return html`
        <div class="roulette-error">
          <p>❌ No se pudo cargar la ruleta</p>
        </div>
      `;
    }
    
    return html`
      <div class="roulette-container">
        <div class="roulette-header">
          <h2 class="roulette-title">${state.roulette.name}</h2>
          <p class="roulette-description">${state.roulette.description}</p>
        </div>
        
        <div class="roulette-wheel-container">
          <!-- Pointer/Indicator -->
          <div class="roulette-pointer"></div>
          
          <canvas id="roulette-canvas-${state.roulette.name.replace(/\s+/g, '-').toLowerCase()}" width="400" height="400">
            Tu navegador no soporta canvas. Por favor actualiza tu navegador.
          </canvas>
        </div>
        
        <div class="roulette-controls">
          <button 
            id="spin-button"
            class="spin-button ${state.spinning ? 'spinning' : ''}"
            ${state.spinning ? 'disabled' : ''}
          >
            <span class="button-icon">${state.spinning ? '🌀' : '🎰'}</span>
            <span class="button-text">
              ${state.spinning ? '¡Girando...' : '¡Girar Ruleta!'}
            </span>
          </button>
          

        </div>
        
        ${state.showResult && state.result ? html`
          <div class="roulette-result ${state.showResult ? 'show' : ''}">
            <div class="result-content">
              <h3>¡Resultado!</h3>
              <div class="result-segment">
                <span class="result-label">${state.result.segment.label}</span>
              </div>
              
              ${state.result.card ? html`
                <div class="result-card">
                  <div class="card-preview">
                    <div class="card-header">
                      <h4>${state.result.card.name}</h4>
                      <span class="card-rarity rarity-${state.result.card.rarity}">${getRarityLabel(state.result.card.rarity)}</span>
                    </div>
                    
                    ${state.result.card.image ? html`
                      <div class="card-image">
                        <img src="${state.result.card.image}" alt="${state.result.card.name}" loading="lazy">
                      </div>
                    ` : html`
                      <div class="card-image placeholder">
                        <span class="placeholder-icon">${getRarityIcon(state.result.card.rarity)}</span>
                      </div>
                    `}
                    
                    <div class="card-rarity rarity-${state.result.card.rarity}">
                      ${getRarityIcon(state.result.card.rarity)} ${state.result.card.rarity}
                    </div>
                    <p class="card-description">${state.result.card.description}</p>
                  </div>
                  <p class="card-added">✨ ¡Carta añadida a tu colección!</p>
                </div>
              ` : ''}
              
              ${state.result.coins ? html`
                <div class="result-coins">
                  <div class="coins-preview">
                    <div class="coins-icon">💰</div>
                    <div class="coins-info">
                      <h4>¡Monedas obtenidas!</h4>
                      <div class="coins-amount">
                        <span class="coin-value">${getCoinAmount(state.result.coins)}</span>
                        <span class="coin-label">monedas</span>
                      </div>
                    </div>
                  </div>
                  <p class="coins-added">✨ ¡Monedas añadidas a tu balance!</p>
                </div>
              ` : ''}
              
              <button class="result-close-button">
                Continuar
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  };

  const mount = () => {
    container.innerHTML = render();
    // Small delay to ensure canvas is in DOM
    setTimeout(() => {
      // Only initialize wheel if it doesn't exist
      if (!state.wheel) {
        initializeWheel();
      }
      bindEvents();
    }, 100);
  };
  
  const initializeWheel = () => {
    if (!state.roulette || !state.roulette.segments) {
      console.warn('⚠️ No roulette or segments available for Winwheel');
      return;
    }
    
    console.log('🎪 Initializing Winwheel.js...');
    
    // Check if dependencies are available
    if (typeof Winwheel === 'undefined') {
      console.error('❌ Winwheel.js not loaded');
      return;
    }
    
    if (typeof TweenMax === 'undefined') {
      console.error('❌ TweenMax not loaded');
      return;
    }
    
    // Convert segments to Winwheel format (equal visual size)
    const segments = state.roulette.segments.map((segment, index) => ({
      'fillStyle': segment.color,
      'text': segment.label,
      'textFontSize': 14,
      'textFontWeight': 'bold',
      'textFillStyle': '#ffffff',
      'textOrientation': 'horizontal',
      'textMargin': 0,
      'segmentData': segment // Store original segment data
    }));
    
    console.log('🎲 Segments created:', segments.map(s => ({ 
      text: s.text, 
      color: s.fillStyle 
    })));
    
    // Create the wheel
    try {
      const canvasId = `roulette-canvas-${state.roulette.name.replace(/\s+/g, '-').toLowerCase()}`;
      console.log('🎯 Creating Winwheel with canvas ID:', canvasId);
      
      state.wheel = new Winwheel({
        'canvasId': canvasId,
        'numSegments': segments.length,
        'outerRadius': 190,
        'innerRadius': 30,
        'textFontFamily': 'Arial, sans-serif',
        'lineWidth': 2,
        'strokeStyle': '#ffffff',
        'segments': segments,
        'animation': {
          'type': 'spinToStop',
          'duration': 3,
          'spins': 8,
          'callbackFinished': handleSpinComplete
        }
      });
      
      console.log('✅ Winwheel initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Winwheel:', error);
    }
  };
  
  const bindEvents = () => {
    const spinButton = container.querySelector('#spin-button');
    if (spinButton) {
      spinButton.addEventListener('click', handleSpin);
    }
    
    const closeButton = container.querySelector('.result-close-button');
    if (closeButton) {
      closeButton.addEventListener('click', handleCloseResult);
    }
  };
  
  const handleSpin = async () => {
    if (state.spinning || !state.wheel || !state.roulette) {
      console.log('🚫 Spin blocked:', { spinning: state.spinning, wheel: !!state.wheel, roulette: !!state.roulette });
      return;
    }
    
    console.log('🎲 Starting Winwheel spin...');
    
    try {
      // 1. Use our weighted selection to determine result
      const result = RouletteService.spinRoulette(state.roulette.id);
      
      if (!result) {
        console.error('Failed to spin roulette');
        return;
      }
      
      // 2. Find which segment was selected
      const selectedSegmentIndex = state.roulette.segments.findIndex(
        segment => segment.label === result.segment.label
      );
      
      if (selectedSegmentIndex === -1) {
        console.error('Could not find selected segment');
        return;
      }
      
      console.log(`🎯 Predetermined result: ${result.segment.label} (segment ${selectedSegmentIndex})`);
      
      // Store result for the callback
      state.predeterminedResult = result;
      
      // Start spinning - update state and UI
      state.spinning = true;
      state.showResult = false;
      state.result = null;
      
      // Update button and add spinner manually
      const spinButton = container.querySelector('#spin-button');
      const controls = container.querySelector('.roulette-controls');
      
      if (spinButton) {
        spinButton.disabled = true;
        spinButton.className = 'spin-button spinning';
        const buttonIcon = spinButton.querySelector('.button-icon');
        const buttonText = spinButton.querySelector('.button-text');
        if (buttonIcon) buttonIcon.textContent = '🌀';
        if (buttonText) buttonText.textContent = '¡Girando...';
      }
      

      
      // 4. Reset wheel rotation and animation state for new spin
      console.log('🔄 Current wheel rotation before reset:', state.wheel.rotationAngle);
      
      // Stop any existing animation
      if (state.wheel.animation.animationId) {
        state.wheel.stopAnimation();
      }
      
      // Reset the wheel rotation to 0 degrees for consistent animation
      state.wheel.rotationAngle = 0;
      
      // Reset animation properties
      state.wheel.animation.clearTween = null;
      
      // Redraw the wheel at 0 degrees
      state.wheel.draw();
      
      // 5. Calculate stop angle to land on predetermined result
      const stopAngle = state.wheel.getRandomForSegment(selectedSegmentIndex + 1); // Winwheel uses 1-based indexing
      
      console.log('🎪 Spinning to predetermined result:', {
        selectedSegment: result.segment.label,
        selectedIndex: selectedSegmentIndex,
        stopAngle: stopAngle
      });
      
      console.log('🎯 Wheel state before animation:', {
        wheel: !!state.wheel,
        canvas: !!document.getElementById(state.wheel.canvasId),
        segments: state.wheel.segments?.length,
        currentRotation: state.wheel.rotationAngle
      });
      
      // 6. Configure animation to stop at predetermined result
      state.wheel.animation.stopAngle = stopAngle;
      state.wheel.startAnimation();
      
      console.log('🚀 Animation started successfully');
      
    } catch (error) {
      console.error('Error in handleSpin:', error);
      setState({ spinning: false });
    }
  };
  
  const handleSpinComplete = async (indicatedSegment) => {
    console.log('✅ Winwheel spin complete:', indicatedSegment);
    
    // Use the predetermined result (which should match where the wheel stopped)
    const result = state.predeterminedResult;
    
    if (!result) {
      console.error('❌ No predetermined result found');
      return;
    }
    
    console.log('🎯 Verification:', {
      wheelSays: indicatedSegment.text,
      predeterminedResult: result.segment.label,
      match: indicatedSegment.text === result.segment.label
    });
    
    if (result.card) {
      // Add card to collection
      CardService.addCard(result.card);
      console.log('📄 Card added to collection:', result.card.name);
    }
    
    if (result.coins) {
      // Add coins to balance
      const coinConfig = await CoinService.getConfig();
      const coinAmount = coinConfig.coinRewards[result.coins] || 0;
      await CoinService.addCoins(coinAmount);
      console.log(`💰 Added ${coinAmount} coins (${result.coins})`);
      
      // Update navigation coin display
      if (window.navigation && window.navigation.updateCoins) {
        window.navigation.updateCoins();
      }
    }
    
    // Update state WITHOUT re-render to preserve canvas
    state.spinning = false;
    state.result = result;
    
    // Update button manually
    const spinButton = container.querySelector('#spin-button');
    if (spinButton) {
      spinButton.disabled = false;
      spinButton.className = 'spin-button';
      const buttonIcon = spinButton.querySelector('.button-icon');
      const buttonText = spinButton.querySelector('.button-text');
      if (buttonIcon) buttonIcon.textContent = '🎰';
      if (buttonText) buttonText.textContent = '¡Girar Ruleta!';
    }
    

    
    // Show result after a pause
    setTimeout(() => {
      // Update state manually and show result without full re-render
      state.showResult = true;
      
      // Add result modal to DOM manually using the predetermined result
      const resultHtml = html`
        <div class="roulette-result show">
          <div class="result-content">
            <h3>¡Resultado!</h3>
            <div class="result-segment">
              <span class="result-label">${result.segment.label}</span>
            </div>
            
            ${result.card ? html`
              <div class="result-card">
                <div class="card-preview">
                  <div class="card-header">
                    <h4>${result.card.name}</h4>
                    <span class="card-rarity rarity-${result.card.rarity}">${getRarityLabel(result.card.rarity)}</span>
                  </div>
                  
                  ${result.card.image ? html`
                    <div class="card-image">
                      <img src="${result.card.image}" alt="${result.card.name}" loading="lazy">
                    </div>
                  ` : html`
                    <div class="card-image placeholder">
                      <span class="placeholder-icon">${getRarityIcon(result.card.rarity)}</span>
                    </div>
                  `}
                  
                  <div class="card-rarity rarity-${result.card.rarity}">
                    ${getRarityIcon(result.card.rarity)} ${result.card.rarity}
                  </div>
                  <p class="card-description">${result.card.description}</p>
                </div>
                <p class="card-added">✨ ¡Carta añadida a tu colección!</p>
              </div>
            ` : ''}
            
            <button class="result-close-button">
              Continuar
            </button>
          </div>
        </div>
      `;
      
      // Add result modal to container
      const existingResult = container.querySelector('.roulette-result');
      if (existingResult) {
        existingResult.remove();
      }
      
      const resultDiv = document.createElement('div');
      resultDiv.innerHTML = resultHtml;
      container.appendChild(resultDiv.firstElementChild);
      
      // Bind close event
      const closeButton = container.querySelector('.result-close-button');
      if (closeButton) {
        closeButton.addEventListener('click', handleCloseResult);
      }
    }, 500);
    
    // Clear pending result
    state.pendingResult = null;
  };
  
  const handleCloseResult = () => {
    // Update state manually without re-render
    state.showResult = false;
    state.result = null;
    
    // Remove result modal from DOM
    const resultModal = container.querySelector('.roulette-result');
    if (resultModal) {
      resultModal.remove();
    }
  };

  const setState = (newState) => {
    console.log('🔄 setState called with:', newState);
    const oldWheel = state.wheel;
    state = { ...state, ...newState };
    
    // Preserve the wheel instance across re-renders
    if (oldWheel && !newState.wheel) {
      state.wheel = oldWheel;
    }
    
    // Always do full re-render for result states, but be careful with spinning
    if (newState.showResult !== undefined || newState.result !== undefined) {
      console.log('🔄 Full re-render for result state');
      mount();
    } else if (newState.spinning === false) {
      // When spinning stops, just update button without re-render
      console.log('🔄 Updating button state only');
      const spinButton = container.querySelector('#spin-button');
      if (spinButton) {
        spinButton.disabled = false;
        spinButton.className = 'spin-button';
        const buttonText = spinButton.querySelector('.button-text');
        if (buttonText) {
          buttonText.textContent = '¡Girar Ruleta!';
        }
      }
    }
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

  const getCoinAmount = (coinType) => {
    const coinAmounts = {
      small: 5,
      medium: 15,
      large: 30,
      huge: 75
    };
    return coinAmounts[coinType] || 0;
  };

  // Initialize component
  mount();

  return {
    mount,
    setState,
    getState: () => state
  };
};

export default RouletteComponent;