# 🌍 MUNDIAL 2026 - GUÍA DE IMPLEMENTACIÓN

Este es un conjunto completo de archivos para cargar y visualizar datos del Mundial 2026 usando API-Football.

## 📋 ÍNDICE

1. [Requisitos](#requisitos)
2. [Estructura de archivos](#estructura-de-archivos)
3. [Paso a paso - Configuración](#paso-a-paso---configuración)
4. [Paso a paso - Obtener datos](#paso-a-paso---obtener-datos)
5. [Integración en tu web](#integración-en-tu-web)
6. [Solución de problemas](#solución-de-problemas)

---

## 📦 Requisitos

- ✅ Node.js 14+ instalado
- ✅ Cuenta gratuita en [API-Football](https://dashboard.api-football.com)
- ✅ Tu API Key de API-Football
- ✅ Internet (para descargar datos)

---

## 📁 Estructura de archivos

```
proyecto/
├── config.js                      # Configuración de la API
├── fetch-worldcup-data.js         # Script para obtener datos
├── worldcup-2026-data.json        # Datos descargados (se genera)
├── WorldCup2026.jsx               # Componente React para visualizar
└── README.md                       # Este archivo
```

---

## 🔧 Paso a paso - Configuración

### 1. OBTENER API KEY

1. Ve a https://dashboard.api-football.com
2. Regístrate gratuitamente (sin tarjeta de crédito)
3. Copia tu API Key

### 2. ACTUALIZAR CONFIG.JS

En el archivo `config.js`, reemplaza:

```javascript
API_KEY: 'YOUR_API_KEY_HERE',
```

Con tu clave:

```javascript
API_KEY: 'TU_CLAVE_AQUI_1234567890abcdef',
```

**Opción alternativa (más segura):**
En lugar de poner la clave en el código, puedes usar variables de entorno:

```bash
export API_FOOTBALL_KEY=tu_clave_aqui
```

---

## 📡 Paso a paso - Obtener datos

### Opción 1: Con Node.js (Recomendado)

```bash
# Navegar a la carpeta del proyecto
cd tu-proyecto

# Ejecutar el script
node fetch-worldcup-data.js
```

**Salida esperada:**
```
═══════════════════════════════════════════════════════
🌍 MUNDIAL 2026 - DESCARGA DE DATOS COMPLETA
═══════════════════════════════════════════════════════

📡 Realizando request: /teams?league=1&season=2026
✅ Request 1/100 - Restantes: 99

📡 Realizando request: /fixtures?league=1&season=2026
✅ Request 2/100 - Restantes: 98

📡 Realizando request: /standings?league=1&season=2026
✅ Request 3/100 - Restantes: 97

📋 Obteniendo información de cobertura...
✅ Información de cobertura obtenida

💾 Datos guardados en: /ruta/worldcup-2026-data.json

═══════════════════════════════════════════════════════
✅ DESCARGA COMPLETADA CON ÉXITO
═══════════════════════════════════════════════════════
⏱️  Tiempo: 2.45s
📊 Datos cargados:
   • 48 equipos
   • 104 partidos
   • 12 grupos
   • 4/100 requests usados
═══════════════════════════════════════════════════════
```

### Opción 2: Usar datos de ejemplo

Si quieres probar sin obtener datos reales, el archivo `worldcup-2026-data.json` incluye datos de ejemplo que funcionan para testing.

---

## 🖥️ Integración en tu web

### Paso 1: Copiar los archivos

Copia estos archivos a tu proyecto web:

```
tu-web/
├── data/
│   └── worldcup-2026-data.json    # Datos del mundial
├── components/
│   └── WorldCup2026.jsx            # Componente React
└── ...
```

### Paso 2: Usar el componente React

En tu página principal:

```jsx
import WorldCup2026 from './components/WorldCup2026';

export default function App() {
  return (
    <div>
      <WorldCup2026 />
    </div>
  );
}
```

### Paso 3: Asegurar acceso a datos

El componente intenta cargar datos desde `/data/worldcup-2026-data.json`.

**Si usas webpack/vite:**
```javascript
// En tu configuración
{
  test: /\.json$/,
  type: 'asset/resource',
  include: path.resolve(__dirname, 'public/data')
}
```

**Si usas archivos estáticos:**
Coloca `worldcup-2026-data.json` en tu carpeta `public/data/`

---

## 🔄 Actualizar datos automáticamente

### Opción 1: CRON Job (Linux/Mac)

```bash
# Editar crontab
crontab -e

# Agregar línea para actualizar a las 12:00 PM cada día
0 12 * * * cd /ruta/proyecto && node fetch-worldcup-data.js

# Guardar con Ctrl+X, luego Y, Enter
```

### Opción 2: Script con Node.js

```javascript
// auto-update.js
import schedule from 'node-schedule';
import WorldCup2026Fetcher from './fetch-worldcup-data.js';

const job = schedule.scheduleJob('0 12 * * *', async () => {
  console.log('Actualizando datos del Mundial 2026...');
  const fetcher = new WorldCup2026Fetcher(process.env.API_FOOTBALL_KEY);
  await fetcher.fetchAll();
});

console.log('⏰ Actualizaciones programadas para las 12:00 PM diarios');
```

Ejecutar:
```bash
node auto-update.js
```

---

## 📊 Estructura de datos

### worldcup-2026-data.json

```json
{
  "metadata": {
    "lastUpdated": "2026-05-12T15:30:00Z",
    "tournament": "FIFA World Cup 2026",
    "totalRequests": 4,
    "source": "API-Football"
  },
  "stats": {
    "totalTeams": 48,
    "totalFixtures": 104,
    "totalGroups": 12,
    "requestsUsed": 4
  },
  "teams": [...],          // Datos de los 48 equipos
  "fixtures": [...],       // Datos de los 104 partidos
  "standings": [...],      // Clasificación de 12 grupos
  "leagueInfo": {...}      // Información de la competencia
}
```

---

## 🎨 Componente WorldCup2026.jsx

### Características

✅ Visualización de los 48 equipos
✅ Calendario de partidos
✅ Clasificación por grupos
✅ Banderas de países
✅ Estados en vivo
✅ Diseño responsive

### Props

Ninguna - el componente carga datos automáticamente.

### Ejemplo de uso avanzado

```jsx
import WorldCup2026 from './WorldCup2026';

export default function TuPagina() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <WorldCup2026 />
    </div>
  );
}
```

---

## 🚀 API-Football - Endpoints útiles

### Teams (Equipos)
```
GET /teams?league=1&season=2026
```

Retorna: Lista de 48 equipos con logos y banderas

### Fixtures (Partidos)
```
GET /fixtures?league=1&season=2026
```

Retorna: Lista de 104 partidos con fechas, horarios, resultados

### Standings (Clasificación)
```
GET /standings?league=1&season=2026
```

Retorna: Tablas de clasificación de los 12 grupos

### League Info (Información)
```
GET /leagues?id=1&season=2026
```

Retorna: Información de cobertura de datos disponibles

---

## ⚠️ Solución de problemas

### Error: "API_KEY no configurada"

**Solución:**
```javascript
// config.js
API_KEY: 'TU_CLAVE_API_AQUI'
```

O usar variable de entorno:
```bash
export API_FOOTBALL_KEY=tu_clave
```

### Error: "Límite de requests alcanzado"

**Causa:** Se alcanzó el límite de 100 requests/día del plan free.

**Solución:**
1. Los datos se cachean en `worldcup-2026-data.json`
2. Esperar hasta mañana para actualizar
3. O actualizar a plan Pro ($19/mes)

### Las banderas no se muestran

**Causa:** flagcdn.com está bloqueado o el código de país es incorrecto.

**Solución:**
1. Verificar conexión a internet
2. Revisar mapeo en `config.js` (FLAGS.countryMap)
3. Usar CORS proxy si es necesario

### Los datos no se actualizan

**Solución:**
1. Limpiar cache del navegador (Ctrl+Shift+Delete)
2. Ejecutar script nuevamente: `node fetch-worldcup-data.js`
3. Revisar que `worldcup-2026-data.json` tiene fecha reciente

---

## 📈 Estadísticas de uso

Con el plan FREE de API-Football:

| Recurso | Límite |
|---------|--------|
| Requests/día | 100 |
| Ligas accesibles | 10 |
| Endpoint de estadísticas | ✅ Sí |
| Endpoint de odds | ❌ No |
| Actualizaciones/día | Ilimitadas |

**Para obtener todos los datos del Mundial:**
- 1 request: teams
- 1 request: fixtures
- 1 request: standings
- 1 request: league info
- **Total: 4 requests por descarga completa**

Puedes actualizar **25 veces al día** sin problemas.

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Nunca expongas tu API Key en código público.

**En producción:**
```javascript
// ❌ MAL
const apiKey = 'abc123public';  // Visible en inspector

// ✅ BIEN - Usar servidor backend
const response = await fetch('/api/worldcup', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

Configura tu backend para llamar a API-Football:
```javascript
// backend.js
app.get('/api/worldcup', async (req, res) => {
  const apiKey = process.env.API_FOOTBALL_KEY; // Variable de entorno
  const response = await fetch('https://v3.football.api-sports.io/teams...', {
    headers: { 'x-apisports-key': apiKey }
  });
  res.json(await response.json());
});
```

---

## 📚 Referencias

- 📖 [Documentación API-Football](https://www.api-football.com/documentation-v3)
- 🌐 [API-Football Dashboard](https://dashboard.api-football.com)
- 🚩 [Banderas flagcdn](https://flagcdn.com)
- ⚽ [Mundial 2026 - FIFA](https://www.fifa.com)

---

## 💡 Tips y trucos

### Optimizar uso de API

```javascript
// Cachear datos por 1 hora
const cache = {
  teams: { data: null, timestamp: null },
  fixtures: { data: null, timestamp: null },
  standings: { data: null, timestamp: null }
};

const CACHE_TIME = 3600000; // 1 hora

async function getTeamsWithCache() {
  const now = Date.now();
  if (cache.teams.data && now - cache.teams.timestamp < CACHE_TIME) {
    return cache.teams.data;
  }
  
  const data = await fetchTeams();
  cache.teams = { data, timestamp: now };
  return data;
}
```

### Filtrar partidos por grupo

```javascript
const groupAMatches = data.fixtures.filter(f => 
  f.league.round === 'Group A'
);
```

### Obtener tabla de un grupo específico

```javascript
const groupA = data.standings.find(s => s.group === 'A');
```

---

## 🎯 Próximos pasos

1. ✅ Configura tu API Key
2. ✅ Ejecuta `node fetch-worldcup-data.js`
3. ✅ Integra el componente React en tu web
4. ✅ Personaliza estilos según tu diseño
5. ✅ Configura actualización automática (CRON)
6. ✅ Deploy a producción

---

¿Preguntas? Revisa la [documentación de API-Football](https://www.api-football.com/documentation-v3)

¡Buena suerte con tu proyecto del Mundial 2026! ⚽🌍
