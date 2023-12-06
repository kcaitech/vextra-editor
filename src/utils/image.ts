import { ExportFormatNameingScheme, Shape, ExportFormat } from '@kcdesign/data';
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

export const getExportFillUrl = (shapes: Shape[], urls: Map<string, string>) => {
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
    if (fileNameCount[item.fileName] === undefined) {
      fileNameCount[item.fileName] = 1;
    } else {
      fileNameCount[item.fileName]++;
      item.fileName += '-' + fileNameCount[item.fileName];
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

export const getPngImageData = (svg: SVGSVGElement, trim: boolean, id: string, format: ExportFormat, pngImageUrls: Map<string, string>) => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = svg.clientWidth;
  canvas.height = svg.clientHeight;
  const svgString = new XMLSerializer().serializeToString(svg);
  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  let imageUrl;
  img.onload = () => {
    context && context.drawImage(img, 0, 0);
    const dataURL = canvas.toDataURL(`image/${format.fileFormat}`);
    imageUrl = dataURL;
    if (trim && context) {
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

      const width = right - left;
      const height = bottom - top;
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
  };
}

export const getSvgImageData = (svg: SVGSVGElement, trim: boolean, id: string, format: ExportFormat, svgImageUrls: Map<string, string>) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = svg.clientWidth;
  canvas.height = svg.clientHeight;
  let imageUrl = '';
  const img = new Image();
  const svgString = new XMLSerializer().serializeToString(svg);
  const imgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  imageUrl = imgUrl;
  img.src = imgUrl;
  img.onload = () => {
    if (trim && ctx) {
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
      const { x, y } = svg.viewBox.baseVal
      const width = right - left;
      const height = bottom - top;
      svg.setAttribute("width", `${right - left}`);
      svg.setAttribute("height", `${bottom - top}`);
      svg.setAttribute("viewBox", `${x + left} ${y + top} ${width} ${height}`);
      // 创建一个新Canvas元素，用于存储裁剪后的图像
      const newSvgString = new XMLSerializer().serializeToString(svg);
      const newImgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(newSvgString)));
      imageUrl = newImgUrl;
    }
    svgImageUrls.set(id, imageUrl);
  }
}