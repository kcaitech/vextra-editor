/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { ShapeDom } from "@/components/Document/Content/vdom/shape";
import { SymbolDom } from "@/components/Document/Content/vdom/symbol";
import { Context } from "@/context";
import { Preview } from "@/context/preview";
import { getFrameList, viewBox } from "@/utils/preview";
import {
    Color,
    EL,
    Fill,
    Matrix,
    PrototypeActions,
    PrototypeConnectionType,
    PrototypeEvents,
    PrototypeNavigationType,
    PrototypeTransitionType,
    ScrollDirection,
    sessionRefIdKey,
    ShapeType,
    ShapeView,
    SymbolRefView
} from '@kcdesign/data';
import { nextTick } from "vue";

export interface EventIndex {
    click: number,
    dblclick: number,
    mousedown: number,
    mouseup: number,
    mouseenter: number,
    hover: number
}

export class ProtoAction {
    private m_context: Context
    private m_shapes: ShapeView[] = [];
    private m_matrix: Matrix = new Matrix();

    constructor(context: Context) {
        this.m_context = context;
    }

    executeActionx(action: PrototypeActions, matrix: Matrix, id?: string) {
        const page = this.m_context.selection.selectedPage;
        this.m_matrix = matrix;
        this.m_shapes = getFrameList(page!);
        if (action.connectionType === PrototypeConnectionType.INTERNALNODE && action.navigationType === PrototypeNavigationType.NAVIGATE) {
            this.actionSkipPage(action);
        } else if (action.connectionType === PrototypeConnectionType.URL) {
            if (action.connectionURL) {
                this.openUrl(action.connectionURL, !!action.openUrlInNewTab);
            }
        } else if (action.connectionType === PrototypeConnectionType.BACK) {
            this.actionBackPage();
        } else if (action.connectionType === PrototypeConnectionType.INTERNALNODE && action.navigationType === PrototypeNavigationType.SCROLLTO) {
            this.artboardInScroll(action, matrix);
        } else if (action.navigationType === PrototypeNavigationType.OVERLAY) {
            this.openDialog(action, matrix);
        } else if (action.connectionType === PrototypeConnectionType.CLOSE) {
            this.closeDialog();
        } else if (action.navigationType === PrototypeNavigationType.SWAP) {
            this.replaceDialog(action, matrix);
        } else if (action.navigationType === PrototypeNavigationType.SWAPSTATE) {
            this.symbolStateSwitch(action);
        }
        if (id) this.m_context.preview.deleteDelaySetTimeout(id);
    }

    // 跳转页面
    actionSkipPage(action: PrototypeActions) {
        const shapeId = action.targetNodeID;
        if (!shapeId) return;
        const shape = this.m_shapes.find(item => item.id === shapeId);
        const select_shape = this.m_context.selection.selectedShapes[0];
        if (!shape || !select_shape) return;
        this.m_context.preview.setFromShapeAction({ id: select_shape.id, action: action });
        if (!action.transitionType) return;
        const type = action.transitionType.split('_');
        const time = action.transitionDuration ?? 0.3;
        if (action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
            // 即时
            this.m_context.selection.selectShape(shape);
        } else if (type.includes('DISSOLVE') || (type.includes('MOVE') && type.includes('FROM'))) {
            // 溶解、移入
            this.m_context.preview.setInteractionAction(action);
            const timer = setTimeout(() => {
                this.m_context.selection.selectShape(shape);
            }, time * 1000)
            this.m_context.preview.addSetTimeout(timer);
        } else if (type.includes('SLIDE') || type.includes('PUSH') || type.includes('OUT')) {
            // 移出、滑入、滑出、推入
            this.m_context.preview.resetInteractionAction(action);
            const timer = setTimeout(() => {
                this.m_context.selection.selectShape(shape);
            }, time * 1000);
            this.m_context.preview.addSetTimeout(timer);
        } else if (action.transitionType === PrototypeTransitionType.SMARTANIMATE) {
            // 智能动画
            const animate = this.smartAmimateTransition(action);
            const amimate_shape = this.m_context.preview.supernatantShapes[0] || select_shape;
            this.executeSmartShape(amimate_shape, shape, animate)
            const timer = setTimeout(() => {
                this.m_context.selection.selectShape(shape);
            }, time * 1000)
            this.m_context.preview.addSetTimeout(timer);
        }
    }
    getShapeAllChilds(shape: ShapeView) {
        function flattenShapes(shapes: ShapeView[]): ShapeView[] {
            return shapes.reduce((result: any[], item: ShapeView) => {
                result = result.concat(item);
                if (item.childs) {
                    const childs = (item).childs;
                    if (Array.isArray(childs)) {
                        result = result.concat(flattenShapes(childs));
                    }
                }
                return result;
            }, []);
        }
        return [shape, ...flattenShapes(shape.childs)];
    }

