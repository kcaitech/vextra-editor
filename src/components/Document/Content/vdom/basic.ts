// import { OverrideType, RenderTransform, Shape, ShapeType, SymbolRefShape, SymbolShape, Variable } from "@kcdesign/data";

import { EL, ShapeView } from "@kcdesign/data";
import { patch } from "./patch";


// export function stringh(tag: string, attrs?: any, childs?: Array<string>): string;
// export function stringh(tag: string, childs?: Array<string>): string;
// export function stringh(...args: any[]): string {
//     const tag = args[0];
//     let attrs = args[1];
//     let childs = args[2];
//     if (args.length === 3) {
//         //
//     }
//     else if (args.length === 2) {
//         if (Array.isArray(args[1])) {
//             attrs = undefined;
//             childs = args[1];
//         }
//     }
//     else {
//         throw new Error("args err!");
//     }

//     if (typeof tag !== 'string') {
//         throw new Error("not support:" + tag);
//     }

//     let ret = '<' + tag;
//     if (attrs) for (let a in attrs) {
//         const attr = attrs[a];
//         if (a === 'style') {
//             let style = ""
//             for (let b in attr) {
//                 style += b + ':' + attr[b] + ';';
//             }
//             ret += ' ' + a + '="' + style + '"';
//         }
//         else {
//             ret += ' ' + a + '="' + attr + '"';
//         }
//     }
//     ret += '>';
//     if (childs) for (let i = 0, len = childs.length; i < len; i++) {
//         ret += childs[i];
//     }
//     ret += '</' + tag + '>';
//     return ret;
// }

// // 待优化
// function findVar(varId: string, ret: Variable[], varsContainer: (SymbolRefShape | SymbolShape)[], i: number | undefined = undefined) {
//     i = i === undefined ? varsContainer.length - 1 : i;
//     for (; i >= 0; --i) {
//         const container = varsContainer[i];
//         const override = container.getOverrid(varId, OverrideType.Variable);
//         if (override) {
//             ret.push(override.v);
//             // scope??
//             varId = override.v.id;
//         }
//         else {
//             const _var = container.getVar(varId);
//             if (_var) {
//                 ret.push(_var);
//             }
//         }
//         if (container instanceof SymbolRefShape) varId = container.id + '/' + varId;
//     }
// }

// function findOverride(refId: string, type: OverrideType, varsContainer: (SymbolRefShape | SymbolShape)[]) {
//     for (let i = varsContainer.length - 1; i >= 0; --i) {
//         const container = varsContainer[i];
//         const override = container.getOverrid(refId, type);
//         if (override) {
//             const ret = [override.v];
//             refId = override.v.id;
//             if (container instanceof SymbolRefShape) refId = container.id + '/' + refId;
//             findVar(refId, ret, varsContainer, i - 1);
//             return ret;
//         }
//         if (container instanceof SymbolRefShape) refId = container.id + '/' + refId;
//     }
// }

// function genid(shape: Shape,
//     varsContainer: (SymbolRefShape | SymbolShape)[]) {
//     if (varsContainer.length > 0) {
//         let id = "";
//         for (let i = 0, len = varsContainer.length; i < len; ++i) {
//             const container = varsContainer[i];
//             if (container instanceof SymbolRefShape) {
//                 if (id.length > 0) id += '/';
//                 id += container.id;
//             }
//         }
//         if (id.length > 0) {
//             return id + '/' + shape.id;
//         }
//     }
//     return shape.id;
// }

// export function findOverrideAndVar(
//     shape: Shape, // proxyed
//     overType: OverrideType,
//     varsContainer: (SymbolRefShape | SymbolShape)[]) {

//     const varbinds = shape.varbinds;
//     const varId = varbinds?.get(overType);
//     if (varId) {
//         const _vars: Variable[] = [];
//         findVar(varId, _vars, varsContainer);
//         if (_vars && _vars.length > 0) return _vars;
//     }

//     // find override
//     // id: xxx/xxx/xxx
//     const id = genid(shape, varsContainer);
//     const _vars = findOverride(id, overType, varsContainer);
//     return _vars;
// }

// export interface ComType {
//     new(ctx: VDomCtx, props: PropsType): VDom;
// }

// export class VDomCtx {
//     comsMap: Map<ShapeType, ComType> = new Map();
//     // 选区
//     // 缩放监听

