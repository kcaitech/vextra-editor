import { debounce } from "lodash";
import { Context } from "@/context";
import { ClientXY, PageXY } from "@/context/selection";
import { AsyncCreator, Shape, ShapeFrame, ShapeType, GroupShape, TextShape, Matrix } from "@kcdesign/data";
import { Action, Media, ResultByAction } from '@/context/workspace';
import { createHorizontalBox } from '@/utils/common';
import { searchCommentShape as finder } from '@/utils/comment'
interface SystemClipboardItem {
  type: ShapeType
  contentType: string
  content: Media | string
}
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
  const s2pMatirx = shape.matrix2Root();
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
    return false;
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
      if (media && media.length) {
        const _m = media[0];
        let _name: any = _m.name.split('.');
        if (_name.length > 1) {
          _name.pop();
          if (_name[0]) {
            _name = get_image_name(parent.childs, _name[0]);
          } else {
            _name = name;
          }
        }
        new_shape = asyncCreator.init_media(page, (parent as GroupShape), _name as string, frame, _m);
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
// 普通图形从init到inset一气呵成
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
    new_shape = asyncCreator.init(page, (parent as GroupShape), type, name, frame);
  }
  if (asyncCreator && new_shape) {
    asyncCreator = asyncCreator.close();
    selection.selectShape(page!.getShape(new_shape.id));
  }
  workspace.setAction(Action.AutoV);
  workspace.creating(false);
}
// 插入文本框
function init_insert_textshape(context: Context, mousedownOnPageXY: PageXY, t: Function, content: string, land?: Shape, _t?: ShapeType) {
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
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    new_shape = asyncCreator.init_text(page, (parent as GroupShape), frame, content);
  }
  if (asyncCreator && new_shape) {
    asyncCreator = asyncCreator.close();
    selection.selectShape(page!.getShape(new_shape.id));
    selection.selectText(0, (new_shape as TextShape).text.length)
  }
  workspace.setAction(Action.AutoV);
  workspace.creating(false);
}
// 图片从init到inset一气呵成
function init_insert_image(context: Context, mousedownOnPageXY: PageXY, t: Function, media: Media) {
  const selection = context.selection;
  const page = selection.selectedPage;
  let asyncCreator: AsyncCreator | undefined;
  let new_shape: Shape | undefined;
  const frame = new ShapeFrame(mousedownOnPageXY.x, mousedownOnPageXY.y, 100, 100);
  if (page) {
    const editor = context.editor.controller();
    const name = getName(ShapeType.Image, page.childs, t);
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    const _m = media;
    let _name: any = _m.name.split('.');
    if (_name.length > 1) {
      _name.pop();
      if (_name[0]) {
        _name = get_image_name(page.childs, _name[0]);
      } else {
        _name = name;
      }
    }
    frame.height = _m.frame.height;
    frame.width = _m.frame.width;
    new_shape = asyncCreator.init_media(page, (page as GroupShape), _name as string, frame, _m);
  }
  if (asyncCreator && new_shape) {
    asyncCreator = asyncCreator.close();
    new_shape = page!.getShape(new_shape.id)
    return new_shape;
  }
}
function insert_imgs(context: Context, t: Function) {
  const selection = context.selection;
  const media = context.workspace.getImageFromDoc();
  const new_shapes: Shape[] = [];
  if (media && media.length) {
    const xy = adjust_content_xy(context, media[0]);
    for (let i = 0; i < media.length; i++) {
      if (i > 0) xy.x = xy.x + media[i - 1].frame.width + 10;
      const img = init_insert_image(context, xy, t, media[i]);
      if (img) {
        new_shapes.push(img);
      }
    }
  }
  if (new_shapes.length) {
    selection.rangeSelectShape(new_shapes);
  }
  context.workspace.setFreezeStatus(false);
}
function is_drag(context: Context, e: MouseEvent, start: ClientXY, threshold?: number) {
  const root = context.workspace.root;
  const dragActiveDis = threshold || 4;
  const diff = Math.hypot(e.clientX - root.x - start.x, e.clientY - root.y - start.y);
  return Boolean(diff > dragActiveDis);
}
function paster(context: Context, t: Function, xy?: PageXY) {
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      context.workspace.setFreezeStatus(true);
      navigator.clipboard.read()
        .then(function (data) {
          if (data && data.length) { // 存在有效内容
            if (data[0].types[0].indexOf('image') !== -1) { // 内容为一张图片
              set_clipboard_image(context, data[0], t, xy)
            } else if (data[0].types.includes('text/html')) {
              data[0].getType('text/html').then(val => { // 图形
                const fr = new FileReader();
                fr.onload = function (event) {
                  const text = event.target?.result;
                  if (text) {
                    console.log('html', text);
                  }
                }
                fr.readAsText(val);
              });
            } else if (data[0].types.includes('text/plain')) { // 白板文本
              data[0].getType('text/plain').then(val => {
                const fr = new FileReader();
                fr.onload = function (event) {
                  const text = event.target?.result;
                  if (text) {
                    console.log('plain', text);
                  }
                }
                fr.readAsText(val);
              });
            }
          } else {
            // todo 没有有效内容
          }
          context.workspace.setFreezeStatus(false);
        })
        .catch((e) => {
          console.log(e);
          context.workspace.setFreezeStatus(false);
        })
    }
  } catch (error) {
    context.workspace.setFreezeStatus(false);
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
    selection.selectShape(page!.getShape(new_shape.id));
  }
  workspace.setAction(Action.AutoV);
  workspace.creating(false);
}
// 复制一张图片
async function set_clipboard_image(context: Context, data: any, t: Function, _xy?: PageXY) {
  const item: SystemClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
  item.contentType = data.types[0];
  const val = await data.getType(item.contentType);
  const frame: { width: number, height: number } = { width: 100, height: 100 };
  const img = new Image();
  img.onload = function () {
    frame.width = img.width;
    frame.height = img.height;
    const fr = new FileReader();
    fr.onload = function (event) {
      const base64: any = event.target?.result;
      if (base64) {
        fr.onload = function (event) {
          const buff = event.target?.result;
          if (base64 && buff) {
            item.content = { name: t('shape.image'), frame, buff: new Uint8Array(buff as any), base64 };
            const content = item!.content as Media;
            const __xy = adjust_content_xy(context, content);
            const xy: PageXY = _xy || __xy;
            paster_image(context, xy, t, content);
          }
        }
        fr.readAsArrayBuffer(val);
      }
    }
    fr.readAsDataURL(val);
  }
  img.src = URL.createObjectURL(val);
}
function adjust_content_xy(context: Context, m: Media) {
  const workspace = context.workspace;
  const root = workspace.root;
  const matrix = workspace.matrix;
  const ratio_wh = m.frame.width / m.frame.height;
  const page_height = root.height / matrix.m00;
  const page_width = root.width / matrix.m00;
  if (m.frame.height >= m.frame.width) {
    if (m.frame.height > page_height * 0.95) {
      m.frame.height = page_height * 0.95;
      m.frame.width = m.frame.height * ratio_wh;
    }
  } else {
    if (m.frame.width > page_width * 0.95) {
      m.frame.width = page_width * 0.95;
      m.frame.height = m.frame.width / ratio_wh;
    }
  }
  const page_center = matrix.inverseCoord(root.center);
  return { x: page_center.x - m.frame.width / 2, y: page_center.y - m.frame.height / 2 };
}
function drop(e: DragEvent, context: Context, t: Function) {
  e.preventDefault();
  const data = e?.dataTransfer?.files;
  if (data && data[0].type.indexOf('image') !== -1) {
    const item: SystemClipboardItem = { type: ShapeType.Image, contentType: 'image/png', content: '' };
    const file = data[0];
    item.contentType = file.type;
    const frame = { width: 100, height: 100 };
    const img = new Image();
    img.onload = function () {
      frame.width = img.width;
      frame.height = img.height;
      const ratio = frame.width / frame.height;
      if (frame.width >= frame.height) {
        if (frame.width > 600) {
          frame.width = 600;
          frame.height = frame.width / ratio;
        }
      } else {
        if (frame.height > 600) {
          frame.height = 600;
          frame.width = 600 * ratio;
        }
      }
      const fr = new FileReader();
      fr.onload = function (event) {
        const base64: any = event.target?.result;
        if (base64) {
          fr.onload = function (event) {
            const buff = event.target?.result;
            if (base64 && buff) {
              item.content = { name: file.name, frame, buff: new Uint8Array(buff as any), base64 };
              const content = item!.content as Media;
              const root = context.workspace.root;
              const { clientX, clientY } = e;
              const xy: PageXY = context.workspace.matrix.inverseCoord({ x: clientX - root.x, y: clientY - root.y });
              paster_image(context, xy, t, content);
            }
          }
          fr.readAsArrayBuffer(file);
        }
      }
      fr.readAsDataURL(file);
    }
    img.src = URL.createObjectURL(file);
  }
}
/**
 * 使page全部内容都在可视区，并居中
 * @param context 
 */
