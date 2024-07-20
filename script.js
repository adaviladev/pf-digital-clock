function updateBackgroundColor() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    const totalDaySeconds = 24 * 3600;
    const progress = totalSeconds / totalDaySeconds;

    // Define gradient colors for different times of the day
    const gradients = [
        { time: 0, color: '#2c3e50' },   // Midnight
        { time: 6, color: '#ff7e5f' },   // 6 AM
        { time: 12, color: '#feb47b' },  // Noon
        { time: 18, color: '#ff9a9e' },  // 6 PM
        { time: 21, color: '#a18cd1' },  // 9 PM
        { time: 24, color: '#2c3e50' }   // Midnight
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

    document.body.style.background = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
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
        timeElement.textContent = `${hours}:${minutes}:${seconds}`;
    }
}

// Initial call to set the background color and clocks immediately
updateBackgroundColor();
updateClocks();

// Update every second
setInterval(() => {
    updateBackgroundColor();
    updateClocks();
}, 1000);
