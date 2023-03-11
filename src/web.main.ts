import { createApp } from "vue";
import App from "./App.vue";
import i18n from "./i18n";
import SvgIcon from '@/components/common/SvgIcon.vue'
import { LzData } from "./data/data/lzdata";
import { LzDataLocal } from '@/io/import/sketch/lzdatalocal';
import { importDocument } from "./data/io/exform/import/document";
import { LzDataRemote } from "./data/io/exform/import/lzdataremote";
import { Document } from "./data/data/document";
import { Zip } from "@pal/zip";

function openLocalFile(onReady: (data: LzData) => void, file?: File) {
    if (file) {
        onReady(new LzDataLocal(new Zip(file)));
    }
}

function openRemoteFile(fid: string, onReady: (data: Document) => void) {
    const lzData = new LzDataRemote(fid, '0');
    importDocument(lzData).then((val: Document) => {
        onReady(val);
    })
}

const app = createApp(App, { openLocalFile, openRemoteFile })
app.use(i18n);
app.component('svg-icon', SvgIcon);
app.mount("#app");
