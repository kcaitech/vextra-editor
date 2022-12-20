import { LzDataLocal } from "@/io/import/lzdatalocal";
import { importDocument } from "@/io/import/sketch/documentio";
import { Document } from "@/data/document";

function getArg(key: string): string | undefined {
    for (let i = 0, len = process.argv.length; i < len; i++) {
        if (process.argv[i] == key) {
            return process.argv[i + 1];
        }
    }
}

const filePath = getArg('--path');
if (filePath === undefined) {
    console.log("NO file path.");
    process.exit(1);
} else {
    console.log("start load file:" + filePath);
}

const lzData = new LzDataLocal(filePath);
let data: Document | undefined;
importDocument(lzData).then((core: Document) => {
    const loadpages = async () => {
        const pm = core.pagesMgr;
        for (let i = 0, len = pm.pageCount; i < len; i++) {
            await pm.getPageByIndex(i);
        }
        return core;
    }
    return loadpages();
}).then((core: Document) => {
    data = core;
    console.log('load data ok.')
    return true;
})

// ------------------------------------------------
const express = require('express');
// const http = require('http');
const app = express();
const expressWs = require('express-ws')(app);
const port = getArg('--port') || 8000;
app.set('port', port);

app.get('/', (req: any, res: any) => {
    res.send('Hello World!')
})

app.ws('/', function (ws: WebSocket, req: any, next: Function) {
    const send = (data: {msg: string, data?: any}) => {
        const d = JSON.stringify(data);
        ws.send(d);
    }

    const expire = 5000;
    let stamp = Date.now();
    let timer: NodeJS.Timer | undefined;
    const clearTimmer = () => {
        if (timer) {
            clearInterval(timer);
            timer = undefined;
        }
    }
    timer = setInterval(() => {
        if (Date.now() - stamp > expire) {
            clearTimmer();
            console.log('close on expired!');
            ws.close();
        }
    }, expire);

    ws.onmessage = (ev: MessageEvent<any>) => {
        stamp = Date.now();
        console.log(ev.data);
        // ws.send('get');
        send({msg: 'get'});
    }
    ws.onclose = (ev: CloseEvent) => {
        clearTimmer();
        console.log('on close, code: ' + ev.code);
    }
    ws.onerror = (ev: Event) => {
        clearTimmer();
        console.log('on error, type: ' + ev.type);
    }

    
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})