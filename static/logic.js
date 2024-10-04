let map; // Declare map variable globally to avoid re-initialization
let markers = []; // Array to hold marker references
let currentQuestion = null; // Track which question is currently displayed
let csvData;

function loadCSV() {
    fetch('updated_data_with_random_coords.csv')
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
        center: [-0.1276, 51.5074], // Initial center [longitude, latitude] (example: London)
        zoom: 5 // Initial zoom level
    });

    // Add navigation controls (zoom, rotate)
    map.addControl(new mapboxgl.NavigationControl());

    // Show markers for the first question by default
    map.on('load', function () {
        toggleMarkers("In your opinion, do you believe mental health conditions can be treated?-Yes");
    });

    // Add event listeners for toggle buttons
    document.getElementById('toggle-question1').addEventListener('click', () => {
        highlightActiveButton('toggle-question1'); // Highlight active button
        toggleMarkers("Do you believe mental health conditions can be treated?-Yes")
    });
    document.getElementById('toggle-question2').addEventListener('click', () => {
        highlightActiveButton('toggle-question2'); // Highlight active button
        toggleMarkers("Do you believe mental health conditions can be treated?-No")
    });
    document.getElementById('toggle-question3').addEventListener('click', () => {
        highlightActiveButton('toggle-question3'); // Highlight active button
        toggleMarkers("Have you ever experienced stigma against person or people with a mental health condition?")
    });
    document.getElementById('toggle-question4').addEventListener('click', () => {
        highlightActiveButton('toggle-question4'); // Highlight active button
        toggleMarkers("Have you ever witnessed stigma against person or people with a mental health condition?")
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
            const nationality = item["Nationality"] || 'Unknown';
            const country = item["Country of residence"] || 'Not specified';
            const heritage = item["Which South Asian heritage do you come from?"] || 'Not specified';
            const diagnosis =item["Formal Diagnosis"]

            if (questionAnswer) { // Only add markers if there is an answer
                const el = document.createElement('div');
                el.className = 'marker'; // Use the CSS class for styling

                // Create a new marker
                const marker = new mapboxgl.Marker(el)
                .setLngLat([lng, lat]) // Set marker position
                .setPopup(new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`  
                    <strong>Country:</strong> ${country}<br>
                    <strong>Heritage:</strong> ${heritage}<br>
                    <strong>Nationality:</strong> ${nationality}<br>
                    <strong>Formal Diagnosis:</strong> ${diagnosis}<br><br>
                    <strong>${question}</strong><br><br>
                    ${questionAnswer}`))
                    .addTo(map); // Make sure to add the marker to the map
                markers.push(marker);
            }
        }
    });
}

// Ensure the map and other elements are fully loaded before calling the function

window.onload = function() {
    loadCSV();
};