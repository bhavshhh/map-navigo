// Initialize Map
var map = L.map("map").setView([28.6139, 77.2090], 13); 

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap"
}).addTo(map);

var markers = [];
var routeLine;

// Geocode function
async function geocode(place) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${place}`
  );
  const data = await response.json();
  return [data[0].lat, data[0].lon];
}

// Find Route
async function findRoute() {
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;

  const startCoord = await geocode(start);
  const endCoord = await geocode(end);

  // Remove previous markers
  markers.forEach(m => map.removeLayer(m));
  
  var m1 = L.marker(startCoord).addTo(map);
  var m2 = L.marker(endCoord).addTo(map);
  markers = [m1, m2];

  // Routing API
  const routeUrl =
    `https://router.project-osrm.org/route/v1/driving/${startCoord[1]},${startCoord[0]};${endCoord[1]},${endCoord[0]}?overview=full&geometries=geojson`;

  const routeData = await fetch(routeUrl).then(res => res.json());

  const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

  if (routeLine) map.removeLayer(routeLine);
  routeLine = L.polyline(coords, { color: "blue" }).addTo(map);

  map.fitBounds(routeLine.getBounds());
}

// Show user's live location
map.locate({ watch: true, setView: true });

map.on("locationfound", function (e) {
  L.circle(e.latlng, { radius: 10, color: "green" }).addTo(map);
});
