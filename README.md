# Pokémon Lockes App

Una aplicación web para gestionar cartas de Pokémon obtenidas a través de ruletas configurables, diseñada específicamente para lockes de Pokémon.

## Características

### ✨ Funcionalidades Principales
- **Ruletas Configurables**: Sistema de ruletas que se pueden configurar dinámicamente mediante JSON
- **Gestión de Cartas**: Colección completa de cartas con filtros y búsqueda avanzada
- **Persistencia Local**: Todos los datos se guardan en LocalStorage con abstracción para futura migración
- **Interfaz Pokémon**: Diseño inspirado en los juegos más recientes de Pokémon

### 🎰 Sistema de Ruletas
- Ruletas configurables con segmentos personalizables
- Pesos diferentes para cada segmento (probabilidades)
- Colores personalizables para cada segmento
- Generación automática de cartas al obtener resultados
- Animaciones suaves de giro

### 🃏 Gestión de Cartas
- Visualización de todas las cartas obtenidas
- Filtros por tipo, rareza y estado (usada/disponible)
- Búsqueda por nombre y descripción
- Marcado de cartas como usadas/no usadas
- Estadísticas de la colección
- Eliminación de cartas

### 🎨 Diseño
- Paleta de colores inspirada en Pokémon
- Colores específicos para cada tipo de Pokémon
- Animaciones y efectos visuales
- Diseño responsivo para móviles
- Interfaz intuitiva y moderna

## Estructura del Proyecto

```
app-lockes/
├── css/
│   └── styles.css              # Estilos principales
├── html/                       # (vacío, se usa index.html)
├── js/                         # (vacío, se usa src/)
├── src/
│   ├── components/             # Componentes reutilizables
│   │   ├── Card.js            # Componente de carta individual
│   │   ├── Navigation.js      # Navegación principal
│   │   └── Roulette.js        # Componente de ruleta
│   ├── models/                # Modelos de datos
│   │   └── Card.js            # Modelos Card y RouletteConfig
│   ├── pages/                 # Páginas principales
│   │   ├── CardsPage.js       # Página de gestión de cartas
│   │   └── RoulettesPage.js   # Página de ruletas
│   ├── services/              # Servicios de datos
│   │   ├── CardService.js     # Gestión de cartas
│   │   ├── RouletteService.js # Gestión de ruletas
│   │   └── StorageService.js  # Abstracción de almacenamiento
│   ├── utils/                 # Utilidades
│   │   └── Router.js          # Enrutador cliente
│   └── app.js                 # Punto de entrada
├── globals.d.ts               # Definiciones TypeScript
├── index.html                 # HTML principal
├── roulettes-config.json      # Configuración de ejemplo
└── README.md                  # Este archivo
```

## Arquitectura Técnica

### 🏗️ Componentes Funcionales
La aplicación utiliza un sistema de componentes funcionales basado en:
- **Funciones que retornan objetos** con métodos `mount()`, `setState()`, etc.
- **Template literals con `html`** para mejor syntax highlighting
- **Estado encapsulado** mediante closures
- **Inmutabilidad** en las actualizaciones de estado

### 🗄️ Almacenamiento
- **StorageService**: Abstracción sobre LocalStorage
- **Prefijo de claves**: `pokemon_lockes_` para evitar conflictos
- **Serialización JSON** automática
- **Manejo de errores** robusto

### 🧩 Principios de Diseño
- **SOLID**: Responsabilidad única por componente/servicio
- **KISS**: Simplicidad en la implementación
- **YAGNI**: Solo se implementa lo necesario
- **DRY**: Reutilización de componentes y utilidades

## Uso de la Aplicación

### 🚀 Inicio Rápido
1. Abre `index.html` en tu navegador
2. Ve a la sección "Ruletas"
3. Haz clic en "Crear Ruletas de Ejemplo" si no hay ninguna
4. Selecciona una ruleta y ¡gírala!
5. Ve a "Mis Cartas" para gestionar tu colección

### ⚙️ Configuración de Ruletas
Las ruletas se pueden configurar mediante JSON. Ejemplo:

```json
{
  "name": "Mi Ruleta",
  "description": "Descripción de la ruleta",
  "segments": [
    {
      "label": "Pikachu",
      "value": "pikachu",
      "weight": 3,
      "color": "#FFD700",
      "card": {
        "name": "Pikachu",
        "type": "electric",
        "rarity": "uncommon",
        "description": "El Pokémon ratón eléctrico"
      }
    }
  ]
}
```

### 🎯 Tipos de Pokémon Soportados
- Normal, Fire, Water, Electric, Grass, Ice
- Fighting, Poison, Ground, Flying, Psychic
- Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy

### 💎 Rarezas Disponibles
- **Common** (Común) - ⚪
- **Uncommon** (Poco común) - 🟢
- **Rare** (Rara) - 🔵
- **Epic** (Épica) - 🟣
- **Legendary** (Legendaria) - 🟡

## Desarrollo

### 📝 Requisitos
- Navegador moderno con soporte para ES6 modules
- Servidor web local (opcional, para desarrollo)

### 🔧 Extensión
Para añadir nuevas funcionalidades:

1. **Nuevos componentes**: Crear en `src/components/`
2. **Nuevos servicios**: Crear en `src/services/`
3. **Nuevas páginas**: Crear en `src/pages/` y registrar en `app.js`
4. **Nuevos estilos**: Añadir a `css/styles.css`

### 🗃️ Cambio de Sistema de Almacenamiento
Para migrar de LocalStorage a otro sistema:
1. Implementar nueva clase en `src/services/`
2. Mantener la misma interfaz que `StorageService`
3. Actualizar imports en los servicios que lo usen

## Ejemplos de Uso

### 🎲 Crear Ruleta Personalizada
```javascript
import RouletteService from './src/services/RouletteService.js';

const miRuleta = {
  name: "Ruleta Personalizada",
  description: "Mi ruleta especial",
  segments: [
    {
      label: "Resultado 1",
      weight: 2,
      color: "#FF0000",
      card: { /* datos de la carta */ }
    }
  ]
};

RouletteService.addRoulette(miRuleta);
```

### 🃏 Gestionar Cartas
```javascript
import CardService from './src/services/CardService.js';

// Obtener todas las cartas
const todasLasCartas = CardService.getAllCards();

// Filtrar cartas disponibles
const cartasDisponibles = CardService.getAvailableCards();

// Usar una carta
CardService.useCard(cardId);
```

## Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
