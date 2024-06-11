
// 吸管🍉，专吸颜色
import { pipette } from '@/utils/cursor';
import domtoimage from './dom-to-image.js';
import { drawTooltip, getCanvas, getCanvasRectColor, loadImage, rbgaObjToHex, renderColorInfo } from './utils';
export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type IColors = string[][];

export interface IRgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Props {
  container: any;
  listener?: Record<string, (e: any) => void>;
  scale?: number;
  useMagnifier?: boolean;
}
export class Eyedropper {
  container: any = {};
  listener: Record<string, (e: any) => void> = {};
  rect: Rect = { x: 0, y: 0, width: 0, height: 0 };
  canvas: any = {};
  ctx: any;
  scale = 1; // 决定取色时视图的分辨率
  magnifier: any = null;
  colorContainer: any = null;
  colors: string[][] = [];
  tooltipVisible = true;
  useMagnifier = false;
  constructor(props: Props) {
    try {
      const { container, listener, scale = 1, useMagnifier = false } = props;
      this.container = container || document.body;
      this.listener = listener || {};
      this.rect = this.container.getBoundingClientRect();
      this.scale = Math.min(4, scale);
      this.useMagnifier = useMagnifier;
      const noscript = document.body.querySelector('noscript');
      noscript?.parentNode?.removeChild(noscript);
      this.initCanvas();
    } catch (e) {
      console.log(e);
      this.destroy();
    }
  }
  // 初始化canvas
  initCanvas() {
    const { rect, scale } = this;
    const { x, y, width, height } = rect;
    const { canvas, ctx } = getCanvas({
      width: rect.width,
      height: rect.height,
      scale,
      attrs: {
        class: 'color-pipette-canvas-container',
        style: `
           position: fixed;
           left: ${x}px;
           top: ${y}px;
           z-index: 10000;
           cursor: -webkit-image-set(url(${pipette}) 1.5x) ${4} ${28}, auto;
           width: ${width}px;
           height: ${height}px;
         `,
      },
    });
    this.canvas = canvas;
    this.ctx = ctx;
  }
  // 吸取之前先更新root
  updateRoot(root: Rect) {
    this.rect = root;
  }
  // 开吸
  async start(tip: string) {
    try {
      await this.drawCanvas();
      document.body.appendChild(this.canvas);
      const tooltip = drawTooltip(tip);
      document.body.appendChild(tooltip);
      setTimeout(() => tooltip?.parentNode?.removeChild(tooltip), 2000);
      this.canvas.addEventListener('mousemove', this.mousemove);
      this.canvas.addEventListener('mousedown', this.mousedown);
      document.addEventListener('keydown', this.keydown);
    } catch (err) {
      console.log(err);
      this.destroy();
    }
  }
  // 吸好了，销毁dom，清除事件监听
  destroy() {
    this.canvas.removeEventListener('mousemove', this.mousemove);
    this.canvas.removeEventListener('mousedown', this.mousedown);
    document.removeEventListener('keydown', this.keydown);
    this.canvas?.parentNode?.removeChild(this.canvas);
    this.colorContainer?.parentNode?.removeChild(this.colorContainer);
    this.colorContainer = null;
  }

  // 将dom节点画到canvas里
  async drawCanvas() {
    const base64 = await domtoimage.toPng(this.container, {}).catch((e: any) => console.log(e));
    if (!base64) {
      throw new Error('invalid base64');
    }
    const img = await loadImage(base64);
    if (!img) {
      throw new Error('invalid img');
    }
    this.ctx.drawImage(img, 0, 0, this.rect.width, this.rect.height);
  }

  // 检查光标环境
  mousemove = (e: any) => {
    const { color, colors } = this.getPointColors(e);
    const { onChange = () => '' } = this.listener;
    const point = { x: e.pageX + 15, y: e.pageY + 15 };
    const colorContainer = renderColorInfo({
      containerDom: this.colorContainer,
      rect: this.rect,
      color,
      colors,
      point,
    });
    if (!this.colorContainer) {
      this.colorContainer = colorContainer;
      document.body.appendChild(colorContainer);
    }
    onChange({ color, colors });
  }

  // 确认目标颜色
  mousedown = (e: any) => {
    const { onOk = () => '' } = this.listener;
    const res = this.getPointColors(e);
    onOk(res);
    this.destroy();
  }

  // 按下Esc退出拾色
  keydown = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
      this.destroy();
    }
  };

  // 鼠标点周围环境获取颜色阵列
  getPointColors(e: any) {
    const { ctx, rect, scale } = this;
    let { pageX: x, pageY: y } = e;
    x -= rect.x;
    y -= rect.y;
    const color = this.getPointColor(x, y);
    const size = 19;
    const half = Math.floor(size / 2);
    const info = { x: x - half, y: y - half, width: size, height: size };
    const colors = getCanvasRectColor(ctx, info, scale);
    return { color, colors };
  }

  // 解析目标颜色
  getPointColor(x: number, y: number) {
    const { scale } = this;
    const { data } = this.ctx.getImageData(x * scale, y * scale, 1, 1);
    const r = data[0];
    const g = data[1];
    const b = data[2];
    const a = data[3] / 255;
    const rgba = { r, g, b, a };
    return rbgaObjToHex(rgba);
  }
}
