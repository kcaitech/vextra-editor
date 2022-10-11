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
import { Repository } from "./data/transact";

preload.on('ready', (lzData: LzData) => {
    importDocument(lzData).then((core: Document) => {
        const repo = new Repository();
        core = repo.proxy(core);
        // for debugger
        (window as any).__document = core;

        const context = new Context(core, repo);
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


// @AtomData
// class A {
//     str: string = "haha"
// }

// function AtomData(target: any) {
//     target.prototype.__id__ = 123;
//     console.log(target);
// }

// const a: any = new A();

// console.log(a.__id__);
// console.log(a);
// console.log(A);