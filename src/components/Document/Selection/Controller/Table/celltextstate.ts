import { Matrix, TableCellView } from "@kcdesign/data";
import { Context } from '@/context';
import { ref } from "vue";
import { useControllerCustom } from "../controller";
import { CursorType } from "@/utils/cursor2";

export function textState(props: {
    shape: TableCellView,
    matrix: number[],
    context: Context
}, i18nT: Function) {
    const editing = ref(false);
    const matrix = new Matrix();
    const ctrl = useControllerCustom(props.context, i18nT);
    const { isDblClick } = ctrl;
    let downIndex: { index: number, before: boolean };
    function onMouseDown(e: MouseEvent) {
        if (e.button === 0) {
            const workspace = props.context.workspace;
            props.context.menu.menuMount();
            if (!editing.value && isDblClick()) {
                if (props.context.navi.focusText) {
                    props.context.navi.set_focus_text();
                }
                editing.value = true;
                workspace.contentEdit(editing.value);
                props.context.cursor.setType(CursorType.Text, 0);
            }
            if (!editing.value) return;
            workspace.setCtrl('controller');
            const root = workspace.root
            matrix.reset(props.matrix);
            const xy = matrix.inverseCoord(e.clientX - root.x, e.clientY - root.y);
            downIndex = props.shape.locateText(xy.x, xy.y);
            e.stopPropagation();
            document.addEventListener("mousemove", onMouseMove);
            document.addEventListener("mouseup", onMouseUp);
        } else if (e.button === 2) {
            if (!(e.target as Element).closest('#text-selection')) {
                e.stopPropagation();
            }
        }
    }
    function be_editor() {
        const workspace = props.context.workspace;
        editing.value = true;
        workspace.contentEdit(editing.value);
        props.context.cursor.setType(CursorType.Text, 0);
    }
    function onMouseUp(e: MouseEvent) {
        e.stopPropagation();
        if (!editing.value) return;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        const selection = props.context.textSelection;
        const workspace = props.context.workspace;
        const { clientX, clientY } = e;
        const root = workspace.root;
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
        const locate = props.shape.locateText(xy.x, xy.y);
        if (downIndex.index === locate.index) {
            if (locate.placeholder) selection.setCursor(locate.index + 1, false);
            else selection.setCursor(locate.index, locate.before);
        }
        else {
            selection.selectText(downIndex.index, locate.index);
        }
        props.context.workspace.setCtrl('page');
    }

    function onMouseMove(e: MouseEvent) {
        e.stopPropagation();
        if (!editing.value) return;
        const workspace = props.context.workspace;
        const selection = props.context.textSelection;
        const { clientX, clientY } = e;
        const root = workspace.root;
        matrix.reset(props.matrix);
        const xy = matrix.inverseCoord(clientX - root.x, clientY - root.y);
        const locate = props.shape.locateText(xy.x, xy.y);
        if (downIndex.index === locate.index) {
            if (locate.placeholder) selection.setCursor(locate.index + 1, false);
            else selection.setCursor(locate.index, locate.before);
        }
        else {
            selection.selectText(downIndex.index, locate.index);
        }
    }
    function onMouseEnter() {
        if (editing.value) {
            props.context.cursor.setType(CursorType.Text, 0);
        }
    }
    function onMouseLeave() {
        props.context.cursor.reset();
    }

    function dispose() {
        ctrl.dispose();
    }

    ctrl.init();

    return {
        onMouseDown,
        onMouseEnter,
        onMouseLeave,
        dispose,
        props
    }
}

