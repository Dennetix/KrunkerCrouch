const api = ((window as unknown) as {
    api: {
        log: (...args: any[]) => void,
        click: () => void,
        crouch: (down: boolean) => void,
        walk: (foreward: boolean) => void,
        sendGameEnded: () => void,

        onCounter: (handler: (counter: number) => void) => void
    }
}).api;

const krunkerFunctions = ((window as unknown) as {
    clearPops: () => void,
    showWindow: (n: number) => void
});

let enabled = true;
let cps = 3;
let counter = 0;

const display = document.createElement('div');
display.style.position = 'fixed';
display.style.right = '10px';
display.style.top = '40%';
display.style.color = 'white';
display.style.padding = '20px';
display.style.borderRadius = '8px';
display.style.background = 'rgba(1, 1, 1, 0.5)';
display.style.zIndex = '2147483647';
document.getElementById('gameUI')?.appendChild(display);

const updateDisplay = (): void => {
    display.innerHTML =
        `<span style="color: ${enabled ? 'lime">Enabled' : 'tomato">Disabled'}</span> (Esc to toggle)<br/>
        Crouches per second (Up/Down): <span style="color:${cps >= 4 ? 'tomato' : 'deepskyblue'}">${cps}</span><br/>
        <span style="color:deepskyblue">${counter}</span> crouches this session`;
};

api.onCounter((c) => {
    counter = c;
    updateDisplay();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        enabled = !enabled;
    }

    if (e.key === 'ArrowUp' && cps < 10) {
        cps += 1;
    }
    if (e.key === 'ArrowDown' && cps > 1) {
        cps -= 1;
    }

    if (e.key !== 'Shift') {
        updateDisplay();
    }
});

let foreward = true;
setInterval(() => {
    if (enabled) {
        api.walk(foreward);
        foreward = !foreward;

        krunkerFunctions.clearPops();
        krunkerFunctions.showWindow(0);

        if (document.getElementById('inGameUI')!.style.display !== 'block') {
            api.click();
        }

        const timer = document.getElementById('timerVal')?.textContent;
        if (timer === '00:00') {
            enabled = false;
            setTimeout(api.sendGameEnded, 1000);
        }
    }
}, 500);

let down = false;
const toggleCrouch = (): void => {
    if (enabled && document.getElementById('inGameUI')!.style.display === 'block') {
        down = !down;
        api.crouch(down);
    }
    setTimeout(toggleCrouch, 500 / cps);
};
toggleCrouch();
