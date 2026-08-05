export interface Camera {
  n: string;    // name
  la: number;   // latitude
  lo: number;   // longitude
  t: 'city' | 'traffic' | 'landmark' | 'beach' | 'weather' | 'wildlife';
  u: string;    // URL
  c: string;    // location
  vid?: string; // YouTube video ID
}

export const CAMERAS: Camera[] = [
  { n: "Times Square", la: 40.758, lo: -73.9855, t: "city", u: "https://www.earthcam.com/usa/newyork/timessquare/", c: "New York, USA", vid: "JQ_jwk_7OVE" },
  { n: "Eiffel Tower", la: 48.8584, lo: 2.2945, t: "landmark", u: "https://www.earthcam.com/world/france/paris/", c: "Paris, France", vid: "OzYp4NRZlwQ" },
  { n: "Trafalgar Square", la: 51.508, lo: -0.128, t: "city", u: "https://www.earthcam.com/world/england/london/", c: "London, UK", vid: "WKGK_hYnlGE" },
  { n: "Colosseum", la: 41.8902, lo: 12.4922, t: "landmark", u: "https://www.earthcam.com/world/italy/rome/", c: "Rome, Italy", vid: "54_skPGLNhA" },
  { n: "Waikiki Beach", la: 21.276, lo: -157.827, t: "beach", u: "https://www.earthcam.com/usa/hawaii/honolulu/", c: "Honolulu, USA", vid: "8waVy4wM1tM" },
  { n: "Hollywood Blvd", la: 34.1016, lo: -118.3267, t: "city", u: "https://www.earthcam.com/usa/california/losangeles/hollywoodblvd/", c: "Los Angeles, USA", vid: "QAzo6Z2Ieag" },
  { n: "Miami Beach", la: 25.782, lo: -80.134, t: "beach", u: "https://www.earthcam.com/usa/florida/miamibeach/", c: "Miami, USA", vid: "cmkAbDUEoyA" },
  { n: "Bourbon Street", la: 29.9584, lo: -90.0644, t: "city", u: "https://www.earthcam.com/usa/louisiana/neworleans/bourbonstreet/", c: "New Orleans, USA", vid: "C32EiZiQPkQ" },
  { n: "Dublin Temple Bar", la: 53.3456, lo: -6.263, t: "city", u: "https://www.earthcam.com/world/ireland/dublin/", c: "Dublin, Ireland", vid: "3nyPER2kzqk" },
  { n: "Golden Gate Bridge", la: 37.8199, lo: -122.4783, t: "traffic", u: "https://www.earthcam.com/usa/california/sanfrancisco/goldengatebridge/", c: "San Francisco, USA", vid: "CXYr04BWvmc" },
  { n: "Tokyo Shibuya Crossing", la: 35.6595, lo: 139.7004, t: "city", u: "https://www.earthcam.com/world/japan/tokyo/", c: "Tokyo, Japan", vid: "dfVK7ld38Ys" },
  { n: "Sydney Harbour", la: -33.8568, lo: 151.2153, t: "landmark", u: "https://www.earthcam.com/world/australia/sydney/", c: "Sydney, Australia", vid: "5uZa3-RMFos" },
  { n: "Dubai Marina", la: 25.081, lo: 55.136, t: "city", u: "https://www.earthcam.com/world/uae/dubai/", c: "Dubai, UAE", vid: "ka9MsehA8I4" },
  { n: "Niagara Falls", la: 43.079, lo: -79.078, t: "landmark", u: "https://www.earthcam.com/world/canada/niagarafalls/", c: "Niagara Falls, Canada", vid: "qx7gry390YA" },
  { n: "Matterhorn", la: 45.976, lo: 7.658, t: "weather", u: "https://www.earthcam.com/world/switzerland/zermatt/", c: "Zermatt, Switzerland" },
  { n: "Mount Everest View", la: 27.988, lo: 86.925, t: "landmark", u: "https://www.earthcam.com/world/nepal/khumjung/", c: "Khumbu, Nepal" },
  { n: "Copacabana Beach", la: -22.971, lo: -43.182, t: "beach", u: "https://www.earthcam.com/world/brazil/riodejaneiro/", c: "Rio de Janeiro, Brazil", vid: "--aLHcF9Ewg" },
  { n: "Brandenburg Gate", la: 52.5163, lo: 13.3777, t: "landmark", u: "https://www.earthcam.com/world/germany/berlin/", c: "Berlin, Germany" },
  { n: "Bondi Beach", la: -33.8915, lo: 151.2767, t: "beach", u: "https://www.earthcam.com/world/australia/sydney/bondibeach/", c: "Sydney, Australia" },
  { n: "Maldives Overwater", la: 4.175, lo: 73.509, t: "beach", u: "https://www.earthcam.com/world/maldives/", c: "Maldives" },
  { n: "Mount Fuji", la: 35.3606, lo: 138.7274, t: "weather", u: "https://www.earthcam.com/world/japan/fujiyoshida/", c: "Fujiyoshida, Japan" },
  { n: "Santorini Caldera", la: 36.3932, lo: 25.4615, t: "landmark", u: "https://www.earthcam.com/world/greece/santorini/", c: "Santorini, Greece", vid: "5p-s-1453Us" },
  { n: "Las Vegas Strip", la: 36.1146, lo: -115.1728, t: "city", u: "https://www.earthcam.com/usa/nevada/lasvegas/", c: "Las Vegas, USA" },
  { n: "Great Wall of China", la: 40.4319, lo: 116.5704, t: "landmark", u: "https://www.earthcam.com/world/china/beijing/", c: "Beijing, China" },
  { n: "South Beach Miami", la: 25.7826, lo: -80.1341, t: "beach", u: "https://www.earthcam.com/usa/florida/miami/southbeach/", c: "Miami, USA" },
  { n: "Table Mountain", la: -33.9628, lo: 18.4098, t: "landmark", u: "https://www.earthcam.com/world/southafrica/capetown/", c: "Cape Town, South Africa", vid: "jOqASqt3vVI" },
  { n: "Shibuya Scramble", la: 35.6595, lo: 139.7004, t: "traffic", u: "https://www.earthcam.com/world/japan/tokyo/shibuya/", c: "Tokyo, Japan" },
  { n: "Banff National Park", la: 51.1784, lo: -115.5708, t: "weather", u: "https://www.earthcam.com/world/canada/banff/", c: "Banff, Canada" },
  { n: "Space Needle", la: 47.6205, lo: -122.3493, t: "landmark", u: "https://www.earthcam.com/usa/washington/seattle/", c: "Seattle, USA" },
  { n: "Barcelona Port", la: 41.376, lo: 2.186, t: "city", u: "https://www.earthcam.com/world/spain/barcelona/", c: "Barcelona, Spain", vid: "hRw1_JQMQoE" },
  { n: "Taj Mahal", la: 27.1751, lo: 78.0421, t: "landmark", u: "https://www.earthcam.com/world/india/agra/", c: "Agra, India" },
  { n: "Phi Phi Islands", la: 7.7407, lo: 98.7784, t: "beach", u: "https://www.earthcam.com/world/thailand/phiphi/", c: "Phi Phi, Thailand" },
  { n: "Yosemite Valley", la: 37.745, lo: -119.593, t: "weather", u: "https://www.earthcam.com/usa/california/yosemite/", c: "Yosemite, USA" },
  { n: "Moscow Kremlin", la: 55.752, lo: 37.617, t: "landmark", u: "https://www.earthcam.com/world/russia/moscow/", c: "Moscow, Russia" },
  { n: "Reykjavik Harbor", la: 64.148, lo: -21.942, t: "city", u: "https://www.earthcam.com/world/iceland/reykjavik/", c: "Reykjavik, Iceland" },
  { n: "Machu Picchu View", la: -13.1631, lo: -72.545, t: "landmark", u: "https://www.earthcam.com/world/peru/machupicchu/", c: "Cusco, Peru" },
  { n: "Venice Grand Canal", la: 45.438, lo: 12.335, t: "landmark", u: "https://www.earthcam.com/world/italy/venice/", c: "Venice, Italy", vid: "aaJT8y3zfWs" },
  { n: "Singapore Marina Bay", la: 1.283, lo: 103.861, t: "city", u: "https://www.earthcam.com/world/singapore/", c: "Singapore", vid: "9cfkyMzanbc" },
  { n: "Burj Khalifa View", la: 25.197, lo: 55.274, t: "landmark", u: "https://www.earthcam.com/world/uae/dubai/burjkhalifa/", c: "Dubai, UAE" },
  { n: "Patong Beach", la: 7.896, lo: 98.296, t: "beach", u: "https://www.earthcam.com/world/thailand/phuket/", c: "Phuket, Thailand" },
  { n: "Amsterdam Canals", la: 52.37, lo: 4.896, t: "city", u: "https://www.earthcam.com/world/netherlands/amsterdam/", c: "Amsterdam, Netherlands", vid: "zYkPj4r7UdY" },
  { n: "Christ the Redeemer", la: -22.952, lo: -43.211, t: "landmark", u: "https://www.earthcam.com/world/brazil/riodejaneiro/christ/", c: "Rio de Janeiro, Brazil" },
  { n: "Mont Blanc View", la: 45.833, lo: 6.865, t: "weather", u: "https://www.earthcam.com/world/france/chamonix/", c: "Chamonix, France" },
  { n: "Brooklyn Bridge", la: 40.706, lo: -73.997, t: "traffic", u: "https://www.earthcam.com/usa/newyork/brooklynbridge/", c: "New York, USA" },
  { n: "Cairo Pyramids", la: 29.979, lo: 31.134, t: "landmark", u: "https://www.earthcam.com/world/egypt/cairo/", c: "Cairo, Egypt", vid: "F9SV5lmcwWE" },
  { n: "Copenhagen Nyhavn", la: 55.68, lo: 12.59, t: "city", u: "https://www.earthcam.com/world/denmark/copenhagen/", c: "Copenhagen, Denmark" },
  { n: "African Safari Live", la: -1.405, lo: 34.915, t: "wildlife", u: "https://explore.org/livecams/african-wildlife/", c: "Maasai Mara, Kenya" },
  { n: "Grand Canyon", la: 36.054, lo: -112.14, t: "landmark", u: "https://www.earthcam.com/usa/arizona/grandcanyon/", c: "Arizona, USA" },
  { n: "Bear Cam Alaska", la: 58.301, lo: -134.42, t: "wildlife", u: "https://explore.org/livecams/brown-bears/", c: "Alaska, USA" },
  { n: "Hawaii Volcano", la: 19.429, lo: -155.257, t: "weather", u: "https://www.earthcam.com/usa/hawaii/volcano/", c: "Hawaii, USA" },
];

export const CAMERA_TYPES: Record<string, string> = {
  city: '🏙 City Views',
  landmark: '🏛 Landmarks',
  beach: '🏖 Beaches & Coast',
  traffic: '🚦 Traffic Cams',
  weather: '🏔 Weather & Mountain',
  wildlife: '🦁 Wildlife',
};
