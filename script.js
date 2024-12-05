// Inisialisasi peta OpenStreetMap
var map = L.map('map').setView([20, 0], 2); // Pusat peta di koordinat global

// Tambahkan layer peta OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Fungsi untuk menambahkan marker ke peta
function addMarker(lat, lng, title, description, details) {
    var marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${title}</b><br>${description}`)
        .on('click', function () {
            displayDisasterDetails(details);
        });
}

// Fungsi untuk menampilkan detail bencana dan cuaca
function displayDisasterDetails(details) {
    var detailsDiv = document.getElementById('disaster-details');
    detailsDiv.innerHTML = `
        <h3>${details.title}</h3>
        <p><strong>Tipe:</strong> ${details.type}</p>
        <p><strong>Status:</strong> ${details.status}</p>
        <p><strong>Lokasi:</strong> ${details.location}</p>
        <p><strong>Deskripsi:</strong> ${details.description}</p>
        ${details.image ? `<img src="${details.image}" alt="${details.title}" style="width:100%; height:auto;">` : ''}
        <p><strong>Cuaca Saat Ini:</strong></p>
        <p><strong>Suhu:</strong> ${details.weather.temperature}°C</p>
        <p><strong>Kecepatan Angin:</strong> ${details.weather.windspeed} km/h</p>
    `;
}

// Ambil data bencana dari GDACS
function getDisasterData() {
    var url = 'https://www.gdacs.org/gdacsapi/api/disasters.json';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            data.forEach(feature => {
                if (feature.geometry && feature.geometry.coordinates) {
                    var coords = feature.geometry.coordinates;
                    var title = feature.title;
                    var description = `Tipe: ${feature.type}, Status: ${feature.status}`;
                    var details = {
                        title: feature.title,
                        type: feature.type,
                        status: feature.status,
                        location: feature.location,
                        description: feature.description,
                        image: feature.image || null,
                        weather: {}
                    };

                    // Tambahkan marker untuk bencana
                    addMarker(coords[1], coords[0], title, description, details);

                    // Ambil data cuaca untuk lokasi bencana
                    getWeatherData(coords[1], coords[0], details);
                }
            });
        })
        .catch(error => console.error('Error fetching disaster data:', error));
}

// Ambil data cuaca dari Open-Meteo
function getWeatherData(lat, lng, details) {
    var weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`;

    fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.current_weather) {
                details.weather.temperature = data.current_weather.temperature;
                details.weather.windspeed = data.current_weather.windspeed;
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Panggil fungsi untuk mendapatkan data bencana
getDisasterData();