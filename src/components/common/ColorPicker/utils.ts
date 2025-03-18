/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { GradientCatch } from "@/components/common/ColorPicker/Editor/gradientlineareditor";

import {
    Color,
    Fill,
    ShapeType,
    ShapeView,
    TextShapeView,
    Gradient,
    Stop,
    GradientType,
    FillType,
    GroupShapeView,
    TableView,
    importGradient
} from '@kcdesign/data';
import type { IColors, Rect, IRgba } from './eyedropper';
import { Context } from '@/context';
import { getHorizontalAngle } from '@/utils/common';

export interface HSB {
    h: number
    s: number
    b: number
}

export interface HSL {
    h: number
    s: number
    l: number
}

export function toRGBA(options: {
    red: number,
    green: number,
    blue: number,
    alpha: number
}): string {
    return "rgba(" + options.red + "," + options.green + "," + options.blue + "," + options.alpha + ")";
}

export type Model = 'RGB' | 'HSL' | 'HSB' | 'Hex';

/**
 * 加载base64图片
 * @param base64
 * @returns
 */
export const loadImage = (base64: string) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
    });
};

// 十进制转化为16进制
export function hex(n: number) {
    return `0${n.toString(16)}`.slice(-2);
}

/**
 * rbga对象转化为16进制颜色字符串
 * @param rgba
 * @returns
 */
export const rbgaObjToHex = (rgba: IRgba) => {
    let {r, g, b} = rgba;
    const {a} = rgba;
    r = Math.floor(r * a);
    g = Math.floor(g * a);
    b = Math.floor(b * a);
    return `#${hex(r)}${hex(g)}${hex(b)}`;
};

// 显示颜色信息，包括放大镜和颜色值
export const renderColorInfo = (params: any) => {
    const {containerDom, color, colors, point, rect} = params;
    let container = containerDom;
    const pos = point;
    const n = 7;
    const count = colors[0].length;
    const size = count * (n + 0) + 2;
    if (!container) {
        const magnifier: any = document.createElement('div');
        container = magnifier;
    }
    if (pos.x + size + 15 > (rect.x + rect.width)) {
        pos.x -= size + 15;
    }
    if (pos.y + size + 40 > (rect.y + rect.height)) {
        pos.y -= size + 40;
    }
    container.style = `
    position: fixed;
    left: ${pos.x + 5}px;
    top: ${pos.y}px;
    z-index: 10001;
    pointer-events: none;
  `;
    container.innerHTML = '';
    const pipette = drawPipette(colors, n);
    const colorBlock = drawColorBlock(color);
    const padding: any = document.createElement('div');
    padding.style = 'height: 3px;';
    container.appendChild(pipette);
    container.appendChild(padding);
    container.appendChild(colorBlock);
    return container;
}

// 绘制放大镜
export function drawPipette(colors: IColors, size = 8) {
    const scale = 2;
    const canvasContainer: any = document.createElement('div');
    const canvasContent: any = document.createElement('div');
    const pipetteCanvas: any = drawPipetteCanvas(colors, size);
    canvasContainer.style = `position: relative;`;
    canvasContent.style = `
    position: absolute;
    top: 0;
    left: 0;
    width: ${pipetteCanvas.width / scale}px;
    height: ${pipetteCanvas.height / scale}px;
    border: 1.5px solid #2c2c2c;
    box-sizing: border-box; 
    border-radius: 50%;`;
    canvasContainer.appendChild(pipetteCanvas);
    canvasContainer.appendChild(canvasContent);
    return canvasContainer;
}

// 颜色方块和颜色值显示
export function drawColorBlock(color: string) {
    const colorBlock: any = document.createElement('div');
    colorBlock.style = `
    display: flex;
    align-items: center;
    justify-content: space-around;
    background-color: rgba(0,0,0,0.4);
    padding: 2px 4px;
    border-radius: 3px;
    width: 64%;
    margin: 0 auto;
  `;
    colorBlock.innerHTML = `
    <div style="
      width: 18px;
      height: 18px;
      background-color: ${color};
      border-radius: 3px;
      border: 1px solid #eee;
    "></div>
    <div style="
      width: 50px;
      border-radius: 3px;
      color: #fff;
      text-align: center;
      font-size: 12px;
    ">${color}</div>
  `;
    return colorBlock;
}

