#!/bin/bash
# Miau Surveillance - Keepalive Script
# Monitors and restarts servers on 5199 and 5200

log() { echo "[$(date +%H:%M:%S)] $1"; }

while true; do
  # Check 5199 (Vite dev server)
  if ! curl -sf -o /dev/null http://localhost:5199/ 2>/dev/null; then
    log "5199 DOWN - restarting Vite"
    fuser -k 5199/tcp 2>/dev/null
    sleep 1
    cd /home/jevgeniz/Projekte/miau-surveillance-free
    npx vite --port 5199 --host > /dev/null 2>&1 &
    log "5199 restarted"
  fi
  
  sleep 10
done
