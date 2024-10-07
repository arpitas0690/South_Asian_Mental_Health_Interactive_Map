let map; // Declare map variable globally to avoid re-initialization
let markers = []; // Array to hold marker references
let currentQuestion = null; // Track which question is currently displayed
let csvData;

function loadCSV() {
    fetch('SouthAsianMentalHealth_with_country_data.csv')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csvText => {
            console.log('CSV text:', csvText); // Log the raw CSV text
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                complete: function(data) {
                    console.log('Parsed CSV data:', data.data); // Log the parsed data
                    csvData = data.data
                    createMap(csvData); // Pass the parsed data to createMap function
                },
                error: function(error) {
                    console.error('Error parsing CSV:', error);
                }
            });
        })
        .catch(error => {
            console.error('Error fetching CSV:', error); // Log fetch errors
        });
}

// Function to create a map and process parsed data
function createMap(csvData) {

    // Add your Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoicmV0aGlua2Rlc2kiLCJhIjoiY2x1ZDZiYmp5MTFweTJpcXRkanY3a3R2dCJ9.gBzX52IIaND_iHKRcKl5mw'; 

    // Initialize the map
    map = new mapboxgl.Map({
        container: 'map', // ID of the div where the map will render
        style: 'mapbox://styles/rethinkdesi/cm1s8gno300uw01qr7hobgodc', // Mapbox style URL
        center: [69.3451, 30.3753], // Initial center [longitude, latitude] (example: India)
        zoom: 3.5 // Initial zoom level
    });

    // Add navigation controls (zoom, rotate)
    map.addControl(new mapboxgl.NavigationControl());

    // Show markers for the first question by default
    map.on('load', function () {
        toggleMarkers("Cause of Mental Health problems");
    });

    // Add event listeners for toggle buttons
    document.getElementById('toggle-question1').addEventListener('click', () => {
        highlightActiveButton('toggle-question1'); // Highlight active button
        toggleMarkers("Cause of Mental Health problems")
    });
    document.getElementById('toggle-question2').addEventListener('click', () => {
        highlightActiveButton('toggle-question2'); // Highlight active button
        toggleMarkers("Treatability")
    });
    document.getElementById('toggle-question3').addEventListener('click', () => {
        highlightActiveButton('toggle-question3'); // Highlight active button
        toggleMarkers("Incident Description")
    });

}
    // Function to highlight the active button
    function highlightActiveButton(activeId) {
        // Remove active class from all buttons
        const buttons = document.querySelectorAll('#toggle-buttons button');
        buttons.forEach(button => button.classList.remove('active'));

        // Add active class to the currently clicked button
        document.getElementById(activeId).classList.add('active');
}

    const heritageColors = {
        'Maldives': '#D33F49', // Red
        'India': '#379392',    // Blue
        'Nepal': '#FFBA08', // Yellow
        'Pakistan': '#1C5838', // Green
        'Sri Lanka': '#FC7A57', // Orange
        'Bangladesh': '#4C1A57', // Purple
        'Afghanistan': '#000000' // Black
    };

function toggleMarkers(question) {
    // Remove existing markers
    markers.forEach(marker => marker.remove());
    markers = []; // Clear the array

    // Store the current question
    currentQuestion = question;

    // Iterate over the dataset and create markers
    csvData.forEach(item => {
        console.log(item);
        const lng = parseFloat(item.longitude);
        const lat = parseFloat(item.latitude);

        if (!isNaN(lat) && !isNaN(lng)) {
            const questionAnswer = item[question];
            const religion = item["Religious Affliation"];
            const heritage = item["South Asian Heritage"];
            const treatments = item["Treatments"];
            const stigma = item["Experience or Wittnessed stigma"];	
            const markerColor = heritageColors[heritage] || '#808080'; 

            if (questionAnswer) { // Only add markers if there is an answer
                console.log(`Creating marker for ${question}: ${questionAnswer} at ${lng}, ${lat}`);
                const el = document.createElement('div');
                el.className = 'marker'; // Use the CSS class for styling
                el.style.backgroundColor = markerColor;

                // Create popup content based on the current question
                let popupContent = '';
                switch(question) {
                    case "Cause of Mental Health problems":
                        popupContent = `
                            <strong>Religious Affiliation:</strong> ${religion}<br>
                            <strong>South Asian Heritage:</strong> ${heritage}<br>
                            <strong>Cause of Mental Health Problems:</strong> ${questionAnswer}
                        `;
                        break;
                    case "Treatability":
                        popupContent = `
                            <strong>South Asian Heritage:</strong> ${heritage}<br>
                            <strong>Treatability:</strong> ${questionAnswer}<br>
                            <strong>Treatments:</strong> ${treatments}
                        `;
                        break;
                    case "Incident Description":
                        popupContent = `
                            <strong>South Asian Heritage:</strong> ${heritage}<br>
                            <strong>Experienced or Witnessed Stigma:</strong> ${stigma}<br>
                            <strong>${question}:</strong> ${questionAnswer}
                        `;
                        break;
                    default:
                        popupContent = `<strong>${question}:</strong> ${questionAnswer}`;
                }

                // Create a new marker
                const marker = new mapboxgl.Marker(el)
                    .setLngLat([lng, lat]) // Set marker position
                    .setPopup(new mapboxgl.Popup({ offset: 25 })
                        .setHTML(popupContent))  
                    .addTo(map); // Make sure to add the marker to the map
                markers.push(marker);     
            }
        }
    });
}

// Ensure the map and other elements are fully loaded before calling the function

window.onload = function() {
    loadCSV();
    highlightActiveButton('toggle-question1'); // Add this line to highlight the first button
};