import { Context } from "@/context";
import { MossClipboard, Bundle, SVGBundle, ImageBundle } from "@/clipboard";
import { ImageLoader } from "@/imageLoader";
import {
    ArtboradView, GroupShapeView, SymbolView, PathShapeView, getFormatFromBase64, ShapeView, Shape, UploadAssets, ShapeFrame, creator,
    adapt2Shape, import_shape_from_clipboard, import_text, TextShape, TransformRaw, makeShapeTransform2By1, makeShapeTransform1By2,
    ImagePack, SVGParseResult, Matrix, Transform, ColVector3D
} from "@kcdesign/data";
import { v4 } from "uuid";
import { message } from "@/utils/message";
import { SpaceHandler } from "@/space";

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

    private getSource(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        return HTML && HTML.slice(0, 60).indexOf(MossClipboard.source) > -1 ? JSON.parse(HTML.split(MossClipboard.source)[1]) : undefined;
    }

    private getParas(HTML: string | undefined) {
        if (!HTML) return undefined;
        HTML = this.decode(HTML);
        return HTML && HTML.slice(0, 60).indexOf(MossClipboard.paras) > -1 ? JSON.parse(HTML.split(MossClipboard.paras)[1]) : undefined;
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
            const transforms: TransformRaw[] = [];
            let offset = 0;
            for (let i = 0; i < medias.length; i++) {
                if (i > 0) {
                    const pre = medias[i - 1];
                    const size = getSize(pre);
                    offset += 20;
                    offset += size.width;
                }
                const __trans = new TransformRaw();
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
        const inverse = makeShapeTransform2By1(new Matrix(matrix.inverse));

        for (let i = 0; i < transforms.length; i++) {
            const t = makeShapeTransform2By1(transforms[i]);
            t.addTransform(offset);
            t.addTransform(inverse);
            transforms[i] = makeShapeTransform1By2(t);
        }
        const packs: {
            pack: ImagePack | SVGParseResult,
            transform: TransformRaw
        }[] = [];
        for (let i = 0; i < medias.length; i++) {
            const media = medias[i];
            if ((media as SVGBundle).shape) {
                packs.push({ pack: media as SVGParseResult, transform: transforms[i] });
            } else {
                const __m = media as ImageBundle;
                const size = { width: __m.width, height: __m.height };
                const buff = Uint8Array.from(atob(__m.base64.split(",")[1]), c => c.charCodeAt(0));
                packs.push({ pack: { size, buff, name: __m.name, base64: __m.base64 }, transform: transforms[i] });
            }
        }
        const page = context.selection.selectedPage!;
        const editor = context.editor4Page(page);
        const result = editor.insertImages(packs, true, env);
        if (result) {
            context.nextTick(page, SH.fit.bind(SH));
            return new ImageLoader(this.context).upload(result);
        }
    }

    paste(bundle: Bundle) {
        let { images, SVG, HTML, plain } = bundle;
        const source = this.getSource(HTML);    // 图层
        const paras = this.getParas(HTML);      // 文本段落

        if (images) {
            const allMedia: (SVGBundle | ImageBundle)[] = [...images, ...(SVG ? SVG : [])];
            const context = this.context;
            const selected = context.selection.selectedShapes;
            // 图片资源数量大于1或不存在图层，视作插入图片(与从文件夹中直接选择文件的场景类似)
            if (allMedia.length > 1 || !selected.length) return this.insertImage(allMedia);

            const container: (ArtboradView | GroupShapeView | SymbolView)[] = selected.filter(view => {
                return view instanceof ArtboradView || view instanceof GroupShapeView || view instanceof SymbolView;
            }) as ArtboradView[];
            const pathviews: PathShapeView[] = selected.filter(view => view instanceof PathShapeView) as PathShapeView[];

            if (container.length) {

            } else if (pathviews.length) { // 将图片设为pathshape的填充
                // todo 检查一下黑白格的问题
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
                new ImageLoader(context).upload(selected.map(shape => ({ shape, upload: [{ buff, ref }] })));
            } else this.insertImage(allMedia);
        } else if (SVG) {
            return this.insertImage(SVG);
        } else if (source) {

        } else if (paras) {

        } else if (plain) {

        }
    }

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
                const asset: UploadAssets = { buff, ref };
                assets.push(asset);
                source.push(creator.newImageFillShape(name, frame, manager, { width, height }, ref));
            }
            const editor = context.editor4Page(context.selection.selectedPage!);
            const result = editor.replace(context.data, source, shapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            new ImageLoader(context).upload(result.map(shape => ({ shape, upload: assets }))).then(result => {
                if (!result) message("danger", context.workspace.t('system.uploadMediaFail'));
            });
        } else if (source) {
            // 检查有没有图层内容
            const context = this.context;
            const page = context.selection.selectedPage!;
            const shapes = import_shape_from_clipboard(context.data, page.data, source.shapes, source.media);
            if (!shapes.length) throw new Error('invalid source');
            // 进行替换
            const editor = context.editor4Page(page);
            const result = editor.replace(context.data, shapes, context.selection.selectedShapes.map((s) => adapt2Shape(s)));
            if (!result || !result.length) return;
            const keys = Object.keys(source.media);
            const assets: UploadAssets[] = [];
            for (const ref of keys) {
                const buff = source.media[ref]?.buff;
                buff && assets.push({ ref, buff });
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
            const shape = creator.newTextShape(name);
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
                mediaResourceMgr.forEach((v, k) => upload.push({ ref: k, buff: v.buff }));
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
}