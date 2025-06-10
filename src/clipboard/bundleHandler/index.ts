/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { Context } from "@/context";
import { Bundle, ImageBundle, Clipboard, SourceBundle, SVGBundle } from "@/clipboard";
import { ImageLoader } from "@/imageLoader";
import {
    adapt2Shape,
    ArtboardView,
    ColVector3D,
    creator,
    getFormatFromBase64,
    GroupShape,
    GroupShapeView,
    ImagePack,
    import_shape_from_clipboard,
    import_text,
    Page,
    PathShapeView,
    Shape,
    ShapeFrame,
    ShapeType,
    ShapeView, StyleMangerMember,
    SVGParseResult,
    SymbolView,
    TextShape,
    Transform,
    UploadAssets,
} from "@kcdesign/data";
import { v4 } from "uuid";
import { message } from "@/utils/message";
import { SpaceHandler } from "@/space";
import { ClipboardTransformHandler } from "@/clipboard/bundleHandler/transform";

export type InsertAction = {
    parent: GroupShape;
    shape: Shape;
    index?: number;
}

export type EnvLike = ArtboardView | SymbolView | GroupShapeView;

export class BundleHandler {
    private readonly context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    private decode(html: string) {
        let result: any;
        const d = document.createElement('div');
        document.body.appendChild(d);
        d.innerHTML = html;
        const carrier = d.querySelector('#carrier');
        result = decodeURIComponent(atob((carrier as HTMLDivElement)?.dataset?.buffer || ''));
        document.body.removeChild(d);
        return result;
    }

    assignBeforeInsert(shapes: Shape[]) {
        for (const shape of shapes) {
            if (shape instanceof TextShape) {
                const placeholder = shape.text.paras[0].spans[0].placeholder;
                if (placeholder) {
                    shape.name = shape.name.slice(1);
                }
            }
        }
    }
    private getSource(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        const source = HTML && HTML.slice(0, 60).indexOf(Clipboard.source) > -1 ? JSON.parse(HTML.split(Clipboard.source)[1]) : undefined;
        if (source) {
            const {unbindRefs, shapes} = source as SourceBundle;
            const manger = this.context.data.symbolsMgr;
            const binds = new Map<string, Shape>();
            for (const ref of unbindRefs) {
                if (!manger.get(ref.symbol)) binds.set(ref.shapeId, ref.base);
            }
            if (binds.size) replace(binds, shapes);
        }
        return source;

        function replace(binds: Map<string, Shape>, shapes: Shape[]) {
            for (let i = 0; i < shapes.length; i++) {
                const shape = shapes[i];
                const base = binds.get(shape.id);
                if (base) shapes[i] = base;
                if ((shape as GroupShape).childs?.length) replace(binds, (shape as GroupShape).childs);
            }
        }
    }

    private getParas(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        return HTML && HTML.slice(0, 60).indexOf(Clipboard.paras) > -1 ? JSON.parse(HTML.split(Clipboard.paras)[1]) : undefined;
    }

    private insertImage(medias: (SVGBundle | ImageBundle)[]) {
        const getSize = (media: SVGBundle | ImageBundle) => {
            if ((media as SVGBundle).shape) return (media as SVGBundle).shape!.size;
            else return {
                width: (media as ImageBundle).width,
                height: (media as ImageBundle).height
            }
        }
        const transforms = (() => {
            const transforms: Transform[] = [];
            let offset = 0;
            for (let i = 0; i < medias.length; i++) {
                if (i > 0) {
                    const pre = medias[i - 1];
                    const size = getSize(pre);
                    offset += 20;
                    offset += size.width;
                }
                const __trans = new Transform();
                __trans.translateX = offset;
                transforms.push(__trans);
            }
            return transforms;
        })();
        const area = (() => {
            let width = 0;
            let height = 0;
            for (const media of medias) {
                const size = getSize(media);
                width += size.width;
                size.height > height && (height = size.height);
            }

            width += (medias.length - 1) * 20;

            return { width, height };
        })();

        const context = this.context;

        const root = context.workspace.root;
        const start = context.workspace.matrix.inverseCoord(root.center.x, root.center.y);
        start.x -= area.width / 2;
        start.y -= area.height / 2;
        const offset = new Transform().setTranslate(ColVector3D.FromXY(start.x, start.y));
        const SH = new SpaceHandler(context);
        const env = SH.getEnvByArea(area);
        const matrix = env.matrix2Root();
        const inverse = ((matrix.inverse));

        for (let i = 0; i < transforms.length; i++) {
            const t = (transforms[i].clone());
            t.addTransform(offset);
            t.addTransform(inverse);
            transforms[i] = (t);
        }
        const packs: {
            pack: ImagePack | SVGParseResult,
            transform: Transform,
            targetEnv: GroupShapeView
        }[] = [];
        for (let i = 0; i < medias.length; i++) {
            const media = medias[i];
            if ((media as SVGBundle).shape) {
                packs.push({ pack: media as SVGParseResult, transform: transforms[i], targetEnv: env });
            } else {
                const __m = media as ImageBundle;
                const size = { width: __m.width, height: __m.height };
                const buff = Uint8Array.from(atob(__m.base64.split(",")[1]), c => c.charCodeAt(0));
                packs.push({ pack: { size, buff, name: __m.name, base64: __m.base64 }, transform: transforms[i], targetEnv: env });
            }
        }
        const page = context.selection.selectedPage!;
        const editor = context.editor4Page(page);
        const result = editor.insertImages(packs, true);
        if (result) {
            context.nextTick(page, SH.fit.bind(SH));
            return new ImageLoader(this.context).upload(result);
        }
    }

