import { CtrlElementType } from '@/context/workspace';
import scaleBase64 from "@/assets/cursor/scale.png";
import rotateBase64 from '@/assets/cursor/rotate.png';
import { XY } from '@/context/selection';

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
  const slope1 = Math.abs((line1[3] - line1[1]) / (line1[2] - line1[0])) === Infinity ? 0 : (line1[3] - line1[1]) / (line1[2] - line1[0]);
  const slope2 = Math.abs((line2[3] - line2[1]) / (line2[2] - line2[0])) === Infinity ? 0 : (line2[3] - line2[1]) / (line2[2] - line2[0]);
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
    deg = 0;
  } else if (ct === CtrlElementType.RectRBR) {
    img = rotateBase64;
    deg = 180;
  } else if (ct === CtrlElementType.RectRTR) {
    img = rotateBase64;
    deg = 90;
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

// 根据四个点生成一个矩形
// p1 p2
// p4 p3
export function createRect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const left = Math.min(x1, x2, x3, x4);
  const top = Math.min(y1, y2, y3, y4);
  const right = Math.max(x1, x2, x3, x4);
  const bottom = Math.max(y1, y2, y3, y4);
  const corner = getAngle([x3, y3, x1, y1], [x3, y3, x4, y4]);
  const diagonal1 = Math.hypot(x1 - x3, y1 - y3);
  const width = Math.abs(diagonal1 * Math.cos(corner * (Math.PI / 180)));
  const height = Math.abs(diagonal1 * Math.sin(corner * (Math.PI / 180)));
  const angle = getHorizontalAngle({ x: x1, y: y1 }, { x: x2, y: y2 });
  const transX = ((right - left) - width) / 2;
  const transY = ((bottom - top) - height) / 2;

  return "position: absolute; " +
    `left: ${left}px; ` +
    `top: ${top}px;` +
    `width: ${width}px;` +
    `height: ${height}px;` +
    "border: 2px solid orange; " +
    `transform: translate(${transX}px, ${transY}px) rotate(${angle}deg);`;
}
// 根据矩形的四个点获取其中心轴
// p1 p2
// p4 p3
export function getAxle(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number): XY {
  const left = Math.min(x1, x2, x3, x4);
  const top = Math.min(y1, y2, y3, y4);
  const right = Math.max(x1, x2, x3, x4);
  const bottom = Math.max(y1, y2, y3, y4);
  return { x: (left + right) / 2, y: (top + bottom) / 2 };
}
// 根据矩形的四个点，获取宽高
// p1 p2
// p4 p3
export function getRectWH(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  const corner = getAngle([x3, y3, x1, y1], [x3, y3, x4, y4]);
  const diagonal1 = Math.hypot(x1 - x3, y1 - y3);
  const width = Math.abs(diagonal1 * Math.cos(corner * (Math.PI / 180)));
  const height = Math.abs(diagonal1 * Math.sin(corner * (Math.PI / 180)));
  return { width, height }
}

export function getHorizontalAngle(A: { x: number, y: number }, B: { x: number, y: number }) {
  const deltaX = B.x - A.x;
  const deltaY = B.y - A.y;
  const angleInDegrees = Math.atan2(deltaY, deltaX) * 180 / Math.PI;
  const angle = (angleInDegrees + 360) % 360; // 将负角度转换为正角度
  return angle;
}