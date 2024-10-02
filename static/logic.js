// Function to load and parse the CSV file
function loadCSV() {
  // Adjust the path to your CSV file if needed
  fetch('updated_data_with_random_coords.csv')
      .then(response => {
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
          return response.text();
      })
      .then(csvText => {
          Papa.parse(csvText, {
              header: true,
              dynamicTyping: true,
              complete: function(data) {
                  createMap(data.data); // Pass the parsed data to the map
              },
              error: function(error) {
                  console.error('Error parsing CSV:', error);
              }
          });
      });
}

// Function to create a map and process parsed data
function createMap(data) {
  // Define the starting coordinates and zoom level for the map
  var map = L.map('map').setView([51.505, -0.09], 3); // Adjust to your preferred default coordinates and zoom level

  // Create the tile layer that will be the background of the map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Create layer groups for each question
  let questionLayers = {
      Question1: L.layerGroup(),
      Question2: L.layerGroup(),
      Question3: L.layerGroup(),
      Question4: L.layerGroup(),
  };

  // Define a color mapping for nationalities
  const nationalityColors = {
      'Pakistani': 'red',
      'Indian': 'orange',
      'Bangladeshi': 'green',
      'Sri Lankan': 'blue',
      'Maldivian': 'purple',
      // Add more mappings as needed
  };

  // Iterate over the dataset and create markers
  data.forEach(function(item) {
      const lat = parseFloat(item.latitude); 
      const lng = parseFloat(item.longitude); 

      // Check if lat and lng are valid numbers
      if (!isNaN(lat) && !isNaN(lng)) {
          const nationality = item["Nationality"] || 'Unknown'; 
          const markerColor = nationalityColors[nationality] || 'grey'; 

          // Create the marker using the AwesomeMarkers library
          const marker = L.marker([lat, lng], {
              icon: L.AwesomeMarkers.icon({ markerColor: markerColor }) 
          });

          // Bind the popup with relevant information
          let popupContent = `
              <strong>Country:</strong> ${(item['Country of residence'])}<br>
              <strong>Heritage:</strong> ${(item['Which South Asian heritage do you come from?'])}<br>
              <strong>Nationality:</strong> ${(item['Nationality'])}<br>
          `;

          // Add question-based information to the popup
          if (item["In your opinion, do you believe mental health conditions can be treated?-Yes"]) {
              popupContent += `
                  <strong>Mental Health Treated (Yes):</strong> ${item["In your opinion, do you believe mental health conditions can be treated?-Yes"]}<br>
              `;  
          }

          if (item["In your opinion, do you believe mental health conditions can be treated?-No"]) {
              popupContent += `
                  <strong>Mental Health Treated (No):</strong> ${item["In your opinion, do you believe mental health conditions can be treated?-No"]}<br>
              `;
          }

          if (item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Experienced"]) {
              popupContent += `
                  <strong>Experienced Stigma:</strong> ${item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Experienced"]}
              `;
          }

          if (item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Witnessed"]) {
              popupContent += `
                  <strong>Witnessed Stigma:</strong> ${item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Witnessed"]}
              `;
          }

          // Bind the complete popup content to the marker
          marker.bindPopup(popupContent);

          // Add the marker to the appropriate question layer (if applicable)
          if (item["In your opinion, do you believe mental health conditions can be treated?-Yes"] || 
              item["In your opinion, do you believe mental health conditions can be treated?-No"]) {
              questionLayers.Question1.addLayer(marker);
          }

          if (item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Experienced"]) {
              questionLayers.Question2.addLayer(marker);
          }

          if (item["Have you ever experienced or witnessed stigma against person or people with a mental health condition? If you so could you please describe the incident. - Witnessed"]) {
              questionLayers.Question3.addLayer(marker);
          }

          if (item["In your opinion, do you believe mental health conditions can be treated?-No"]) {
              questionLayers.Question4.addLayer(marker);
          }
      } else {
          console.warn('Invalid coordinates for:', item); 
      }
  });

  // Add layer control for each question
  var overlayMaps = {
      "Mental Health Treated (Yes/No)": questionLayers.Question1,
      "Experienced Stigma": questionLayers.Question2,
      "Witnessed Stigma": questionLayers.Question3,
      "Mental Health Treated (No)": questionLayers.Question4
  };

  // Add the layer control to the map
  L.control.layers(null, overlayMaps, {collapsed: false}).addTo(map);

  // Show only the first question layer by default
  questionLayers.Question1.addTo(map);

  // Event listener to switch layers
  map.on('overlayadd', function(e) {
      // Remove all layers before adding the new one
      Object.values(overlayMaps).forEach(layer => {
          if (layer !== e.layer) {
              map.removeLayer(layer);
          }
      });
  });
}

// Ensure the map and other elements are fully loaded before calling the function
window.onload = function() {
  loadCSV();
};