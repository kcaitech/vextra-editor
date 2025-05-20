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
import {
    ColVector3D, GroupShapeView, ImagePack,
    Shape, ShapeView, SVGParseResult,
    Transform, UploadAssets,
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { message } from "@/utils/message";
import { svgParser as parse_svg } from "@kcdesign/data";
import { upload_image } from "@/utils/content";
import { XY } from "@/context/selection";

/**
 *  · ImageTool --ok
 *  · 图片拖入 --ok
 *  · 图片通过SVG内嵌的方式进入 --ok
 *  · 图片直接通过粘贴事件进入 --ok
 *  · 图片内嵌在图层内并通过粘贴事件进入 --ok
 *  · 表格内引入图片
 */
/**
 * @description 图片加载器
 */
export class ImageLoader {
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async SVGReader(file: File) {
        const reader = new FileReader();
        reader.readAsText(file);
        return new Promise((resolve, reject) => {
            reader.onload = (event) => {
                const svg = event?.target?.result;
                if (!svg) reject('no result');
                const parseResult = parse_svg.parse(svg as string);
                if (!parseResult.shape) reject('svg can not parse');
                else parseResult.shape.name = file.name.replace(/.svg$/i, '') || this.context.workspace.t('shape.artboard');
                resolve(parseResult);
            }
        });
    }

    async packFile(file: File, readSVG = true) {
        if (file.type === "image/svg+xml" && readSVG) return this.SVGReader(file);
        const img = new Image();
        img.src = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
            img.onload = () => {
                if (img.width && img.height) resolve({ width: img.width, height: img.height });
                else reject('wrong size');
            };
        }).then(pre => {
            return new Promise((resolve, reject) => {
                const size = pre as { width: number, height: number };
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = (event) => {
                    const buff = event?.target?.result;
                    if (buff && buff instanceof ArrayBuffer) resolve({ buff: new Uint8Array(buff), size });
                    else reject('no buff');
                }
            })
        }).then(pre => {
            return new Promise((resolve, reject) => {
                const data = pre;
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = (event) => {
                    const base64 = event?.target?.result;
                    if (base64) resolve(Object.assign(data as any, {
                        base64,
                        name: file.name || this.context.workspace.t('shape.image')
                    }));
                    else reject('no base64');
                }
            })
        }).catch(err => {
            console.error(file.name + ': ', err);
        });
    }

    packAll(files: FileList) {
        const task = [];
        const packFile = this.packFile.bind(this);
        for (let i = 0; i < files.length; i++) {
            if (i >= 20) {
                message('info', '20 for max');
                break;
            }
            const file = files[i];
            task.push(packFile(file));
        }
        return Promise.all(task);
    }

    private __fixTransform(transforms: Transform[], area: { width: number, height: number }, targetXY?: XY) {
        const context = this.context;
        let env: GroupShapeView = context.selection.selectedPage!;
        if (targetXY) {
            const dx = targetXY.x;
            const dy = targetXY.y;
            const selectionTransform = new Transform().trans(dx, dy);

            env = context.selection.getClosestContainer(targetXY) as GroupShapeView;

            for (let i = 0; i < transforms.length; i++) {
                const transform = transforms[i];
                const t = (transform)
                    .clone()
                    .multi(selectionTransform)
                    .multi(env.matrix2Root().getInverse())
                transforms[i] = t;
            }
        } else {
            const { width, height } = context.workspace.root;
            let clientMatrix = (context.workspace.matrix);
            const { [0]:col0, [1]:col1 } = clientMatrix.clone().getInverse().transform([
                ColVector3D.FromXY(0, 0),
                ColVector3D.FromXY(width, height)
            ]);
            const containWidth = col1.x - col0.x;
            const containHeight = col1.y - col0.y;
            const ratioW = area.width / (containWidth * 0.92);
            const ratioH = area.height / (containHeight * 0.92);
            const matrix = context.workspace.matrix;
            if (ratioW > 1 || ratioH > 1) {
                matrix.trans(-width / 2, -height / 2);
                matrix.scale(1 / Math.max(ratioW, ratioH));
                matrix.trans(width / 2, height / 2);

                clientMatrix = (context.workspace.matrix);
                context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
            }

            const centerAfterScale = clientMatrix.clone()
                .getInverse()
                .transform(ColVector3D.FromXY(width / 2, height / 2));

            const dx = centerAfterScale.x - area.width / 2;
            const dy = centerAfterScale.y - area.height / 2;

            const selectionTransform = new Transform()
                .setTranslate(ColVector3D.FromXY(dx, dy));

            for (let i = 0; i < transforms.length; i++) {
                const transform = transforms[i];
                const t = (transform.clone())
                    .clone()
                    .addTransform(selectionTransform)
                transforms[i] = (t);
            }
        }
        return env;
    }

    /**
     * @description 从系统文件夹中读取图片资源
     */
    async insertImageByPackages(files: FileList, fixed: boolean, targetXY?: XY) {
        const packages = (await this.packAll(files) as (ImagePack | SVGParseResult)[])
            .filter(i => i);
        if (!packages?.length) return false;
        const transforms = (() => {
            const transforms: Transform[] = [];
            let offset = 0;
            for (let i = 0; i < packages.length; i++) {
                if (i > 0) {
                    const p = packages[i - 1];
                    const size = getSize(p);
                    offset += 20;
                    offset += size.width;
                }
                const __trans = new Transform();
                __trans.translateX = offset;
                transforms.push(__trans)
            }
            return transforms;
        })();
        const area = (() => {
            let width = 0;
            let height = 0;
            for (const p of packages) {
                const size = getSize(p);
                width += size.width;
                size.height > height && (height = size.height);
            }

            width += (packages.length - 1) * 20;

            return { width, height };
        })();
        const context = this.context;
        const selection = context.selection;
        const env = this.__fixTransform(transforms, area, targetXY);
        const page = selection.selectedPage!;
        const getInPage = page.matrix2Root().getInverse();
        for (let i = 0; i < transforms.length; i++) {
            const t = (transforms[i].clone());
            t.multi(getInPage);
            transforms[i] = (t);
        }
        const __packs = transforms.map((v, i) => ({ pack: packages[i], transform: v, targetEnv: env }));
        const editor = context.editor4Page(page);
        const result = editor.insertImages(__packs, fixed);
        if (result) this.upload(result);
        return true;

        function getSize(pack: ImagePack | SVGParseResult) {
            return (pack as ImagePack).size
                ? (pack as ImagePack).size
                : (pack as SVGParseResult).shape?.size;
        }
    }

    async upload(buffs: { shape: Shape | ShapeView, upload: UploadAssets[] }[]) {
        const context = this.context;
        let someError = false;
        let count = 0;
        const keySet = new Set<string>();
        const failed: Map<string, { shape: Shape | ShapeView, refs: string[] }> = new Map();
        const mgr = this.context.data.mediasMgr;
        for (const buffPack of buffs) {
            const { shape, upload } = buffPack;
            if (!upload.length) continue;
            for (const assets of upload) {
                const { ref, buff, base64 } = assets;
                if (keySet.has(ref)) continue;
                const res = await upload_image(context, ref, buff);
                if (res) {
                    keySet.add(ref);
                    count++;
                    if (!mgr.has(ref)) mgr.add(ref, { buff, base64 });
                } else {
                    let container = failed.get(shape.id)!;
                    if (!container) {
                        container = { shape, refs: [] };
                        failed.set(shape.id, container);
                    }
                    container.refs.push(ref);
                    someError = true;
                }
            }
        }

        if (someError) {
            const page = this.context.selection.selectedPage!;
            failed.forEach(v => {
                const { shape, refs } = v;
                refs.forEach((v) => this.context.data.mediasMgr.delete(v));
                if (shape instanceof ShapeView) {
                    shape.reloadImage(new Set(refs));
                } else {
                    const __view = page.getView(shape.id);
                    __view?.reloadImage(new Set(refs));
                }
            });
        }

        return !someError;
    }

    async thumbnail(file: File): Promise<void> {
        const pack = await this.packFile(file, false) as ImagePack;
        this.context.net?.genThumbnail(pack.name, pack.buff);
    }
}