<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { AsyncTransfer, Matrix, Shape, ShapeView, adapt2Shape } from "@kcdesign/data";
import { Context } from "@/context";
import { ClientXY, PageXY } from '@/context/selection';
import { EffectType, Wheel, fourWayWheel } from '@/utils/wheel';
import { PointsOffset, distance2apex, gen_match_points } from '@/utils/assist';
import { permIsEdit } from '@/utils/content';
import {
    check_status,
    end_transalte,
    gen_offset_map,
    get_speed,
    migrate,
    migrate_immediate,
    modify_mouse_position_by_type,
    pre_translate
} from '@/utils/controllerFn';
import { paster_short } from '@/utils/clipboard';
import { Asssit } from '@/context/assist';
import { Perm } from '@/context/workspace';
import { forbidden_to_modify_frame } from '@/utils/common';

const props = defineProps<{
    name: string,
    index: number,
    maxWidth: number,
    shape: ShapeView,
    selected: boolean,
    context: Context
}>()
const emit = defineEmits<{
    (e: 'rename', value: string, shape: ShapeView): void
    (e: 'hover', shape: ShapeView): void
    (e: 'leave'): void
}>()
const isInput = ref<boolean>(false)
const nameInput = ref<HTMLInputElement | null>(null)
const inputSpan = ref<HTMLSpanElement>()
const esc = ref<boolean>(false)
const inputWidth = ref(5)
const hover = ref(false)
let isDragging: boolean = false;

const onRename = () => {
    if (!permIsEdit(props.context) || props.context.tool.isLable) {
        return;
    }
    isInput.value = true
    nextTick(() => {
        if (nameInput.value) {
            if (inputSpan.value) {
                inputSpan.value.innerHTML = props.name
                inputWidth.value = inputSpan.value.offsetWidth + 2
            }
            (nameInput.value as HTMLInputElement).value = props.name.trim();
            nameInput.value.focus();
            nameInput.value.select();
            nameInput.value?.addEventListener('blur', stopInput);
            nameInput.value?.addEventListener('keydown', keySaveInput);
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
        var timer = setTimeout(() => {
            if (nameInput.value) {
                (nameInput.value).blur()
            }
            clearTimeout(timer)
            document.removeEventListener('click', onInputBlur);
        }, 10)
    }
}

const onInputName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (inputSpan.value) {
        inputSpan.value.innerHTML = value
        inputWidth.value = inputSpan.value.offsetWidth + 2
    }
}

const ChangeReName = (e: Event) => {
    const value = (e.target as HTMLInputElement).value
    if (esc.value) return
    if (value.length === 0 || value.trim().length === 0) return
    emit('rename', value, props.shape)
}

const hoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('hover', props.shape)
    hover.value = true
}

const unHoverShape = (e: MouseEvent) => {
    if (isDragging) return;
    emit('leave')
    hover.value = false
}
let startPosition: ClientXY = { x: 0, y: 0 };
let wheel: Wheel | undefined = undefined;
let matrix_inverse: Matrix = new Matrix();
let matrix: Matrix = new Matrix();
let asyncTransfer: AsyncTransfer | undefined;
const dragActiveDis = 3;
let speed: number = 0;
let t_e: MouseEvent | undefined;
let shapes: ShapeView[] = [];
let offset_map: PointsOffset | undefined;

function down(e: MouseEvent) {
    const context = props.context;
    if ((context.workspace.documentPerm !== Perm.isEdit)) {
        return;
    }
    if (!check_status(context)) {
        return;
    }
    if (e.button === 0) {
        context.selection.selectShape(props.shape);
        let root = props.context.workspace.root;
        startPosition = { x: e.clientX - root.x, y: e.clientY - root.y };
        if(forbidden_to_modify_frame(props.shape) || context.tool.isLable) return;
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
    } else if (e.button === 2) {
        props.context.workspace.downArboardTitle(e);
    }
}

function move(e: MouseEvent) {
    if (e.buttons !== 1) return;
    let root = props.context.workspace.root;
    const mousePosition: ClientXY = { x: e.clientX - root.x, y: e.clientY - root.y };
    if (isDragging && wheel && asyncTransfer) {
        modify_speed(e);
        // const isOut = wheel.moving(e, { type: EffectType.TRANS, effect: asyncTransfer.transByWheel });
        let update_type: number = 0;
        // if (!isOut) update_type = transform_f(startPosition, mousePosition);
        update_type = transform_f(startPosition, mousePosition);
        modify_mouse_position_by_type(update_type, startPosition, mousePosition);
    } else if (!isDragging && Math.hypot(mousePosition.x - startPosition.x, mousePosition.y - startPosition.y) > dragActiveDis) {
        matrix.reset(props.context.workspace.matrix);
        matrix_inverse = new Matrix(matrix.inverse);
        wheel = fourWayWheel(props.context, undefined, matrix_inverse.computeCoord3(startPosition));
        const selection = props.context.selection;
        shapes = selection.selectedShapes;

        isDragging = true;

        asyncTransfer = props.context.editor.controller().asyncTransfer(shapes.map((s) => adapt2Shape(s)), selection.selectedPage!);
        const action = (shapes: ShapeView[]) => {
            pre_translate(props.context, shapes);
            const map_anchor = matrix_inverse.computeCoord3(startPosition);
            offset_map = shapes[0] && gen_offset_map(shapes[0], map_anchor);
        }

        if (e.altKey) {
            paster_short(props.context, shapes, asyncTransfer).then((val) => {
                shapes = val;
                action(shapes);
            }).catch((e) => {
                console.log(e);
                isDragging = false;
            });
        }
        else {
            action(shapes);
        }
    }
}
function up(e: MouseEvent) {
    if (e.button !== 0) return;
    if (isDragging) {
        end_transalte(props.context);
        isDragging = false;
    }
    if (asyncTransfer) {
        migrate_immediate(props.context, asyncTransfer, shapes, shapes[0]);
        asyncTransfer = asyncTransfer.close();
    }
    if (wheel) wheel = wheel.remove(); // 卸载滚轮
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', up);
}
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
function move2(e: MouseEvent) {
    if (e.buttons === 0) e.stopPropagation();
}
</script>

<template>
    <div class="container-name" @mouseenter="hoverShape" @mouseleave="unHoverShape" @mousedown.stop="down"
        @mousemove="move2" data-area="controller">
        <div v-if="!isInput" class="name" :class="{ selected, active: hover }" :style="{ maxWidth: props.maxWidth + 'px' }"
            @dblclick="onRename">{{ props.name }}
        </div>
        <input v-if="isInput" type="text" :style="{ maxWidth: props.maxWidth + 'px', width: inputWidth + 'px' }"
            ref="nameInput" class="rename" @input="onInputName" @change="ChangeReName">
        <span v-if="isInput" style="position: absolute; visibility: hidden; top: 0px;" ref="inputSpan"></span>
    </div>
</template>

<style scoped lang="scss">
.container-name {
    .name {
        width: 100%;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        padding-left: 2px;
        background-color: transparent;
        color: #bbb;
    }

    .rename {
        outline-style: none;
        font-size: var(--font-default-fontsize);
        border: 1px solid var(--active-color);
        padding: 0 1px;
        margin-right: 1px;
        box-sizing: border-box;
    }

    .selected {
        color: var(--active-color);
    }

    .active {
        color: var(--active-color);
    }
}
</style>