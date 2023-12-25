<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { AsyncTransfer, Matrix, Shape, SymbolShape } from "@kcdesign/data";
import { Context } from "@/context";
import { permIsEdit } from '@/utils/content';
import { ClientXY, PageXY } from '@/context/selection';
import { EffectType, Wheel, fourWayWheel } from '@/utils/wheel';
import { check_status, end_transalte, gen_offset_map, get_speed, migrate, migrate_immediate, modify_mouse_position_by_type, pre_translate } from '@/utils/controllerFn';
import { paster_short } from '@/utils/clipboard';
import { PointsOffset, distance2apex, gen_match_points } from '@/utils/assist';
import { Asssit } from '@/context/assist';
interface Props {
    name: string
    index: number
    maxWidth: number
    shape: Shape
    context: Context
}
interface Emits {
    (e: 'rename', value: string, shape: Shape): void
    (e: 'hover', shape: Shape): void
    (e: 'leave'): void
}
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const inputSpan = ref<HTMLSpanElement>()
const esc = ref<boolean>(false)
const inputWidth = ref(5)
const hover = ref(false)
let isDragging: boolean = false;
const reflush = ref<number>(0);
const watcher = (t: any) => { if (t !== 'shape-frame') reflush.value++; };
const onRename = () => {
    if (!permIsEdit(props.context) || props.context.tool.isLable) {
        return;
    }
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            if (inputSpan.value) {
                inputSpan.value.innerHTML = props.name
                inputWidth.value = inputSpan.value.offsetWidth + 6
            }
            (nameInput.value as HTMLInputElement).value = props.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value.addEventListener('blur', stopInput);
            nameInput.value.addEventListener('keydown', keySaveInput);
        }
    })
    document.addEventListener('click', onInputBlur)
}

const stopInput = () => {
    esc.value = false
    isInput.value = false
}

const keySaveInput = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
        esc.value = false
        isInput.value = false
    } else if (e.code === 'Escape') {
        esc.value = true
        isInput.value = false
    }
}

const onInputBlur = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.rename')) {
        const timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur();
            }
            clearTimeout(timer);
            document.removeEventListener('click', onInputBlur);
        }, 10)
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (inputSpan.value) {
        inputSpan.value.innerHTML = value;
        inputWidth.value = inputSpan.value.offsetWidth + 6;
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    if (esc.value) return;
    if (value.length === 0 || value.length > 40 || value.trim().length === 0) return;
    emit('rename', value, props.shape)
}

const hoverShape = () => {
    if (isDragging) return;
    if (props.context.workspace.isPageDragging) return;
    emit('hover', props.shape)
    hover.value = true
}

