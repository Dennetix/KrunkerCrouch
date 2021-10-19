import { app, BrowserWindow, ipcMain } from 'electron';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

app.whenReady()
    .then(() => {
        const win = new BrowserWindow({
            width: 1600,
            height: 900,
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

        const loadGame = async(): Promise<void> => {
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

            win.loadURL(`https://krunker.io/?game=${game[0]}`)
                .then(() => {
                    const script = fs.readFileSync(path.join(__dirname, './injection.bundle.js')).toString();
                    win.webContents.executeJavaScript(script)
                        .catch(console.error);
                })
                .catch(console.error);
        };

        loadGame()
            .catch(console.error);

        let counter = 0;

        ipcMain.on('log', (e, args: any[]) => console.log(args));
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
        ipcMain.on('game_ended', () => {
            loadGame()
                .catch(console.error);
        });

        setInterval(() => {
            win.webContents.send('counter', counter);
        }, 500);
    })
    .catch(console.error);