    executeSmartShape(exe_shape: ShapeView, shape: ShapeView, animate: string) {
        const processed = new Set();
        const exe_shapes = this.getShapeAllChilds(exe_shape);
        const shapes = this.getShapeAllChilds(shape);
        const nameMap: Map<string, ShapeView> = new Map();
        shapes.forEach(s => {
            if (!nameMap.has(s.name)) nameMap.set(s.name, s);
        });
        const exe_el = (exe_shape as ShapeDom).el;
        const scaleEl: Map<string, { x: number, y: number }> = new Map();
        let pm0 = 1; let pm3 = 1;
        exe_shapes.forEach(s => {
            const el = (s as ShapeDom).el;
            const _s = s.id === exe_shape.id ? shape : nameMap.get(s.name);
            if (_s && el) {
                // 需要执行的动画 大小，位置，颜色
                const frame = _s.boundingBox();
                const cur_frame = s.boundingBox();
                const m0 = frame.width / cur_frame.width;
                const m3 = frame.height / cur_frame.height;
                if (s.id === exe_shape.id) {// 最外层容器缩放大小
                    pm0 = m0; pm3 = m3;
                }
                el.style['transition'] = animate;
                const fills = _s.getFills();
                const colors = this.getColors(fills);
                const color = this.blendMultipleRGBA(colors);
                if (color) { // 颜色动画
                    const fillsEl = document.querySelectorAll(`.fill-${s.id.replace(/\//g, '-')}`);
                    fillsEl && fillsEl.forEach((element) => {
                        (element as any).style['transition'] = animate;
                        element.setAttribute('fill', "rgb(" + color.red + "," + color.green + "," + color.blue + ")")
                        element.setAttribute('fill-opacity', `${color.alpha}`);
                    });
                }
                const styleTransform = el.style.transform;
                if (styleTransform && styleTransform.startsWith('matrix')) {
                    const matrixValues = s.transform.toArray();
                    scaleEl.set(s.id, { x: m0, y: m3 });
                    if (s.id !== exe_shape.id) { // 不是最外层容器// 移动的位置
                        matrixValues[4] = frame.x;
                        matrixValues[5] = frame.y;
                        const scale = scaleEl.get(s.parent?.id || '');
                        if (scale) { // 抵消父级缩放
                            matrixValues[0] /= scale.x;
                            matrixValues[3] /= scale.y;
                            matrixValues[4] /= scale.x;
                            matrixValues[5] /= scale.y;
                        }
                    }
                    // 大小变化
                    matrixValues[0] *= m0;
                    matrixValues[3] *= m3;
                    const newMatrix = `matrix(${matrixValues.join(',')})`;
                    el.style.transform = newMatrix;
                }
                nameMap.delete(s.name);
            } else { // 需要执行的动画 透明度
                if (el) {
                    el.style['transition'] = animate;
                    el.style['opacity'] = '0'
                }
            }
            processed.add(s.name);
        })
        const p_box = viewBox(this.m_matrix, shape);
        shapes.forEach((item) => {
            const el = (item as ShapeDom).el;
            if (!processed.has(item.name) && item.id !== shape.id && el) { // 需要执行的动画 透明度
                const box = viewBox(this.m_matrix, item);
                const styleTransform = el.style.transform;
                el.style['opacity'] = '0'
                el.style['transition'] = '';
                if (styleTransform && styleTransform.startsWith('matrix')) {
                    const matrixValues = item.transform.toArray();
                    matrixValues[0] /= pm0;
                    matrixValues[3] /= pm3;
                    matrixValues[4] = (box.left - p_box.left) / this.m_matrix.m00;
                    matrixValues[5] = (box.top - p_box.top) / this.m_matrix.m00;
                    matrixValues[4] /= pm0;
                    matrixValues[5] /= pm3;
                    const newMatrix = `matrix(${matrixValues.join(',')})`;
                    el.style.transform = newMatrix;
                }
                el.style['transition'] = animate;
                exe_el?.appendChild(el as any)
                setTimeout(() => {
                    el.style['opacity'] = '1'; // 过渡到 完全不透明
                }, 0);
            }
        });
    }
    getColors(fills: Fill[]) {
        const colors = [];
        for (let index = fills.length - 1; index >= 0; index--) {
            const fill = fills[index];
            colors.push(fill.color);
            if (fill.color.alpha === 1) break;
        }
        return colors;
    }
    blendMultipleRGBA(colors: Color[]) {
        return colors.reduce((result: Color, color: Color) => {
            const { alpha: a1, red: r1, green: g1, blue: b1 } = result;
            const { alpha: a2, red: r2, green: g2, blue: b2 } = color;
            const resultAlpha = 1 - (1 - a1) * (1 - a2);
            const resultR = (r1 * a1 + r2 * a2 * (1 - a1)) / resultAlpha;
            const resultG = (g1 * a1 + g2 * a2 * (1 - a1)) / resultAlpha;
            const resultB = (b1 * a1 + b2 * a2 * (1 - a1)) / resultAlpha;
            return new Color(resultAlpha, resultR, resultG, resultB);
        }, new Color(0, 0, 0, 0))
    }

