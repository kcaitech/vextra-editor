import { Context } from "@/context";
import { TransformRaw } from "@kcdesign/data";

/**
 *  · ImageTool
 *  · 图片拖入
 *  · 图片通过SVG内嵌的方式进入
 *  · 图片直接通过粘贴事件进入
 *  · 图片内嵌在图层内并通过粘贴事件进入
 */
interface ImagePack {
    size: {
        width: number;
        height: number;
    },
    buff: Uint8Array;
    base64: string;
}

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
                    if (base64) resolve(Object.assign(data as any, { base64 }));
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
        for (const file of files) {
            task.push(packFile(file));
        }
        return Promise.all(task);
    }

    async insetImageByPackages(files: FileList) {
        const packages = await this.packAll(files) as ImagePack[];
        if (!packages?.length) return false;

        const transforms: TransformRaw[] = [];
        function presetTransform(packages: ImagePack[]) {
            let offset = 0;

            for (let i = 0;  i < packages.length; i++) {

                if (i > 0) {
                    const p = packages[i - 1];
                    offset += 20;
                    offset += p.size.width;
                }

                const __trans = new TransformRaw();
                __trans.translateX = offset;
                transforms.push(__trans)
            }
        }
        function getAreaFromSizes(packages: ImagePack[]) {
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
        }
        function fixScale() {

        }
    }
}