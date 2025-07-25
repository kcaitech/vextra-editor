/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Bundle } from "@/clipboard";
import { IO } from "@kcaitech/vextra-core";
import { Reader } from "@/clipboard/read/reader";
import { Context } from "@/context";

export class ClipboardEventReader extends Reader {
    constructor(context: Context) {
        super(context);
    }

    async read(bundle: Bundle, event?: ClipboardEvent) {
        if (!event) return;
        const items = event.clipboardData?.items;
        if (!items) return;
        // 拷贝一份DataTransferItemList，原因是event.clipboardData上的DataTransferItemList在异步读取一次后会清空自己(items.length = 0)，导致只能读取到一份数据
        const data: DataTransferItem[] = [];
        for (const d of items) data.push(d);
        const fileList = data.filter(i => i.kind === "file").map(i => i.getAsFile()!).slice(0, 20); // 限定最多张数20
        const stringList = data.filter(i => i.kind === "string");
        for (const file of fileList) {
            const type = file.type;
            if (!type.includes("image")) continue;
            if (file.type === "image/svg+xml") {
                const svg = await this.SVGFileReader(file);
                const svgs = bundle["SVG"];
                svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                continue;
            }
            const size = await new Promise<{
                width: number,
                height: number
            }>(resolve => {
                const img = new Image();
                img.src = URL.createObjectURL(file);
                img.onload = () => resolve({ width: img.width, height: img.height });
            });
            const base64 = await new Promise<{
                name: string,
                base64: string
            }>(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const base64 = event?.target?.result as string;
                    if (base64) resolve({
                        base64,
                        name: file.name || this.context.workspace.t('shape.image')
                    });
                }
            });
            if (size && base64) {
                const images = bundle["images"];
                images ? images.push(Object.assign(size, base64)) : bundle["images"] = [Object.assign(size, base64)];
            }
        }
        // 同样的经过一个await之后，类型为string的DataTransferItem里面的内容会被清空，所以需要把所有DataTransferItem的读取进程收集起来放到一个await后面
        const all: Promise<{ type: string, result: string }>[] = [];
        for (const item of stringList) {
            const type = item.type; // type不能放到getAsString的callback里面读取，执行callback的时候已经清空了
            if (!type) continue;
            all.push(new Promise<{ type: string, result: string }>(resolve => item.getAsString((result) => resolve({ type, result }))));
        }
        const allResult = await Promise.all(all);
        for (const item of allResult) {
            if (item.type === "text/html") {
                bundle["HTML"] = item.result;
            } else if (item.type === "text/plain") {
                const result = item.result;
                if (this.maySvgText(result)) {
                    const svg = IO.SvgParser.parse(result);
                    const svgs = bundle["SVG"];
                    svgs ? svgs.push(svg) : bundle["SVG"] = [svg];
                } else bundle["plain"] = result;
            }
        }
    }
}