function adapt_page(context: Context, r?: Root) {
  const childs = context.selection.selectedPage?.childs || [];
  if (!childs.length) return new Matrix();
  const matrix = context.workspace.matrix;
  const points: [number, number][] = [];
  for (let i = 0; i < childs.length; i++) {
    const item = childs[i];
    const frame = item.frame;
    const m = item.matrix2Root();
    const _points: [number, number][] = [
      [0, 0],
      [frame.width, 0],
      [frame.width, frame.height],
      [0, frame.height]
    ]
    points.push(..._points.map(p => {
      const r = m.computeCoord(p[0], p[1]);
      const _r = matrix.computeCoord(r.x, r.y);
      return [_r.x, _r.y] as [number, number];
    }))
  }
  const box = createHorizontalBox(points);
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const root = r || context.workspace.root;
  const w_max = root.width;
  const h_max = root.height;

  const ratio_w = width / w_max * 1.06; // 两边留点空白
  const ratio_h = height / h_max * 1.12; // 留点位置给容器标题

  const ratio = Math.max(ratio_h, ratio_w);

  if (ratio != 1) {
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    matrix.trans(del.x, del.y);
    matrix.trans(-root.width / 2, -root.height / 2); // 先去中心点
    if (matrix.m00 * 1 / ratio > 0.02 && matrix.m00 * 1 / ratio < 256) { // 不能小于2%,不能大于25600%
      matrix.scale(1 / ratio);
    } else {
      if (matrix.m00 * 1 / ratio <= 0.02) {
        matrix.scale(0.02 / matrix.m00);
      } else if (matrix.m00 * 1 / ratio >= 256) {
        matrix.scale(256 / matrix.m00);
      }
    }
    matrix.trans(root.width / 2, root.height / 2);
    context.workspace.matrixTransformation();
  } else {
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    if (del.x || del.y) {
      matrix.trans(del.x, del.y);
      context.workspace.matrixTransformation();
    }
  }
  return matrix;
}
function page_scale(context: Context, scale: number) {
  const workspace = context.workspace;
  const root = workspace.root;
  const matrix = workspace.matrix;
  const offsetX = root.center.x - root.x;
  const offsetY = root.center.y - root.y;
  matrix.trans(-offsetX, -offsetY);
  matrix.scale(scale / matrix.m00);
  matrix.trans(offsetX, offsetY);
  workspace.matrixTransformation();
}
/**
 * 右键选择图形的规则
 * @param p 点击位置在页面中所处的位置
 * @param context 
 * @param pre_shapes 预选图形
 * @param { 'controller' | 'group'| 'artboard'| 'null' | 'normal' } area
 */
