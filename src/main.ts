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
import Raphael from "./vendor/raphael";

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

console.log(Raphael);


const paper = new Raphael(document.createElement("div"), 500, 500);

const path = paper.path("M 43,53 183,85 C 194,113 179,136 167,161 122,159 98,195 70,188 z");
path.attr({fill: "#a00", stroke: "none"});

const ellipse = paper.ellipse(170, 160, 40, 35);
ellipse.attr({fill: "#0a0", stroke: "none"});

const rect = paper.rect(0, 0, 100, 100);
const circle = paper.circle(0, 0, 50);

const unionPath = paper.union(path, ellipse);
const diffPath = paper.difference(path, ellipse);
const exclPath = paper.exclusion(path, ellipse);
const intersectPath = paper.intersection(path, ellipse);


//draw a new path element using that string
paper.path(unionPath).attr({fill: "#666"});
paper.path(diffPath).attr({fill: "#666", transform:"translate(100 0)"});
paper.path(exclPath).attr({fill: "#666", x: 0, y: 100});
paper.path(intersectPath).attr({fill: "#666", x: 100, y: 100});

// as they aren't needed anymore remove the other elements
path.remove();
ellipse.remove();
