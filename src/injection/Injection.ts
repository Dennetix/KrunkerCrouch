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
display.style.top = '35%';
display.style.color = 'white';
display.style.padding = '20px';
display.style.borderRadius = '8px';
display.style.background = 'rgba(1, 1, 1, 0.5)';
display.style.zIndex = '2147483647';
display.style.textAlign = 'left';
document.getElementById('gameUI')?.appendChild(display);

const updateDisplay = (): void => {
    display.innerHTML =
        `State: <span style="color: ${enabled ? 'lime">Enabled' : 'tomato">Disabled'}</span><br/>
        Crouches per second: <span style="color:${cps >= 4 ? 'tomato' : 'deepskyblue'}">${cps}</span><br/>
        Crouches this session: <span style="color:deepskyblue">${counter}</span><hr/>
        <span style="color:gray">[Esc]</span> to turn on/off<br/>
        <span style="color:gray">[N]</span> to change lobby<br/>
        <span style="color:gray">[Up/Down]</span> to change speed`;
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

    if (enabled && e.key === 'n') {
        api.sendGameEnded();
    }

    if (e.key !== 'Shift') {
        updateDisplay();
    }
});

let foreward = true;
let timeout = Date.now();

setInterval(() => {
    if (enabled) {
        api.walk(foreward);
        foreward = !foreward;

        krunkerFunctions.clearPops();
        krunkerFunctions.showWindow(0);

        if (document.getElementById('inGameUI')!.style.display !== 'block') {
            api.click();
        }

        if (Date.now() - timeout >= 265000) {
            api.sendGameEnded();
        }

        const timer = document.getElementById('timerVal')?.textContent;
        if (timer === '00:00' && document.getElementsByClassName('endTableN').length > 1) {
            api.sendGameEnded();
        } else if (timer === '00:00') {
            timeout = Date.now();
        }
    } else {
        timeout = Date.now();
    }
}, 750);

let down = false;
const toggleCrouch = (): void => {
    if (enabled && document.getElementById('inGameUI')!.style.display === 'block') {
        down = !down;
        api.crouch(down);
    }
    setTimeout(toggleCrouch, 500 / cps);
};
toggleCrouch();
