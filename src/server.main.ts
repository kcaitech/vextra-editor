import { LzDataLocal } from "@/io/import/sketch/lzdatalocal";
import { importDocument } from "@/io/import/sketch/documentio";
import { Document } from "@/data/document";
import { exportDocument } from "./io/export/exform/document";
import { EventEmitter } from "./basic/event";
import { Page } from "./data/page";
import { exportPage } from "./io/export/exform/page";
import { ExfContext } from "./io/export/exform/context";

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

const lzData = new LzDataLocal(new File([], filePath));
let doc: Document | undefined;
const emitter = new class extends EventEmitter {
    on(name: string, cb: Function) {
        if (name === 'ready' && doc) {
            cb(doc);
            return { remove: () => {} };
        } else {
            return super.on(name, cb);
        }
    }
    once(name: string, cb: Function) {
        if (name === 'ready' && doc) {
            cb(doc);
            return { remove: () => {} };
        } else {
            return super.on(name, cb);
        }
    }
}
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
    doc = core;
    console.log('load data ok.')
    emitter.emit('ready', doc);
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

app.get('/media', (req: any, res: any) => {
    const ref = req.param('ref');
    emitter.once('ready', (doc: Document) => {
        doc.mediaMgr.loadRaw(ref).then((buff) => {
            res.download(buff);
        })
    });
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
        const data = JSON.parse(ev.data);
        if (data['msg'] !== "I am alive.") console.log(data);
        // ws.send('get');
        // send({msg: 'get'});
        if (data['msg'] === 'load') {
            emitter.once('ready', (doc: Document) => {
                const url = data['data'];
                const idx = doc.pagesMgr.getPageIndexById(url);
                doc.pagesMgr.getPageByIndex(idx).then((p: Page) => {
                    const page = exportPage(p, new ExfContext());
                    send({msg: "load", data: {url, data: page}})
                })
            })
        }
    }
    ws.onclose = (ev: CloseEvent) => {
        clearTimmer();
        console.log('on close, code: ' + ev.code);
    }
    ws.onerror = (ev: Event) => {
        clearTimmer();
        console.log('on error, type: ' + ev.type);
    }

    emitter.once('ready', (doc: Document) => {
        const document = exportDocument(doc);
        doc.pagesMgr.getPageByIndex(0).then((p: Page) => {
            const page = exportPage(p, new ExfContext());
            send({msg: "firstload", data: {document, page}})
        })
    })
});

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})