import { IStorage } from "@kcdesign/data";

export default class LCStorage implements IStorage {
    public get(uri: string): Promise<Uint8Array> {
        const __slices = uri.split('/');
        if (__slices.includes('medias')) {
            uri = '/static/images/' + (__slices.pop() || '');
        } else if (__slices.includes('pages')) {
            uri = '/static/' + (__slices.pop() || '');
        } else {
            uri = '/static/' + (__slices.pop() || '');
        }

        return new Promise((resolve, reject) => {
            fetch(uri).then(async res => {
                const stream = res.body;
                if (!stream) throw new Error('null');
                const reader = stream.getReader();
                const values: Uint8Array[] = [];
                let count = 0;
                while (reader) {
                    const { value, done } = await reader.read();
                    if (value) {
                        values.push(value);
                        count += value.length;
                    }
                    if (done) break;
                }
                if (values.length) {
                    const units = new Uint8Array(count);
                    let index = 0;
                    for (const u of values) {
                        units.set(u, index);
                        index += u.length;
                    }
                    resolve(units);
                } else reject('wrong value');
            }).catch(reject);
        });
    }

    public put(uri: string, data: Uint8Array, contentType?: string): Promise<void> {
        throw new Error('not implements yet');
    }
}