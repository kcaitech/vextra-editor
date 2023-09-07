import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";
import { useI18n } from 'vue-i18n';

export function useControllerCustom(context: Context, i18nT: Function) {
    const workspace = computed(() => context.workspace);
    let timer: any;
    const duration: number = 250; // 双击判定时长 ms 
    let isDragging = false;
    let editing: boolean = false;

    function handleDblClick() {
        console.log('emit dbl');
    }
    function isMouseOnContent(e: MouseEvent): boolean {
        return (e.target as Element)?.closest(`#content`) ? true : false;
    }
    function mousedown(e: MouseEvent) {
        if (context.workspace.isPageDragging) return;
        if (isElement(e)) {
            if (timer) handleDblClick();
            initTimer();
        } else if (isMouseOnContent(e)) {
            const selection = context.selection;
            if (!selection.hoveredShape) selection.resetSelectShapes();
        }
    }

    function initController() {
        initTimer();
    }
    function initTimer() {
        clearTimeout(timer);
        timer = setTimeout(() => {
            clearTimeout(timer);
            timer = null;
        }, duration)
    }
    function timerClear() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    function isDblClick(): boolean {
        return timer ? true : false;
    }
    function isEditing() {
        return editing;
    }
    function isDrag() {
        return isDragging;
    }
    function isElement(e: MouseEvent): boolean {
        const root = context.workspace.root;
        return Boolean(context.selection.scout?.isPointInStroke(context.workspace.ctrlPath, { x: e.clientX - root.x, y: e.clientY - root.y }));
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context, i18nT);
    }
    function selection_watcher(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
            editing = false;
            context.workspace.contentEdit(false);
        }
    }
    function windowBlur() {
        workspace.value.setCtrl('page');
        timerClear();
        context.cursor.cursor_freeze(false);
    }
    function init() {
        context.selection.watch(selection_watcher);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        initController();
        context.workspace.contentEdit(false);
    }
    function dispose() {
        context.selection.unwatch(selection_watcher);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    }
    return { isDblClick, isEditing, isDrag, init, dispose };
}

export function useController(context: Context) {
    const { t } = useI18n();

    const ctrl = useControllerCustom(context, t);
    onMounted(() => {
        ctrl.init();
    })
    onUnmounted(() => {
        ctrl.dispose();
    })
    return ctrl;
}