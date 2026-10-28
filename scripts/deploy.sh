#!/bin/bash
# Deploy script for bigrich88888.xin
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🚀 Deploying to $ENVIRONMENT..."

if [ "$ENVIRONMENT" = "production" ]; then
    echo "📦 Building Astro site..."
    cd "$ROOT_DIR/astro-site"
    npm run build
    
    echo "📋 Copying files to server..."
    # Deploy static files
    sudo cp -r --remove-destination "$ROOT_DIR/www/"* /usr/share/nginx/html/
    
    # Deploy Astro build
    if [ -d "$ROOT_DIR/astro-site/dist" ]; then
        sudo cp -r --remove-destination "$ROOT_DIR/astro-site/dist/"* /usr/share/nginx/html/slash/
    fi
    
    echo "🔧 Setting permissions..."
    sudo chown -R root:admin /usr/share/nginx/html/
    sudo chmod -R 755 /usr/share/nginx/html/
    
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    
    echo "✅ Deployment completed!"
else
    echo "⚠️  Unknown environment: $ENVIRONMENT"
    exit 1
fi