    // 返回上一级
    actionBackPage() {
        const action = this.m_context.preview.protoAction;
        if (action) {
            const shape = this.m_shapes.find(item => item.id === action.id);
            if (!action.action.transitionType || !shape) return;
            const type = action.action.transitionType.split('_');
            const time = action.action.transitionDuration ?? 0.3;
            if (action.action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
                this.m_context.selection.selectShape(shape);
            } else if (type.includes('DISSOLVE')) {
                this.m_context.preview.setInteractionAction(action.action, shape?.id);
                const timer = setTimeout(() => {
                    this.m_context.selection.selectShape(shape);
                }, time * 1000);
                this.m_context.preview.addSetTimeout(timer);
            } else if (action.action.transitionType === PrototypeTransitionType.SMARTANIMATE) {
                // 智能动画
                const select_shape = this.m_context.selection.selectedShapes[0];
                const animate = this.smartAmimateTransition(action.action);
                const amimate_shape = this.m_context.preview.supernatantShapes[0] || select_shape;
                this.executeSmartShape(amimate_shape, shape, animate)
                const timer = setTimeout(() => {
                    this.m_context.selection.selectShape(shape);
                }, time * 1000)
                this.m_context.preview.addSetTimeout(timer);
            } else {
                this.m_context.preview.resetInteractionAction(action.action, shape?.id);
                const timer = setTimeout(() => {
                    this.m_context.selection.selectShape(shape);
                }, time * 1000);
                this.m_context.preview.addSetTimeout(timer);
            }
        }
    }

    // 容器内滚动
    artboardInScroll(action: PrototypeActions, matrix: Matrix) {
        const page = this.m_context.selection.selectedPage;
        if (!page || !action.targetNodeID) return;
        const target_shape = page.getShape(action.targetNodeID);
        if (!target_shape) return;
        const scroll_shape = this.scrollParent(target_shape);
        if (scroll_shape) {
            if (scroll_shape.parent!.type === ShapeType.Page && scroll_shape.scrollDirection === ScrollDirection.NONE) {
                const box = viewBox(matrix, scroll_shape);
                const offsetx = box.left - (action.extraScrollOffset?.x || 0);
                const offsety = box.top - (action.extraScrollOffset?.y || 0);
                this.m_context.preview.setArtboardScroll({ x: offsetx, y: offsety }, action);
            } else {
                const frame = target_shape.relativeFrame;
                const offsetx = -frame.x + (action.extraScrollOffset?.x || 0);
                const offsety = -frame.y + (action.extraScrollOffset?.y || 0);
                this.m_context.preview.setArtboardScroll({ x: offsetx, y: offsety }, action, scroll_shape);
            }
        }
    }

    scrollParent(shape: ShapeView) {
        let p = shape.parent;
        while (p && p.type !== ShapeType.Artboard && p.type !== ShapeType.Page) {
            p = p.parent;
        }
        return p;
    }

    // 打开链接
    openUrl(str: string, newTab: boolean) {
        const url = getFullURL(str)
        let a = document.createElement("a");
        const id = "new_a";
        a.setAttribute("href", url);
        a.setAttribute("target", newTab ? "_blank" : "_self");
        a.setAttribute("id", id);
        // 防止反复添加      
        if (!document.getElementById(id)) {
            document.body.appendChild(a);
        }
        a.click();
        document.body.removeChild(a);
    }

