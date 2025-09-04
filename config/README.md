# Configuraciones de Pokémon Lockes

Este directorio contiene todos los archivos de configuración de la aplicación.

## Archivos de configuración

### `cards-config.json`
Define todas las cartas disponibles en el juego.

**Estructura:**
```json
{
  "cards": {
    "card_id": {
      "name": "Nombre de la carta",
      "type": "tipo_pokemon",
      "rarity": "common|uncommon|rare|epic|legendary",
      "description": "Descripción de la carta",
      "image": "URL_de_imagen_opcional"
    }
  }
}
```

### `roulettes-config.json`
Define las ruletas disponibles y sus segmentos.

**Estructura:**
```json
[
  {
    "name": "Nombre de la ruleta",
    "description": "Descripción de la ruleta",
    "segments": [
      {
        "label": "Texto mostrado",
        "value": "valor_interno",
        "weight": 1.0,
        "color": "#HEXCOLOR",
        "cardId": "id_de_carta_opcional",
        "coins": "small|medium|large|huge_opcional"
      }
    ]
  }
]
```

### `coins-config.json`
Define los precios por rareza y recompensas de monedas.

**Estructura:**
```json
{
  "rarityPrices": {
    "common": 10,
    "uncommon": 25,
    "rare": 50,
    "epic": 100,
    "legendary": 200
  },
  "coinRewards": {
    "small": 5,
    "medium": 15,
    "large": 30,
    "huge": 75
  },
  "initialCoins": 0
}
```

## Ruletas disponibles

1. **Victoria contra Líder de Gimnasio** - Mejores recompensas (cartas épicas y legendarias)
2. **Victoria contra Rival** - Recompensas intermedias (cartas raras y útiles)
3. **Liberar Pokémon** - Recompensas menores (cartas comunes y monedas pequeñas)

## Tipos de cartas

- **item**: Objetos consumibles (Master Ball, Pociones, etc.)
- **boost**: Mejoras temporales o permanentes
- **protection**: Cartas que protegen de situaciones adversas
- **strategy**: Cartas que modifican las reglas del juego

## Notas importantes

- **Cartas**: Todas las cartas están diseñadas específicamente para lockes de Pokémon
- **Ruletas**: Cada ruleta tiene diferentes probabilidades según la dificultad del logro
- **Monedas**: Los precios y recompensas se configuran centralmente
- **IDs**: Los IDs de cartas deben ser únicos y coincidir entre archivos
- **Sistema temático**: Ya no hay cartas de Pokémon específicos, solo herramientas para el locke
