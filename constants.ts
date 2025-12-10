export const THEME = {
  colors: {
    emerald: '#002E1E',
    emeraldDark: '#01150E',
    gold: '#FFD700',
    champagne: '#F7E7CE',
    ruby: '#8B0000',
    sapphire: '#0F52BA',
    obsidian: '#0A0A0A'
  },
  materials: {
    treeRoughness: 0.8,
    ornamentMetalness: 0.9,
    ornamentRoughness: 0.1,
  }
};

export const INITIAL_CONFIG = {
  lightColor: THEME.colors.gold,
  ornamentColor: THEME.colors.gold,
  rotationSpeed: 0.5,
  bloomIntensity: 1.5,
  isExploded: false, // Start assembled
};