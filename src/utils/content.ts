import { debounce } from "lodash";
import { Context } from "@/context";
import { ClientXY, PageXY } from "@/context/selection";
import { AsyncCreator, Shape, ShapeFrame, ShapeType, GroupShape } from "@kcdesign/data";
import { Action, Media, ResultByAction, WorkSpace, ClipboardItem } from '@/context/workspace';
import { get_frame } from '@/utils/image';
import { async } from "node-stream-zip";
interface Root {
  init: boolean
  x: number
  y: number
  bottom: number
  right: number
  width: number
  height: number
  element: any
  center: ClientXY
}
const updateRootTime = 300;
function _updateRoot(context: Context, element: HTMLElement) {
  const { x, y, right, bottom } = element.getBoundingClientRect();
  const root: Root = {
    init: true, x, y, right, bottom, element,
    width: right - x,
    height: bottom - y,
    center: { x: (right - x) / 2, y: (bottom - y) / 2 }
  }
  context.workspace.updateRoot(root);
}
const updateRoot = debounce(_updateRoot, updateRootTime);

// 根据类型给图形命名
function getName(type: ShapeType, brothers: Shape[], t: Function): string {
  const name = t(`shape.${type}`);
  const renamebrothers = brothers.filter((item: Shape) => item.type === type);
  const repeats: number = renamebrothers.length;
  return repeats ? `${name} ${repeats + 1}` : name;
}
function get_image_name(brothers: Shape[], name: string) {
  name = name.trim();
  const renamebrothers = brothers.filter((item: Shape) => {
    const _n: any = item.name.split(' ');
    return item.type === ShapeType.Image && _n[0] === name;
  });
  const repeats: number = renamebrothers.length;
  return repeats ? `${name} ${repeats + 1}` : name;
}
// 判断图形是否在可视区域内
function isInner(context: Context, shape: Shape) {
  const pMatrix = context.workspace.matrix;
  const { x: rx, y: ry, bottom, right } = context.workspace.root;
  const s2pMatirx = shape.matrix2Page();
  const { width, height } = shape.frame;
  let point = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height]
  ]
  point = point.map(p => {
    const _s = s2pMatirx.computeCoord(p[0], p[1]);
    const _p = pMatrix.computeCoord(_s.x, _s.y);
    return [_p.x, _p.y];
  })
  const r = Math.max(point[0][0], point[1][0], point[2][0], point[3][0]);
  const l = Math.min(point[0][0], point[1][0], point[2][0], point[3][0]);
  const t = Math.min(point[0][1], point[1][1], point[2][1], point[3][1]);
  const b = Math.max(point[0][1], point[1][1], point[2][1], point[3][1]);

  if ((l + rx) > right - 20 || r < 0 + 20) {
    return false;
  } else if (b < 0 + 20 || (t + ry) > bottom - 20) {
    return false
  } else {
    return true;
  }
}
function init_scale(context: Context, shapes: Shape[]) {
  // todo
}
function init_shape(context: Context, frame: ShapeFrame, mousedownOnPageXY: PageXY, t: Function) {
  const selection = context.selection;
  const workspace = context.workspace;
  const type = ResultByAction(workspace.action);
  const page = selection.selectedPage;
  const parent = selection.getClosetArtboard(mousedownOnPageXY);
  let asyncCreator: AsyncCreator | undefined;
  let new_shape: Shape | undefined;
  if (page && parent && type) {
    const editor = context.editor.controller();
    const name = getName(type, parent.childs, t);
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    if (type === ShapeType.Image) {
      const media = workspace.getImageFromDoc();
      if (media) {
        let _name: any = media.name.split('.');
        if (_name.length > 1) {
          _name.pop();
          if (_name[0]) {
            _name = get_image_name(parent.childs, _name[0]);
          } else {
            _name = name;
          }
        }
        new_shape = asyncCreator.init_media(page, (parent as GroupShape), _name as string, frame, media);
      }
    } else {
      new_shape = asyncCreator.init(page, (parent as GroupShape), type, name, frame);
    }
  }
  if (asyncCreator && new_shape) {
    selection.selectShape(new_shape);
    workspace.creating(true);
    return { asyncCreator, new_shape };
  }
}
// 图形从init到inset一气呵成
function init_insert_shape(context: Context, mousedownOnPageXY: PageXY, t: Function, land?: Shape, _t?: ShapeType) {
  const selection = context.selection;
  const workspace = context.workspace;
  const type = _t || ResultByAction(workspace.action);
  const page = selection.selectedPage;
  const parent = land || selection.getClosetArtboard(mousedownOnPageXY);
  let asyncCreator: AsyncCreator | undefined;
  let new_shape: Shape | undefined;
  const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
  if (page && parent && type) {
    const editor = context.editor.controller();
    const name = getName(type, parent.childs, t);
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    if (type === ShapeType.Image) {
      const media = workspace.getImageFromDoc();
      if (media) {
        let _name: any = media.name.split('.');
        if (_name.length > 1) {
          _name.pop();
          if (_name[0]) {
            _name = get_image_name(parent.childs, _name[0]);
          } else {
            _name = name;
          }
        }
        frame.height = media.frame.height;
        frame.width = media.frame.width;
        new_shape = asyncCreator.init_media(page, (parent as GroupShape), _name as string, frame, media);
      }
    } else {
      new_shape = asyncCreator.init(page, (parent as GroupShape), type, name, frame);
    }
  }
  if (asyncCreator && new_shape) {
    asyncCreator = asyncCreator.close();
    selection.selectShape(new_shape);
  }
  workspace.setAction(Action.AutoV);
  workspace.creating(false);
}
function is_drag(context: Context, e: MouseEvent, start: ClientXY, threshold?: number) {
  const root = context.workspace.root;
  const dragActiveDis = threshold || 4;
  const diff = Math.hypot(e.clientX - root.x - start.x, e.clientY - root.y - start.y);
  return Boolean(diff > dragActiveDis);
}
async function paster(context: Context, t: Function, xy?: PageXY) {
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      await navigator.clipboard.read().then(async function (data) {
        if (data && data.length) {
          if (data[0].types[0].indexOf('image') !== -1) {
            await set_clipboard_image(context, data[0], t, xy)
          }
        }
      });
    }
  } catch (error) {
    // todo
    console.log(error);
  }
}
function paster_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
  const selection = context.selection;
  const workspace = context.workspace;
  const type = ShapeType.Image;
  const page = selection.selectedPage;
  const parent = selection.selectedPage;
  let asyncCreator: AsyncCreator | undefined;
  let new_shape: Shape | undefined;
  const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
  if (page && parent && type) {
    const editor = context.editor.controller();
    const name = getName(type, parent.childs, t);
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    if (type === ShapeType.Image) {
      frame.height = media.frame.height;
      frame.width = media.frame.width;
      new_shape = asyncCreator.init_media(page, (parent as GroupShape), name, frame, media);
    }
  }
  if (asyncCreator && new_shape) {
    asyncCreator = asyncCreator.close();
    selection.selectShape(new_shape);
  }
  workspace.setAction(Action.AutoV);
  workspace.creating(false);
}
// 复制一张图片
async function set_clipboard_image(context: Context, data: any, t: Function, _xy?: PageXY) {
  const item: ClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
  item.contentType = data.types[0];
  const val = await data.getType(item.contentType);
  const frame = get_frame(val);
  const fr = new FileReader();
  fr.onload = function (event) {
    const base64: any = event.target?.result;
    if (base64) {
      fr.onload = function (event) {
        const buff = event.target?.result;
        if (base64 && buff) {
          item.content = { name: '图片', frame, buff: new Uint8Array(buff as any), base64 };
          const workspace = context.workspace;
          const root = workspace.root;
          const matrix = workspace.matrix;
          const content = item!.content as Media;
          const ratio_wh = content.frame.width / content.frame.height;
          const page_height = root.height * matrix.m00;
          const page_width = root.width * matrix.m00;
          if ((content.frame.height >= content.frame.width) && (content.frame.height > page_height * 0.95)) {
            content.frame.height = page_height * 0.95;
            content.frame.width = content.frame.height * ratio_wh;
          } else if ((content.frame.width >= content.frame.height) && (content.frame.width > page_width * 0.95)) {
            content.frame.width = page_width * 0.95;
            content.frame.height = content.frame.width / ratio_wh;
          }
          const page_center = matrix.inverseCoord(root.center);
          const xy: PageXY = _xy || { x: page_center.x - content.frame.width / 2, y: page_center.y - content.frame.height / 2 };
          paster_image(context, xy, t, content);
        }
      }
      fr.readAsArrayBuffer(val);
    }
  }
  fr.readAsDataURL(val);
}
export { Root, updateRoot, getName, get_image_name, isInner, init_scale, init_shape, init_insert_shape, is_drag, paster };