// esc退出提示
export function drawTooltip(content: string, tooltipVisible = true) {
    const tooltip: any = document.createElement('div');
    tooltip.id = 'color-pipette-tooltip-container';
    tooltip.innerHTML = content;
    tooltip.style = `
    position: fixed;
    left: 50%;
    top: 100px;
    z-index: 10002;
    transform: translateX(-50%);
    display: ${tooltipVisible ? 'flex' : 'none'};
    align-items: center;
    background-color: rgba(0,0,0,0.4);
    padding: 4px 10px;
    border-radius: 3px;
    color: #fff;
    font-size: 20px;
    pointer-events: none;
  `;
    return tooltip;
}

// 绘制放大镜canvas
export function drawPipetteCanvas(colors: IColors, size: number) {
    const count = colors.length;
    const diameter = size * count;
    const radius = diameter / 2;
    const {canvas, ctx} = getCanvas({
        width: diameter,
        height: diameter,
        scale: 2,
        attrs: {
            style: `border-radius: 50%;`,
        },
    });
    if (!ctx) {
        return;
    }
    // 画像素点
    colors.forEach((row, i) => row.forEach((color, j) => {
        ctx.fillStyle = color;
        ctx.fillRect(j * size, i * size, size, size);
    }));
    // 画水平线
    for (let i = 0; i < count; i += 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 0.6;
        ctx.moveTo(0, i * size);
        ctx.lineTo(diameter, i * size);
        ctx.stroke();
    }
    // 画垂直线
    for (let j = 0; j < count; j += 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.lineWidth = 0.6;
        ctx.moveTo(j * size, 0);
        ctx.lineTo(j * size, diameter);
        ctx.stroke();
    }
    // 画圆形描边
    ctx.beginPath();
    ctx.strokeStyle = '#ddd';
    ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
    ctx.stroke();
    // 画中心像素点
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(radius - size / 2, radius - size / 2, size, size);
    return canvas;
}

// 生成canvas
export function getCanvas({width = 0, height = 0, scale = 1, attrs = {} as Record<string, any>}) {
    const canvas: any = document.createElement('canvas');
    Object.keys(attrs).forEach((key) => {
        const value = attrs[key];
        canvas.setAttribute(key, value);
    });
    canvas.setAttribute('width', `${width * scale}`);
    canvas.setAttribute('height', `${height * scale}`);
    canvas.style = `${attrs.style || ''};width: ${width}px;height: ${height}px;`;
    const ctx = canvas.getContext('2d');
    ctx?.scale(scale, scale);
    return {canvas, ctx};
}

// 获取将canvas输出的数据转化为二位数组
const getImageColor = (data: any[], rect: Rect, scale: number = 1) => {
    const colors: any[][] = [];
    const {width, height} = rect;
    for (let row = 0; row < height; row += 1) {
        if (!colors[row]) {
            colors[row] = [];
        }
        const startIndex = row * width * 4 * scale * scale;
        for (let column = 0; column < width; column += 1) {
            const i = startIndex + column * 4 * scale;
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            const a = data[i + 3] / 255;
            const color = rbgaObjToHex({r, g, b, a});
            colors[row][column] = color;
        }
    }
    return colors;
};

// 获取canvas某一区域的颜色值二位数组
export const getCanvasRectColor = (ctx: any, rect: Rect, scale: number = 1) => {
    const {x, y, width, height} = rect;
    const image = ctx.getImageData(x * scale, y * scale, width * scale, height * scale);
    const {data} = image;
    return getImageColor(data, rect, scale);
}

// store
export const color_recent_storage = 'color_recently';
const split = ':';

export function updateRecently(color: Color) {
    const store = JSON.parse(localStorage.getItem(color_recent_storage) || JSON.stringify([]));
    if (store.length) {
        const item = parseColorForStorage(color);
        const e_idx = store.findIndex((i: string) => i === item);
        if (e_idx > -1) {
            store.splice(e_idx, 1);
            store.unshift(item);
        } else {
            store.unshift(item);
        }
        if (store.length > 10) {
            setLocalStorageForColors(store.slice(0, 10));
        } else {
            setLocalStorageForColors(store);
        }
    } else {
        const c = parseColorForStorage(color);
        store.unshift(c);
        setLocalStorageForColors(store);
    }
    return localStorage.getItem(color_recent_storage);
}

