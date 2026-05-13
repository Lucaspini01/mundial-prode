import React, { useState, useEffect } from 'react';

/**
 * Componente principal para visualizar datos del Mundial 2026
 */
const WorldCup2026 = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teams');

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/data/worldcup-2026-data.json');
      if (!response.ok) throw new Error('Error al cargar datos');
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px' }}>
        ⚽ Cargando datos del Mundial 2026...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#fee', 
        border: '1px solid #f99',
        borderRadius: '8px'
      }}>
        ❌ Error: {error}
        <button onClick={loadData} style={{ marginLeft: '20px', padding: '8px 16px' }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!data) return <div>No hay datos disponibles</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ 
        background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '8px',
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: '0 0 10px 0' }}>🌍 MUNDIAL 2026</h1>
        <p style={{ margin: '0', opacity: 0.9 }}>
          {data.stats.totalTeams} equipos • {data.stats.totalFixtures} partidos • {data.stats.totalGroups} grupos
        </p>
        <p style={{ margin: '10px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
          Actualizado: {new Date(data.metadata.lastUpdated).toLocaleString()}
        </p>
      </header>

      {/* Tabs de navegación */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        borderBottom: '2px solid #ddd'
      }}>
        {['teams', 'fixtures', 'standings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab ? '#2a5298' : '#f0f0f0',
              color: activeTab === tab ? 'white' : '#333',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === tab ? 'bold' : 'normal',
              borderRadius: '4px 4px 0 0',
              transition: 'all 0.3s'
            }}
          >
            {tab === 'teams' && '🏆 Equipos'}
            {tab === 'fixtures' && '⚽ Partidos'}
            {tab === 'standings' && '📊 Clasificación'}
          </button>
        ))}
      </div>

      {/* Tab: Equipos */}
      {activeTab === 'teams' && <TeamsTab teams={data.teams} />}

      {/* Tab: Partidos */}
      {activeTab === 'fixtures' && <FixturesTab fixtures={data.fixtures} />}

      {/* Tab: Clasificación */}
      {activeTab === 'standings' && <StandingsTab standings={data.standings} />}

      {/* Footer */}
      <footer style={{
        marginTop: '40px',
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontSize: '12px',
        borderTop: '1px solid #eee'
      }}>
        <p>Fuente: API-Football (api-sports.io)</p>
        <button 
          onClick={loadData}
          style={{
            padding: '8px 16px',
            background: '#2a5298',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Actualizar datos
        </button>
      </footer>
    </div>
  );
};

/**
 * Tab: Equipos
 */
const TeamsTab = ({ teams }) => (
  <div>
    <h2>Equipos clasificados ({teams.length})</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '15px'
    }}>
      {teams.map(team => (
        <div 
          key={team.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            textAlign: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <img 
            src={team.flag} 
            alt={team.country}
            style={{
              width: '40px',
              height: '30px',
              marginBottom: '10px',
              borderRadius: '3px'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <h3 style={{ margin: '10px 0', fontSize: '16px' }}>{team.name}</h3>
          <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
            {team.country}
          </p>
          <p style={{ margin: '5px 0', fontSize: '11px', color: '#999' }}>
            Código: {team.code}
          </p>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Tab: Partidos
 */
const FixturesTab = ({ fixtures }) => (
  <div>
    <h2>Partidos ({fixtures.length})</h2>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      {fixtures.slice(0, 20).map(fixture => (
        <div 
          key={fixture.id}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            background: '#f9f9f9'
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '12px', color: '#999' }}>
              {new Date(fixture.date).toLocaleDateString()} 
              {' - '}
              {new Date(fixture.date).toLocaleTimeString()}
            </span>
            <span style={{
              fontSize: '11px',
              background: fixture.status.short === 'FT' ? '#2ecc71' : '#f39c12',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              {fixture.status.short}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ textAlign: 'right', flex: 1 }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>{fixture.teams.home.name}</p>
            </div>
            
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              minWidth: '60px',
              textAlign: 'center'
            }}>
              {fixture.goals.home ?? '-'} : {fixture.goals.away ?? '-'}
            </div>
            
            <div style={{ textAlign: 'left', flex: 1 }}>
              <p style={{ margin: '0', fontWeight: 'bold' }}>{fixture.teams.away.name}</p>
            </div>
          </div>
          
          <div style={{
            marginTop: '10px',
            fontSize: '12px',
            color: '#666',
            borderTop: '1px solid #eee',
            paddingTop: '10px'
          }}>
            📍 {fixture.venue.name || 'Venue TBD'}
          </div>
        </div>
      ))}
      {fixtures.length > 20 && (
        <p style={{ textAlign: 'center', color: '#999' }}>
          Mostrando 20 de {fixtures.length} partidos...
        </p>
      )}
    </div>
  </div>
);

/**
 * Tab: Clasificación
 */
const StandingsTab = ({ standings }) => (
  <div>
    <h2>Clasificación por grupos</h2>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    }}>
      {standings.map(group => (
        <div 
          key={group.group}
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        >
          <div style={{
            background: '#2a5298',
            color: 'white',
            padding: '15px',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center'
          }}>
            Grupo {group.group}
          </div>
          
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Pos</th>
                <th style={{ padding: '8px', textAlign: 'left', fontSize: '12px' }}>Equipo</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>PJ</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>G</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>E</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>P</th>
                <th style={{ padding: '8px', textAlign: 'center', fontSize: '12px' }}>Pts</th>
              </tr>
            </thead>
            <tbody>
              {group.teams.map(team => (
                <tr 
                  key={team.team.id}
                  style={{
                    borderBottom: '1px solid #eee',
                    background: team.position === 1 || team.position === 2 ? '#f0f8ff' : 'white'
                  }}
                >
                  <td style={{ padding: '10px 8px', fontWeight: 'bold' }}>{team.position}</td>
                  <td style={{ padding: '10px 8px' }}>{team.team.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{team.played}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#2ecc71' }}>{team.wins}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#f39c12' }}>{team.draws}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#e74c3c' }}>{team.losses}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 'bold' }}>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  </div>
);

export default WorldCup2026;
