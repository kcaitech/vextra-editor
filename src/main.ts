import { createApp } from "vue";
import { Document } from "./data/document";
import { LzData } from "./data/lzdata";
import { Page } from "./data/page";
import { importDocument } from "./io/sketch/documentio";
import { preload } from "./preload";
import Navigation from "./components/Navigation.vue";
import PageView from "./components/PageView.vue"
import App from "./App.vue";

preload.on('ready', (lzData: LzData) => {

    importDocument(lzData).then((core: Document) => {
        
        const selectPage = (index: number) => {
            core.getPageByIndex(index).then((page: Page) => {
                createApp(PageView, {data: page}).mount("#content");
            })
        }
        createApp(Navigation, {data: core, select: selectPage}).mount("#navigation");
        selectPage(0);

        // createApp(App, {}).mount("#container");
    })
});

createApp(App, {}).mount("#app");
preload.emit('load');
