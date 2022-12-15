import { LzDataLocal } from "@/io/import/lzdatalocal";
import { importDocument } from "@/io/import/sketch/documentio";
import { Document } from "@/data/document";

// console.log("hello server")
// console.log(process.argv)

function getArg(key: string): string | undefined {
    for (let i = 0, len = process.argv.length; i < len; i++) {
        if (process.argv[i] == key) {
            return process.argv[i + 1];
        }
    }
}

const filePath = getArg('--path');
// console.log(filePath);

if (filePath === undefined) {
    console.log("NO file path.");
    process.exit(1);
}

const lzData = new LzDataLocal(filePath);

importDocument(lzData).then((core: Document) => {
    // curDoc.value = core;
    const loadpages = async () => {
        const pm = core.pagesMgr;
        for (let i = 0, len = pm.pageCount; i < len; i++) {
            await pm.getPageByIndex(i);
        }
        return core;
    }
    return loadpages();
}).then((core: Document) => {

    console.log('load ok')
    return true;
})

// const express = require('express')
import express from 'express';
const app = express()
const port = getArg('--port') || 8000;
app.set('port', port);

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})