const unHoverShape = () => {
    if (isDragging) return;
    if (props.context.workspace.isPageDragging) return;
    emit('leave')
    hover.value = false;
}
// #region 组件标题拖动
let startPosition: ClientXY = { x: 0, y: 0 }; // 鼠标按下的点
let wheel: Wheel | undefined = undefined; // 滚轮，作用：当图形拖动到文档边缘可以继续向前拖动
// matrix_inverse 变换矩阵：在计算机图形处理中，一个齐次坐标与一个变换矩阵相乘可以得到另一个齐次坐标，这个变换矩阵的目的是把位于屏幕上的坐标映射到文档上。关于几何变换是一个需要较多精力去了解的内容
let matrix_inverse: Matrix = new Matrix();
let matrix: Matrix = new Matrix();
let asyncTransfer: AsyncTransfer | undefined; // 属性修改器：它负责图形的当前信息，工作内容类似 box.style.left = xx + 'px'...
const dragActiveDis = 3;
let speed: number = 0; // 记录鼠标移动的速度
let t_e: MouseEvent | undefined;
let shapes: Shape[] = [];
let offset_map: PointsOffset | undefined;
// 鼠标按下
function down(e: MouseEvent) {
    const context = props.context; // 组件通信中心，里面包含负责各种功能的通信模组
    if (context.workspace.isPageDragging) return;
    e.stopPropagation();
    if (isInput.value) return;
    if (!permIsEdit(context)) return; // 检查是否有权限编辑文档， 没有则return；
    if (!check_status(context)) return; // 检查当前文档状态是否可以编辑；
    if (e.button === 0) { // 只允许左键进行拖动
        context.selection.selectShape(props.shape); // 先将图形设为选中状态，只有被选中才可以被拖动
        let root = props.context.workspace.root;// 盒子的信息(wrap的信息)
        startPosition = { x: e.clientX - root.x, y: e.clientY - root.y }; // 记录鼠标按下的点相对wrap的相对位移
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    } else if (e.button === 2) { // 右键是打开菜单
        props.context.workspace.downArboardTitle(e);
    }
}
// 按下后移动
function move(e: MouseEvent) {
    if (e.buttons !== 1) return; // 注意，这里是buttons而不是button，通过mdn了解一下两者的区别
    let root = props.context.workspace.root;// 盒子的信息(wrap的信息)
    const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y }; // 记录鼠标的当前位置
    if (isDragging && wheel && asyncTransfer) { // 满足这三个条件才可以拖动一个图形
        // 在这个if分支里面，图形已经正在移动了，不用关注具体代码内容，需要知道这里时移动过程中需要做的事情，包括对齐、判断所处wrap、迁移        
        modify_speed(e); // 更新当前鼠标移动速度
        const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
        let update_type: number = 0;
        if (!isOut) update_type = transform_f(startPosition, mousePosition);
        modify_mouse_position_by_type(update_type, startPosition, mousePosition);
    } else if (Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) { // 注意：这里判断一个图形被拖动的条件是鼠标拖动的距离大于3px，目的在于与单击事件做区分
        // 在这个if分支里面，做的都是图形开始移动前的准备工作
        matrix.reset(props.context.workspace.matrix); // 更新变换矩阵，确保最新状态
        matrix_inverse = new Matrix(matrix.inverse); // matrix的逆矩阵
        // matrix_inverse.computeCoord(startPosition): 坐标转换，可以通过变换矩阵把鼠标在屏幕上的位置转到文档上的对应位置
        wheel = fourWayWheel(props.context, undefined, matrix_inverse.computeCoord3(startPosition)); // 以鼠标在文档上的坐标为锚点，安装滚轮
        const selection = props.context.selection; // selection, 是位于context中用于组件通信的一个模块，主要负责选区状态的通信；
        shapes = selection.selectedShapes;
        if (e.altKey) shapes = paster_short(props.context, shapes); // 图形分身
        asyncTransfer = props.context.editor.controller().asyncTransfer(shapes, selection.selectedPage!); // 创建属性编辑器
        pre_translate(props.context, shapes);
        isDragging = true;
        const map_anchor = matrix_inverse.computeCoord3(startPosition);
        offset_map = gen_offset_map(shapes[0], map_anchor);
    }
}
// 移动后抬起：不用细致关注干了什么，但是需要知道每次拖动一个图形都要用如下方法进行收尾
function up(e: MouseEvent) {
    if (e.button !== 0) return;
    if (isDragging) { // 关闭拖动状态
        end_transalte(props.context);
        isDragging = false;
    }
    if (asyncTransfer) { // 销毁编辑器
        migrate_immediate(props.context, asyncTransfer, shapes, shapes[0]);
        asyncTransfer = asyncTransfer.close();
    }
    if (wheel) wheel = wheel.remove(); // 卸载滚轮
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
// 以下代码不用过多关注，但需知道这段代码功能为在移动过程中使图形与其他图形进行对齐
function transform_f(start: ClientXY, end: ClientXY) {
    const ps: PageXY = matrix_inverse.computeCoord3(start);
    const pe: PageXY = matrix_inverse.computeCoord3(end);

    let update_type = 0;
    if (asyncTransfer) {
        update_type = trans(asyncTransfer, ps, pe);
        migrate(props.context, asyncTransfer, shapes, shapes[0]);
    }
    return update_type;
}
let pre_target_x: number, pre_target_y: number;
let stickedX: boolean = false;
let stickedY: boolean = false;
function trans(asyncTransfer: AsyncTransfer, ps: PageXY, pe: PageXY): number {
    const assist = props.context.assist;
    if (speed > 5) {
        asyncTransfer.trans(ps, pe);
        assist.notify(Asssit.CLEAR);
        return 3;
    }
    if (!offset_map) return 3;
    const compo = shapes[0];
    if (!compo) return 3;
    let need_multi = 0;
    let update_type = 3;
    const stick = { dx: 0, dy: 0, sticked_x: false, sticked_y: false };
    const stickness = assist.stickness;
    const target = assist.trans_match(offset_map, pe);
    if (!target) return update_type;
    if (stickedX) {
        if (Math.abs(pe.x - ps.x) >= stickness) stickedX = false;
        else {
            if (pre_target_x === target.x) {
                pe.x = ps.x, update_type -= 1, need_multi += 1;
            } else if (target.sticked_by_x) {
                modify_fix_x(target);
            }
        }
    } else if (target.sticked_by_x) {
        modify_fix_x(target);
    }
    if (stickedY) {
        if (Math.abs(pe.y - ps.y) >= stickness) stickedY = false;
        else {
            if (pre_target_y === target.y) {
                pe.y = ps.y, stick.dy = 0, update_type -= 2, need_multi += 2;
            } else if (target.sticked_by_y) {
                modify_fix_y(target);
            }
        }
    } else if (target.sticked_by_y) {
        modify_fix_y(target);
    }
    if (stick.sticked_x || stick.sticked_y) {
        asyncTransfer.stick(stick.dx, stick.dy);
    } else {
        asyncTransfer.trans(ps, pe);
    }
    if (need_multi) {
        assist.setCPG(gen_match_points(compo, true));
        assist.notify(Asssit.UPDATE_ASSIST, need_multi);
        assist.notify(Asssit.UPDATE_MAIN_LINE);
    }
    return update_type;
    function modify_fix_x(target: any) {
        pre_target_x = target.x;
        const distance = distance2apex(compo, target.alignX);
        const trans_x = target.x - distance;
        stick.dx = trans_x, stick.sticked_x = true, stick.dy = pe.y - ps.y;
        pe.x = ps.x + trans_x;
        const t = matrix.computeCoord3(pe);
        startPosition.x = t.x;
        update_type -= 1;
        stickedX = true;
        need_multi += 1;
    }
    function modify_fix_y(target: any) {
        pre_target_y = target.y;
        const distance = distance2apex(compo, target.alignY);
        const trans_y = target.y - distance;
        stick.dy = trans_y, stick.sticked_y = true;
        pe.y = ps.y + trans_y;
        if (!stick.sticked_x) stick.dx = pe.x - ps.x;
        const t = matrix.computeCoord3(pe);
        startPosition.y = t.y;
        update_type -= 2;
        stickedY = true;
        need_multi += 2;
    }
}
function modify_speed(e: MouseEvent) {
    speed = get_speed(t_e || e, e);
    t_e = e;
}
// #endregion
function move2(e: MouseEvent) {
    if (e.buttons === 0) e.stopPropagation();
}
function move3(e: MouseEvent) {
    if (e.buttons === 1) e.stopPropagation();
}
onMounted(() => {
    props.shape.watch(watcher);
})
onUnmounted(() => {
    props.shape.unwatch(watcher);
})
</script>

<template>
    <div :reflush="reflush" class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown="down"
        @mousemove="move2" data-area="controller">
        <div class="name-wrap" :style="{ maxWidth: props.maxWidth + 'px' }" @dblclick="onRename" v-if="!isInput">
            <!-- <svg width="306" height="306" viewBox="0 0 306 306" fill="none" xmlns="http://www.w3.org/2000/svg"
                v-if="(props.shape as SymbolShape).isSymbolUnionShape">
                <rect x="8.07106" y="153.895" width="90" height="90" transform="rotate(-45.0629 8.07106 153.895)"
                    fill="#7F58F9" stroke="#7F58F9" stroke-width="10" />
                <rect x="90.0054" y="71.7804" width="90" height="90" transform="rotate(-45.0629 90.0054 71.7804)"
                    fill="#7F58F9" stroke="#7F58F9" stroke-width="10" />
                <rect x="88.7697" y="234.416" width="90" height="90" transform="rotate(-45.0629 88.7697 234.416)"
                    fill="#7F58F9" stroke="#7F58F9" stroke-width="10" />
                <rect x="170.704" y="152.302" width="90" height="90" transform="rotate(-45.0629 170.704 152.302)"
                    fill="#7F58F9" stroke="#7F58F9" stroke-width="10" />
                <rect x="15" y="15" width="274" height="274" stroke="#7F58F9" stroke-width="30" stroke-dasharray="50 50" />
            </svg> -->
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
                width="16" height="16" viewBox="0 0 16 16" v-if="(props.shape as SymbolShape).isSymbolUnionShape">
                <defs>
                    <clipPath id="master_svg0_747_09671">
                        <rect x="0" y="0" width="16" height="16" rx="0" />
                    </clipPath>
                </defs>
                <g clip-path="url(#master_svg0_747_09671)">
                    <g>
                        <path
                            d="M15.1858,8Q15.1858,7.33726,14.7172,6.86863L9.13137,1.282843Q8.66274,0.814214,8,0.814214Q7.33726,0.814214,6.86863,1.282843L1.282843,6.86863Q0.814214,7.33726,0.814214,8Q0.814214,8.66274,1.282843,9.13137L6.86863,14.7172Q7.33726,15.1858,8,15.1858Q8.66274,15.1858,9.13137,14.7172L14.7172,9.13137Q15.1858,8.66274,15.1858,8ZM8.28284,2.13137L13.8686,7.71716Q14.1515,8,13.8686,8.28284L8.28284,13.8686Q8,14.1515,7.71716,13.8686L2.13137,8.28284Q2.0142100000000003,8.16569,2.0142100000000003,8Q2.0142100000000003,7.83431,2.13137,7.71716L7.71716,2.13137Q7.83431,2.0142100000000003,8,2.0142100000000003Q8.16569,2.0142100000000003,8.28284,2.13137Z"
                            fill-rule="evenodd" fill="#7F58F9" fill-opacity="1" />
                    </g>
                    <g
                        transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,4.538494595686643,-4.75560098247297)">
                        <rect x="8.009765625" y="3.10064697265625" width="3" height="3" rx="0.5" fill="#B7A4F3"
                            fill-opacity="1" />
                    </g>
                    <g
                        transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,5.693277989414128,-1.9677502472059132)">
                        <rect x="5.221923828125" y="5.888519287109375" width="3" height="3" rx="0.5" fill="#B7A4F3"
                            fill-opacity="1" />
                    </g>
                    <g
                        transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,7.306647318680916,-5.902135808926687)">
                        <rect x="10.77783203125" y="5.86883544921875" width="3" height="3" rx="0.5" fill="#B7A4F3"
                            fill-opacity="1" />
                    </g>
                    <g
                        transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,8.461502219544855,-3.1144577071481763)">
                        <rect x="7.990234375" y="8.656707763671875" width="3" height="3" rx="0.5" fill="#B7A4F3"
                            fill-opacity="1" />
                    </g>
                </g>
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="none" version="1.1"
                width="16" height="16" viewBox="0 0 16 16" v-else>
                <defs>
                    <clipPath id="master_svg0_747_6025">
                        <rect x="0" y="0" width="16" height="16" rx="0" />
                    </clipPath>
                </defs>
                <g clip-path="url(#master_svg0_747_6025)">
                    <g>
                        <path
                            d="M15.1858,8Q15.1858,7.33726,14.7172,6.86863L9.13137,1.282843Q8.66274,0.814214,8,0.814214Q7.33726,0.814214,6.86863,1.282843L1.282843,6.86863Q0.814214,7.33726,0.814214,8Q0.814214,8.66274,1.282843,9.13137L6.86863,14.7172Q7.33726,15.1858,8,15.1858Q8.66274,15.1858,9.13137,14.7172L14.7172,9.13137Q15.1858,8.66274,15.1858,8ZM8.28284,2.13137L13.8686,7.71716Q14.1515,8,13.8686,8.28284L8.28284,13.8686Q8,14.1515,7.71716,13.8686L2.13137,8.28284Q2.0142100000000003,8.16569,2.0142100000000003,8Q2.0142100000000003,7.83431,2.13137,7.71716L7.71716,2.13137Q7.83431,2.0142100000000003,8,2.0142100000000003Q8.16569,2.0142100000000003,8.28284,2.13137Z"
                            fill-rule="evenodd" fill="#7F58F9" fill-opacity="1" />
                    </g>
                    <g
                        transform="matrix(0.7071067690849304,0.7071067690849304,-0.7071067690849304,0.7071067690849304,4.540654637874468,-4.75025670389914)">
                        <rect x="8.00439453125" y="3.105926513671875" width="6.921310901641846" height="6.9352264404296875"
                            rx="0.5" fill="#B7A4F3" fill-opacity="1" />
                    </g>
                </g>
            </svg>
            <div class="content">
                {{ props.name }}
            </div>
        </div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
            ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName" @mousemove="move3">
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0; font-size: 10px;"
            ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    .name-wrap {
        display: flex;
        align-items: center;

        >svg {
            width: 16px;
            height: 16px;
            padding: 0 2px 0 0;
        }

        .content {
            width: calc(100% - 12px);
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
            padding-left: 2px;
            background-color: transparent;
            color: var(--component-color);
        }
    }

    .rename {
        height: 15px;
        outline-style: none;
        font-size: 10px;
        border: 1px solid var(--active-color);
        padding: 0 3px;
        margin-right: 1px;
        box-sizing: border-box;
    }
}
</style>