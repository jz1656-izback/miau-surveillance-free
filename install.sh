#!/usr/bin/env bash
set -e
echo "🐱 Miau Surveillance Free — Production Install"
echo "=============================================="
echo ""

command -v node >/dev/null 2>&1 || { echo "❌ Node.js 18+ required"; exit 1; }

# Clone if needed
if [ ! -f "server.cjs" ]; then
  echo "📦 Cloning..."
  git clone https://github.com/jz1656-izback/miau-surveillance-free.git .
  echo ""
fi

# Start
echo "🚀 Starting on port ${PORT:-5199}..."
echo "   http://localhost:${PORT:-5199}"
echo ""
node server.cjs
