/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { ResourceMgr, Shape, Transform, } from "@kcdesign/data";
import { ClipboardEventReader } from "@/clipboard/read/clipboardEventReader";
import { NavigatorClipboardReader } from "@/clipboard/read/navigatorClipboardReader";
import { BundleHandler } from "@/clipboard/bundleHandler";
import { Writer } from "@/clipboard/write";
import { XY } from "@/context/selection";

export type ImageBundle = {
    base64: string;
    name: string;
    width: number;
    height: number;
}

export type SVGBundle = {
    shape: Shape | undefined;
    mediaResourceMgr: ResourceMgr<{ buff: Uint8Array, base64: string }>
}
export type Bundle = {
    HTML?: string;                  // 包含图层、图层属性、文本格式
    plain?: string;                 // 纯文本
    images?: ImageBundle[];         // 图片资源
    SVG?: SVGBundle[];              // 矢量图层
}

export type RefShapeBase = {
    symbol: string;
    base: Shape;
    shapeId: string;
}

export type SourceBundle = {
    shapes: Shape[];
    originTransform: { [key: string]: Transform };
    originIds: string[];
    media: any;
    unbindRefs: RefShapeBase[];
    styles: any[];
}

export class Clipboard {
    static source = 'vext/source';
    static paras = 'vext/paras';
    static properties = 'vext/properties';

    private readonly context: Context;
    private cache: Bundle | undefined;
    constructor(context: Context) {
        this.context = context;
    }

    async write(event?: ClipboardEvent): Promise<boolean> {
        const cache: Bundle = {};
        await new Writer(this.context).write(cache, event);
        if (Object.keys(cache).length) {
            this.cache = cache;
            return true;
        } else return false;
    }

    async writeAsPNG(blob: Blob, name: string, width: number, height: number) {
        const cache: Bundle = {};
        if (await new Writer(this.context).writeAsPNG(cache, blob, name, width, height)) {
            this.cache = cache;
            return true;
        } else return false;
    }

    writeProperties() { }
    async read(event?: ClipboardEvent): Promise<Bundle | undefined> {
        const bundle: Bundle = {};
        try {
            // 剪切板执行两种方案：ClipboardEventReader方案兼容性好、NavigatorClipboardReader方案实用性强，将两种方案融合，各取所长应对不同场景
            if (!navigator.userAgent.includes('Windows') && navigator.userAgent.includes('Safari')) { // 对于Safari这种非常有个性的浏览器，只能忍气吞声
                await new ClipboardEventReader(this.context).read(bundle, event);
            } else {
                await new ClipboardEventReader(this.context).read(bundle, event);
                await new NavigatorClipboardReader(this.context).read(bundle);
            }
            // 两种方案都没有获取到有效内容，使用缓存
            if (!Object.keys(bundle).length) return this.cache;

            return this.cache = bundle;
        } catch (e) {
            // 在用户没有给予剪切板权限、safari浏览器下常常会抛出异常
            console.error(e);
            return bundle;
        }
    }

    /**
     * @description 通过监听浏览器粘贴事件触发(类似“粘贴在这里”，“粘贴图层属性”这类非通过Ctrl + V触发的不属于浏览器粘贴事件，属于自定义粘贴事件)
     */
    async paste(event: ClipboardEvent) {
        // 读取剪切板
        const bundle = await this.read(event);
        if (!bundle || !Object.keys(bundle).length) return false; // 剪切板没有可用于粘贴的内容

        return new BundleHandler(this.context).paste(bundle);
    }

    async pasteHere(xy: XY) {
        const bundle = await this.read();
        if (!bundle || !Object.keys(bundle).length) return false;
    }

    async pasteProperties() {
    }

    async replace() {
        const shapes = this.context.selection.selectedShapes;
        if (!shapes.length) return;

        const bundle = await this.read();
        if (!bundle || !Object.keys(bundle).length) return false; // 剪切板内没有可用的替换内容

        new BundleHandler(this.context).replace(bundle, shapes);
    }

    async cut(event?: ClipboardEvent) {
        const writeSuccess = await this.write(event);
        if (!writeSuccess) return;
        const textshape = this.context.selection.textshape;
        const text = new Writer(this.context).text;

        if (text && textshape) {
            const selection = this.context.textSelection;
            const start = selection.cursorStart;
            const end = selection.cursorEnd;
            if (start === end) return;

            const editor = this.context.editor4TextShape(textshape);

            if (editor.deleteText(Math.min(start, end), Math.abs(start - end))) {
                selection.setCursor(Math.min(start, end), false);
            }
            return;
        }

        const table = this.context.selection.tableshape;
        if (text && table) {
            const editor = this.context.editor4Table(table);
            const ts = this.context.tableSelection;
            editor.resetTextCells(ts.tableRowStart, ts.tableRowEnd, ts.tableColStart, ts.tableColEnd);
            ts.resetSelection();
            return;
        }
        const page = this.context.selection.selectedPage!;
        const editor = this.context.editor4Page(page);
        const delete_res = editor.delete_batch(this.context.selection.selectedShapes);
        if (delete_res) this.context.selection.resetSelectShapes();
    }
}