//     // 先更新数据再绘制
//     datachangeset: Map<string, VDom> = new Map();
//     // 要由上往下更新
//     dirtyset: Map<string, VDom> = new Map();
// }

// export type VarsContainer = (SymbolRefShape | SymbolShape)[];

// export interface PropsType {
//     data: Shape;
//     transx?: RenderTransform;
//     varsContainer?: VarsContainer;
// }

// class Watchable {
//     public __watcher: Set<((...args: any[]) => void)> = new Set();

//     public watch(watcher: ((...args: any[]) => void)): (() => void) {
//         this.__watcher.add(watcher);
//         return () => {
//             this.__watcher.delete(watcher);
//         };
//     }
//     public unwatch(watcher: ((...args: any[]) => void)): boolean {
//         return this.__watcher.delete(watcher);
//     }
//     public notify(...args: any[]) {
//         if (this.__watcher.size === 0) return;
//         // 在set的foreach内部修改set会导致无限循环
//         Array.from(this.__watcher).forEach(w => {
//             w(...args);
//         });
//     }
// }

// export class VDom extends Watchable {
//     m_ctx: VDomCtx;
//     m_data: Shape;
//     m_el?: HTMLElement | SVGElement; // bind
//     m_children: VDom[] = [];
//     m_parent: VDom | undefined;
//     m_transx?: RenderTransform;
//     m_varsContainer?: (SymbolRefShape | SymbolShape)[];

//     // m_isdirty: boolean = false;
//     m_isdistroyed: boolean = false;

//     m_nodeCount: number = 1;

//     constructor(ctx: VDomCtx, props: PropsType) {
//         super();
//         this.m_ctx = ctx;
//         this.m_data = props.data;

//         this._datawatcher = this._datawatcher.bind(this);
//         // watch data & varsContainer
//         this.m_data.watch(this._datawatcher);
//         if (this.m_varsContainer) {
//             this.m_varsContainer.forEach((c) => c.watch(this._datawatcher));
//         }

//         // build childs
//         this.onCreate();
//         this.update(props, true);
//     }

//     private _datawatcher(...args: any[]) {
//         this.m_ctx.datachangeset.set(this.id(), this);
//         this.onDataChange(...args);
//         super.notify(...args);
//     }

//     onCreate() {

//     }

//     onDestory() {

//     }

//     onDataChange(...args: any[]) {

//     }

//     data() {
//         return this.m_data;
//     }

//     id() {
//         if (this.m_varsContainer) return genid(this.m_data, this.m_varsContainer);
//         return this.m_data.id;
//     }

//     // 1. 新创建，则正常创建，append
//     // 2. 运行期更新，
//     //    2.1 内部更新
//     //        2.1.1 仅更新dom内部
//     //        2.1.2 更换dom节点类型
//     //    2.2 外部更新
//     //        2.2.1 移动位置
//     // 3. 销毁

//     bind(node: HTMLElement /* old, for reuse */) { // 
//         // if same tag, modify
//         // else replace
//         if (this.m_el === node) return;
//         if (this.m_el) this.m_el.remove();
//         this.m_el = node;
//         this.m_ctx.dirtyset.set(this.id(), this);
//     }

//     unbind() {
//         if (this.m_el && this.m_el.parentNode) this.m_el.remove();
//     }

//     update(props: PropsType, force?: boolean) {
//     }

//     // 
//     render(): HTMLElement | SVGElement | undefined {
//         throw new Error('not implement');
//     }

//     addChild(child: VDom, idx?: number) {
//         if (child.m_parent) throw new Error('child already added');
//         if (idx !== undefined) {
//             this.m_children.splice(idx, 0, child);
//         }
//         else {
//             this.m_children.push(child);
//         }
//         child.m_parent = this;

//         this.m_nodeCount += child.m_nodeCount;
//         let p = this.m_parent;
//         while (p) {
//             p.m_nodeCount += child.m_nodeCount;
//             p = p.m_parent;
//         }
//     }

//     addChilds(childs: VDom[], idx?: number) {
//         // check
//         childs.forEach(c => {
//             if (c.m_parent) throw new Error('child already added');
//         })
//         if (idx !== undefined) {
//             this.m_children.splice(idx, 0, ...childs);
//         }
//         else {
//             this.m_children.push(...childs);
//         }
//         let nodeCount = 0;
//         childs.forEach(c => {
//             c.m_parent = this;
//             nodeCount += c.m_nodeCount;
//         })

