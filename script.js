// Función para convertir hex a RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
}

// Actualiza el fondo y el color del texto según el tiempo
function updateBackgroundColorAndTextColor(clock, timeZone) {
    const now = timeZone ? new Date(new Date().toLocaleString("en-US", { timeZone })) : new Date();
    const hours = now.getHours();
    const styles = getComputedStyle(document.documentElement);

    // Define gradientes para diferentes momentos del día
    const gradients = [
        { time: 0, color: styles.getPropertyValue('--color-midnight').trim(), textColor: styles.getPropertyValue('--text-color-midnight').trim() },
        { time: 6, color: styles.getPropertyValue('--color-dawn').trim(), textColor: styles.getPropertyValue('--text-color-dawn').trim() },
        { time: 12, color: styles.getPropertyValue('--color-noon').trim(), textColor: styles.getPropertyValue('--text-color-noon').trim() },
        { time: 18, color: styles.getPropertyValue('--color-dusk').trim(), textColor: styles.getPropertyValue('--text-color-dusk').trim() },
        { time: 24, color: styles.getPropertyValue('--color-midnight').trim(), textColor: styles.getPropertyValue('--text-color-midnight').trim() }
    ];

    // Encuentra los gradientes que rodean el tiempo actual
    let startGradient, endGradient;
    for (let i = 0; i < gradients.length - 1; i++) {
        if (hours >= gradients[i].time && hours < gradients[i + 1].time) {
            startGradient = gradients[i];
            endGradient = gradients[i + 1];
            break;
        }
    }

    // Calcula el color basado en el progreso entre los dos gradientes
    const timeBetween = (hours - startGradient.time) / (endGradient.time - startGradient.time);
    const startColor = hexToRgb(startGradient.color);
    const endColor = hexToRgb(endGradient.color);
    const currentColor = {
        r: Math.round(startColor.r + timeBetween * (endColor.r - startColor.r)),
        g: Math.round(startColor.g + timeBetween * (endColor.g - startColor.g)),
        b: Math.round(startColor.b + timeBetween * (endColor.b - startColor.b))
    };

    const startTextColor = hexToRgb(startGradient.textColor);
    const endTextColor = hexToRgb(endGradient.textColor);
    const currentTextColor = {
        r: Math.round(startTextColor.r + timeBetween * (endTextColor.r - startTextColor.r)),
        g: Math.round(startTextColor.g + timeBetween * (endTextColor.g - startTextColor.g)),
        b: Math.round(startTextColor.b + timeBetween * (endTextColor.b - startTextColor.b))
    };

    // Aplica el color de fondo y el color del texto
    const gradientColor = `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`;
    const textColor = `rgb(${currentTextColor.r}, ${currentTextColor.g}, ${currentTextColor.b})`;
    clock.style.background = `linear-gradient(0deg, ${gradientColor} 0%, rgba(0,0,0,0.8) 100%)`;
    clock.querySelector('.time').style.color = textColor;
}

// Actualiza la hora y el color para cada reloj
function updateClocks() {
    const timeZones = {
        'clock-local': null, // Hora local
        'clock-ny': 'America/New_York',
        'clock-london': 'Europe/London',
        'clock-tokyo': 'Asia/Tokyo',
        'clock-sydney': 'Australia/Sydney',
        'clock-sao-paulo': 'America/Sao_Paulo'
    };

    const now = new Date();

    // Actualiza la hora para cada reloj
    for (const [id, timeZone] of Object.entries(timeZones)) {
        const cityTime = timeZone ? new Date(now.toLocaleString("en-US", { timeZone })) : now;
        const hours = cityTime.getHours().toString().padStart(2, '0');
        const minutes = cityTime.getMinutes().toString().padStart(2, '0');
        const seconds = cityTime.getSeconds().toString().padStart(2, '0');
        const clock = document.getElementById(id);
        if (clock) {
            const timeElement = clock.querySelector('.time');
            if (timeElement) {
                timeElement.textContent = `${hours}:${minutes}:${seconds}`;
                updateBackgroundColorAndTextColor(clock, timeZone);
            }
        }
    }
}

// Llama a la función `updateClocks` inmediatamente y cada segundo
updateClocks();
setInterval(updateClocks, 1000);

// Añade los event listeners para las alarmas y el drag-and-drop
document.addEventListener('DOMContentLoaded', () => {
    const clocks = document.querySelectorAll('.clock');
    let draggedClock = null;

    clocks.forEach(clock => {
        clock.addEventListener('click', () => setAlarm(clock.id));

        // Drag-and-drop
        clock.addEventListener('dragstart', (event) => {
            draggedClock = event.target;
            event.target.style.opacity = 0.5;
        });

        clock.addEventListener('dragend', (event) => {
            event.target.style.opacity = 1;
            saveClockOrder(); // Guarda el orden después del drag-and-drop
        });

        clock.addEventListener('dragover', (event) => {
            event.preventDefault();
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

    loadClockOrder(); // Carga el orden de los relojes al inicio
});

// Guarda el orden de los relojes en el localStorage
function saveClockOrder() {
    const container = document.getElementById('clock-container');
    const order = Array.from(container.children).map(clock => clock.id);
    localStorage.setItem('clockOrder', JSON.stringify(order));
}

// Carga el orden de los relojes desde el localStorage
function loadClockOrder() {
    const order = JSON.parse(localStorage.getItem('clockOrder'));
    if (order) {
        const container = document.getElementById('clock-container');
        order.forEach(id => {
            const clock = document.getElementById(id);
            if (clock) {
                container.appendChild(clock);
            }
        });
    }
}