import { app, BrowserWindow, ipcMain, powerSaveBlocker, session } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

let counter = 0;
let login: { user: string, pass: string } | undefined;

const l = Buffer.from(fs.readFileSync(path.join(__dirname, './login')).toString(), 'base64').toString('utf8').split('|');
if (l[0].length > 0 && l[1].length > 0) {
    login = {
        user: l[0],
        pass: l[1]
    };
}

app.whenReady()
    .then(() => {
        session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
            if (
                details.url.includes('.png') ||
                details.url.includes('.jpg') ||
                details.url.includes('.mp3') ||
                details.url.includes('.obj') ||
                details.url.includes('twitter') ||
                details.url.includes('paypal') ||
                details.url.includes('unpkg') ||
                details.url.includes('adsafe') ||
                details.url.includes('deployads') ||
                details.url.includes('doubleclick')
            ) {
                callback({ cancel: true });
                return;
            }

            callback({});
        });

        powerSaveBlocker.start('prevent-display-sleep');

        const createWindow = (): BrowserWindow => {
            const win = new BrowserWindow({
                width: 800,
                height: 600,
                title: 'KrunkerCrouch',
                show: false,
                webPreferences: {
                    preload: path.join(__dirname, './preload.bundle.js')
                }
            });

            win.webContents.setUserAgent(win.webContents.userAgent.replace(/Electron.*/, ''));
            win.on('ready-to-show', () => win.show());

            if (process.env.NODE_ENV === 'development') {
                win.setMenuBarVisibility(false);
                win.webContents.openDevTools({ mode: 'detach' });
                win.webContents.addListener('devtools-opened', () => win.focus());
            } else {
                win.setMenu(null);
            }

            return win;
        };

        let win = createWindow();

        const loadGame = async (): Promise<void> => {
            win.loadURL('data:text/html,<h1>Searching for lobby...</h1>')
                .catch(console.error);

            const games = (await axios.get<{ games: [string, string, number, number, { g: number, c: number, v: string, i: string }][] }>(
                'https://matchmaker.krunker.io/game-list',
                { params: { hostname: 'krunker.io' } }
            )).data.games.filter(g => (
                g[4].c === 0 && // not a custom game
                g[2] === 0 // 0 players
            ));

            if (games.length === 0) {
                win.loadURL('data:text/html,<h1>No Lobby found. Waiting...</h1>')
                    .catch(console.error);
                setTimeout(() => {
                    loadGame()
                        .catch(console.error);
                }, 20000);
                return;
            }

            const game = games[Math.floor(Math.random() * games.length)];

            const interval = setInterval(() => {
                if (!win.webContents.isLoading()) {
                    clearInterval(interval);

                    win.loadURL(`https://krunker.io/?game=${game[0]}`)
                        .then(() => {
                            const script = fs.readFileSync(path.join(__dirname, './injection.bundle.js')).toString();
                            win.webContents.executeJavaScript(script)
                                .catch(console.error);

                            if (login) {
                                setTimeout(() => {
                                    win.webContents.send('login', login!.user, login!.pass);
                                }, 2500);
                            }
                        })
                        .catch(console.error);
                }
            }, 100);
        };

        loadGame()
            .catch(console.error);

        ipcMain.on('log', (e, args: any[]) => console.dir(args));
        ipcMain.on('click', () => {
            win.webContents.sendInputEvent({ type: 'mouseDown', x: 400, y: 400 });
            win.webContents.sendInputEvent({ type: 'mouseUp', x: 400, y: 400 });
        });
        ipcMain.on('crouch', (e, arg: boolean) => {
            win.webContents.sendInputEvent({ keyCode: 'shift', type: arg ? 'keyDown' : 'keyUp' });
            if (arg) {
                counter += 1;
            }
        });
        ipcMain.on('walk', (e, arg: boolean) => {
            win.webContents.sendInputEvent({ keyCode: arg ? 'w' : 's', type: 'keyDown' });
            setTimeout(() => win.webContents.sendInputEvent({ keyCode: arg ? 'w' : 's', type: 'keyUp' }), 200);
        });
        ipcMain.on('game_ended', (e, reopen: boolean) => {
            if (reopen) {
                win.close();
                win = createWindow();
            }
            loadGame()
                .catch(console.error);
        });
        ipcMain.on('login', (e, user: string, pass: string) => {
            login = { user, pass };
            fs.writeFileSync(path.join(__dirname, './login'), Buffer.from(`${user}|${pass}`, 'utf8').toString('base64'));
        });

        setInterval(() => {
            win.webContents.send('counter', counter);
        }, 500);
    })
    .catch(console.error);

