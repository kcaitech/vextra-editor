import { Context } from "@/context";
import { getFrameList } from "@/utils/preview";
import { PrototypeActions, PrototypeConnectionType, PrototypeNavigationType, PrototypeTransitionType, ShapeView } from "@kcdesign/data";

export class ProtoAction {
    private m_context: Context
    private m_shapes: ShapeView[] | []
    constructor(context: Context) {
        this.m_context = context;
        const page = this.m_context.selection.selectedPage;
        this.m_shapes = getFrameList(page!);
    }

    executeActionx(action: PrototypeActions) {
        if (action.connectionType === PrototypeConnectionType.INTERNALNODE && action.navigationType === PrototypeNavigationType.NAVIGATE) {
            this.actionSkipPage(action);
        } else if (action.connectionType === PrototypeConnectionType.URL) {
            if (action.connectionURL) {
                this.openUrl(action.connectionURL);
            }
        } else if (action.connectionType === PrototypeConnectionType.BACK) {
            this.actionBackPage();
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
        // 即时
        if (action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
            this.m_context.selection.selectShape(shape);
        }
    }

    // 返回上一级
    actionBackPage() {
        const action = this.m_context.preview.protoAction;
        if (action) {
            const shape = this.m_shapes.find(item => item.id === action.id);
            if (action.action.transitionType === PrototypeTransitionType.INSTANTTRANSITION) {
                this.m_context.selection.selectShape(shape);
            }
        }
    }

    // 容器内滚动
    artboardInScroll(action: PrototypeActions) {

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
    symbolStateSwitch() {

    }
    // 打开浮层
    openDialog() {

    }
    // 关闭浮层
    closeDialog() {

    }

    // 替换浮层
    replaceDialog() {

    }
    // 动画操作
    animation() {

    }
    // 动画即时
    animationAtOnce() {

    }
    // 动画淡入淡出
    animationFadeOutFadeIn() {

    }
    // 动画滑入
    animationSlipInto() {

    }
    // 动画滑出
    animationSlipOut() {

    }

    // 动画移入
    animationShiftInto() {

    }
    // 动画移出
    animationShiftOut() {

    }

    // 动画推入
    animationPushIn() {

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