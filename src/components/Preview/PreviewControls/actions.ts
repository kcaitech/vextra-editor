import { Context } from "@/context";
import { Preview } from "@/context/preview";
import { getFrameList, viewBox } from "@/utils/preview";
import { ArtboradView, Matrix, PrototypeActions, PrototypeConnectionType, PrototypeEvents, PrototypeNavigationType, PrototypeTransitionType, ScrollDirection, sessionRefIdKey, ShapeType, ShapeView, SymbolRefView, SymbolShape, SymbolUnionShape, SymbolView, VariableType } from "@kcdesign/data";

export class ProtoAction {
    private m_context: Context
    private m_shapes: ShapeView[] = [];
    constructor(context: Context) {
        this.m_context = context;
    }

    executeActionx(action: PrototypeActions, matrix: Matrix, id?: string) {
        const page = this.m_context.selection.selectedPage;
        this.m_shapes = getFrameList(page!);
        if (action.connectionType === PrototypeConnectionType.INTERNALNODE && action.navigationType === PrototypeNavigationType.NAVIGATE) {
            this.actionSkipPage(action);
        } else if (action.connectionType === PrototypeConnectionType.URL) {
            if (action.connectionURL) {
                this.openUrl(action.connectionURL);
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
        }
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
                const frame = target_shape._p_frame;
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
    openUrl(str: string) {
        const url = getFullURL(str)
        let a = document.createElement("a");
        const id = "new_a";
        a.setAttribute("href", url);
        a.setAttribute("target", "_blank");
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
        let jsonString = sessionStorage.getItem(key);
        if (jsonString) {
            let refIdArray = JSON.parse(jsonString);
            return new Map(refIdArray);
        }
        return new Map();
    }
    saveMapRefIdLS(map: Map<string, string>, key: string) {
        let refIdArray = Array.from(map.entries());
        let jsonString = JSON.stringify(refIdArray);
        sessionStorage.setItem(key, jsonString);
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
    if(!shape) return;
    const protoActionFn = new ProtoAction(context);
    executeDelayActionShape(context, shape, protoActionFn, matrix);
}

function executeDelayActionShape(context: Context, shape: ShapeView, protoActionFn: ProtoAction, matrix: Matrix) {
    const actions = shape.prototypeInterActions;
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