// Script para obtener datos del Mundial 2026 desde API-Football
import { API_CONFIG } from './config.js';
import fs from 'fs';
import path from 'path';

class WorldCup2026Fetcher {
  constructor(apiKey) {
    if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
      throw new Error(
        '❌ API_KEY no configurada. Por favor actualiza config.js con tu clave de API-Football'
      );
    }
    this.apiKey = apiKey;
    this.baseUrl = API_CONFIG.BASE_URL;
    this.requestCount = 0;
    this.maxRequests = 100; // Límite del plan free
  }

  /**
   * Hacer una solicitud a la API
   */
  async makeRequest(endpoint) {
    if (this.requestCount >= this.maxRequests) {
      throw new Error(`❌ Límite de ${this.maxRequests} requests diarios alcanzado`);
    }

    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      console.log(`📡 Realizando request: ${endpoint}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: API_CONFIG.HEADERS(this.apiKey)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      this.requestCount++;

      // Mostrar headers de rate limit
      const remaining = response.headers.get('x-ratelimit-requests-remaining');
      const limit = response.headers.get('x-ratelimit-requests-limit');
      
      if (remaining !== null) {
        console.log(`✅ Request ${this.requestCount}/${limit} - Restantes: ${remaining}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Error en request: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener todos los equipos del Mundial
   */
  async fetchTeams() {
    console.log('\n🏆 Obteniendo equipos del Mundial 2026...');
    const data = await this.makeRequest(API_CONFIG.ENDPOINTS.teams);
    
    if (!data.response) {
      throw new Error('No se obtuvieron equipos');
    }

    const teams = data.response.map(item => {
      const team = item.team;
      const countryCode = this.getCountryCode(team.country);
      
      return {
        id: team.id,
        name: team.name,
        country: team.country,
        code: team.code || countryCode,
        founded: team.founded,
        national: team.national,
        logo: team.logo,
        flag: `https://flagcdn.com/w640/${countryCode}.png`
      };
    });

    console.log(`✅ ${teams.length} equipos obtenidos correctamente`);
    return teams;
  }

  /**
   * Obtener todos los partidos del Mundial
   */
  async fetchFixtures() {
    console.log('\n⚽ Obteniendo partidos del Mundial 2026...');
    const data = await this.makeRequest(API_CONFIG.ENDPOINTS.fixtures);
    
    if (!data.response) {
      throw new Error('No se obtuvieron partidos');
    }

    const fixtures = data.response.map(item => ({
      id: item.fixture.id,
      date: item.fixture.date,
      timestamp: item.fixture.timestamp,
      timezone: item.fixture.timezone,
      status: item.fixture.status,
      venue: {
        id: item.fixture.venue?.id,
        name: item.fixture.venue?.name,
        city: item.fixture.venue?.city,
        country: item.fixture.venue?.country
      },
      league: {
        id: item.league.id,
        name: item.league.name,
        country: item.league.country,
        logo: item.league.logo,
        season: item.league.season,
        round: item.league.round
      },
      teams: {
        home: {
          id: item.teams.home.id,
          name: item.teams.home.name,
          logo: item.teams.home.logo,
          winner: item.teams.home.winner
        },
        away: {
          id: item.teams.away.id,
          name: item.teams.away.name,
          logo: item.teams.away.logo,
          winner: item.teams.away.winner
        }
      },
      goals: {
        home: item.goals.home,
        away: item.goals.away
      },
      score: {
        halftime: {
          home: item.score.halftime?.home,
          away: item.score.halftime?.away
        },
        fulltime: {
          home: item.score.fulltime?.home,
          away: item.score.fulltime?.away
        },
        extratime: {
          home: item.score.extratime?.home,
          away: item.score.extratime?.away
        },
        penalty: {
          home: item.score.penalty?.home,
          away: item.score.penalty?.away
        }
      }
    }));

    console.log(`✅ ${fixtures.length} partidos obtenidos correctamente`);
    return fixtures;
  }

  /**
   * Obtener clasificaciones de todos los grupos
   */
  async fetchStandings() {
    console.log('\n📊 Obteniendo clasificaciones...');
    const data = await this.makeRequest(API_CONFIG.ENDPOINTS.standings);
    
    if (!data.response) {
      throw new Error('No se obtuvieron clasificaciones');
    }

    const standings = data.response[0].league.standings.map((groupTeams, groupIndex) => {
      const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
      
      return {
        group: groupLetters[groupIndex] || `Group ${groupIndex + 1}`,
        teams: groupTeams.map(team => ({
          position: team.rank,
          team: {
            id: team.team.id,
            name: team.team.name,
            logo: team.team.logo
          },
          points: team.points,
          goalsDiff: team.goalsDiff,
          played: team.all.played,
          wins: team.all.win,
          draws: team.all.draw,
          losses: team.all.lose,
          goals: {
            for: team.all.goals.for,
            against: team.all.goals.against
          },
          form: team.form,
          status: team.status,
          description: team.description
        }))
      };
    });

    console.log(`✅ Clasificaciones de ${standings.length} grupos obtenidas`);
    return standings;
  }

  /**
   * Obtener información de cobertura de la liga
   */
  async fetchLeagueInfo() {
    console.log('\n📋 Obteniendo información de cobertura...');
    const data = await this.makeRequest(API_CONFIG.ENDPOINTS.leagues);
    
    if (!data.response || data.response.length === 0) {
      throw new Error('No se obtuvo información de la liga');
    }

    const league = data.response[0];
    const coverage = league.coverage;

    console.log('✅ Información de cobertura obtenida');
    console.log(`   Fixtures (eventos): ${coverage.fixtures.events}`);
    console.log(`   Fixtures (lineups): ${coverage.fixtures.lineups}`);
    console.log(`   Standings: ${coverage.standings}`);
    console.log(`   Jugadores: ${coverage.players}`);
    console.log(`   Top scorers: ${coverage.top_scorers}`);
    console.log(`   Odds: ${coverage.odds}`);

    return {
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
        logo: league.logo,
        season: league.season
      },
      coverage
    };
  }

  /**
   * Mapear nombre de país a código de bandera
   */
  getCountryCode(countryName) {
    const map = API_CONFIG.FLAGS.countryMap;
    return map[countryName] || countryName.toLowerCase().substring(0, 2);
  }

  /**
   * Guardar datos en archivo JSON
   */
  saveToFile(data, filename = 'worldcup-2026-data.json') {
    const outputPath = path.join(process.cwd(), filename);
    
    const jsonData = {
      metadata: {
        lastUpdated: new Date().toISOString(),
        tournament: 'FIFA World Cup 2026',
        totalRequests: this.requestCount,
        source: 'API-Football (api-sports.io)'
      },
      ...data
    };

    fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2), 'utf8');
    console.log(`\n💾 Datos guardados en: ${outputPath}`);
    
    return outputPath;
  }

  /**
   * Ejecutar la descarga completa
   */
  async fetchAll() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🌍 MUNDIAL 2026 - DESCARGA DE DATOS COMPLETA');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
      const startTime = Date.now();

      // Obtener todos los datos
      const [teams, fixtures, standings, leagueInfo] = await Promise.all([
        this.fetchTeams(),
        this.fetchFixtures(),
        this.fetchStandings(),
        this.fetchLeagueInfo()
      ]);

      const elapsed = Date.now() - startTime;

      // Compilar datos
      const allData = {
        teams,
        fixtures,
        standings,
        leagueInfo,
        stats: {
          totalTeams: teams.length,
          totalFixtures: fixtures.length,
          totalGroups: standings.length,
          requestsUsed: this.requestCount
        }
      };

      // Guardar archivo
      this.saveToFile(allData);

      // Resumen
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ DESCARGA COMPLETADA CON ÉXITO');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`⏱️  Tiempo: ${(elapsed / 1000).toFixed(2)}s`);
      console.log(`📊 Datos cargados:`);
      console.log(`   • ${teams.length} equipos`);
      console.log(`   • ${fixtures.length} partidos`);
      console.log(`   • ${standings.length} grupos`);
      console.log(`   • ${this.requestCount}/100 requests usados`);
      console.log('═══════════════════════════════════════════════════════\n');

      return allData;
    } catch (error) {
      console.error('\n❌ ERROR DURANTE LA DESCARGA:');
      console.error(error.message);
      process.exit(1);
    }
  }
}

/**
 * EJECUCIÓN
 */
async function main() {
  const apiKey = process.env.API_FOOTBALL_KEY || API_CONFIG.API_KEY;
  
  const fetcher = new WorldCup2026Fetcher(apiKey);
  await fetcher.fetchAll();
}

main().catch(console.error);

export default WorldCup2026Fetcher;
