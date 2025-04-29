// Get the video element from the DOM
const video = document.getElementById('video');

// Access the user's camera using the browser's mediaDevices API
navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        // If access is granted, set the video stream as the source for the video element
        video.srcObject = stream;
        video.play(); // Start playing the video stream
    })
    .catch(err => {
        // If an error occurs, log it and alert the user
        console.error("Camera error:", err.name, err.message);
        alert("Camera access not granted or not available. Please check your browser settings.");
    });

// Function to capture the current video frame and send it for prediction
function capture() {
    // Create a canvas element to draw the video frame
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; // Set canvas width to the video width
    canvas.height = video.videoHeight; // Set canvas height to the video height
    const ctx = canvas.getContext('2d'); // Get the canvas 2D drawing context

    // Draw the current video frame onto the canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas drawing to a data URL (image in base64 format)
    const imgData = canvas.toDataURL('image/jpeg');

    // Send the captured image to the server for prediction
    fetch('/predict', {
        method: 'POST', // HTTP POST request
        headers: { 'Content-Type': 'application/json' }, // JSON content type
        body: JSON.stringify({ image: imgData }) // Send the captured image data
    })
    .then(res => res.json()) // Parse the server response as JSON
    .then(data => {
        // Display the prediction results
        let output = "Emotion Probabilities:<br>";
        for (const [emotion, value] of Object.entries(data.prediction)) {
            output += `${emotion}: ${value}%<br>`;
        }
        document.getElementById('prediction').innerHTML = output; // Update the UI with results
    })
    .catch(err => console.error("Prediction error:", err)); // Log any errors during prediction
}

// Add an event listener to the "capture" button to call the capture function when clicked
document.getElementById('capture').addEventListener('click', capture);