    // 组件状态替换
    symbolStateSwitch(action: PrototypeActions, id?: string, shape?: ShapeView) {
        const down_shape = shape || this.m_context.selection.hoveredShape as SymbolRefView;
        if (!action.targetNodeID) return;
        const time = action.transitionDuration ?? 0.3;
        const maprefIdArray = this.getMapRefIdLS(sessionRefIdKey);
        maprefIdArray.set(down_shape.id, action.targetNodeID);
        this.saveMapRefIdLS(maprefIdArray, sessionRefIdKey);
        if (action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
            this.m_context.preview.notify(Preview.SWAP_REF_STAT);
            this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH);
        } else if (action.transitionType === PrototypeTransitionType.SMARTANIMATE) {
            // 智能动画
            const sym = this.m_context.data.symbolsMgr.get(action.targetNodeID);
            if (!sym) return;
            const domCtx = new DomCtx();
            initComsMap(domCtx.comsMap);
            const view = new SymbolDom(domCtx, { data: sym });
            view.layout();
            view.render();
            const animate = this.smartAmimateTransition(action);
            this.executeSmartShape(down_shape, view, animate)
            const timer = setTimeout(() => {
                this.m_context.preview.notify(Preview.SWAP_REF_STAT);
                this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH);
            }, time * 1000)
            this.m_context.preview.addSetTimeout(timer);
        } else {
            // 执行动画
            this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH, action, shape);
            const timer = setTimeout(() => {
                this.m_context.preview.notify(Preview.SWAP_REF_STAT);
                // 清除操作
                this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH);
            }, time * 1000);
            this.m_context.preview.addSetTimeout(timer);
        }
        if (id) this.m_context.preview.deleteDelaySetTimeout(id);
    }

    // 打开浮层
    openDialog(action: PrototypeActions, matrix: Matrix) {
        this.m_context.preview.setInteractionAction(action);
        delayAction(this.m_context, matrix);
    }

    // 关闭浮层
    closeDialog() {
        const endAction = this.m_context.preview.endAction;
        if (!endAction) return;
        if (endAction.navigationType === PrototypeNavigationType.SWAP) {
            this.m_context.preview.deleteSwapEndAction();
        }
        this.m_context.preview.deleteEndAction();
    }

    // 替换浮层
    replaceDialog(action: PrototypeActions, matrix: Matrix) {
        const end_action = this.m_context.preview.endAction;
        this.m_context.preview.setSwapAction(end_action);
        this.closeDialog();
        this.openDialog(action, matrix);
    }

    getMapRefIdLS(key: string): Map<string, string> {
        let jsonString = this.m_context.sessionStorage.get(key);
        if (jsonString) {
            let refIdArray = JSON.parse(jsonString);
            return new Map(refIdArray);
        }
        return new Map();
    }

    saveMapRefIdLS(map: Map<string, string>, key: string) {
        let refIdArray = Array.from(map.entries());
        let jsonString = JSON.stringify(refIdArray);
        this.m_context.sessionStorage.set(key, jsonString);
    }

    smartAmimateTransition(action: PrototypeActions) {
        const bezier = action.easingFunction ? [action.easingFunction.x1, action.easingFunction.y1, action.easingFunction.x2, action.easingFunction.y2] : [0, 0, 1, 1];
        const time = action.transitionDuration ?? 0.3;
        return `all ${time}s cubic-bezier(${bezier[0]}, ${bezier[1]}, ${bezier[2]}, ${bezier[3]}) 0s`;
    }
}

function getFullURL(str: string) {
    const pattern = new RegExp('^(https?:\\/\\/)?' +
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' +
        '((\\d{1,3}\\.){3}\\d{1,3}))' +
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
        '(\\?[;&a-z\\d%_.~+=-]*)?' +
        '(\\#[-a-z\\d_]*)?$', 'i');

    if (!pattern.test(str)) {
        return str;
    }

    if (!/^https?:\/\//i.test(str)) {
        str = 'http://' + str;
    }

    return str;
}

//延迟动作
export const delayAction = (context: Context, matrix: Matrix) => {
    let shape = context.selection.selectedShapes[0];
    const page = context.selection.selectedPage;
    const shapes = getFrameList(page!);
    const action = context.preview.endAction;
    if (action) {
        // 有浮层
        const s = shapes.find(item => item.id === action.targetNodeID);
        if (s) {
            shape = s;
        }
    }
    if (!shape) return;
    const protoActionFn = new ProtoAction(context);
    executeDelayActionShape(context, shape, protoActionFn, matrix);
}

function executeDelayActionShape(context: Context, shape: ShapeView, protoActionFn: ProtoAction, matrix: Matrix) {
    const actions = shape.prototypeInteractions;
    if (actions?.length) {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            if (action.event.interactionType === PrototypeEvents.AFTERTIMEOUT) {
                const time = action.event.transitionTimeout || 0.8;
                const timers = context.preview.delaySetTimeout;
                if (!timers.has(action.id)) {
                    const timer = setTimeout(() => {
                        if (action.actions.navigationType === PrototypeNavigationType.SWAPSTATE) {
                            protoActionFn.symbolStateSwitch(action.actions, action.id, shape);
                        } else {
                            protoActionFn.executeActionx(action.actions, matrix, action.id);
                        }
                    }, time * 1000);
                    context.preview.addDelaySetTimeout(action.id, timer);
                }
            }
        }
    }

    if (shape.type === ShapeType.Table) {
        return;
    }

    const children = shape.childs || [];
    if (!children.length) {
        return;
    } else {
        for (let i = 0; i < children.length; i++) {
            const item = children[i];
            executeDelayActionShape(context, item, protoActionFn, matrix);
        }
    }
}