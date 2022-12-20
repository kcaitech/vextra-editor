// LzDataRemote

import { IJSON, LzData } from "@/data/lzdata";
import { Link } from "./link";

export class LzDataRemote implements LzData {
    private __link: Link;
    constructor(l: Link) {
        this.__link = l;
    }
    loadRaw(url: string): Promise<Buffer> {
        throw new Error("Method not implemented.");
    }
    load(url: string): Promise<IJSON> {
        return new Promise((resolve, reject) => {
            const token = this.__link.on('load', (data: IJSON) => {
                if (data['url'] == url) {
                    token.remove();
                    resolve(data['data']);
                }
            })
			this.__link.send({msg: 'load', data: url});
		})
    }
}
