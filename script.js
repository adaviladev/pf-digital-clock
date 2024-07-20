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
    clock.style.background = `linear-gradient(18deg, ${gradientColor} 0%, rgba(0,0,0,0.8) 100%)`;
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


let alarms = {}; // To store alarm times for each clock

function setAlarm(clockId) {
    const alarmTime = prompt("Enter alarm time (HH:MM) for " + clockId + ":");
    if (alarmTime) {
        alarms[clockId] = { time: alarmTime, triggered: false };
        alert("Alarm set for " + alarmTime);
    }
}

function checkAlarms() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;

    for (const [clockId, alarm] of Object.entries(alarms)) {
        if (currentTime === alarm.time) {
            if (!alarm.triggered) {
                const clockElement = document.getElementById(clockId);
                clockElement.classList.add('alarm-triggered');
                alarm.triggered = true; // Mark the alarm as triggered
                setTimeout(() => {
                    clockElement.classList.remove('alarm-triggered'); // Remove the animation class after 10 seconds
                    alarm.triggered = false; // Reset the alarm
                }, 10000); // Pulsation effect duration
            }
        }
    }
}

// Add event listeners to clocks
document.querySelectorAll('.clock').forEach(clock => {
    clock.addEventListener('click', () => setAlarm(clock.id));
});

// Check alarms every second for more responsive checking
setInterval(checkAlarms, 1000);

// JavaScript for Drag-and-Drop
document.addEventListener('DOMContentLoaded', () => {
    const clocks = document.querySelectorAll('.clock');
    let draggedClock = null;

    clocks.forEach(clock => {
        clock.addEventListener('dragstart', (event) => {
            draggedClock = event.target;
            event.target.style.opacity = 0.5; // Visual feedback
        });

        clock.addEventListener('dragend', (event) => {
            event.target.style.opacity = 1; // Reset visual feedback
        });

        clock.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow dropping
            if (event.target.classList.contains('clock')) {
                event.target.classList.add('drag-over');
            }
        });

        clock.addEventListener('dragleave', (event) => {
            if (event.target.classList.contains('drag-over')) {
                event.target.classList.remove('drag-over');
            }
        });

        clock.addEventListener('drop', (event) => {
            event.preventDefault();
            if (event.target.classList.contains('clock') && event.target !== draggedClock) {
                event.target.classList.remove('drag-over');
                const container = document.getElementById('clock-container');
                const draggedIndex = Array.from(container.children).indexOf(draggedClock);
                const targetIndex = Array.from(container.children).indexOf(event.target);
                
                if (draggedIndex < targetIndex) {
                    container.insertBefore(draggedClock, event.target.nextSibling);
                } else {
                    container.insertBefore(draggedClock, event.target);
                }
            }
        });
    });
});

function saveClockOrder() {
    const clockIds = Array.from(document.querySelectorAll('.clock')).map(clock => clock.id);
    localStorage.setItem('clockOrder', JSON.stringify(clockIds));
}

function loadClockOrder() {
    const savedOrder = JSON.parse(localStorage.getItem('clockOrder'));
    if (savedOrder) {
        const container = document.getElementById('clock-container');
        savedOrder.forEach(id => {
            const clock = document.getElementById(id);
            container.appendChild(clock);
        });
    }
}

// Call loadClockOrder when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadClockOrder();
    // Add saveClockOrder call to dragend event
    document.querySelectorAll('.clock').forEach(clock => {
        clock.addEventListener('dragend', saveClockOrder);
    });
});

