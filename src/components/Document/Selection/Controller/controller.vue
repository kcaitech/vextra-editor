<script setup lang='ts'>
import { computed, onMounted, onUnmounted } from "vue";
import { Context } from "@/context";
import { Matrix } from '@kcdesign/data/basic/matrix';
import { ClientXY, PageXY } from "@/context/selection";
import { fourWayWheel, Wheel, forCtrlRect } from "@/utils/contentFn";
import { keyboardHandle as handle } from "@/utils/controllerFn";
import { Selection } from "@/context/selection";

export function useController(context: Context) {
    const workspace = computed(() => context.workspace);
    const matrix = new Matrix();
    const dragActiveDis = 3;
    let timer: any;
    const duration: number = 250; // 双击判定时长 ms
    let isDragging = false;
    let startPosition: ClientXY = { x: 0, y: 0 };
    let startPositionOnPage: PageXY = { x: 0, y: 0 };
    let root: ClientXY = { x: 0, y: 0 };
    let wheel: Wheel | undefined = undefined;

    function updater(t?: number) {
        if (t === Selection.CHANGE_SHAPE) { // 选中的图形发生改变，初始化控件
            initController();
        }
    }
    function preTodo(e: MouseEvent) { // 移动之前做的准备
        if (e.button === 0) { // 当前组件只处理左键事件，右键事件冒泡出去由父节点处理
            workspace.value.menuMount(false); // 取消右键事件
            root = context.workspace.root;
            wheel = fourWayWheel(context, { rolling: forCtrlRect });
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
        }
    }
    function handleDblClick() {
        timerClear();
    }
    function mousedown(e: MouseEvent) {
        matrix.reset(workspace.value.matrix);
        setPosition(e);
        if (timer) { // 双击预定时间还没过，再次mousedown，则判定为双击
            handleDblClick();
        }
        initTimer(); // 每次点击都应该开始预定下一次可以形成双击的点击
        preTodo(e);
    }

    function mousemove(e: MouseEvent) {
        if (e.button === 0) { //只处理鼠标左键按下时的移动
            const { clientX, clientY } = e;
            if (wheel) {
                wheel.moving(e);
            }
            const mousePosition: ClientXY = { x: clientX - root.x, y: clientY - root.y };
            if (isDragging) {
                workspace.value.translating(true); // 编辑器开始处于transforming状态 ---start transforming---
                context.selection.unHoverShape(); // 当编辑器处于transforming状态时, 此时的编辑器焦点为选中的图层, 应该取消被hover图层的hover状态, 同时不再给其他图层赋予hover状态
                startPosition = { ...mousePosition };
            } else {
                if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 是否开始移动的判定条件
                    isDragging = true;
                }
            }
        }
    }
    function mouseup(e: MouseEvent) {
        if (e.button === 0) { // 只处理鼠标左键按下时的抬起
            if (isDragging) {
                isDragging = false;
                workspace.value.translating(false); // 编辑器关闭transforming状态  ---end transforming---
            }
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            if (wheel) wheel = wheel.remove(); // 卸载滚轮
            if (workspace.value.isPreToTranslating) workspace.value.preToTranslating(); // 取消移动准备
        }
    }

    function checkStatus() { // 检查是否可以直接开始移动
        if (workspace.value.isPreToTranslating) { // 可以开始移动，该状态开启之后将跳过mousedown事件
            const start = workspace.value.startPoint;
            setPosition(start!);
            preTodo(start!);
        }
    }
    function setPosition(e: MouseEvent) {
        const { clientX, clientY } = e;
        matrix.reset(workspace.value.matrix);
        root = workspace.value.root;
        startPosition = { x: clientX - root.x, y: clientY - root.y };
        startPositionOnPage = matrix.inverseCoord(startPosition.x, startPosition.y);
    }
    function keyboardHandle(e: KeyboardEvent) {
        handle(e, context);
    }
    function initController() {
        initTimer(); // 控件生成之后立马开始进行双击预定，该预定将在duration(ms)之后取消
    }
    function initTimer() {
        clearTimeout(timer); // 先取消原有的预定
        timer = setTimeout(() => { // 设置新的预定
            clearTimeout(timer); // 取消预定
            timer = null;
        }, duration)
    }
    function timerClear() {
        if (timer) {
            clearTimeout(timer);
            timer = null;
        }
    }
    function windowBlur() {
        if (isDragging) { // 窗口失焦,此时鼠标事件(up,move)不再受系统管理, 此时需要手动关闭已开启的状态
            isDragging = false;
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
        }
        if (wheel) wheel = wheel.remove(); // 卸载滚轮
        timerClear();
    }
    function isDblClick() {
        return timer;
    }
    onMounted(() => {
        context.selection.watch(updater);
        window.addEventListener('blur', windowBlur);
        document.addEventListener('keydown', keyboardHandle);
        document.addEventListener('mousedown', mousedown);
        checkStatus();
        initController();
    })

    onUnmounted(() => {
        context.selection.unwatch(updater);
        window.removeEventListener('blur', windowBlur);
        document.removeEventListener('keydown', keyboardHandle);
        document.removeEventListener('mousedown', mousedown);
        timerClear();
    })

    return { isDblClick, startPosition, startPositionOnPage, isDragging }
}

</script>