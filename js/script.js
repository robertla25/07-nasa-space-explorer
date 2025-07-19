// NASA API key
const API_KEY = 'SgBlqf0vQGLWYoUjYapglvBtQ52VhDtYE6sLQvkU';

// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Find the "Get Space Images" button and the gallery div
const getImagesButton = document.querySelector('.filters button');
const gallery = document.getElementById('gallery');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

// Create a modal element and add it to the page
const modal = document.createElement('div');
modal.id = 'imageModal';
modal.style.display = 'none'; // Hide by default
modal.innerHTML = `
  <div class="modal-content">
    <span class="close-button">&times;</span>
    <img class="modal-image" src="" alt="" />
    <h2 class="modal-title"></h2>
    <p class="modal-date"></p>
    <p class="modal-explanation"></p>
  </div>
`;
document.body.appendChild(modal);

// Get modal elements for later use
const closeButton = modal.querySelector('.close-button');
const modalImage = modal.querySelector('.modal-image');
const modalTitle = modal.querySelector('.modal-title');
const modalDate = modal.querySelector('.modal-date');
const modalExplanation = modal.querySelector('.modal-explanation');

// Function to open the modal with image or video details
function openModal(item) {
  // Check if the item is an image or a video
  if (item.media_type === 'image') {
    modalImage.style.display = 'block';
    modalImage.src = item.url;
    modalImage.alt = item.title;
    // Remove any existing video if present
    const oldVideo = modal.querySelector('.modal-video');
    if (oldVideo) oldVideo.remove();
  } else if (item.media_type === 'video') {
    modalImage.style.display = 'none';
    // Remove any existing video
    const oldVideo = modal.querySelector('.modal-video');
    if (oldVideo) oldVideo.remove();
    // Create and insert a video iframe
    const video = document.createElement('iframe');
    video.className = 'modal-video';
    video.src = item.url;
    video.width = "100%";
    video.height = "340";
    video.frameBorder = "0";
    video.allow = "accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture";
    video.allowFullscreen = true;
    // Insert after the close button
    modal.querySelector('.modal-content').insertBefore(video, modalTitle);
  }
  modalTitle.textContent = item.title;
  modalDate.textContent = item.date;
  modalExplanation.textContent = item.explanation;
  modal.style.display = 'flex';
}

// Function to close the modal
function closeModal() {
  modal.style.display = 'none';
}

// Close modal when clicking the close button
closeButton.addEventListener('click', closeModal);

// Close modal when clicking outside the modal content
modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeModal();
  }
});

// Add a click event listener to the button
getImagesButton.addEventListener('click', () => {
  // Get the selected start and end dates from the inputs
  const startDate = startInput.value;
  const endDate = endInput.value;

  // Show a loading message while fetching images
  gallery.innerHTML = `
    <div class="placeholder">
      <div class="placeholder-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;

  // Build the NASA APOD API URL with the selected dates
  const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${startDate}&end_date=${endDate}`;

  // Fetch data from the API
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      // Clear the gallery
      gallery.innerHTML = '';

      // Check if we got an array of results
      if (Array.isArray(data)) {
        // Loop through each item (image or video)
        data.forEach(item => {
          // Create a div for each gallery item
          const itemDiv = document.createElement('div');
          itemDiv.className = 'gallery-item';

          // If it's an image, show the image
          if (item.media_type === 'image') {
            itemDiv.innerHTML = `
              <img src="${item.url}" alt="${item.title}" />
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            `;
          }
          // If it's a video, embed the video
          else if (item.media_type === 'video') {
            itemDiv.innerHTML = `
              <div class="video-wrapper">
                <iframe src="${item.url}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
              <h3>${item.title}</h3>
              <p>${item.date}</p>
            `;
          }

          // Add a click event to open the modal with details
          itemDiv.addEventListener('click', () => {
            openModal(item);
          });

          // Add the item div to the gallery
          gallery.appendChild(itemDiv);
        });
        // If no items were added, show a message
        if (gallery.children.length === 0) {
          gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
        }
      } else {
        // If there's an error or no items, show a message
        gallery.innerHTML = '<p>No images or videos found for this date range.</p>';
      }
    })
    .catch(error => {
      // Show an error message if something goes wrong
      gallery.innerHTML = `<p>Error fetching images: ${error.message}</p>`;
    });
});

// Array of fun space facts (leave empty for now)
const spaceFacts = [
  "Space does not begin at a specific altitude above the Earth, but the Kármán line at 100 km is a commonly used definition.",
  "The temperature in the void of space is about -270.45 °C.",
  "Space is a hard vacuum, meaning it is a void containing very little matter.",
  "There is no sound in space because molecules are too far apart to transmit sound.",
  "The space between galaxies is not completely empty but has an average of one atom per cubic meter.",
  "There are an estimated 100-400 billion stars in our galaxy, the Milky Way.",
  "The universe is observed to be 13.8 billion years old and has been expanding since its formation in the Big Bang.",
  "In the observable universe there are an estimated 2 trillion (2,000,000,000,000) galaxies.",
  "The International Space Station is the largest ever crewed object in space.",
  "Spacecraft have visited all the known planets in our solar system.",
];

// Function to pick a random fact from the array
function getRandomFact() {
  if (spaceFacts.length === 0) return '';
  const randomIndex = Math.floor(Math.random() * spaceFacts.length);
  return spaceFacts[randomIndex];
}

// Create the fact section and insert it above the gallery
const factSection = document.createElement('section');
factSection.className = 'did-you-know';
const fact = getRandomFact();
factSection.innerHTML = `
  <h2>Did You Know?</h2>
  <p>${fact}</p>
`;

// Insert the fact section above the gallery
const container = document.querySelector('.container');
const gallerySection = document.getElementById('gallery');
container.insertBefore(factSection, gallerySection);
