// Configuración de API-Football para Mundial 2026
export const API_CONFIG = {
  // Leída desde .env.local — nunca hardcodear aquí
  API_KEY: process.env.API_FOOTBALL_KEY,
  
  // Base URL de la API
  BASE_URL: 'https://v3.football.api-sports.io',
  
  // Identificadores del Mundial 2026
  WORLD_CUP_2026: {
    league_id: 1,        // ID del World Cup en la API
    season: 2026,
    name: 'FIFA World Cup 2026'
  },
  
  // Endpoints principales
  ENDPOINTS: {
    // Obtener todos los equipos (48 selecciones)
    teams: '/teams?league=1&season=2026',
    
    // Obtener todos los partidos (104 matches)
    fixtures: '/fixtures?league=1&season=2026',
    
    // Obtener clasificaciones de todos los grupos
    standings: '/standings?league=1&season=2026',
    
    // Obtener información de la liga (cobertura, detalles)
    leagues: '/leagues?id=1&season=2026',
    
    // Obtener un partido específico con detalles
    fixtureDetail: (fixtureId) => `/fixtures?id=${fixtureId}`,
  },
  
  // Configuración de la API
  HEADERS: (apiKey) => ({
    'x-apisports-key': apiKey,
    'Content-Type': 'application/json'
  }),
  
  // URLs de banderas alternativas
  FLAGS: {
    provider: 'flagcdn',
    base_url: 'https://flagcdn.com/w640',
    // Mapeo de países a códigos de bandera
    countryMap: {
      'Argentina': 'ar',
      'Australia': 'au',
      'Belgium': 'be',
      'Brazil': 'br',
      'Canada': 'ca',
      'Croatia': 'hr',
      'Czech Republic': 'cz',
      'Denmark': 'dk',
      'Ecuador': 'ec',
      'Egypt': 'eg',
      'England': 'gb-eng',
      'France': 'fr',
      'Germany': 'de',
      'Ghana': 'gh',
      'Greece': 'gr',
      'Iran': 'ir',
      'Iraq': 'iq',
      'Japan': 'jp',
      'Jordan': 'jo',
      'Mexico': 'mx',
      'Morocco': 'ma',
      'Netherlands': 'nl',
      'New Zealand': 'nz',
      'North Korea': 'kp',
      'Panama': 'pa',
      'Paraguay': 'py',
      'Peru': 'pe',
      'Poland': 'pl',
      'Portugal': 'pt',
      'Qatar': 'qa',
      'Senegal': 'sn',
      'Serbia': 'rs',
      'Slovakia': 'sk',
      'Slovenia': 'si',
      'South Africa': 'za',
      'South Korea': 'kr',
      'Spain': 'es',
      'Sweden': 'se',
      'Switzerland': 'ch',
      'Tunisia': 'tn',
      'Turkey': 'tr',
      'Ukraine': 'ua',
      'United States': 'us',
      'Uruguay': 'uy',
      'Uzbekistan': 'uz',
      'Wales': 'gb-wls',
      'Bosnia and Herzegovina': 'ba',
      'Curacao': 'cw'
    }
  },
  
  // Configuración de almacenamiento local
  STORAGE: {
    // Archivo donde se guardan los datos
    dataFile: 'worldcup-2026-data.json',
    
    // Tiempos de actualización (en milisegundos)
    updateIntervals: {
      teams: 86400000,      // 1 día
      fixtures: 3600000,    // 1 hora (cambios de horarios)
      standings: 3600000,   // 1 hora (cambios en clasificación)
    }
  }
};

// Pares de equipos que clasificaron (para mapear con banderas)
export const TEAMS_DATA = {
  groups: {
    A: ['Mexico', 'South Africa', 'Korea Republic', 'Czech Republic'],
    B: ['Canada', 'Bosnia and Herzegovina', 'Qatar', 'Switzerland'],
    C: ['Brazil', 'Nigeria', 'Cameroon', 'New Zealand'],
    D: ['United States', 'Suriname', 'Jamaica', 'Panama'],
    E: ['Germany', 'Netherlands', 'Belgium', 'Serbia'],
    F: ['Spain', 'Greece', 'Portugal', 'Ukraine'],
    G: ['France', 'Norway', 'Iceland', 'Sweden'],
    H: ['Argentina', 'Uruguay', 'Paraguay', 'Peru'],
    I: ['Italy', 'Austria', 'Bulgaria', 'Romania'],
    J: ['Poland', 'Hungary', 'Slovenia', 'Slovakia'],
    K: ['England', 'Wales', 'Croatia', 'Türkiye'],
    L: ['Japan', 'South Korea', 'Iran', 'Iraq']
  }
};
