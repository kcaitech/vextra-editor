import { createApp } from "vue";
import { Document } from "./data/document";
import { LzData } from "./data/lzdata";
import { Page } from "./data/page";
import { importDocument } from "./io/sketch/documentio";
import { preload } from "./preload";
import Navigation from "./components/Navigation.vue";
import PageView from "./components/PageView.vue"
import App from "./App.vue";
import { Context } from "./context";

preload.on('ready', (lzData: LzData) => {
    importDocument(lzData).then((core: Document) => {
        const context = new Context(core);
        const selection = context.selection;

        let preApp: any | undefined;
        const pagesMgr = core.pagesMgr;
        const selectPage = (id: string) => {
            const index = pagesMgr.getPageIndexById(id);
            pagesMgr.getPageByIndex(index).then((page: Page) => {
                if (preApp) preApp.unmount();
                preApp = createApp(PageView, {context, data: page});
                preApp.mount("#content");
                selection.selectPage(page);
            })
        }
        createApp(Navigation, {data: core, selection, select: selectPage}).mount("#navigation");
        selectPage(pagesMgr.getPageIdByIndex(0));
    })
});
createApp(App, {preload}).mount("#app");
preload.emit('load');
