import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    log: (...args: any[]) => ipcRenderer.send('log', args),
    click: () => ipcRenderer.send('click'),
    crouch: (down: boolean) => ipcRenderer.send('crouch', down),
    walk: (foreward: boolean) => ipcRenderer.send('walk', foreward),
    sendGameEnded: () => ipcRenderer.send('game_ended'),
    sendLogin: (user: string, pass: string) => ipcRenderer.send('login', user, pass),

    onCounter: (handler: (counter: number) => void) => ipcRenderer.on('counter', (e, counter: number) => handler(counter)),
    onLogin: (handler: (user: string, pass: string) => void) => ipcRenderer.on('login', (e, user: string, pass: string) => handler(user, pass))
});
