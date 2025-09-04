/**
 * Rules page - displays the classic Nuzlocke rules
 */

const RulesPage = (container) => {
  let state = {
    loading: false
  };
  
  const render = () => html`
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">
          <span class="title-icon">📋</span>
          Reglas del Nuzlocke
        </h1>
        <p class="page-subtitle">
          Las reglas clásicas que definen el desafío Nuzlocke
        </p>
      </div>
      
      <div class="page-content">
        <div class="rules-container">
          <div class="rules-intro">
            <p class="rules-description">
              El <strong>Nuzlocke Challenge</strong> es un conjunto de reglas autoimpuestas que hacen que los juegos de Pokémon sean más desafiantes y emocionalmente intensos. Estas son las reglas clásicas:
            </p>
          </div>

          <div class="rules-sections">
            <div class="rules-section">
              <h2 class="section-title">
                <span class="section-icon">🎯</span>
                Reglas Principales
              </h2>
              <div class="rules-list">
                <div class="rule-item core-rule">
                  <div class="rule-number">1</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Un Pokémon por Ruta</h3>
                    <p class="rule-description">Solo puedes capturar el primer Pokémon que encuentres en cada ruta, ciudad o área. Si se desmaya o huye, pierdes la oportunidad de capturar en esa zona.</p>
                  </div>
                </div>

                <div class="rule-item core-rule">
                  <div class="rule-number">2</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Muerte Permanente</h3>
                    <p class="rule-description">Si un Pokémon se desmaya, se considera "muerto" y debe ser liberado o almacenado permanentemente en el PC. No puede volver a usarse en combate.</p>
                  </div>
                </div>

                <div class="rule-item core-rule">
                  <div class="rule-number">3</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Apodos Obligatorios</h3>
                    <p class="rule-description">Todos los Pokémon capturados deben recibir un apodo para crear un vínculo emocional más fuerte con ellos.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-section">
              <h2 class="section-title">
                <span class="section-icon">⭐</span>
                Reglas Adicionales Clásicas
              </h2>
              <div class="rules-list">
                <div class="rule-item">
                  <div class="rule-icon">🏛️</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Pokémon Estáticos Permitidos</h3>
                    <p class="rule-description">Se pueden capturar Pokémon estáticos (como legendarios en ubicaciones fijas) independientemente de la regla del primer encuentro.</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon">✨</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Excepción Shiny</h3>
                    <p class="rule-description">Si encuentras un Pokémon shiny, puedes capturarlo aunque no sea el primer encuentro de la ruta. <strong>Los Pokémon shiny tienen 2 vidas</strong> (pueden desmayarse una vez antes de morir permanentemente).</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon">📈</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Límite de Nivel</h3>
                    <p class="rule-description">No puedes superar el nivel del próximo Líder de Gimnasio, Elite 4 o Campeón. Esto evita el overleveling y mantiene el desafío.</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon">💊</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Sin Objetos Curativos</h3>
                    <p class="rule-description">No se pueden comprar objetos curativos (Pociones, Súper Pociones, etc.) ni objetos X (Ataque X, Defensa X, etc.). Solo se pueden usar los encontrados.</p>
                  </div>
                </div>

                <div class="rule-item">
                  <div class="rule-icon">👥</div>
                  <div class="rule-content">
                    <h3 class="rule-title">Sin Pokémon de Horda</h3>
                    <p class="rule-description">En juegos que tengan encuentros de horda, no se pueden capturar Pokémon de estas batallas grupales.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="rules-section">
              <h2 class="section-title">
                <span class="section-icon">💡</span>
                Consejos Adicionales
              </h2>
              <div class="rules-tips">
                <div class="tip-item">
                  <div class="tip-icon">🎮</div>
                  <p><strong>Modo Set:</strong> Juega en modo "Set" para que no te avisen cuando el rival va a sacar un Pokémon.</p>
                </div>
                <div class="tip-item">
                  <div class="tip-icon">📝</div>
                  <p><strong>Documentación:</strong> Lleva un registro de tus capturas, muertes y momentos importantes del desafío.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const mount = () => {
    container.innerHTML = render();
  };
  
  const init = () => {
    mount();
  };
  
  const setState = (newState) => {
    state = { ...state, ...newState };
    mount();
  };
  
  return {
    mount,
    init,
    setState,
    getState: () => state
  };
};

export default RulesPage;
