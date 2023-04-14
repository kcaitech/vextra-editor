import { CtrlElementType } from '@/context/workspace';
import scaleBase64 from "@/assets/cursor/scale.png";
import rotateBase64 from '@/assets/cursor/rotate.png'
export function genOptions(items: string[][]) {
  return items.map((item: string[], index: number) => {
    return {
      id: index,
      data: {
        value: item[0],
        content: item[1]
      }
    }
  })
}
export function getAngle(line1: [number, number, number, number], line2: [number, number, number, number]): number {
  const slope1 = (line1[3] - line1[1]) / (line1[2] - line1[0]);
  const slope2 = (line2[3] - line2[1]) / (line2[2] - line2[0]);

  const angleRad = Math.atan((slope2 - slope1) / (1 + slope1 * slope2));

  return angleRad * (180 / Math.PI);
}
export function rotateBase64Image(base64Image: any, angle: number) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = function () {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const radians = angle * Math.PI / 180;
      const cos = Math.abs(Math.cos(radians));
      const sin = Math.abs(Math.sin(radians));
      const width = image.width * cos + image.height * sin;
      const height = image.width * sin + image.height * cos;

      canvas.width = width;
      canvas.height = height;
      context?.translate(width / 2, height / 2);
      context?.rotate(radians);
      context?.drawImage(image, -image.width / 2, -image.height / 2);

      const rotatedBase64Image = canvas.toDataURL('image/png');
      resolve(rotatedBase64Image);
    };
    image.onerror = function () {
      reject('Invalid base64 image');
    }
    image.src = base64Image;
  });
}

export async function cursorHandle(ct: CtrlElementType, rotate: number) {
  let cursor: string = 'auto';
  let img: any;
  let deg: number = 0;
  const hot: { x: number, y: number } = { x: 20, y: 20 };
  if ([CtrlElementType.RectRB, CtrlElementType.RectLT].includes(ct)) {
    img = scaleBase64;
    deg = 45;
  } else if ([CtrlElementType.RectRT, CtrlElementType.RectLB].includes(ct)) {
    img = scaleBase64;
    deg = 135;
    hot.x = 32;
    hot.y = 20;
  } else if (ct === CtrlElementType.RectLBR) {
    img = rotateBase64;
    deg = 270;
    hot.x = 18;
    hot.y = 12;
  } else if (ct === CtrlElementType.RectLTR) {
    img = rotateBase64;
    deg = 135;
  } else if (ct === CtrlElementType.RectRBR) {
    img = rotateBase64;
    deg = 135;
  } else if (ct === CtrlElementType.RectRTR) {
    img = rotateBase64;
    deg = 135;
  }
  if (!img) return cursor;
  await rotateBase64Image(img, deg + rotate).then(cr => {
    if (cr) {      
      cursor = getString(cr, 1.5, hot);
    }
  }, () => { })  
  return cursor

  function getString(url: any, times: number, hotPosition: { x: number, y: number }) {
    const { x, y } = hotPosition;
    return `-webkit-image-set(url(${url})${times}x) ${x} ${y}, auto`
  }
} 