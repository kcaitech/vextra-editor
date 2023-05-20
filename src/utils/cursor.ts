// 光标样式处理   ---.svg + 角度 = base64
import { v4 as uuid } from "uuid";

const auto = 'data:image/png;base64,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';
const cross = 'data:image/png;base64,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';
const scale = 'data:image/png;base64,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';
const rotate = 'data:image/png;base64,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';
const extend = 'data:image/png;base64,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';
const scan = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAW4SURBVHgB7VrNSyRHFK+unhkdP2dFEYxmRcwhMQdBPeSmuebiRf8FiRf1GDB+gHfxT8gt6EXwEsjFSwI5CF48CSqJEUTxE3Xsj6r8fm23zGbblYWt3h23flB0d/WrqX6v3nv13qsRwsLCwsLCwsLCwsLCwuLzgyMygNaa8+jKOR3HYf8bdOyrGJP0aWEQOWEWDhlZXFx0dnZ25MnJiXN9ff3I5eDgYNoYPTw8LEZGRgSuKitBGAE/fmxszB0YGMjjfl+/B5RSB/iJPJqMNcgITGqAw5Xf29uTx8fHnKd7ZmZGbG9vPzuwv79fLC8vv+7s7MwdHh5Sg0IKpdJEPhSMCYCrzw/u7e2V5XI5mqe7u1tcXFw80qyvr0fPpVJJjI6OPvbzmbi9vc1jvFpYWFDz8/OVfuTTBxcMNkzGi2ivYPu/3t/fH0IY/7JxRSEQMhRdCfaTxvf9f+7u7v7AuxK0oMjfMWkGRhA7LxfM1TY3N7/C/RdoX6F9Oz09/UOaANjP9zU1Nb2khyZEAsC9MQFIYQ7RB+dyOX15eRk2NDT4ePTAnJ/P58Mnxig0H1rg19fXB/T88AGRCQhD6m9SAAIfrrGCIRqZvkfXHZgqQxj3afR1dXVebW1tmXSFQqEMIXjYQSgAvjaiAcacIFePZsDVgw37BwcH9OLa8zxRLBaDtDEQjAeNucNtGWbjYUwIDaC2aFNxgFENEJEr0AxsFJgJmpqaPNd1/dgc3gIFAwF48Ane0NCQD+FF258w6P2NCoDbIFcOWxgZCKHSiv4AfSqNHmaipJSKdKurq1R9bToCNK0BERImEA7rlpaWJ+mgHVG8Az+QBD3G9/1MBJAADk2cnZ1xpVPfh2HonJ+f662trcz2fNPJ0CPiyPBZxqghFFISSb4YwJ4lwtqalZWVLxHi/pkWCCFa/G1paek16UTG2mkaDrNCXOuQGP24v7+vkfAk3j1qfKb6n56e/sToj/T/rxeYQBZSph5HWWFbW5uE/XdjS3wrK+QzG3aBEnIBSXqRQcEmCwFoRnJIdBw4uWdze75HsJSjI2Q6LaodsRrL2K5LiOx+pqqnmQBNY3d3d5p0L80PkJEaZoUTExPfQAC/pznBq6urvyYnJ78WsQBiv1HdWkCVZuvr6ytgi2tCV8fs7Oz3aQKYm5sbQULUgb5mtEI8VpiEcRVjFBgXRRUiPYa5TI1TkyFkgCGcIN+FCJp0HEoLk8jExpgLQJ01qsIhkyHUBFLrARQA84SOjg7V09OjXso2GGkBTECzvgc7V08JADkABRTADMK1tTXjiRCRmZdlZgfGmQyh4q1SGYP6R0yTTmRUAM10m2GWxyvT3adouEUmdFkgUwEwGEKioxHpiU8FmQoAOwGzvWfdepbpcCYCoDdngyN8mFTKdzJIOvgMJ4uzAOMCiJlwxsfH5c3NjUQ+4CIdTp2XSRAuLumgLSwfZCIEU3Di5vJkB55/kweeQRD8zZOftEiQ/Xwf0/3CQ1XWEUxGhMaky49mBLixseHCpnmyc4tnwVQ4wVNngzwcnZqaEl1dXXXt7e0BxieR4weXgvGSGKrAEo4vKgKS2UoBkNEElf3J4SgyxzxPlhBFKgRGSlQTksNRVneYBVK19XuA9KUHSSTVoeo6GSJQAdKbm5sCAhCNjY3fwbaLOPcr5B/KwomPeAR8XoBiCMNkD+EwfOWtg7zAwepX5R8kBD6cF2aBIY67Gf1IRHkKAVGAcDchcyAUkYS/zAfw3gfzQWtra3B0dBQykRKGYNoHRCdCWM0o9IOXD6EFOTxLMMjD0IgI1+jPD9z1mA1CW0LYfgBhBDwcZSIlDMHoHku75f7PAic8uYQ6u1hRiZWN5kUFWOD+jTHo00yHmRHCdBTGJX+Pqb4/ScVwuJfj6sYlLmpdnns8W3LPilHyHNOQ1nhl+GNEWalzppwEVe2KW1hYWFhYWFhUBf4D5TqhLgU1rAYAAAAASUVORK5CYII=';
interface StyleSheetController {
  getId: Function
  setup: Function
  remove: Function
  appendClass: Function
  getClass: Function
}
const getBase64ByType = new Map([
  ['auto', auto],
  ['cross', cross],
  ['scale', scale],
  ['rotate', rotate],
  ['extend', extend],
  ['scan', scan]
])

