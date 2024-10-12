import { Context } from "@/context";
import {
    ColVector3D, GroupShapeView, ImagePack,
    Shape, ShapeView, SVGParseResult,
    Transform, TransformRaw, UploadAssets,
    makeShapeTransform1By2, makeShapeTransform2By1,
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { message } from "@/utils/message";
import * as parse_svg from "@/svg_parser";
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

    async insertImageByPackages(files: FileList, fixed: boolean, targetXY?: XY) {
        const packages = (await this.packAll(files) as (ImagePack | SVGParseResult)[])
            .filter(i => i);
        if (!packages?.length) return false;
        const transforms = (() => {
            const transforms: TransformRaw[] = [];
            let offset = 0;
            for (let i = 0; i < packages.length; i++) {
                if (i > 0) {
                    const p = packages[i - 1];
                    const size = getSize(p);
                    offset += 20;
                    offset += size.width;
                }
                const __trans = new TransformRaw();
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
            const len = packages.length;
            width += len * 20;

            return { width, height };
        })();
        const context = this.context;
        const selection = context.selection;
        const env = fixTransform(targetXY);
        const page = selection.selectedPage!;
        const getInPage = page.transform2FromRoot.getInverse();
        for (let i = 0; i < transforms.length; i++) {
            const t = makeShapeTransform2By1(transforms[i]);
            t.addTransform(getInPage);
            transforms[i] = makeShapeTransform1By2(t);
        }
        const __packs = transforms.map((v, i) => ({ pack: packages[i], transform: v }));
        const editor = context.editor4Page(page);
        const result = editor.insertImages(__packs, fixed, env);
        if (result) this.upload(result);
        return true;

        function getSize(pack: ImagePack | SVGParseResult) {
            return (pack as ImagePack).size
                ? (pack as ImagePack).size
                : (pack as SVGParseResult).shape?.size;
        }

        function fixTransform(targetXY?: XY) {
            let env: GroupShapeView = context.selection.selectedPage!;
            if (targetXY) {
                const dx = targetXY.x;
                const dy = targetXY.y;
                const selectionTransform = new Transform()
                    .setTranslate(ColVector3D.FromXY(dx, dy));

                env = context.selection.getClosestContainer(targetXY) as GroupShapeView;

                for (let i = 0; i < transforms.length; i++) {
                    const transform = transforms[i];
                    const t = makeShapeTransform2By1(transform)
                        .clone()
                        .addTransform(selectionTransform)
                        .addTransform(env.transform2FromRoot.getInverse())
                    transforms[i] = makeShapeTransform1By2(t) as TransformRaw;
                }
            } else {
                const { width, height } = context.workspace.root;
                let clientMatrix = makeShapeTransform2By1(context.workspace.matrix);
                const { col0, col1 } = clientMatrix.clone().getInverse().transform([
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

                    clientMatrix = makeShapeTransform2By1(context.workspace.matrix);
                    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
                }

                const centerAfterScale = clientMatrix.clone()
                    .getInverse()
                    .transform(ColVector3D.FromXY(width / 2, height / 2)).col0;

                const dx = centerAfterScale.x - area.width / 2;
                const dy = centerAfterScale.y - area.height / 2;

                const selectionTransform = new Transform()
                    .setTranslate(ColVector3D.FromXY(dx, dy));

                for (let i = 0; i < transforms.length; i++) {
                    const transform = transforms[i];
                    const t = makeShapeTransform2By1(transform)
                        .clone()
                        .addTransform(selectionTransform)
                    transforms[i] = makeShapeTransform1By2(t) as TransformRaw;
                }
            }
            return env;
        }
    }

    async upload(buffs: { shape: Shape | ShapeView, upload: UploadAssets[] }[]) {
        const context = this.context;
        let someError = false;
        let count = 0;
        const keySet = new Set<string>();
        const failed: Map<string, { shape: Shape | ShapeView, refs: string[] }> = new Map();
        for (const buffPack of buffs) {
            const { shape, upload } = buffPack;
            if (!upload.length) continue;
            for (const assets of upload) {
                const { ref, buff } = assets;
                if (keySet.has(ref)) continue;
                const res = await upload_image(context, ref, buff);
                if (!res) {
                    let container = failed.get(shape.id)!;
                    if (!container) {
                        container = { shape, refs: [] };
                        failed.set(shape.id, container);
                    }
                    container.refs.push(ref);
                    someError = true;
                } else {
                    keySet.add(ref);
                    count++;
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
        // else if (count) message('success', this.context.workspace.t('home.image_uploaded').replace('xx', count), 3);

        return !someError;
    }
}