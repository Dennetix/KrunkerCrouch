import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    log: (...args: any[]) => ipcRenderer.send('log', args),
    click: () => ipcRenderer.send('click'),
    crouch: (down: boolean) => ipcRenderer.send('crouch', down),
    walk: (foreward: boolean) => ipcRenderer.send('walk', foreward),
    sendGameEnded: () => ipcRenderer.send('game_ended'),

    onCounter: (handler: (counter: number) => void) => ipcRenderer.on('counter', (e, counter: number) => handler(counter))
});
