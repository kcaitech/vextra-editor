import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import { ipcRenderer } from 'electron';
import { LzData } from "./data/lzdata";
import { LzDataLocal } from './io/lzdatalocal';

export function openLocalFile(onReady: (data: LzData) => void) {
    ipcRenderer.invoke('getOpenFilePath').then((filePath) => {
        if (filePath) onReady(new LzDataLocal(filePath));
    });
}

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector: string, text: string) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }
    for (const type of ['chrome', 'node', 'electron']) {
        replaceText(`${type}-version`, (process.versions[type] || ''))
    }
})

const app = createApp(App, { openLocalFile })
app.use(i18n);
app.mount("#app");

