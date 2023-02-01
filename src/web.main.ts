import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import SvgIcon from '@/components/common/SvgIcon.vue'
import { IJSON, LzData } from "./data/lzdata";
import { LzDataLocal } from '@/io/import/sketch/lzdatalocal';
import { Link } from "./basic/link";
import { importDocument } from "./io/import/exform/document";
import { LzDataRemote } from "./io/import/exform/lzdataremote";
import { Document } from "./data/document";

function openLocalFile(onReady: (data: LzData) => void, file?: File) {
    if (file) {
        onReady(new LzDataLocal(file));
    }
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

const app = createApp(App, { openLocalFile, openRemoteFile })
app.use(i18n);
app.component('svg-icon', SvgIcon);
app.mount("#app");
