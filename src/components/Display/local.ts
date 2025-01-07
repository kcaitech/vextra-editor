import { IStorage } from "@kcdesign/data";

export default class LCStorage implements IStorage {
    private scriptMap: Map<string, Uint8Array> = new Map();

    public get(uri: string): Promise<Uint8Array> {
        if (uri.startsWith('medias')) {
            uri = './static/images/' + uri.slice('medias/'.length);
            const encoder = new TextEncoder();
            return Promise.resolve(encoder.encode(uri));
        } else {
            const target = this.scriptMap.get(uri);
            if (!target) {
                return new Promise((resolve) => {
                    const script = document.createElement("script");
                    script.src = './static/' + uri + '.js';
                    document.head.append(script);
                    script.onload = () => {
                        const __moss_content = JSON.stringify((window as any).__moss_content_string);
                        (window as any).__moss_content_string = undefined;
                        script.remove();
                        const encoder = new TextEncoder();
                        const u8a = encoder.encode(__moss_content)
                        this.scriptMap.set(uri, u8a);
                        resolve(u8a);
                    }
                })
            } else {
                return Promise.resolve(target);
            }
        }
    }

    public put(uri: string, data: Uint8Array, contentType?: string): Promise<void> {
        throw new Error('not implements yet');
    }
}