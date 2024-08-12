import { Context } from "@/context";
import {
    ArtboradView,
    ColVector3D, ImagePack,
    makeShapeTransform1By2,
    makeShapeTransform2By1, ShapeView,
    Transform,
    TransformRaw
} from "@kcdesign/data";
import { WorkSpace } from "@/context/workspace";
import { get_envs_from_selection } from "@/utils/clipboard";
import { message } from "@/utils/message";

/**
 *  · ImageTool
 *  · 图片拖入
 *  · 图片通过SVG内嵌的方式进入
 *  · 图片直接通过粘贴事件进入
 *  · 图片内嵌在图层内并通过粘贴事件进入
 */
/**
 * @description 图片加载器
 */
export class ImageLoader {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    packFile(file: File) {
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
                    if (base64) resolve(Object.assign(data as any, { base64, name: file.name }));
                    else reject('no base64');
                }
            })
        }).catch(err => {
            console.error(file.name + ': ', err);
        });
    }

    packAll(files: FileList) {
        const task = [];
        const packFile = this.packFile;
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

    async insetImageByPackages(files: FileList) {
        const packages = await this.packAll(files) as ImagePack[];
        if (!packages?.length) return false;
        const transforms = (() => {
            const transforms: TransformRaw[] = [];
            let offset = 0;
            for (let i = 0; i < packages.length; i++) {
                if (i > 0) {
                    const p = packages[i - 1];
                    offset += 20;
                    offset += p.size.width;
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
                const size = p.size;
                width += size.width;
                height += size.height;
            }
            const len = packages.length;
            width += len * 20;
            height += len * 20;

            return { width, height };
        })();
        const context = this.context;
        const selection = context.selection;
        // const __envs = get_envs_from_selection(context);
        // if (__envs.length) {
        //     // 如果存在指定容器选区，则进入对应的选区并且居中
        //
        // } else {
        //     // 否则让所有图片于屏幕居中，如果遇见合适的容器，需要进去，如果是在页面下，且页面无法承接区域面积，则调整缩放比例
        // }

        // 先让所有图层到页面下去
        fixScale();
        const page = selection.selectedPage!;
        const getInPage = page.transform2FromRoot.getInverse();
        for (let i = 0; i < transforms.length; i++) {
            const t = makeShapeTransform2By1(transforms[i]);
            t.addTransform(getInPage);
            transforms[i] = makeShapeTransform1By2(t);
        }

        const __packs = packages.map((v, i) => ({ pack: v, transform: transforms[i] }));
        const editor = context.editor4Page(page);
        return editor.insertImagesToPage(__packs);

        function getEnvs(area: { x: number, y: number, width: number, height: number }) {
            const selection = context.selection;
            let envs: ShapeView[] = [selection.selectedPage!];
            if (selection.selectedShapes.length) {
                const __envs = get_envs_from_selection(context);
                if (__envs.length) envs = __envs;
            } else {
                const { x, y, width, height } = area;
                const layers = selection.getLayers({ x, y });
                if (layers.length) {
                    for (let i = layers.length - 1; i > -1; i--) {
                        const layer = layers[i];
                        if (!(layer instanceof ArtboradView) || layer.isVirtualShape) continue;
                        if (layer.size.width > width && layer.size.height > height) {
                            envs = [layer];
                            break;
                        }
                    }
                }
            }
            return envs;
        }

        function fixScale() {
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
    }
}