import StreamZip from "node-stream-zip";

export class Zip extends StreamZip {
    constructor(file: File) {
        super({file: file.path});
    }
    async entryDataJson(entry: string): Promise<{[key: string]: any}> {
        const buffer = super.entryDataSync(entry);
        return buffer.toJSON();
    }
    async entryData(entry: string): Promise<Uint8Array> {
        const buffer = super.entryDataSync(entry);
        return buffer;
    }
}
