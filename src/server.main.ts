import { LzDataLocal } from "./io/import/lzdatalocal";
import { importDocument } from "./io/import/sketch/documentio";
import { Document } from "./data/document";

// console.log("hello server")
// console.log(process.argv)

function getArg(key: string): string | undefined {
    for (let i = 0, len = process.argv.length; i < len; i++) {
        if (process.argv[i] == key) {
            return process.argv[i + 1];
        }
    }
}

const filePath = getArg('--path') || getArg('-p');
// console.log(filePath);

if (filePath === undefined) {
    console.log("NO file path.");
    process.exit(1);
}

const lzData = new LzDataLocal(filePath);
importDocument(lzData).then((core: Document) => {
    // curDoc.value = core;
    console.log(core)
})