const API_KEY_STORAGE = 'user_setup_complete';

window.addEventListener('DOMContentLoaded', () => {
    const setupComplete = localStorage.getItem(API_KEY_STORAGE);
    if (!setupComplete) {
        document.getElementById('apiKeyModal').style.display = 'flex';
    } else {
        document.getElementById('apiKeyModal').style.display = 'none';
    }
});

function saveApiKey() {
    localStorage.setItem(API_KEY_STORAGE, 'true');
    document.getElementById('apiKeyModal').style.display = 'none';
    alert('Setup complete! You can now generate coloring pages. 🎨');
}

async function generateColoring() {
    const prompt = document.getElementById('promptInput').value.trim();
    
    if (!prompt) {
        showError('Please describe what you want to color');
        return;
    }
    
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    
    try {
        const coloringPrompt = `${prompt}, simple black and white coloring book page for children, thick outlines, no shading, clean line art`;

        const imageElement = await puter.ai.txt2img(coloringPrompt, {
            model: 'stable-diffusion-xl'
        });
        
        displayImageElement(imageElement);
        
    } catch (error) {
        showError(`Error: ${error.message}. Please try again.`);
    } finally {
        document.getElementById('generateBtn').disabled = false;
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function displayImageElement(imgElement) {
    const resultImg = document.getElementById('coloringImage');
    resultImg.src = imgElement.src;
    document.getElementById('resultSection').classList.remove('hidden');
}

function downloadImage() {
    const img = document.getElementById('coloringImage');
    const link = document.createElement('a');
    link.href = img.src;
    link.download = `coloring-page-${Date.now()}.png`;
    link.click();
}

function printImage() {
    const img = document.getElementById('coloringImage');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Print Coloring Page</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        img { max-width: 100%; height: auto; }
                    }
                    body { 
                        display: flex; 
                        justify-content: center; 
                        align-items: center; 
                        min-height: 100vh; 
                    }
                    img { max-width: 100%; height: auto; }
                </style>
            </head>
            <body>
