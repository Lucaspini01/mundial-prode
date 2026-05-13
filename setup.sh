#!/bin/bash

# Script de instalación rápida para Mundial 2026

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🌍 MUNDIAL 2026 - SCRIPT DE INSTALACIÓN                  ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "📥 Descárgalo desde: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js detectado: $(node --version)"
echo ""

# Leer API Key
echo "🔑 CONFIGURACIÓN DE API KEY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Ve a: https://dashboard.api-football.com"
echo "2. Copia tu API Key"
echo "3. Pégala aquí:"
echo ""

read -p "Ingresa tu API Key: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "❌ API Key no proporcionada"
    exit 1
fi

# Actualizar config.js
echo ""
echo "💾 Actualizando config.js..."

# Escape para sed
API_KEY_ESCAPED=$(echo "$API_KEY" | sed 's/[\/&]/\\&/g')

# Usar sed para actualizar
sed -i.bak "s/API_KEY: 'YOUR_API_KEY_HERE'/API_KEY: '$API_KEY_ESCAPED'/" config.js

if [ $? -eq 0 ]; then
    echo "✅ config.js actualizado"
else
    echo "❌ Error al actualizar config.js"
    exit 1
fi

# Crear directorio de datos
echo ""
echo "📁 Creando estructura de carpetas..."
mkdir -p data
mkdir -p components
mkdir -p public/data

echo "✅ Carpetas creadas"
echo ""

# Preguntar si descargar datos
echo "🔄 DESCARGA DE DATOS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "¿Descargar datos ahora? (s/n): " DOWNLOAD

if [[ "$DOWNLOAD" == "s" || "$DOWNLOAD" == "S" || "$DOWNLOAD" == "y" || "$DOWNLOAD" == "Y" ]]; then
    echo ""
    echo "📡 Descargando datos del Mundial 2026..."
    echo ""
    node fetch-worldcup-data.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Datos descargados correctamente"
        
        # Copiar a carpeta public si existe
        if [ -f "worldcup-2026-data.json" ]; then
            cp worldcup-2026-data.json public/data/ 2>/dev/null || true
            echo "✅ Datos copiados a public/data/"
        fi
    else
        echo ""
        echo "⚠️  Error durante la descarga"
        echo "   Intenta nuevamente con: node fetch-worldcup-data.js"
    fi
else
    echo "⏭️  Descarga omitida"
fi

# Mostrar resumen
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALACIÓN COMPLETADA                               ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📍 PRÓXIMOS PASOS:"
echo ""
echo "1. Integra el componente en tu web:"
echo "   import WorldCup2026 from './components/WorldCup2026';"
echo ""
echo "2. Los datos están en:"
echo "   public/data/worldcup-2026-data.json"
echo ""
echo "3. Para actualizar datos:"
echo "   node fetch-worldcup-data.js"
echo ""
echo "4. Para programar actualizaciones automáticas:"
echo "   crontab -e"
echo "   Agregar: 0 12 * * * cd $(pwd) && node fetch-worldcup-data.js"
echo ""
echo "📚 Para más información, revisa README.md"
echo ""
echo "¡Listo para el Mundial 2026! ⚽🌍"
echo ""
