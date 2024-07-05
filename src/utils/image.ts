import { ExportFormatNameingScheme, Shape, ExportFormat, ShapeType, GroupShapeView, ShapeView } from '@kcdesign/data';
import { getShadowMax, getShapeBorderMax, getGroupChildBounds } from '@/utils/cutout';
import JSZip from 'jszip';
export function get_frame(file: any) {
  const frame: { width: number, height: number } = { width: 100, height: 100 };
  const img = new Image();
  img.onload = function () {
    frame.width = img.width;
    frame.height = img.height;
  }
  img.src = URL.createObjectURL(file);
  return frame;
}

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
      let rotate = shape.rotation || 0;
      if (el) {
        const { width, height } = pcloneSvg.viewBox.baseVal
        const { left, top, right, bottom } = getShadowMax(shape);
        let g_x = 0;
        let g_y = 0;
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);
        if (shape.type === ShapeType.Group) {
          const { x, y, width, height } = getGroupChildBounds(shape);
          g_x = shape.frame.x - x;
          g_y = shape.frame.y - y;
        }
        const x = left + l_max + g_x;
        const y = top + t_max + g_y;
        el.style.transform = `rotate(0deg)`;
        let rotateY = 0;
        let rotateX = 0;
        // todo flip
        // shape.isFlippedHorizontal ? rotateY = 180 : rotateY = 0;
        // shape.isFlippedVertical ? rotateX = 180 : rotateX = 0;
        rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
        const radian = rotate * Math.PI / 180;
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);
        const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
        const newHeight = Math.abs(width * sin) + Math.abs(height * cos);
        pcloneSvg.setAttribute("width", `${newWidth * format.scale}`);
        pcloneSvg.setAttribute("height", `${newHeight * format.scale}`);
        pcloneSvg.setAttribute("viewBox", `0 0 ${newWidth} ${newHeight}`);
        el.style.transform = `translate(${newWidth / 2}px, ${newHeight / 2}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotate(${rotate}deg) translate(${-width / 2 + x}px, ${-height / 2 + y}px)`;
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
      const dataURL = canvas.toDataURL(`image/${format.fileFormat}`);
      imageUrl = dataURL;
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
        const newDataURL = newCanvas.toDataURL(`image/${format.fileFormat}`);
        imageUrl = newDataURL;
      }
      pngImageUrls.set(id, imageUrl);
      document.body.removeChild(pcloneSvg);
      resolve();
    };
  });
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
      if (el) {
        const { width, height } = cloneSvg.viewBox.baseVal
        const { left, top, right, bottom } = getShadowMax(shape);
        let g_x = 0;
        let g_y = 0;
        const { l_max, t_max, r_max, b_max } = getShapeBorderMax(shape);
        if (shape.type === ShapeType.Group) {
          const { x, y, width, height } = getGroupChildBounds(shape);
          g_x = shape.frame.x - x;
          g_y = shape.frame.y - y;
        }
        const x = left + l_max + g_x;
        const y = top + t_max + g_y;
        el.style.transform = `rotate(0deg)`;
        let rotateY = 0;
        let rotateX = 0;
        // todo flip
        // shape.isFlippedHorizontal ? rotateY = 180 : rotateY = 0;
        // shape.isFlippedVertical ? rotateX = 180 : rotateX = 0;
        rotate = (rotate < 0 ? rotate + 360 : rotate) % 360;
        const radian = rotate * Math.PI / 180;
        const sin = Math.sin(radian);
        const cos = Math.cos(radian);
        const newWidth = Math.abs(width * cos) + Math.abs(height * sin);
        const newHeight = Math.abs(width * sin) + Math.abs(height * cos);
        cloneSvg.setAttribute("width", `${newWidth * format.scale}`);
        cloneSvg.setAttribute("height", `${newHeight * format.scale}`);
        cloneSvg.setAttribute("viewBox", `0 0 ${newWidth} ${newHeight}`);
        el.style.transform = `translate(${newWidth / 2}px, ${newHeight / 2}px) rotateY(${rotateY}deg) rotateX(${rotateX}deg) rotate(${rotate}deg) translate(${-width / 2 + x}px, ${-height / 2 + y}px)`;
      }
      const { width, height } = cloneSvg.getBoundingClientRect();
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
        cloneSvg.setAttribute("viewBox", `${x + left / format.scale} ${y + top / format.scale} ${w / format.scale} ${h / format.scale}`);
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