    private insertImageToEnvs(medias: (SVGBundle | ImageBundle)[], envs: GroupShapeView[]) {
        const getSize = (media: SVGBundle | ImageBundle) => {
            if ((media as SVGBundle).shape) return (media as SVGBundle).shape!.size;
            else return {
                width: (media as ImageBundle).width,
                height: (media as ImageBundle).height
            }
        }
        const area = (() => {
            let width = 0;
            let height = 0;
            for (const media of medias) {
                const size = getSize(media);
                width += size.width;
                size.height > height && (height = size.height);
            }

            width += (medias.length - 1) * 20;

            return { width, height };
        })();
        const transformId = (shape: Shape) => {
            shape.id = v4();
            (shape as GroupShape).childs?.length && (shape as GroupShape).childs.forEach(i => transformId(i));
        }

        const context = this.context;
        const page = context.selection.selectedPage!;

        const packs: {
            pack: ImagePack | SVGParseResult,
            transform: Transform,
            targetEnv: GroupShapeView
        }[] = [];

        for (let i = 0; i < envs.length; i++) {
            const transforms = (() => {
                const transforms: Transform[] = [];
                let offset = 0;
                for (let i = 0; i < medias.length; i++) {
                    if (i > 0) {
                        const pre = medias[i - 1];
                        const size = getSize(pre);
                        offset += 20;
                        offset += size.width;
                    }
                    const __trans = new Transform();
                    __trans.translateX = offset;
                    transforms.push(__trans);
                }
                return transforms;
            })();

            const env = envs[i];
            const start = { x: (env.frame.width - area.width) / 2, y: (env.frame.height - area.height) / 2 };
            const offset = new Transform().setTranslate(ColVector3D.FromXY(start.x, start.y));
            for (let i = 0; i < transforms.length; i++) {
                const t = (transforms[i].clone());
                t.addTransform(offset);
                transforms[i] = (t);
            }
            for (let i = 0; i < medias.length; i++) {
                const media = medias[i];
                if ((media as SVGBundle).shape) {
                    const bundle = { ...media } as SVGBundle;
                    const shape = import_shape_from_clipboard(
                        context.data,
                        [bundle.shape!]
                    ).pop()!;
                    transformId(shape);
                    bundle.shape = shape;
                    packs.push({ pack: bundle as SVGParseResult, transform: transforms[i], targetEnv: env });
                } else {
                    const __m = media as ImageBundle;
                    const size = { width: __m.width, height: __m.height };
                    const buff = Uint8Array.from(atob(__m.base64.split(",")[1]), c => c.charCodeAt(0));
                    packs.push({ pack: { size, buff, name: __m.name, base64: __m.base64 }, transform: transforms[i], targetEnv: env });
                }
            }
        }

        const editor = context.editor4Page(page);
        const result = editor.insertImages(packs, true);

        if (result) {
            context.nextTick(page, () => { new SpaceHandler(context).fit(); });
            new ImageLoader(this.context).upload(result);
        }
    }

