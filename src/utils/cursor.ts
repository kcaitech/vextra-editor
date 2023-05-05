// 光标样式处理   ---.svg + 角度 = base64
import { v4 as uuid } from "uuid";

const auto = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1LjM4MyAxNC42ODE2TDI2LjEwNyAxOC42NTVMMjAuMjQ3NCAyNS4wMzE5TDE1LjM4MyAxNC42ODE2WiIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==';
const cross = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE1IDhIMThWMjRIMTVWOFoiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjkiIHk9IjE3IiB3aWR0aD0iMyIgaGVpZ2h0PSIxNSIgdHJhbnNmb3JtPSJyb3RhdGUoLTkwIDkgMTcpIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K';
const scale = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUgMTZMMTEuMDc4OSAxMC44MDM4VjIxLjE5NjJMNSAxNloiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yNyAxNkwyMC45MjExIDIxLjE5NjJWMTAuODAzOEwyNyAxNloiIGZpbGw9ImJsYWNrIi8+CjxyZWN0IHg9IjEwLjc4OTQiIHk9IjE0Ljc5OTgiIHdpZHRoPSIxMS41Nzg5IiBoZWlnaHQ9IjIuNCIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==';
const rotate = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIyIDYuNTM4MDlMMjYuMzMwMSAxMy4xNzI3SDE3LjY2OTlMMjIgNi41MzgwOVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik03LjAwMDEyIDIwLjY5MjNMMTMuMjUwMSAxNi4wOTU3VjI1LjI4ODlMNy4wMDAxMiAyMC42OTIzWiIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTEyLjgzMzMgMjIuNDYxNUMxNC4yNTYgMjIuNDYxNSAxNS42NjQ3IDIyLjIwOTggMTYuOTc5MSAyMS43MjA4QzE4LjI5MzQgMjEuMjMxOCAxOS40ODc3IDIwLjUxNSAyMC40OTM3IDE5LjYxMTVDMjEuNDk5NiAxOC43MDc5IDIyLjI5NzYgMTcuNjM1MiAyMi44NDIgMTYuNDU0NkMyMy4zODY1IDE1LjI3NCAyMy42NjY3IDE0LjAwODYgMjMuNjY2NyAxMi43MzA4SDE5Ljk3NEMxOS45NzQgMTMuNTczMSAxOS43ODkzIDE0LjQwNzEgMTkuNDMwNCAxNS4xODUzQzE5LjA3MTYgMTUuOTYzNCAxOC41NDU2IDE2LjY3MDUgMTcuODgyNSAxNy4yNjYxQzE3LjIxOTUgMTcuODYxNyAxNi40MzIzIDE4LjMzNDEgMTUuNTY1OSAxOC42NTY0QzE0LjY5OTYgMTguOTc4OCAxMy43NzExIDE5LjE0NDcgMTIuODMzMyAxOS4xNDQ3TDEyLjgzMzMgMjIuNDYxNVoiIGZpbGw9ImJsYWNrIi8+Cjwvc3ZnPgo=';
const extend = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgMTVMOSAxMS41MzU5VjE4LjQ2NDFMMyAxNVoiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yOSAxNUwyMyAxOC40NjQxVjExLjUzNTlMMjkgMTVaIiBmaWxsPSJibGFjayIvPgo8cmVjdCB4PSI4IiB5PSIxNCIgd2lkdGg9IjE2IiBoZWlnaHQ9IjIiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0xNiAyOEwxMi41MzU5IDIxLjI1SDE5LjQ2NDFMMTYgMjhaIiBmaWxsPSJibGFjayIvPgo8cGF0aCBkPSJNMTYgM0wxOS40NjQxIDlIMTIuNTM1OUwxNiAzWiIgZmlsbD0iYmxhY2siLz4KPHJlY3QgeD0iMTUuMjAwMSIgeT0iMjIuMTU3NyIgd2lkdGg9IjEzLjY4NDIiIGhlaWdodD0iMS42IiB0cmFuc2Zvcm09InJvdGF0ZSgtOTAgMTUuMjAwMSAyMi4xNTc3KSIgZmlsbD0iYmxhY2siLz4KPC9zdmc+Cg==';
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
      str += `cursor: image-set(url(${src})) ${hot[0]} ${hot[1]}, auto;`;
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