function parseColorForStorage(color: Color): string {
    // if (color instanceof Gradient) return "gradient/" + JSON.stringify(exportGradient(color));
    // else return "color/" + `${color.alpha}${split}${color.red}${split}${color.green}${split}${color.blue}`;
    return `${color.alpha}${split}${color.red}${split}${color.green}${split}${color.blue}`;
}

export function parseColorFormStorage(c: string): Color | Gradient {
    if (c.includes('gradient')) {
        return importGradient(JSON.parse(c.slice('gradient/'.length)));
    } else {
        let _c: any[] = c.split(split);
        _c = _c.map(i => Number(i));
        return new Color(_c[0], Math.round(_c[1]), Math.round(_c[2]), Math.round(_c[3]));
    }
}

function setLocalStorageForColors(si: string[]) {
    localStorage.setItem(color_recent_storage, JSON.stringify(si));
}

// RGB => H
export function RGB2H(color: Color, sub?: number) {
    const {red, green, blue} = color;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0;
    if (max === min) {
        h = sub ? sub : 0;
    } else if (max === red && green >= blue) {
        h = 60 * ((green - blue) / (max - min)) + 0;
    } else if (max === red && green < blue) {
        h = 60 * ((green - blue) / (max - min)) + 360;
    } else if (max === green) {
        h = 60 * ((blue - red) / (max - min)) + 120;
    } else if (max === blue) {
        h = 60 * ((red - green) / (max - min)) + 240;
    }
    return h;
}

export function RGB2H2(red: number, green: number, blue: number) {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0;
    if (max === min) {
        h = 0;
    } else if (max === red && green >= blue) {
        h = 60 * ((green - blue) / (max - min));
    } else if (max === red && green < blue) {
        h = 60 * ((green - blue) / (max - min)) + 360;
    } else if (max === green) {
        h = 60 * ((blue - red) / (max - min)) + 120;
    } else if (max === blue) {
        h = 60 * ((red - green) / (max - min)) + 240;
    }
    return h;
}

// RGB => HSB
export function RGB2HSB(color: Color): HSB {
    const {red, green, blue} = color;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0, s = 0, b = 0;
    if (max === min) {
        h = 0;
    } else if (max === red && green >= blue) {
        h = 60 * ((green - blue) / (max - min)) + 0;
    } else if (max === red && green < blue) {
        h = 60 * ((green - blue) / (max - min)) + 360;
    } else if (max === green) {
        h = 60 * ((blue - red) / (max - min)) + 120;
    } else if (max === blue) {
        h = 60 * ((red - green) / (max - min)) + 240;
    }
    if (max === min && min === 0) {
        s = 0;
    } else {
        s = (max - min) / max;
    }
    b = max / 255;
    return {h: h, s, b};
}

export function RGB2HSB2(red: number, green: number, blue: number): HSB {
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0;
    let s;
    let b;

    if (max === min) {
        h = 0;
    } else if (max === red && green >= blue) {
        h = 60 * ((green - blue) / (max - min));
    } else if (max === red && green < blue) {
        h = 60 * ((green - blue) / (max - min)) + 360;
    } else if (max === green) {
        h = 60 * ((blue - red) / (max - min)) + 120;
    } else if (max === blue) {
        h = 60 * ((red - green) / (max - min)) + 240;
    }

    if (max === min && min === 0) {
        s = 0;
    } else {
        s = (max - min) / max;
    }

    b = max / 255;
    return {h: h / 360, s, b};
}

export function RGB2SB(color: Color): { s: number, b: number } {
    const {red, green, blue} = color;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let s = 0, b = 0;
    if (max === min && min === 0) {
        s = 0;
    } else {
        s = (max - min) / max;
    }
    b = max / 255;
    return {s, b};
}

export function validate(model: Model, field: number, value: number | string): boolean {
    if (typeof value === "string") {
        if (model === "Hex" && field === 0) {
            const _v = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value.toString());
            let _v2: boolean;
            if (_v) {
                let color = value.replace(/^#/, '');
                if (color.length === 3) {
                    color = [color.charAt(0), color.charAt(0), color.charAt(1), color.charAt(1), color.charAt(2), color.charAt(2)].join('');
                }
                let r = parseInt(color.substring(0, 2), 16);
                let g = parseInt(color.substring(2, 4), 16);
                let b = parseInt(color.substring(4, 6), 16);
                _v2 = (r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255);
            } else _v2 = false;
            return _v2 && _v;
        } else return false;
    }
    if (isNaN(value)) return false;
    let result = true;
    if (model === "RGB") {
        if ([0, 1, 2].includes(field)) {
            if (value > 255 || value < 0) result = false;
        } else {
            if (value < 0 || value > 100) {
                result = false;
            }
        }
    } else if (model === "HSB" || model === "HSL") {
        if (field === 0) {
            if (value > 360 || value < 0) result = false;
        } else {
            if (value < 0 || value > 100) {
                result = false;
            }
        }
    }
    return result;
}

