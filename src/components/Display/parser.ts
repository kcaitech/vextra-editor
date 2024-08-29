import { CoopRepository, importRemote, Repository } from "@kcdesign/data";
import LCStorage from "./local";
import { Context } from "@/context";

export async function parserDocument() {
    const storage = new LCStorage();
    const repo = new Repository();
    const { document, loader } = await importRemote(storage, '', '', '', repo);
    const cooprepo = new CoopRepository(document, repo)
    return new Context(document, cooprepo, { source: 'storage', storage } as any);
}

interface Config {
    pageId: string;
    boardId: string;
    backgroundColor: string;
}

export async function fetchConfig(): Promise<Config> {
    const response = await fetch('/static/.config');
    const stream = response.body;
    if (!stream) throw new Error('null stream');
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
        return JSON.parse(new TextDecoder().decode(units));
    } else {
        throw new Error('no values');
    }
}