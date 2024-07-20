function updateBackgroundColor(clock, timeZone) {
    const now = timeZone ? new Date(new Date().toLocaleString("en-US", { timeZone })) : new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const totalDaySeconds = 24 * 3600;
    const progress = totalSeconds / totalDaySeconds;

    // Define cyberpunk gradient colors for different times of the day
    const gradients = [
        { time: 0, color: '#2a1f4b' },   // Midnight - Deep Blue
        { time: 6, color: '#e63946' },   // 6 AM - Neon Pink
        { time: 12, color: '#f1faee' },  // Noon - Light Cyan
        { time: 18, color: '#ff77aa' },  // 6 PM - Electric Purple
        { time: 21, color: '#4e4c59' },  // 9 PM - Dark Purple
        { time: 24, color: '#2a1f4b' }   // Midnight - Deep Blue
    ];

    // Find the two gradient stops surrounding the current time
    let startGradient, endGradient;
    for (let i = 0; i < gradients.length - 1; i++) {
        if (progress >= gradients[i].time / 24 && progress < gradients[i + 1].time / 24) {
            startGradient = gradients[i];
            endGradient = gradients[i + 1];
            break;
        }
    }

    // Calculate the color based on the time progress between the two stops
    const timeBetween = (progress - startGradient.time / 24) / ((endGradient.time - startGradient.time) / 24);
    const startColor = hexToRgb(startGradient.color);
    const endColor = hexToRgb(endGradient.color);
    const currentColor = {
        r: Math.round(startColor.r + timeBetween * (endColor.r - startColor.r)),
        g: Math.round(startColor.g + timeBetween * (endColor.g - startColor.g)),
        b: Math.round(startColor.b + timeBetween * (endColor.b - startColor.b))
    };

    // Apply gradient background
    const gradientColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
    clock.style.background = `linear-gradient(180deg, ${gradientColor} 0%, rgba(0,0,0,0.8) 100%)`;
}

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

function updateClocks() {
    const timeZones = {
        'clock-local': null, // Local time
        'clock-ny': 'America/New_York',
        'clock-london': 'Europe/London',
        'clock-tokyo': 'Asia/Tokyo',
        'clock-sydney': 'Australia/Sydney',
        'clock-sao-paulo': 'America/Sao_Paulo'
    };

    const now = new Date();
    for (const [id, timeZone] of Object.entries(timeZones)) {
        const cityTime = timeZone ? new Date(now.toLocaleString("en-US", { timeZone })) : now;
        const hours = cityTime.getHours().toString().padStart(2, '0');
        const minutes = cityTime.getMinutes().toString().padStart(2, '0');
        const seconds = cityTime.getSeconds().toString().padStart(2, '0');
        const timeElement = document.querySelector(`#${id} .time`);
        const clock = document.getElementById(id);
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
        updateBackgroundColor(clock, timeZone);
    }
}

// Initial call to set the background color and clocks immediately
updateClocks();

// Update every second
setInterval(() => {
    updateClocks();
}, 1000);