    private insertTextShape(shape: Shape) {
        const context = this.context;
        const selected = context.selection.selectedShapes;
        const container: EnvLike[] = selected.filter(view => {
            return view instanceof ArtboardView || view instanceof GroupShapeView || view instanceof SymbolView;
        }) as ArtboardView[];

        const actions: InsertAction[] = [];
        const area = { ...shape.size };
        const page = adapt2Shape(context.selection.selectedPage!) as Page;
        if (container.length) {
            for (let i = 0; i < container.length; i++) {
                const env = container[i];
                const __shape = import_shape_from_clipboard(context.data, [shape]).pop()!;
                const start = { x: (env.frame.width - area.width) / 2, y: (env.frame.height - area.height) / 2 };
                const offset = new Transform().setTranslate(ColVector3D.FromXY(start.x, start.y));
                const t = (__shape.transform.clone());
                t.addTransform(offset);
                __shape.transform = (t);
                actions.push({ parent: adapt2Shape(env) as GroupShape, shape: __shape });
            }
        } else {
            const __shape = import_shape_from_clipboard(context.data, [shape]).pop()!;
            const root = context.workspace.root;
            const start = context.workspace.matrix.inverseCoord(root.center.x, root.center.y);
            start.x -= area.width / 2;
            start.y -= area.height / 2;
            const offset = new Transform().setTranslate(ColVector3D.FromXY(start.x, start.y));
            const SH = new SpaceHandler(context);
            const env = SH.getEnvByArea(area);
            const matrix = env.matrix2Root();
            const inverse = ((matrix.inverse));
            const t = (__shape.transform.clone());
            t.addTransform(offset);
            t.addTransform(inverse);
            __shape.transform = (t);
            actions.push({ parent: adapt2Shape(env) as GroupShape, shape: __shape })
        }
        return actions.length && context.editor4Page(context.selection.selectedPage!).insertShapes(actions);
    }

    paste(bundle: Bundle) {
        let { images, SVG, HTML, plain } = bundle;
        const source = this.getSource(HTML) as SourceBundle;        // 图层
        const paras = this.getParas(HTML);                          // 文本段落
        if (images) {                                                            // 图片资源(多个的情况下可能包含了SVG资源)
            const allMedia: (SVGBundle | ImageBundle)[] = [...images, ...(SVG ? SVG : [])];
            const context = this.context;
            const selected = context.selection.selectedShapes;

            const container: EnvLike[] = selected.filter(view => {
                return view instanceof ArtboardView || view instanceof GroupShapeView || view instanceof SymbolView;
            }) as ArtboardView[];
            const pathviews: PathShapeView[] = selected.filter(view => view instanceof PathShapeView) as PathShapeView[];

            if (container.length) {
                this.insertImageToEnvs(allMedia, container);
            } else if (pathviews.length) { // 将图片设为pathshape的填充
                if (allMedia.length > 1) return this.insertImage(allMedia);
                const { base64, width, height } = images[0];
                const buff = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
                const format = getFormatFromBase64(base64);
                const ref = `${v4()}.${format}`;
                const media = { buff, base64 };
                const actions: {
                    shape: ShapeView,
                    ref: string,
                    width: number,
                    height: number,
                    media: { buff: Uint8Array, base64: string }
                }[] = [];
                for (const view of pathviews) actions.push({ shape: view as any, ref, width, height, media });
                const page = context.selection.selectedPage!;
                const editor = context.editor4Page(page);
                editor.setShapesFillAsImage(actions);
                new ImageLoader(context).upload(selected.map(shape => ({ shape, upload: [{ buff, ref, base64 }] })));
            } else {
                this.insertImage(allMedia);
            }
        } else if (SVG) { // 一定是单个SVG资源，多个的场景当作图片资源处理
            this.insertImage(SVG);
        } else if (source) {
            if (source.styles?.length) {
                this.insertMasks(source.styles);  // 样式
            }
            // 如果选区内全都是容器，粘贴到每个选中的容器
            const context = this.context;
            const page = context.selection.selectedPage!;
            const selected = context.selection.selectedShapes;
            let params: InsertAction[] | undefined;
            const { shapes, media, originIds } = source;

            this.assignBeforeInsert(shapes);
            const containerSet = new Set<EnvLike>();
            const isContainer = (view: ShapeView) => view instanceof GroupShapeView || view instanceof ArtboardView || view instanceof SymbolView;
            for (const view of selected) {
                if (isContainer(view)) {
                    containerSet.add(view as EnvLike);
                    continue;
                }
                const parent = view.parent!;
                if (isContainer(parent) && parent.type !== ShapeType.Page) containerSet.add(parent as EnvLike);
            }
            const container = Array.from(containerSet.values());
            const handler = new ClipboardTransformHandler();
            if (selected.length === 1 && selected[0] instanceof ArtboardView && originIds.length === 1 && originIds[0] === selected[0].id) {
                params = handler.rightBy(context, source, selected[0]);
            } else if (container.length) {
                params = handler.fitEnvs(context, container, source);
            } else {
                if (handler.isOuterView(context, shapes)) {
                    params = handler.center(context, source);
                } else {
                    params = handler.fitOrigin(context, source);
                }
            }
            if (params && context.editor4Page(page).insertShapes(params)) {
                const keys = Object.keys(media);
                const assets: UploadAssets[] = [];
                for (const ref of keys) {
                    const buff = media[ref].buff ?? Uint8Array.from(atob(media[ref].split(",")[1]), c => c.charCodeAt(0));
                    const base64 = media[ref].base64 ?? media[ref];
                    buff && base64 && assets.push({ ref, buff, base64 });
                }
                const uploadPackages = params.map(o => ({ shape: o.shape, upload: assets }));
                new ImageLoader(context).upload(uploadPackages);
                context.nextTick(page, () => { new SpaceHandler(context).fit() });
            }
        } else if (paras) {
            const text = import_text(this.context.data, paras, true);
            const shape: TextShape = (text as TextShape);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            const context = this.context;
            if (this.insertTextShape(shape)) context.nextTick(context.selection.selectedPage!, () => { new SpaceHandler(context).fit() });
        } else if (plain) {
            const name = plain.length >= 20 ? plain.slice(0, 19) + '...' : plain;
            const shape = creator.newTextShape(name, this.context.data.stylesMgr);
            shape.text.insertText(plain, 0);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            const context = this.context;
            if (this.insertTextShape(shape)) context.nextTick(context.selection.selectedPage!, () => { new SpaceHandler(context).fit() });
        }
    }

