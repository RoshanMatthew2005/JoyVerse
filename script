const video = document.getElementById('video');

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
    .then(stream => {
        video.srcObject = stream;
        video.play();  
    })
    .catch(err => {
        console.error("Camera error:", err.name, err.message);
        alert("Camera access not granted or not available. Please check your browser settings.");
    });

function capture() {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imgData = canvas.toDataURL('image/jpeg');

    fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imgData })
    })
    .then(res => res.json())
    .then(data => {
        let output = "Emotion Probabilities:<br>";
        for (const [emotion, value] of Object.entries(data.prediction)) {
            output += `${emotion}: ${value}%<br>`;
        }
        document.getElementById('prediction').innerHTML = output;
    })
    .catch(err => console.error("Prediction error:", err));
}
 
document.getElementById('capture').addEventListener('click', capture);
