import { CoopRepository, importLocal, Repository } from "@kcdesign/data";
import LCStorage from "./local";
import { Context } from "@/context";

export async function parserDocument() {
    const storage = new LCStorage();
    const repo = new Repository();
    const { document, loader } = await importLocal(storage, '', '', '', repo);
    const cooprepo = new CoopRepository(document, repo)
    const context = new Context(document, cooprepo, { source: 'storage', storage } as any);
    (window as any).__context = context;
    return context;
}

interface Config {
    pageId: string;
    boardId: string;
    backgroundColor: string;
}

export async function fetchConfig(): Promise<Config> {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = './static/.config.js';
        document.head.append(script);
        script.onload = () => {
            const __moss_config = JSON.parse(JSON.stringify((window as any).__moss_config));
            script.remove();
            resolve(__moss_config)
        }
    })
}