interface HRGB {
    R: number
    G: number
    B: number
}

export function getHRGB(h: number): HRGB {
    const h_rgb = {R: 255, G: 0, B: 0};
    const start = 0;
    const end = 360;
    if (start <= h && h <= end * 0.17) {
        const rate = h / (end * 0.17);
        h_rgb.R = 255;
        h_rgb.G = Math.floor(255 * rate);
        h_rgb.B = 0;
    } else if (end * 0.17 < h && h <= end * 0.33) {
        const rate = (h - end * 0.17) / (end * 0.33 - end * 0.17);
        h_rgb.R = Math.floor(255 - 255 * rate);
        h_rgb.G = 255;
        h_rgb.B = 0;
    } else if (end * 0.33 < h && h <= end * 0.50) {
        const rate = (h - end * 0.33) / (end * 0.50 - end * 0.33);
        h_rgb.R = 0;
        h_rgb.G = 255;
        h_rgb.B = Math.floor(255 * rate);
    } else if (end * 0.50 < h && h <= end * 0.67) {
        const rate = (h - end * 0.50) / (end * 0.67 - end * 0.50);
        h_rgb.R = 0;
        h_rgb.G = Math.floor(255 - 255 * rate);
        h_rgb.B = 255;
    } else if (end * 0.67 < h && h <= end * 0.83) {
        const rate = (h - end * 0.67) / (end * 0.83 - end * 0.67);
        h_rgb.R = Math.floor(255 * rate);
        h_rgb.G = 0;
        h_rgb.B = 255;
    } else {
        const rate = (h - end * 0.83) / (end - end * 0.83);
        h_rgb.R = 255;
        h_rgb.G = 0;
        h_rgb.B = Math.floor(255 - 255 * rate);
    }
    return h_rgb;
}

export interface RGB {
    R: number
    G: number
    B: number
}

export function HSB2RGB(H: number, S: number, V: number): RGB {
    const I = Math.floor((H / 60)) % 6;
    const F = H === 360 ? 0 : (H / 60) - I;
    const P = (V * 255) * (1 - S);
    const Q = (V * 255) * (1 - F * S);
    const T = (V * 255) * (1 - (1 - F) * S);
    const _V = V * 255;
    switch (I) {
        case 0:
            return {R: _V, G: T, B: P};
        case 1:
            return {R: Q, G: _V, B: P};
        case 2:
            return {R: P, G: _V, B: T};
        case 3:
            return {R: P, G: Q, B: _V};
        case 4:
            return {R: T, G: P, B: _V};
        case 5:
            return {R: _V, G: P, B: Q};
        default:
            return {R: 255, G: 0, B: 0};
    }
}

export function RGB2HSL(color: Color): HSL {
    let {red, green, blue} = color;
    red = red / 255;
    green = green / 255;
    blue = blue / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0, s = 0, l = 0;
    if (max === min) {
        h = 0;
    } else if (max === red && green >= blue) {
        h = 60 * ((green - blue) / (max - min)) + 0;
    } else if (max === red && green < blue) {
        h = 60 * ((green - blue) / (max - min)) + 360;
    } else if (max === green) {
        h = 60 * ((blue - red) / (max - min)) + 120;
    } else if (max === blue) {
        h = 60 * ((red - green) / (max - min)) + 240;
    }
    l = ((max + min) / 2);
    if (l === 0 || l === 1) {
        s = 0;
    } else {
        s = (max - min) / (1 - Math.abs(2 * l - 1));
    }
    return {h, s, l};
}

