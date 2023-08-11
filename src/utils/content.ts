import { debounce } from "lodash";
import { Context } from "@/context";
import { ClientXY, PageXY } from "@/context/selection";
import { AsyncCreator, Shape, ShapeFrame, ShapeType, GroupShape, TextShape, Matrix, Color } from "@kcdesign/data";
import { Action, ResultByAction } from "@/context/tool";
import { Perm, WorkSpace } from '@/context/workspace';
import { XYsBounding } from '@/utils/common';
import { searchCommentShape as finder } from '@/utils/comment'
import { paster_image } from "./clipaboard";
export interface Media {
  name: string
  frame: { width: number, height: number }
  buff: Uint8Array
  base64: string
}
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
  let point = [[0, 0], [width, 0], [width, height], [0, height]]
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
function init_shape(context: Context, frame: ShapeFrame, mousedownOnPageXY: PageXY, t: Function) {
  const selection = context.selection;
  const workspace = context.workspace;
  const action = context.tool.action;
  const type = ResultByAction(action);
  const page = selection.selectedPage;
  const parent = selection.getClosetArtboard(mousedownOnPageXY);
  let asyncCreator: AsyncCreator | undefined;
  let new_shape: Shape | undefined;
  if (page && parent && type) {
    const editor = context.editor.controller();
    const name = getName(type, parent.childs, t);
    asyncCreator = editor.asyncCreator(mousedownOnPageXY);
    new_shape = asyncCreator.init(page, (parent as GroupShape), type, name, frame);
  }
  if (asyncCreator && new_shape) {
    selection.selectShape(new_shape);
    workspace.creating(true);
    return { asyncCreator, new_shape };
  }
}
// 普通图形从init到inset一气呵成
function init_insert_shape(context: Context, mousedownOnPageXY: PageXY, t: Function, land?: Shape, _t?: ShapeType) {
  const tool = context.tool;
  const action = tool.action;
  if (action === Action.AddText) return init_insert_textshape(context, mousedownOnPageXY, t('shape.input_text'));
  const selection = context.selection;
  const workspace = context.workspace;
  const type = _t || ResultByAction(action);
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
  workspace.creating(false);
  tool.setAction(Action.AutoV);
  context.cursor.setType('auto-0');
}
// 插入文本框
function init_insert_textshape(context: Context, mousedownOnPageXY: PageXY, content: string, land?: Shape, _t?: ShapeType) {
  const selection = context.selection;
  const workspace = context.workspace;
  const type = _t || ResultByAction(context.tool.action);
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
    selection.getTextSelection(new_shape as TextShape).selectText(0, (new_shape as TextShape).text.length);
  }
  workspace.creating(false);
  context.tool.setAction(Action.AutoV);
  context.cursor.setType('auto-0');
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
async function insert_imgs(context: Context, t: Function, media: Media[]) {
  const selection = context.selection;
  const new_shapes: Shape[] = [];
  if (media && media.length) {
    const xy = adjust_content_xy(context, media[0]);
    for (let i = 0; i < media.length; i++) {
      if (i > 0) xy.x = xy.x + media[i - 1].frame.width + 10;
      const img = init_insert_image(context, xy, t, media[i]);
      if (img && await context.communication.docResourceUpload.upload(img.imageRef, media[i].buff.buffer.slice(0))) new_shapes.push(img);
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
function adapt_page(context: Context, initPage = false) {
  const childs = context.selection.selectedPage?.childs || [];
  if (!childs.length) return new Matrix();
  const matrix = context.workspace.matrix;
  const points: ClientXY[] = [];
  for (let i = 0; i < childs.length; i++) {
    const item = childs[i];
    const frame = item.frame;
    const m = item.matrix2Root();
    m.multiAtLeft(matrix);
    points.push(...[[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => m.computeCoord(p[0], p[1])));
  }
  const box = XYsBounding(points);
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const root = context.workspace.root;
  const w_max = root.width;
  const h_max = root.height;
  const ratio_w = width / w_max * 1.06; // 两边留点空白
  const ratio_h = height / h_max * 1.12; // 留点位置给容器标题
  const ratio = Math.max(ratio_h, ratio_w);
  if (ratio !== 1) {
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    matrix.trans(del.x, del.y);
    matrix.trans(-root.width / 2, -root.height / 2); // 先去中心点
    const max = initPage ? 1 : 256;
    if (matrix.m00 / ratio > 0.02 && matrix.m00 / ratio < max) { // 不能小于2%,不能大于25600%
      matrix.scale(1 / ratio);
    } else {
      if (matrix.m00 / ratio <= 0.02) {
        matrix.scale(0.02 / matrix.m00);
      } else if (matrix.m00 / ratio >= max) {
        matrix.scale(max / matrix.m00);
      }
    }
    matrix.trans(root.width / 2, root.height / 2);
    context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
  } else {
    const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
    const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
    if (del.x || del.y) {
      matrix.trans(del.x, del.y);
      context.workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
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
  workspace.notify(WorkSpace.MATRIX_TRANSFORMATION);
}
/**
 * 右键选择图形的规则
 * @param p 点击位置在页面中所处的位置
 * @param context 
 * @param pre_shapes 预选图形
 * @param { 'text-selection' | 'controller' | 'group'| 'artboard'| 'null' | 'normal' | 'table' | 'table_cell' } area
 */
function right_select(e: MouseEvent, p: PageXY, context: Context): 'text-selection' | 'controller' | 'group' | 'artboard' | 'null' | 'normal' | 'table' | 'table_cell' {
  const is_edting = context.workspace.isEditing;
  const area_0 = finder(context, p);
  if (area_0.length) {
    if ((e.target as Element).closest('#text-selection') && is_edting && area_0[0].type === ShapeType.Table) {
      return 'table';
    }
  }
  if ((e.target as Element).closest('#text-selection') && is_edting) {
    return 'text-selection';
  }
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
 * @returns { number } 只判断了两种图形 两位二进制 00 
 */
function get_selected_types(context: Context): number {
  let result = 0;
  const shapes = context.selection.selectedShapes;
  for (let i = shapes.length - 1; i > -1; i--) {
    if (shapes[i].type === ShapeType.Artboard) {
      result = result | 1;
    } else if (shapes[i].type === ShapeType.Group) {
      result = result | 2;
    }
    if (result >= 3) return result; // 已经得到了最多类型，不可能再有新的类型，不需要继续判断
  }
  return result;
}
// 列表转树
const list2Tree = (list: any, rootValue: string) => {
  const arr: any = []
  list.forEach((item: any) => {
    if (item.parent_id === rootValue) {
      const children = list2Tree(list, item.id)
      if (children.length) {
        item.children = children
      }
      arr.push(item)
    }
  })
  return arr
}
function flattenShapes(shapes: any) {
  return shapes.reduce((result: any, item: Shape) => {
    if (Array.isArray(item.childs)) {
      // 如果当前项有子级数组，则递归调用flattenArray函数处理子级数组
      result = result.concat(flattenShapes(item.childs));
    }
    return result.concat(item);
  }, []);
}
/**
 * 右键菜单打开之前根据点击的区域整理应该显示的菜单项
 * @param { "controller" | "text-selection" | "group" | "artboard" | "null" | "normal" | "table" | "table_cell"  } area 点击的区域
 * @returns 
 */
function get_menu_items(context: Context, area: "controller" | "text-selection" | "group" | "artboard" | "null" | "normal" | "table" | "table_cell" ): string[] {
  let contextMenuItems = []
  if (area === 'artboard') { // 点击在容器上
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'paste-here', 'replace', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'dissolution'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else if (area === 'group') { // 点击在编组上
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'paste-here', 'replace', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container', 'un_group'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else if (area === 'controller') { // 点击在选区上
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'paste-here', 'replace', 'visible', 'lock', 'groups', 'container'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
    const types = get_selected_types(context); // 点击在选区上时，需要判定选区内存在图形的类型
    if (types & 1) { // 存在容器
      if (permIsEdit(context)) {
        contextMenuItems.push('dissolution');
      }
    }
    if (types & 2) { // 存在编组
      if (permIsEdit(context)) {
        contextMenuItems.push('un_group');
      }
    }
    if (context.selection.selectedShapes.length <= 1) { // 当选区长度为1时，提供移动图层选项
      if (permIsEdit(context)) {
        contextMenuItems.push('forward', 'back', 'top', 'bottom');
      }
    }
  } else if (area === 'normal') { // 点击除了容器、编组以外的其他图形
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'paste-here', 'replace', 'visible', 'lock', 'forward', 'back', 'top', 'bottom', 'groups', 'container'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else if (area === 'text-selection') {
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'cut', 'paste', 'only_text'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else if (area === 'table') {
    if (permIsEdit(context)) {
      contextMenuItems = ['all', 'copy', 'cut', 'paste', 'only_text', 'insert_column', 'delete_column', 'split_cell', 'merge_cell'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else if (area === 'table_cell') {
    if (permIsEdit(context)) {
      contextMenuItems = ['insert_column', 'delete_column', 'split_cell', 'merge_cell'];
    } else {
      contextMenuItems = ['all', 'copy'];
    }
  } else {
    if (permIsEdit(context)) {
      // contextMenuItems = ['all', 'paste-here', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'title'];
      contextMenuItems = ['all', 'paste-here', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor'];
    } else {
      // contextMenuItems = ['all', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'title'];
      contextMenuItems = ['all', 'half', 'hundred', 'double', 'canvas', 'operation', 'comment', 'cursor'];
    }
  }
  return contextMenuItems;
}
function color2string(color: Color, t?: number) {
  const { red, green, blue, alpha } = color;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
function selectShapes(context: Context, shapes: Shape[]) {
  const hoveredShape = shapes[0], selection = context.selection;
  if (hoveredShape) {
    const selected = selection.selectedShapes;
    if (selected.length) {
      const isSelected = selected.find((s: Shape) => s.id == hoveredShape.id);
      if (!isSelected) {
        selection.hoverShape(hoveredShape);
      } else {
        selection.unHoverShape();
      }
    } else {
      selection.hoverShape(hoveredShape);
    }
  } else {
    selection.unHoverShape();
  }
}

export const permIsEdit = (context: Context) => {
  return Boolean(context.workspace.documentPerm === Perm.isEdit);
}

export const hasRadiusShape = (shape: Shape, type: ShapeType[]) => {
  const shapeType = shape.type
  if (shapeType === ShapeType.Group) {
    if (!(shape as GroupShape).isBoolOpShape) return false
  }

  if (!type.includes(shapeType)) return false

  return true
}

function skipUserSelectShapes(context: Context, shapes: Shape[]) {
  if (!shapes.length) return new Matrix();
  const matrix = context.workspace.matrix;
  const points: ClientXY[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const item = shapes[i];
    const frame = item.frame;
    const m = item.matrix2Root();
    m.multiAtLeft(matrix);
    points.push(...[[0, 0], [frame.width, 0], [frame.width, frame.height], [0, frame.height]].map(p => m.computeCoord(p[0], p[1])));
  }
  const box = XYsBounding(points);
  const width = box.right - box.left;
  const height = box.bottom - box.top;
  const root = context.workspace.root;
  const p_center = { x: box.left + width / 2, y: box.top + height / 2 };
  const del = { x: root.center.x - p_center.x, y: root.center.y - p_center.y };
  if (del.x || del.y) {
    matrix.trans(del.x, del.y);
    context.workspace.matrixTransformation();
  }
}

export {
  Root, updateRoot, _updateRoot,
  getName, get_image_name, get_selected_types,
  isInner, is_drag,
  init_shape, init_insert_shape, init_insert_textshape,
  insert_imgs, drop, adapt_page, page_scale, right_select,
  list2Tree, flattenShapes,
  get_menu_items, color2string, selectShapes, skipUserSelectShapes
};
