import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import { ipcRenderer } from 'electron';
import { IJSON, LzData } from "./data/lzdata";
import { LzDataLocal } from '@/io/import/sketch/lzdatalocal';
import { Link } from "./basic/link";
import { importDocument } from "./io/import/exform/document";
import { LzDataRemote } from "./io/import/exform/lzdataremote";
import { Document } from "./data/document";



function openLocalFile(onReady: (data: LzData) => void) {
    ipcRenderer.invoke('getOpenFilePath').then((filePath: string) => {
        if (filePath) onReady(new LzDataLocal(filePath));
    });
}

let link: Link | undefined;

function openRemoteFile(onReady: (data: Document) => void) {
    if (link) link.close();
    const l = link = new Link("ws://localhost:8000")
    const timeout = setTimeout(() => { // expired
        if (!l.isOpen()) l.close();
    }, 10000);
    l.once('onopen', () => {
        clearTimeout(timeout);
    })
    l.once('firstload', (data: IJSON) => {
        const document = data['document'];
        const page = data['page'];
        // console.log(document, page);
        const lzData = new LzDataRemote(l);
        importDocument(lzData, JSON.parse(document), JSON.parse(page)).then((val: Document) => {
            onReady(val);
        })
    })
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

const app = createApp(App, { openLocalFile, openRemoteFile })
app.use(i18n);
app.mount("#app");


//

// const l = new Link("ws://localhost:8000")
//     const timeout = setTimeout(() => { // expired
//         if (!l.isOpen()) l.close();
//     }, 10000);
//     l.once('onopen', () => {
//         clearTimeout(timeout);
//     })
//     l.once('firstload', (data: IJSON) => {
//         const document = data['document'];
//         const page = data['page'];
//         console.log(document);
//         console.log(page);
//     })