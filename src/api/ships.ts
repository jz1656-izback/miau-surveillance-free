export interface Ship {
  mmsi: number;
  name: string;
  lat: number;
  lon: number;
  heading: number;
  speed: number; // knots
  type: 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'military' | 'other';
  destination?: string;
}

// AISHub provides free AIS data with registration
// Fallback: sample ships for demo
const DEMO_SHIPS: Ship[] = [
  { mmsi: 367000000, name: 'Ever Forward', lat: 37.7, lon: -122.3, heading: 270, speed: 12, type: 'cargo', destination: 'Oakland' },
  { mmsi: 367000001, name: 'MSC Oscar', lat: 34.2, lon: -119.5, heading: 180, speed: 18, type: 'cargo', destination: 'Los Angeles' },
  { mmsi: 367000002, name: 'CMA CGM Marco Polo', lat: 28.4, lon: -94.8, heading: 90, speed: 15, type: 'cargo', destination: 'Houston' },
  { mmsi: 367000003, name: 'Oasis of the Seas', lat: 25.7, lon: -79.3, heading: 135, speed: 20, type: 'passenger', destination: 'Miami' },
  { mmsi: 367000004, name: 'Queen Mary 2', lat: 50.9, lon: -1.4, heading: 270, speed: 22, type: 'passenger', destination: 'New York' },
  { mmsi: 367000005, name: 'Nordic Tanker', lat: 55.7, lon: 12.6, heading: 45, speed: 10, type: 'tanker', destination: 'Copenhagen' },
  { mmsi: 367000006, name: 'Arctic Fisher', lat: 68.5, lon: 15.0, heading: 315, speed: 8, type: 'fishing', destination: 'Tromso' },
  { mmsi: 367000007, name: 'Ever Given', lat: 30.1, lon: 32.5, heading: 0, speed: 14, type: 'cargo', destination: 'Suez' },
  { mmsi: 367000008, name: 'Fuji Maru', lat: 35.0, lon: 139.9, heading: 180, speed: 16, type: 'cargo', destination: 'Tokyo' },
  { mmsi: 367000009, name: 'Singapore Star', lat: 1.3, lon: 104.0, heading: 90, speed: 12, type: 'tanker', destination: 'Singapore' },
  { mmsi: 367000010, name: 'Pacific Voyager', lat: -33.9, lon: 151.3, heading: 0, speed: 18, type: 'passenger', destination: 'Sydney' },
  { mmsi: 367000011, name: 'Dubai Pearl', lat: 25.2, lon: 55.0, heading: 270, speed: 4, type: 'tanker', destination: 'Jebel Ali' },
];

// Simulate ship movement
setInterval(() => {
  DEMO_SHIPS.forEach(ship => {
    const rad = (ship.heading * Math.PI) / 180;
    const speedDeg = (ship.speed * 0.00003); // Convert knots to degrees/sec at 30s interval (scaled)
    ship.lat += Math.cos(rad) * speedDeg * 30;
    ship.lon += Math.sin(rad) * speedDeg * 30;
    // Wrap around
    if (ship.lat > 85) ship.lat = 85;
    if (ship.lat < -85) ship.lat = -85;
  });
}, 30000);

export function getShips(): Ship[] {
  return DEMO_SHIPS;
}

// Future: real AIS data
// export async function fetchAISShips() {
//   const res = await fetch('https://data.aishub.net/ws.php?...');
//   ...
// }
