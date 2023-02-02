import StreamZip from "node-stream-zip";

interface File extends Blob {
    readonly lastModified: number;
    readonly name: string;
    readonly path: string;
}

export class Zip {
    private _zip: StreamZip;
    constructor(file: File | string) {
        const path = typeof file === 'string' ? file : file.path;
        this._zip = new StreamZip({file: path});
    }
    async entryDataJson(entry: string): Promise<{ [key: string]: any }> {
        const buffer = this._zip.entryDataSync(entry);
        const json = JSON.parse(buffer.toString());
        return json;
    }
    async entryData(entry: string): Promise<Uint8Array> {
        const buffer = this._zip.entryDataSync(entry);
        return buffer;
    }
    close() {
        this._zip.close();
    }
    on(event: 'ready', handler: () => void): void;
    on(event: 'error', handler: (error: any) => void): void;
    on(event: 'ready' | 'error', handler: (error?: any) => void): void {
        if (event === 'ready') this._zip.on(event, handler);
        else if (event === 'error') this._zip.on(event, handler);
    }
}
