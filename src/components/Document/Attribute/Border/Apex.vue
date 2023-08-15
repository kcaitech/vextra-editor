<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue';
import { MarkerType, Shape } from '@kcdesign/data';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { genOptions } from '@/utils/common';
import { WorkSpace } from '@/context/workspace';
import { Context } from '@/context';
interface Props {
    context: Context
    shapes: Shape[]
}
const props = defineProps<Props>();
const borderFrontStyle = ref<SelectItem>({ value: MarkerType.Line, content: MarkerType.Line });
const borderFrontStyleOptionsSource: SelectSource[] = genOptions([
    [MarkerType.Line, MarkerType.Line],
    [MarkerType.OpenArrow, MarkerType.OpenArrow],
    [MarkerType.FilledArrow, MarkerType.FilledArrow],
    [MarkerType.FilledCircle, MarkerType.FilledCircle],
    [MarkerType.FilledSquare, MarkerType.FilledSquare],
    [MarkerType.Square, MarkerType.Square],
    [MarkerType.Round, MarkerType.Round]
]);
const borderEndStyle = ref<SelectItem>({ value: MarkerType.Line, content: `end-${MarkerType.Line}` });
const borderEndStyleOptionsSource: SelectSource[] = genOptions([
    [MarkerType.Line, `end-${MarkerType.Line}`],
    [MarkerType.OpenArrow, `end-${MarkerType.OpenArrow}`],
    [MarkerType.FilledArrow, `end-${MarkerType.FilledArrow}`],
    [MarkerType.FilledCircle, `end-${MarkerType.FilledCircle}`],
    [MarkerType.FilledSquare, `end-${MarkerType.FilledSquare}`],
    [MarkerType.Square, `end-${MarkerType.Square}`],
    [MarkerType.Round, `end-${MarkerType.Round}`]
]);
function borderApexStyleSelect(selected: SelectItem) {
    props.context.workspace.notify(WorkSpace.CTRL_DISAPPEAR);
    if (selected.content.startsWith('end')) {
        borderEndStyle.value = selected;
        if (props.shapes.length === 1) {
            const e = props.context.editor.editor4Shape(props.shapes[0]);
            e.setMarkerType(selected.value as MarkerType, true);
        }
    } else {
        if (props.shapes.length === 1) {
            const e = props.context.editor.editor4Shape(props.shapes[0]);
            e.setMarkerType(selected.value as MarkerType, false);
        }
        borderFrontStyle.value = selected;
    }
    props.context.workspace.notify(WorkSpace.CTRL_APPEAR);
}
function init_v() {
    const len = props.shapes.length;
    if (len === 1) {
        const s = props.shapes[0].style;
        const sm = s.startMarkerType, em = s.endMarkerType;
        borderFrontStyle.value = { value: sm || MarkerType.Line, content: sm || MarkerType.Line };
        borderEndStyle.value = { value: em || MarkerType.Line, content: `end-${em || MarkerType.Line}` };
    }
}
function exchange() {
    const len = props.shapes.length;
    if (len === 1) {
        const e = props.context.editor.editor4Shape(props.shapes[0]);
        e.exchangeMarkerType();
        init_v();
    }
}
const stop = watch(() => props.shapes, init_v);
onMounted(init_v);
onUnmounted(stop);
</script>
<template>
    <div class="wrap">
        <div class="apex-select-wrap">
            <Select style="z-index: 100;" :selected="borderFrontStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :item-height="30" :source="borderFrontStyleOptionsSource"
                @select="borderApexStyleSelect"></Select>
            <div class="change" @click="exchange">
                <svg-icon icon-class="exchange"></svg-icon>
            </div>
            <Select style="z-index: 100;" :selected="borderEndStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :item-height="30" :source="borderEndStyleOptionsSource"
                @select="borderApexStyleSelect"></Select>
        </div>

    </div>
</template>
<style scoped lang="scss">
.wrap {
    width: 100%;
    margin: 8px 0px;
    margin-left: 23px;
    box-sizing: border-box;
    display: flex;

    .apex-select-wrap {
        width: 175.5px;
        display: flex;

        .change {
            width: 40px;
            height: var(--default-input-height);
            display: flex;
            align-items: center;
            cursor: pointer;

            >svg {
                width: 100%;
                height: 100%;
            }
        }
    }
}
</style>