    // todo 现在可以先用原来的
    pasteHere(bundle: Bundle) { }

    replace(bundle: Bundle, shapes: ShapeView[]) {
        const { HTML, plain, images, SVG } = bundle;

        const source = this.getSource(HTML);
        const paras = this.getParas(HTML);

        if (images) {
            // 用图片生成图层
            const context = this.context;
            const source: Shape[] = [];
            const assets: UploadAssets[] = [];
            for (const image of images) {
                let { base64, name, width, height } = image;
                const buff = Uint8Array.from(atob(base64.split(",")[1]), c => c.charCodeAt(0));
                const format = getFormatFromBase64(base64);
                const ref = `${v4()}.${format}`;
                const manager = context.data.mediasMgr;
                manager.add(ref, { buff, base64 });
                name = name.replace(new RegExp(`.${format}|.jpg$`, 'img'), '') || 'image';
                const frame = new ShapeFrame(0, 0, width, height);
                const asset: UploadAssets = { buff, ref, base64 };
                assets.push(asset);
                source.push(creator.newImageFillShape(name, frame, manager, {
                    width,
                    height
                }, this.context.data.stylesMgr, ref));
            }
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: assets }))).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        } else if (source) {
            if (source.styles?.length) this.insertMasks(source.styles);  // 样式
            // 检查有没有图层内容
            const context = this.context;
            const page = context.selection.selectedPage!;
            const shapes = import_shape_from_clipboard(context.data, source.shapes, source.media);
            if (!shapes.length) throw new Error('invalid source');
            // 进行替换
            const editor = context.editor4Page(page);
            const result = editor.replace(context.data, shapes, context.selection.selectedShapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            const keys = Object.keys(source.media);
            const assets: UploadAssets[] = [];
            for (const ref of keys) {
                const buff = source.media[ref]?.buff ?? Uint8Array.from(atob(source.media[ref].split(",")[1]), c => c.charCodeAt(0));
                const base64 = source.media[ref]?.base64 ?? source.media[ref];
                buff && base64 && assets.push({ ref, buff, base64 });
            }
            const uploadPackages = result.map(shape => ({ shape, upload: assets }));
            new ImageLoader(context).upload(uploadPackages).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        } else if (paras) {
            // 用文本段落生成图层
            const text = import_text(this.context.data, paras, true);
            const context = this.context;
            const shape: TextShape = (text as TextShape);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            context.editor4Page(context.selection.selectedPage!)
                .replace(context.data, [shape], context.selection.selectedShapes.map((s) => adapt2Shape(s)));
        } else if (plain) {
            // 用纯文本生成图层
            const name = plain.length >= 20 ? plain.slice(0, 19) + '...' : plain;
            const shape = creator.newTextShape(name, this.context.data.stylesMgr);
            shape.text.insertText(plain, 0);
            const layout = shape.getLayout();
            shape.size.width = layout.contentWidth;
            shape.size.height = layout.contentHeight;
            const context = this.context;
            // 进行替换
            context.editor4Page(context.selection.selectedPage!)
                .replace(context.data, [shape], context.selection.selectedShapes.map((s) => adapt2Shape(s)));
        } else if (SVG) {
            const source: Shape[] = [];
            const assets: UploadAssets[] = [];
            for (const svg of SVG) {
                const { shape, mediaResourceMgr } = svg;
                if (!shape) continue;
                source.push(shape);
                const upload: UploadAssets[] = [];
                mediaResourceMgr.forEach((v, k) => upload.push({ ref: k, buff: v.buff, base64: v.base64 }));
                assets.push(...upload)
            }
            const context = this.context;
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: assets }))).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        }
    }

    insertMasks(masks: StyleMangerMember[]) {
        const editor = this.context.editor4Doc();
        editor.insertStyles(masks);
    }
}