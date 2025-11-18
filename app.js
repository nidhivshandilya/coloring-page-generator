const HF_API_URL = 'https://corsproxy.io/?https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1';
const API_KEY_STORAGE = 'hf_api_token';

window.addEventListener('DOMContentLoaded', () => {
    const apiKey = localStorage.getItem(API_KEY_STORAGE);
    if (!apiKey) {
        document.getElementById('apiKeyModal').style.display = 'flex';
    } else {
        document.getElementById('apiKeyModal').style.display = 'none';
    }
});

function saveApiKey() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    
    if (!apiKey) {
        alert('Please enter your API token');
        return;
    }
    
    if (!apiKey.startsWith('hf_')) {
        alert('Hugging Face tokens start with "hf_". Please check your token.');
        return;
    }
    
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    document.getElementById('apiKeyModal').style.display = 'none';
    alert('Token saved! You can now generate coloring pages. 🎨');
}

async function generateColoring() {
    const prompt = document.getElementById('promptInput').value.trim();
    const apiKey = localStorage.getItem(API_KEY_STORAGE);
    
    if (!apiKey) {
        showError('Please set your API token first');
        document.getElementById('apiKeyModal').style.display = 'flex';
        return;
    }
    
    if (!prompt) {
        showError('Please describe what you want to color');
        return;
    }
    
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('loadingSpinner').classList.remove('hidden');
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
    
    try {
        const coloringPrompt = `${prompt}, coloring book page, black and white line art, simple outlines, no shading, no colors, thick lines, children's coloring book style, white background, clean line drawing`;

        const response = await fetch(HF_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: coloringPrompt,
                parameters: {
                    negative_prompt: "color, colored, shading, gradient, complex, detailed, photorealistic, blurry, watermark",
                    num_inference_steps: 30,
                    guidance_scale: 7.5
                }
            })
        });
        
        if (!response.ok) {
            if (response.status === 503) {
                throw new Error('The AI model is waking up. Wait 20 seconds and click Generate again. This is normal! ⏳');
            }
            if (response.status === 401) {
                throw new Error('Your token is invalid. Please enter it again.');
            }
            throw new Error(`Error ${response.status}. Please try again.`);
        }
        
        const imageBlob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
            displayImage(reader.result);
        };
        reader.readAsDataURL(imageBlob);
        
    } catch (error) {
        showError(error.message);
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

function displayImage(base64Image) {
    const img = document.getElementById('coloringImage');
    img.src = base64Image;
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
                <img src="${img.src}" onload="window.print();" />
            </body>
        </html>
    `);
}

function resetApp() {
    document.getElementById('promptInput').value = '';
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

document.getElementById('promptInput')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateColoring();
    }
});
