/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { ExportFormatNameingScheme, ExportFormat, ShapeType, ShapeView, ColVector3D, ArtboardView, GroupShapeView } from '@kcdesign/data';
import { getGroupChildBounds, getShadowMax, parentIsArtboard } from '@/utils/cutout';
import JSZip from 'jszip';
import { XYsBounding } from './common';

export async function downloadImages(imageUrls: any[]) {
    const zip = new JSZip();
    // 异步加载图片并添加到ZIP文件中
    const addImagesToZip = async (folder: any) => {
        const currentFolder = zip.folder('');
        // 处理当前文件夹中的图片
        if (folder.image) {
            const imagePromises = folder.image.map(async (url: string) => {
                const response = await fetch(url);
                const data = await response.blob();
                currentFolder && currentFolder.file(`${folder.fileName}.${folder.fileFormat}`, data, { base64: true });
            });
            await Promise.all(imagePromises);
        }
    };

    await Promise.all(imageUrls.map(folder => addImagesToZip(folder)));
    // 生成ZIP文件
    const content = await zip.generateAsync({ type: 'blob' });
    // 创建下载链接并触发下载
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'download.zip';
    link.click();
}

export const getExportFillUrl = (shapes: ShapeView[], urls: Map<string, string>) => {
    let fileUrls = [];
    for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        const options = shape.exportOptions;
        if (options && options.exportFormats.length) {
            for (let f = 0; f < options.exportFormats.length; f++) {
                const format = options.exportFormats[f];
                const id = shape.id + format.id;
                const url = urls.get(id);
                let fileName;
                if (format.namingScheme === ExportFormatNameingScheme.Prefix) {
                    fileName = format.name + shape.name;
                } else {
                    fileName = shape.name + format.name;
                }
                const fileInfo = {
                    name: '',
                    fileName: fileName,
                    image: [url],
                    fileFormat: format.fileFormat,
                }
                fileUrls.push(fileInfo);
            }
        }
    }
    const fileNameCount: any = {};
    fileUrls.forEach(item => {
        if (fileNameCount[item.fileName + item.fileFormat] === undefined) {
            fileNameCount[item.fileName + item.fileFormat] = 1;
        } else {
            fileNameCount[item.fileName + item.fileFormat]++;
            item.fileName += '-' + fileNameCount[item.fileName + item.fileFormat];
        }
    });
    return fileUrls;
}

export const exportSingleImage = (imageUrl: string, type: string, name: string) => {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = imageUrl;
    a.download = `${name}.${type}`;
    a.click();
    document.body.removeChild(a);
}

