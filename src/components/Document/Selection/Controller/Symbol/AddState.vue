<script setup lang='ts'>
import {Context} from '@/context';
import {find_space_for_state, make_default_state, make_state, SymbolType} from '@/utils/symbol';
import {Matrix, Shape, ShapeView, SymbolShape} from '@kcdesign/data';
import {onMounted, onUnmounted, ref, watch} from 'vue';
import {useI18n} from 'vue-i18n';

interface Props {
    matrix: number[]
    context: Context
    shape: ShapeView
    symbolType: SymbolType
}

const props = defineProps<Props>();
const {t} = useI18n();
const matrix = new Matrix();
const transform = ref<string>('');

function update() {
    matrix.reset(props.matrix);
    transform.value = gen_add_button_transform();
}

function gen_add_button_transform() {
    const shape = props.shape;
    const frame = shape.frame;
    let center = {x: 0, y: 0};
    let last = 'translate(8px, -10px)';
    if (props.symbolType === SymbolType.Union) {
        center = matrix.computeCoord2(frame.width / 2, frame.height);
        last = 'translate(-10px, 8px)'
    } else if (props.symbolType === SymbolType.State) {
        center = matrix.computeCoord2(frame.width, frame.height / 2);
    }
    let mt = ''
    if (shape.isFlippedHorizontal) mt += 'rotateY(180deg) ';
    if (shape.isFlippedVertical) mt += 'rotateX(180deg) ';
    if (shape.rotation) mt += `rotate(${shape.rotation}deg)`;
    let t = `translate(${center.x}px, ${center.y}px) `;
    t += mt;
    t += last;
    return t;
}

function down(e: MouseEvent) {
    if (e.button !== 0) return;
    props.context.menu.menuMount();
    e.stopPropagation();
    let make_result: Shape | undefined;
    if (props.symbolType === SymbolType.Union) {
        make_default_state(props.context, t);
    } else if (props.symbolType === SymbolType.State) {
        const state = props.context.selection.symbolstate;
        if (!state) return;
        const symbol = state.parent as SymbolShape;
        if (!symbol) return;
        const result = find_space_for_state(symbol, state);
        make_result = make_state(props.context, t, result?.x);
        if (make_result) {
            const page = props.context.selection.selectedPage!;
            props.context.nextTick(page, () => {
                const s = make_result && page.getShape(make_result.id);
                props.context.selection.selectShape(s);
            })
        }
    }
}

watch(() => props.matrix, update);
watch(() => props.shape, (value, old) => {
    old.unwatch(update);
    value.watch(update);
    update();
})
onMounted(() => {
    props.shape.watch(update);
    update();
})
onUnmounted(() => {
    props.shape.unwatch(update);
})
</script>
<template>
    <g :style="{ transform }" @mousedown="down">
        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20">
            <rect x="0" y="0" rx="100" ry="100" width="1024" height="1024" fill="transparent" stroke="none"
                  class="rect">
            </rect>
            <path
                d="M856.3 128H167.7c-21.9 0-39.7 17.8-39.7 39.7v688.7c0 21.9 17.8 39.7 39.7 39.7h688.7c21.9 0 39.7-17.8 39.7-39.7V167.7c-0.1-21.9-17.9-39.7-39.8-39.7z m-10.9 717.4H178.6V178.6h666.8v666.8z"
                class="path">
            </path>
            <path
                d="M356.4 537.3h130.3v130.3c0 14 11.3 25.3 25.3 25.3s25.3-11.3 25.3-25.3V537.3h130.3c14 0 25.3-11.3 25.3-25.3s-11.3-25.3-25.3-25.3H537.3V356.4c0-14-11.3-25.3-25.3-25.3s-25.3 11.3-25.3 25.3v130.3H356.4c-14 0-25.3 11.3-25.3 25.3s11.3 25.3 25.3 25.3z"
                class="path ">
            </path>
        </svg>
    </g>
</template>
<style lang='scss' scoped>
.path {
    fill: var(--theme-color-anti);
}

.rect {
    fill: var(--component-color);
}
</style>