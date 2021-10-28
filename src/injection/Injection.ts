const api = ((window as unknown) as {
    api: {
        log: (...args: any[]) => void,
        click: () => void,
        crouch: (down: boolean) => void,
        walk: (foreward: boolean) => void,
        sendGameEnded: () => void,
        sendLogin: (user: string, pass: string) => void,

        onCounter: (handler: (counter: number) => void) => void,
        onLogin: (handler: (user: string, pass: string) => void) => void
    }
}).api;

const krunkerFunctions = ((window as unknown) as {
    clearPops: () => void,
    showWindow: (n: number) => void,
    loginAcc: () => void
});

let enabled = true;
let cps = 3;
let counter = 0;
let login: { user: string, pass: string } | undefined;
let isLoggingIn = false;

let foreward = true;
let timeout = Date.now();

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
        Crouches this session: <span style="color:deepskyblue">${counter}</span><br/>
        Timeout in: <span style="color:deepskyblue">${Math.floor((265000 - (Date.now() - timeout)) / 1000)}</span><hr/>
        <span style="color:gray">[Esc]</span> to turn on/off<br/>
        <span style="color:gray">[N]</span> to change lobby<br/>
        <span style="color:gray">[L]</span> to set autologin<br/>
        <span style="color:gray">[Up/Down]</span> to change speed`;
};

const loginForm = document.createElement('form');
loginForm.style.position = 'fixed';
loginForm.style.left = '50%';
loginForm.style.top = '50%';
loginForm.style.transform = 'translate(-50%, -50%)';
loginForm.style.color = 'white';
loginForm.style.padding = '20px';
loginForm.style.borderRadius = '8px';
loginForm.style.background = 'rgba(1, 1, 1, 0.5)';
loginForm.style.zIndex = '2147483647';
loginForm.style.textAlign = 'left';
loginForm.style.display = 'none';
document.getElementById('gameUI')?.appendChild(loginForm);

loginForm.innerHTML = `
    Save login information<br />
    <input type="text" placeholder="Username" /><br />
    <input type="password" placeholder="Password" /><br />
    <input type="submit" value="Save" />
`;

loginForm.onsubmit = (e) => {
    e.preventDefault();

    login = {
        user: (loginForm.children[1] as HTMLInputElement).value,
        pass: (loginForm.children[3] as HTMLInputElement).value
    };

    api.sendLogin(login.user, login.pass);
    enabled = true;
    loginForm.style.display = 'none';
};

api.onCounter((c) => {
    counter = c;
    updateDisplay();
});

api.onLogin((user, pass) => {
    login = { user, pass };
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginForm.style.display === 'none') {
        enabled = !enabled;
    }

    if (e.key === 'n' && loginForm.style.display === 'none') {
        api.sendGameEnded();
    }

    if (e.key === 'l' && loginForm.style.display === 'none') {
        enabled = false;
        loginForm.style.display = 'block';
        document.exitPointerLock();
    } else if (e.key === 'Escape' && loginForm.style.display === 'block') {
        enabled = true;
        loginForm.style.display = 'none';
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

setInterval(() => {
    if (Date.now() - timeout >= 265000) {
        api.sendGameEnded();
        return;
    }

    if (enabled && document.getElementById('initLoader')?.style.display === 'none') {
        api.walk(foreward);
        foreward = !foreward;

        krunkerFunctions.clearPops();

        if (!login) {
            enabled = false;
            loginForm.style.display = 'block';
        } else if (document.getElementById('menuAccountUsername')?.textContent === '?' && !isLoggingIn) {
            isLoggingIn = true;
            setTimeout(() => {
                if (document.getElementById('menuAccountUsername')?.textContent === '?') {
                    krunkerFunctions.showWindow(5);
                    (document.getElementById('accName') as HTMLInputElement).value = login!.user;
                    (document.getElementById('accPass') as HTMLInputElement).value = login!.pass;
                    krunkerFunctions.loginAcc();
                }
            }, 5000);
        } else if (document.getElementById('menuAccountUsername')?.textContent !== '?') {
            krunkerFunctions.showWindow(0);
            api.click();
        }

        const timer = document.getElementById('timerVal')?.textContent;
        if (timer === '00:00' && document.getElementsByClassName('endTableN').length > 1) {
            api.sendGameEnded();
        } else if (timer === '00:00') {
            timeout = Date.now();
        }
    } else if (document.getElementById('initLoader')?.style.display === 'none') {
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