export const getPngImageData = async (svg: SVGSVGElement, trim: boolean, id: string, format: ExportFormat, pngImageUrls: Map<string, string>, shape: ShapeView): Promise<void> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        const pcloneSvg = svg.cloneNode(true) as SVGSVGElement;
        document.body.appendChild(pcloneSvg);
        if (shape.type !== ShapeType.Cutout && shape.rotation !== 0) {
            const el = pcloneSvg.children[0] as SVGSVGElement;
            if (el) {
                const { width, height } = pcloneSvg.viewBox.baseVal
                const { left, top, right, bottom } = getShadowMax(shape);
                if (isNoTransform(shape)) {
                    pcloneSvg.setAttribute("width", `${width * format.scale}`);
                    pcloneSvg.setAttribute("height", `${height * format.scale}`);
                    pcloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
                } else {
                    const matrix = el.style.transform;
                    const m = shape.matrix2Root();
                    const size = shape.outerFrame;
                    m.trans(-m.m02, -m.m12);
                    const box = XYsBounding(m.transform([
                        ColVector3D.FromXY(size.x - left, size.y - top),
                        ColVector3D.FromXY(size.width + right, size.y - top),
                        ColVector3D.FromXY(size.width + right, size.height + bottom),
                        ColVector3D.FromXY(size.x - left, size.height + bottom),
                    ]));
                    // 解析 matrix 值
                    let values = matrix.match(/matrix.*\((.+)\)/)![1].split(', ');
                    // 转换为数字并修改值（这里假设你要修改缩放值）
                    let a = Number(values[0]); // 缩放X
                    let b = Number(values[1]); // 倾斜Y
                    let c = Number(values[2]); // 倾斜X
                    let d = Number(values[3]); // 缩放Y
                    const newMatrix = `matrix(${a}, ${b}, ${c}, ${d}, ${-box.left}, ${-box.top})`;
                    const newWidth = box.right - box.left;
                    const newHeight = box.bottom - box.top;
                    pcloneSvg.setAttribute("width", `${newWidth * format.scale}`);
                    pcloneSvg.setAttribute("height", `${newHeight * format.scale}`);
                    pcloneSvg.setAttribute("viewBox", `0 0 ${newWidth} ${newHeight}`);
                    el.style.transform = newMatrix;
                }
            }
            const { width, height } = pcloneSvg.getBoundingClientRect();
            canvas.width = width;
            canvas.height = height;
        } else {
            const { width, height } = pcloneSvg.viewBox.baseVal
            canvas.width = width * format.scale;
            canvas.height = height * format.scale;
        }
        const svgString = new XMLSerializer().serializeToString(pcloneSvg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        let imageUrl;
        img.onload = () => {
            context && context.drawImage(img, 0, 0);
            imageUrl = canvas.toDataURL(`image/${format.fileFormat}`);
            if (context && trim) {
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let top = canvas.height, bottom = 0, left = canvas.width, right = 0;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = data[(y * canvas.width + x) * 4 + 3]; // 获取像素的透明度值
                        if (alpha > 0) {
                            top = Math.min(top, y);
                            bottom = Math.max(bottom, y);
                            left = Math.min(left, x);
                            right = Math.max(right, x);
                        }
                    }
                }
                const width = (right - left) + 2;
                const height = (bottom - top) + 2;
                // 创建一个新Canvas元素，用于存储裁剪后的图像
                const newCanvas = document.createElement("canvas");
                const outputCtx = newCanvas.getContext("2d");
                newCanvas.width = width;
                newCanvas.height = height;
                // 在新Canvas上绘制裁剪后的图像
                outputCtx && outputCtx.drawImage(img, left, top, width, height, 0, 0, width, height);
                imageUrl = newCanvas.toDataURL(`image/${format.fileFormat}`);
            }
            pngImageUrls.set(id, imageUrl);
            document.body.removeChild(pcloneSvg);
            resolve();
        };
    });
}
const isNoTransform = (shape: ShapeView) => {
    const t = shape.transform;
    return t.m00 == 1 && t.m01 === 0 && t.m10 === 0 && t.m11 === 1;
}
export const getSvgImageData = async (svg: SVGSVGElement, trim: boolean, id: string, format: ExportFormat, svgImageUrls: Map<string, string>, shape: ShapeView): Promise<void> => {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const cloneSvg = svg.cloneNode(true) as SVGSVGElement;
        document.body.appendChild(cloneSvg);
        if (shape.type !== ShapeType.Cutout && shape.rotation !== 0) {
            const el = cloneSvg.children[0] as SVGSVGElement;
            let rotate = shape.rotation || 0;
            const { width, height } = cloneSvg.viewBox.baseVal
            if (el) {
                const { left, top, right, bottom } = getShadowMax(shape);
                if (isNoTransform(shape)) {
                    cloneSvg.setAttribute("width", `${width * format.scale}`);
                    cloneSvg.setAttribute("height", `${height * format.scale}`);
                    cloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
                } else {
                    const matrix = el.style.transform;
                    const m = shape.matrix2Root();
                    const size = shape.frame;
                    m.trans(-m.m02, -m.m12);
                    const box = XYsBounding(m.transform([
                        ColVector3D.FromXY(size.x - left, size.y - top),
                        ColVector3D.FromXY(size.width + right, size.y - top),
                        ColVector3D.FromXY(size.width + right, size.height + bottom),
                        ColVector3D.FromXY(size.x - left, size.height + bottom),
                    ]));
                    // 解析 matrix 值
                    let values = matrix.match(/matrix.*\((.+)\)/)![1].split(', ');
                    // 转换为数字并修改值（这里假设你要修改缩放值）
                    let a = Number(values[0]); // 缩放X
                    let b = Number(values[1]); // 倾斜Y
                    let c = Number(values[2]); // 倾斜X
                    let d = Number(values[3]); // 缩放Y
                    const newMatrix = `matrix(${a}, ${b}, ${c}, ${d}, ${-box.left}, ${-box.top})`;
                    const newWidth = box.right - box.left;
                    const newHeight = box.bottom - box.top;
                    cloneSvg.setAttribute("width", `${newWidth * format.scale}`);
                    cloneSvg.setAttribute("height", `${newHeight * format.scale}`);
                    cloneSvg.setAttribute("viewBox", `0 0 ${newWidth} ${newHeight}`);
                    el.style.transform = newMatrix;
                }
            }
            canvas.width = width;
            canvas.height = height;
            if (ctx) {
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.rotate((rotate * Math.PI) / 180);
                ctx.translate(-width / 2, -height / 2);
            }
        } else {
            const { width, height } = cloneSvg.viewBox.baseVal
            canvas.width = width;
            canvas.height = height;
        }
        const { x, y, width, height } = cloneSvg.viewBox.baseVal;
        if (x !== 0 && y !== 0) {
            cloneSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
            const children: HTMLElement[] = cloneSvg.children as any;
            Array.from(children).forEach((child) => {
                const styleTransform = child.style.transform;
                if (styleTransform && styleTransform.startsWith('matrix')) {
                    const matrixValues = styleTransform.replace('matrix(', '').replace(')', '').split(',').map(parseFloat);
                    matrixValues[4] -= x;
                    matrixValues[5] -= y;
                    child.style.transform = `matrix(${matrixValues.join(',')})`;
                }
            });
        }
        let imageUrl = '';
        const img = new Image();

        const svgString = new XMLSerializer().serializeToString(cloneSvg);
        const imgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
        imageUrl = imgUrl;
        img.src = imgUrl;
        img.onload = () => {
            if (ctx && trim) {
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let top = canvas.height, bottom = 0, left = canvas.width, right = 0;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = data[(y * canvas.width + x) * 4 + 3]; // 获取像素的透明度值
                        if (alpha > 0) {
                            top = Math.min(top, y);
                            bottom = Math.max(bottom, y);
                            left = Math.min(left, x);
                            right = Math.max(right, x);
                        }
                    }
                }
                const { x, y } = cloneSvg.viewBox.baseVal
                const w = (right - left);
                const h = (bottom - top);

                cloneSvg.setAttribute("width", `${w}`);
                cloneSvg.setAttribute("height", `${h}`);
                cloneSvg.setAttribute("viewBox", `0 0 ${w / format.scale} ${h / format.scale}`);

                // 获取所有子元素
                const children: HTMLElement[] = cloneSvg.children as any;
                Array.from(children).forEach((child) => {
                    const styleTransform = child.style.transform;
                    if (styleTransform && styleTransform.startsWith('matrix')) {
                        const matrixValues = styleTransform.replace('matrix(', '').replace(')', '').split(',').map(parseFloat);
                        matrixValues[4] -= x + left / format.scale;
                        matrixValues[5] -= y + top / format.scale;
                        const newMatrix = `matrix(${matrixValues.join(',')})`;
                        child.style.transform = newMatrix;
                    }
                });
                // 创建一个新Canvas元素，用于存储裁剪后的图像
                const newSvgString = new XMLSerializer().serializeToString(cloneSvg);
                const newImgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(newSvgString)));
                imageUrl = newImgUrl;
            }
            svgImageUrls.set(id, imageUrl);
            document.body.removeChild(cloneSvg);
            resolve();
        }
    })
}

export const getPosition = (shape: ShapeView) => {
    const p_artboard = parentIsArtboard(shape);
    if (shape.type === ShapeType.Cutout) {
        if (p_artboard) {
            const __frame = shape.relativeFrame;
            const _f = shape.parent!.transform.transform(ColVector3D.FromXY(__frame.x, __frame.y));
            return { x: _f.x, y: _f.y, width: shape.frame.width, height: shape.frame.height }
        } else {
            const p = shape.boundingBox()
            return { ...p }
        }
    } else {
        const { left, top, right, bottom } = getShadowMax(shape);
        let { x, y, width: _w, height: _h } = shape.relativeOuterFrame;
        if (shape instanceof GroupShapeView) {
            const f = shape.relativeVisibleFrame;
            if (!(shape as ArtboardView).frameMaskDisabled) {
                x = f.x; y = f.y; _w = f.width; _h = f.height;
            }
        }
        return { x: x - left, y: y - top, width: _w + left + right, height: _h + top + bottom }
    }
}