function right_select(e: MouseEvent, p: PageXY, context: Context): 'controller' | 'group' | 'artboard' | 'null' | 'normal' {
  if ((e.target as Element).closest('[data-area="controller"]')) { // 点在了控件上
    return 'controller';
  }
  const selection = context.selection;
  const area_1 = context.selection.getShapesByXY(p, false);
  if (area_1.length) {
    if (area_1[0].type === ShapeType.Group) {
      selection.selectShape(area_1[0]);
      return 'group';
    }
  }
  const area_2 = finder(context, p);
  if (area_2.length) {
    if (area_2[0].type === ShapeType.Artboard) {
      selection.selectShape(area_2[0]);
      return 'artboard';
    } else {
      selection.selectShape(area_2[0]);
      return 'normal';
    }
  }
  return 'null';
}
/**
 * 判断选区存在的类型
 * @param context
 * @returns { number } 两位二进制 00 
 */
function get_selected_type(context: Context): number {
  let result = 0;
  const shapes = context.selection.selectedShapes;
  for (let i = shapes.length - 1; i > -1; i--) {
    if (shapes[i].type === ShapeType.Artboard) {
      result = result | 1;
    } else if (shapes[i].type === ShapeType.Group) {
      result = result | 2;
    }
  }
  return result;
}
export { Root, updateRoot, _updateRoot, getName, get_image_name, isInner, init_scale, init_shape, init_insert_shape, init_insert_textshape, is_drag, paster, insert_imgs, drop, adapt_page, page_scale, right_select, get_selected_type };