//         this.m_nodeCount += nodeCount;
//         let p = this.m_parent;
//         while (p) {
//             p.m_nodeCount += nodeCount;
//             p = p.m_parent;
//         }
//     }

//     removeChild(idx: number) {
//         const dom = this.m_children.splice(idx, 1)[0];
//         if (dom) {
//             this.m_nodeCount -= dom.m_nodeCount;
//             let p = this.m_parent;
//             while (p) {
//                 p.m_nodeCount -= dom.m_nodeCount;
//                 p = p.m_parent;
//             }
//             dom.m_parent = undefined;
//         }
//         return dom;
//     }

//     moveChild(child: VDom, toIdx: number) {
//         if (child.m_parent !== this) {
//             throw new Error("child not in this parent");
//         }
//         if (toIdx < 0 || toIdx >= this.m_children.length) {
//             throw new Error("invalid index");
//         }
//         const fIdx = this.m_children.indexOf(child);
//         if (fIdx === toIdx) {
//             return;
//         }
//         if (fIdx < 0) {
//             throw new Error("child not in this parent");
//         }
//         this.m_children.splice(fIdx, 1);
//         this.m_children.splice(toIdx, 0, child);
//     }

//     removeChilds(idx: number, len: number) {
//         const dom = this.m_children.splice(idx, len);
//         if (dom) {
//             let nodeCount = 0;
//             dom.forEach(d => {
//                 d.m_parent = undefined;
//                 nodeCount += d.m_nodeCount;
//             });

//             this.m_nodeCount -= nodeCount;
//             let p = this.m_parent;
//             while (p) {
//                 p.m_nodeCount -= nodeCount;
//                 p = p.m_parent;
//             }
//         }
//         return dom;
//     }

//     toSVGString() {
//         const frame = this.m_data.frame;
//         const attrs: { [kye: string]: string | number } = {};
//         attrs['xmlns'] = "http://www.w3.org/2000/svg";
//         attrs['xmlns:xlink'] = "http://www.w3.org/1999/xlink";
//         attrs['xmlns:xhtml'] = "http://www.w3.org/1999/xhtml";
//         attrs['preserveAspectRatio'] = "xMinYMin meet";
//         attrs.width = frame.width;
//         attrs.height = frame.height;
//         attrs.viewBox = `${frame.x} ${frame.y} ${frame.width} ${frame.height}`;
//         attrs.overflow = "visible";
//         return stringh('svg', attrs, [this.m_el?.innerHTML || ""]);
//     }

//     destory() {
//         if (this.m_parent) throw new Error("parent is not null");
//         if (this.m_isdistroyed) throw new Error("already distroyed");
//         const tid = this.id();
//         this.m_ctx.datachangeset.delete(tid);
//         this.m_ctx.dirtyset.delete(tid);

//         if (this.m_el) {
//             this.m_el.remove();
//             this.m_el = undefined;
//         }
//         this.m_data.unwatch(this._datawatcher);
//         if (this.m_varsContainer) {
//             this.m_varsContainer.forEach((c) => c.unwatch(this._datawatcher));
//         }
//         this.m_children.forEach((c) => c.destory());
//         // --this.m_ctx.instanceCount;
//         // remove first?
//         this.onDestory();
//         this.m_isdistroyed = true;
//         // destroy childs
//         // destroy dom
//         // recycle?
//     }
// }

// export interface DomType extends ShapeView {
//     bind(node: HTMLElement /* old, for reuse */): void;
//     unbind(): void;
// }

type Constructor<T = Record<string, any>> = new (...args: any[]) => T;

export const DomBasic = <T extends Constructor>(SuperClass: T) =>
    class extends SuperClass {
        el?: HTMLElement | SVGElement; // 不要改名，path用到
        m_save_rrender: { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] } | undefined;

        bind(node: HTMLElement /* old, for reuse */) { // 
            if (this.el === node) return;
            if (this.el) this.el.remove();
            this.el = node;
        }

        unbind() {
            if (this.el && this.el.parentNode) {
                this.el.remove();
            }
            this.el = undefined;
        }

        render(): { tag: string, attr: { [key: string]: string }, childs: (ShapeView | EL)[] } | undefined {
            const rrsult = super.render();
            if (rrsult !== this.m_save_rrender || !this.el) {
                this.el = patch(this.el, rrsult, this.m_save_rrender);
                this.m_save_rrender = rrsult;
            }
            return rrsult;
        }
    }