export function HSL2RGB(hsl: HSL): RGB {
    const {h, s, l} = hsl;
    const C = (1 - Math.abs(2 * l - 1)) * s;
    const h_prime = h / 60;
    const X = C * (1 - Math.abs(h_prime % 2 - 1));
    const m = l - C / 2;
    if (h_prime <= 1) {
        return withLight(C, X, 0)
    } else if (h_prime <= 2) {
        return withLight(X, C, 0)
    } else if (h_prime <= 3) {
        return withLight(0, C, X)
    } else if (h_prime <= 4) {
        return withLight(0, X, C)
    } else if (h_prime <= 5) {
        return withLight(X, 0, C)
    } else {
        return withLight(C, 0, X)
    }

    function withLight(r: number, g: number, b: number) {
        return {R: (r + m) * 255, G: (g + m) * 255, B: (b + m) * 255};
    }
}

export function getColorsFromDoc(context: Context) {
    // const s = Date.now();
    const page = context.selection.selectedPage;
    if (!page) return [];
    let dcs = Array.from(finder(context, page).values());
    dcs = dcs.sort((a, b) => {
        if (a.length > b.length) return -1;
        else if (a.length === b.length) return 0;
        else return 1;
    });
    const result: { times: number, color: Color }[] = [];
    for (let i = 0; i < dcs.length; i++) result.push({times: dcs[i].length, color: dcs[i][0]});
    // const e = Date.now();
    // console.log(e - s);
    return result;
}

function finder(context: Context, shape: ShapeView, init?: Map<string, Color[]>) {
    const cs = shape.childs;
    const result: Map<string, Color[]> = init || new Map();
    for (let i = 0; i < cs.length; i++) {
        const s = cs[i];
        if (!s) continue;
        const fills = s.getFills();
        const borders = s.getBorders().strokePaints;
        // const fbs: Array<Fill> = [...fills, ...borders];
        const fbs: Array<Fill> = [];
        for (let j = 0; j < fbs.length; j++) {
            const r = result.get(c2s(fbs[j].color));
            if (r) r.push(fbs[j].color);
            else result.set(c2s(fbs[j].color), [fbs[j].color]);
        }
        if (s.type === ShapeType.Text) {
            const editor = context.peekEditor4TextShape(s as TextShapeView);
            const format = (s as TextShapeView).text.getTextFormat(0, Infinity, editor?.getCachedSpanAttr());
            const c = format.color;
            if (format.colorIsMulti || !c) continue;
            const r = result.get(c2s(c));
            if (r) r.push(c);
            else result.set(c2s(c), [c]);
        }
        if (s instanceof GroupShapeView && s.childs.length) {
            finder(context, s, result)
        } else if (s instanceof TableView) finder(context, s, result);
    }
    return result;
}

function c2s(c: Color) {
    return `${c.alpha}|${c.red}|${c.green}|${c.blue}`;
}

export function block_style_generator(color: Color, gradient?: Gradient, fillType?: FillType) {
    if (fillType === FillType.Pattern) return {
        border: 'none',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center'
    }
    let style: any = {
        'background-color': toRGBA(color),
    }
    if (!gradient || !fillType) {
        return style;
    }
    if (fillType === FillType.Gradient) {
        delete style['background-color'];
        if (gradient.gradientType === GradientType.Linear) {
            style = get_linear_gradient(gradient);
        } else if (gradient.gradientType === GradientType.Radial) {
            style = get_radial_gradient(gradient);
        } else {
            style = get_angular_gradient(gradient);
        }
    }
    return style;
}

export function gradient_channel_generator(gradient: GradientCatch) {
    const stops = gradient.RGBAs;
    const style: any = {};
    if (!stops?.length) {
        return style;
    }
    let lg = 'linear-gradient(to right, ';
    for (let i = 0, l = stops.length; i < l; i++) {
        const s = stops[i];
        const c = toRGBA({red: s.R, green: s.G, blue: s.B, alpha: s.A});
        lg += `${c} ${s.position * 100}%, `
    }
    lg = lg.slice(0, lg.length - 2);
    lg += ')';
    if (stops.length === 1) {
        const s = stops[0];
        lg = toRGBA({red: s.R, green: s.G, blue: s.B, alpha: s.A});
    }
    style['background'] = lg;
    return style;
}

export interface StopEl {
    left: number
    is_active: boolean
    index: number
    stop: Stop
}

export function stops_generator(gradient: Gradient, width: number, selected = -1) {
    const result: StopEl[] = [];
    const stops = gradient.stops;
    if (!stops.length) {
        return result;
    }
    for (let i = 0, l = stops.length; i < l; i++) {
        const stop = stops[i];
        result.push({
            left: stop.position * width + 16,
            is_active: selected === i,
            index: i,
            stop
        });
    }
    return result;
}

