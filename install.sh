#!/usr/bin/env bash
set -e

echo "🐱 Miau Surveillance Free — Installer"
echo "======================================"
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install: https://nodejs.org"; exit 1; }
command -v npm  >/dev/null 2>&1 || { echo "❌ npm is required."; exit 1; }
command -v git  >/dev/null 2>&1 || { echo "❌ git is required."; exit 1; }

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ required (found v$(node -v))"
  exit 1
fi

echo "✅ Node $(node -v) — OK"
echo "✅ npm $(npm -v) — OK"
echo ""

# Clone if not already in the repo
if [ ! -f "package.json" ]; then
  echo "📦 Cloning repository..."
  git clone https://github.com/jz1656-izback/miau-surveillance-free.git .
  echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo ""

# Copy Windy keys template if not exists
if [ ! -f "src/api/windy-keys.ts" ]; then
  echo "🔑 Creating Windy keys template..."
  cp src/api/windy-keys.example.ts src/api/windy-keys.ts
  echo "   ⚠️  Optional: edit src/api/windy-keys.ts with your Windy API keys"
  echo "   Get free keys at: https://www.windy.com/api-keys"
  echo ""
fi

# Build
echo "🔨 Building..."
npm run build
echo ""

# Start options
PORT=${PORT:-5199}
PRESENT_PORT=${PRESENT_PORT:-5200}

echo "✅ Build complete!"
echo ""
echo "🚀 Start options:"
echo ""
echo "   Production (static, no Vite):"
echo "     npm start                     → http://localhost:$PORT"
echo ""
echo "   Development (hot reload):"
echo "     npm run dev                   → http://localhost:$PORT"
echo ""
echo "   Presentation page:"
echo "     npm run present               → http://localhost:$PRESENT_PORT"
echo ""
echo "🐱 Miau!"
