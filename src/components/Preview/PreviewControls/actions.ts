import { initComsMap } from "@/components/Document/Content/vdom/comsmap";
import { DomCtx } from "@/components/Document/Content/vdom/domctx";
import { SymbolDom } from "@/components/Document/Content/vdom/symbol";
import { Context } from "@/context";
import { Preview } from "@/context/preview";
import { XYsBounding } from "@/utils/common";
import { getFrameList, getPreviewMatrix } from "@/utils/preview";
import { Matrix, PrototypeActions, PrototypeConnectionType, PrototypeNavigationType, PrototypeTransitionType, ShapeView, SymbolRefView, SymbolShape, SymbolUnionShape, SymbolView, VariableType } from "@kcdesign/data";

export class ProtoAction {
    private m_context: Context
    private m_shapes: ShapeView[] = [];
    constructor(context: Context) {
        this.m_context = context;
    }

    executeActionx(action: PrototypeActions, matrix: Matrix) {
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
            this.openDialog(action);
        } else if (action.connectionType === PrototypeConnectionType.CLOSE) {
            this.closeDialog();
        } else if (action.navigationType === PrototypeNavigationType.SWAP) {
            this.replaceDialog(action);
        } else if (action.navigationType === PrototypeNavigationType.SWAPSTATE) {
            this.symbolStateSwitch(action);
        }
    }
    // 跳转页面
    actionSkipPage(action: PrototypeActions) {
        const shapeId = action.targetNodeID;
        if (!shapeId) return;
        const shape = this.m_shapes.find(item => item.id === shapeId);
        const select_shape = this.m_context.selection.selectedShapes[0];
        if (!shape) return;
        this.m_context.preview.setFromShapeAction({ id: select_shape.id, action: action });
        if (!action.transitionType) return;
        const type = action.transitionType.split('_');
        const time = action.transitionDuration || 0.3;
        if (action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
            // 即时
            this.m_context.selection.selectShape(shape);
        } else if (type.includes('DISSOLVE') || (type.includes('MOVE') && type.includes('FROM'))) {
            // 溶解、移入
            this.m_context.preview.setInteractionAction(action);
            setTimeout(() => {
                this.m_context.selection.selectShape(shape);
            }, time * 1000);
        } else if (type.includes('SLIDE') || type.includes('PUSH') || type.includes('OUT')) {
            // 移出、滑入、滑出、推入
            this.m_context.preview.resetInteractionAction(action);
            setTimeout(() => {
                this.m_context.selection.selectShape(shape);
            }, time * 1000);
        }
    }

    // 返回上一级
    actionBackPage() {
        const action = this.m_context.preview.protoAction;
        if (action) {
            const shape = this.m_shapes.find(item => item.id === action.id);
            if (!action.action.transitionType) return;
            const type = action.action.transitionType.split('_');
            const time = action.action.transitionDuration || 0.3;
            if (action.action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
                this.m_context.selection.selectShape(shape);
            } else if (type.includes('DISSOLVE')) {
                this.m_context.preview.setInteractionAction(action.action, shape?.id);
                setTimeout(() => {
                    this.m_context.selection.selectShape(shape);
                }, time * 1000);
            } else {
                this.m_context.preview.resetInteractionAction(action.action, shape?.id);
                setTimeout(() => {
                    this.m_context.selection.selectShape(shape);
                }, time * 1000);
            }
        }
    }

    // 容器内滚动
    artboardInScroll(action: PrototypeActions, matrix: Matrix) {
        let artboard_shape: ShapeView | undefined;
        if (this.m_context.preview.supernatantIsOpen) {
            const page = this.m_context.selection.selectedPage;
            const shapes = getFrameList(page!);
            const end_action = this.m_context.preview.endAction;
            const shape = shapes.find(item => item.id === end_action.targetNodeID);
            artboard_shape = shape;
        } else {
            artboard_shape = this.m_context.selection.selectedShapes[0];
        }
        if (!artboard_shape || !artboard_shape.childs.length) return;
        const scrol_shape = artboard_shape.childs.find(item => item.id === action.targetNodeID);
        // const scrol_shape = artboard_shape.childs[0];
        if (scrol_shape) {
            const m = getPreviewMatrix(scrol_shape);
            m.multiAtLeft(matrix);
            const frame = scrol_shape.frame;
            const points = [
                m.computeCoord2(0, 0),
                m.computeCoord2(frame.width, 0),
                m.computeCoord2(frame.width, frame.height),
                m.computeCoord2(0, frame.height)
            ];
            const box = XYsBounding(points);
            const offsetx = box.left - (action.extraScrollOffset?.x || 0);
            const offsety = box.top - (action.extraScrollOffset?.y || 0);

            this.m_context.preview.setArtboardScroll({ x: offsetx, y: offsety }, action);
        }
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
    symbolStateSwitch(action: PrototypeActions) {
        const down_shape = this.m_context.selection.hoveredShape as SymbolRefView;
        if (!action.targetNodeID) return;
        const time = action.transitionDuration || 0.3;
        const maprefIdArray = this.getMapRefIdLS('symrefSwitchId');
        maprefIdArray.set(down_shape.id, action.targetNodeID);
        this.saveMapRefIdLS(maprefIdArray, 'symrefSwitchId');
        if (action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
            this.m_context.preview.notify(Preview.SWAP_REF_STAT);
        } else {
            this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH, action);
            setTimeout(() => {
                this.m_context.preview.notify(Preview.SWAP_REF_STAT);
                this.m_context.preview.notify(Preview.SYMBOL_REF_SWITCH);
            }, time * 1000);
        }
    }
    // 打开浮层
    openDialog(action: PrototypeActions) {
        this.m_context.preview.setInteractionAction(action);
    }
    // 关闭浮层
    closeDialog() {
        const endAction = this.m_context.preview.endAction;
        if (endAction.navigationType === PrototypeNavigationType.SWAP) {
            this.m_context.preview.deleteSwapEndAction();
        }
        this.m_context.preview.deleteEndAction();
    }

    // 替换浮层
    replaceDialog(action: PrototypeActions) {
        const end_action = this.m_context.preview.endAction;
        this.m_context.preview.setSwapAction(end_action);
        this.closeDialog();
        this.openDialog(action);
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