const hot = [16, 16]; // 光标热点在svg的位置

// 返回一个StyleSheetController对象
function styleSheetController(): StyleSheetController {
  let styleSheetId: string = '';
  let style: HTMLStyleElement;
  const classList: Map<string, string> = new Map();

  // 向document的head插入一个<style type='text/css' id='xxx'>标签
  async function appendStyleSheetForCursor() {
    style = document.createElement('style');
    style.type = 'text/css';
    styleSheetId = (uuid().split('-').at(-1)) || 'cursor'; // at() 可能存在浏览器兼容问题，后期观察👀；
    style.id = styleSheetId;
    // 预设一个auto
    style.innerHTML += await getClassString('auto', 0, styleSheetId);
    classList.set(`auto-0-${styleSheetId}`, `auto-0-${styleSheetId}`);
    document.querySelector('head')?.appendChild(style);
  }
  // 根据id移除一个<style>标签
  function removeStyleSheetForCursor() {
    if (styleSheetId.length) {
      const style = document.getElementById(styleSheetId);
      style?.remove();
    }
  }
  // 向style标签里面插入class样式
  function appendClass(clsName: string, cls: string) {
    if (style) {
      style.innerHTML += cls;
      classList.set(clsName, clsName);
    }
  }
  async function getClass(clsName: string) { //这个clsName是不带id的，只有类型和度数
    const arr = clsName.split('-');
    arr[1] = findNearestMultipleOf(Math.floor(((Number(arr[1]) % 360))), 3).toString();
    clsName = `${arr[0]}-${arr[1]}-${styleSheetId}`;
    // 如果获取的过程中无法从已有的样式库中取得样式，则先创建一个样式插入到样式库
    if (!classList.get(clsName)) {
      const [type, deg] = clsName.split('-');
      const cls: string = await getClassString(type, Number(deg), styleSheetId);
      appendClass(clsName, cls);
      return clsName;
    } else {
      return classList.get(clsName) || `auto-0-${styleSheetId}`;
    }
  }

  async function getClassString(type: string, deg: number, id: string) {
    let src: string = getBase64ByType.get(type) || auto;
    const result = await rotateBase64Image(src, deg);
    let str = `.${type}-${deg}-${id} {`;
    if (result) {
      src = (result as string);
      if (type === 'auto') {
        str += `cursor: -webkit-image-set(url(${src}) 2x) ${hot[0] - 3} ${hot[1] - 3}, auto;`;
      } else {
        str += `cursor: -webkit-image-set(url(${src}) 2x) ${hot[0]} ${hot[1]}, auto;`;
      }
    }
    str += '}'
    return str;
  }
  function getId() {
    return styleSheetId;
  }
  return {
    getId,
    setup: appendStyleSheetForCursor,
    remove: removeStyleSheetForCursor,
    appendClass,
    getClass,
  };
}

// image/svg+xml -rotate-> image/svg+xml;
function rotateBase64Image(base64Image: string, angle: number) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.src = base64Image;
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
      // const rotatedBase64Image = canvas.toDataURL('image/svg+xml');
      resolve(rotatedBase64Image);
    };
    image.onerror = function () {
      reject('Invalid base64 image');
    }
  });
}

// step, 输入一个整数A，返回可以被step整除的离A最近的一个整数B
function findNearestMultipleOf(num: number, step?: number): number {
  step = step || 3
  let closest = Math.round(num / step) * step;
  if (closest < num) {
    closest += step;
  }
  return closest;
}
export { StyleSheetController, styleSheetController }