// 16进制色彩转10进制
export function hexToX(hex: string): number[] {
    hex = hex.slice(1);
    let result: number[] = [];
    if (hex.length === 3) {
        let temp = hex.split('');
        result = temp.map(v => {
            const __v = `0x${v}${v}`;
            return Number(parseInt(__v, 16));
        })
    } else if (hex.length === 6) {
        let temp = hex.split('');
        for (let i = 0; i < 6; i = i + 2) {
            const __v = `0x${temp[i]}${temp[i + 1]}`;
            result.push(Number(parseInt(__v, 16)));
        }
    }
    return result
}

function get_linear_gradient(gradient: Gradient) {
    const {from, to, stops} = gradient;
    const rotate = getHorizontalAngle({x: from.x * 10, y: from.y * 10}, {x: to.x * 10, y: to.y * 10});
    const colors = [];
    if (stops.length === 1) {
        return {
            'background': toRGBA(stops[0].color),
        }
    }
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const c = toRGBA(stop.color);
        colors.push(`${c} ${stop.position * 100}%`)
    }
    const linear = `linear-gradient(${rotate + 90}deg, ${colors.join(', ')})`
    return {
        'background': linear,

    }
}

function get_radial_gradient(gradient: Gradient) {
    const {stops} = gradient;
    const colors = [];
    if (stops.length === 1) {
        return {
            'background': toRGBA(stops[0].color),

        }
    }
    for (let i = 0; i < stops.length; i++) {
        const stop = stops[i];
        const c = toRGBA(stop.color);
        colors.push(`${c} ${stop.position * 100}%`)
    }
    const radial = `radial-gradient(circle closest-side, ${colors.join(', ')})`
    return {
        'background-image': radial,

    }
}

function get_angular_gradient(gradient: Gradient) {
    const {from, to, stops} = gradient;
    let angular_gradient = "";
    const sc = stops.length;
    const calcSmoothColor = () => {
        const firstStop = stops[0];
        const lastStop = stops[sc - 1];
        const lastDistance = 1 - lastStop.position;
        const firstDistance = firstStop.position;
        const fColor = firstStop.color || 'white';
        const lColor = lastStop.color || 'white';
        const ratio = 1 / (firstDistance + lastDistance);
        const fRatio = lastDistance * ratio;
        const lRatio = firstDistance * ratio;
        let r = (fColor.red * fRatio + lColor.red * lRatio);
        let g = (fColor.green * fRatio + lColor.green * lRatio);
        let b = (fColor.blue * fRatio + lColor.blue * lRatio);
        let a = (fColor.alpha * fRatio + lColor.alpha * lRatio);
        r = Math.min(Math.max(Math.round(r), 0), 255);
        g = Math.min(Math.max(Math.round(g), 0), 255);
        b = Math.min(Math.max(Math.round(b), 0), 255);
        a = Math.min(Math.max(a, 0), 1);
        return {r, g, b, a};
    }
    if (sc > 0 && stops[0].position > 0) {
        const {r, g, b, a} = calcSmoothColor();
        angular_gradient = "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 0deg";
    }
    for (let i = 0; i < sc; i++) {
        const stop = stops[i];
        const color = stop.color || 'white';
        const rgbColor = "rgba(" + color.red + "," + color.green + "," + color.blue + "," + color.alpha + ")";
        const deg = Math.round(stop.position * 360)// % 360;
        angular_gradient.length > 0 && (angular_gradient = angular_gradient + ",")
        angular_gradient = angular_gradient + rgbColor + " " + deg + "deg";
    }
    if (sc > 0 && stops[sc - 1].position < 1) {
        const {r, g, b, a} = calcSmoothColor();
        angular_gradient = angular_gradient + "," + "rgba(" + r + "," + g + "," + b + "," + a + ")" + " 360deg";
    }
    const rotate = Math.atan2((to.y * 10 - from.y * 10), (to.x * 10 - from.x * 10)) / Math.PI * 180 + 90;
    const f = "from " + rotate + "deg at " + from.x * 100 + "% " + from.y * 100 + "%";
    const angular = "conic-gradient(" + f + "," + angular_gradient + ")"
    return {
        'background': angular,
        width: '-webkit-fill-available'
    }
}

export function verifiedVal(val: number, min: number, max: number) {
    return Math.max(min, Math.min(val, max));
}
