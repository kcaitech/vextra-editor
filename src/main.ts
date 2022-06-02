import { createApp } from "vue";
import { Document } from "./data/document";
import { LzData } from "./data/lzdata";
import { Page } from "./data/page";
import { importDocument } from "./io/sketch/documentio";
import { preload } from "./preload";
import Navigation from "./components/Navigation.vue";
import PageView from "./components/PageView.vue"
import App from "./App.vue";
// import Raphael from "raphael";
// import R = require('raphael');
// import * as Raphael from "raphael"
// require("amd-loader");
import Raphael from "./raphael";

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

console.log("amd", Raphael);
const paper = new Raphael("canvas", 250, 250);

const path = paper.path("M 43,53 183,85 C 194,113 179,136 167,161 122,159 98,195 70,188 z");
path.attr({fill: "#a00", stroke: "none"});

const ellipse = paper.ellipse(170, 160, 40, 35);
ellipse.attr({fill: "#0a0", stroke: "none"});
