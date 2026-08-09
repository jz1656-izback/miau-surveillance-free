#!/bin/bash
# Combined launcher - both servers in one persistent process
cd /home/jevgeniz/Projekte/miau-surveillance-free
npx vite --port 5199 --host &
cd public && python3 -m http.server 5200 --bind 0.0.0.0 &
wait
