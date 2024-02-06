<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue';
import { MarkerType, ShapeView } from '@kcdesign/data';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { genOptions } from '@/utils/common';
import { Context } from '@/context';
import { hidden_selection } from '@/utils/content';
interface Props {
    context: Context
    shapes: ShapeView[]
    view: number
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
    if (selected.content.startsWith('end')) {
        borderEndStyle.value = selected;
        if (props.shapes.length === 1) {
            const e = props.context.editor4Shape(props.shapes[0]);
            e.setMarkerType(selected.value as MarkerType, true);
        }
    } else {
        if (props.shapes.length === 1) {
            const e = props.context.editor4Shape(props.shapes[0]);
            e.setMarkerType(selected.value as MarkerType, false);
        }
        borderFrontStyle.value = selected;
    }
    hidden_selection(props.context);
}
function init_v() {
    const len = props.shapes.length;
    if (len === 1) {
        const s = props.shapes[0].style;
        const sm = s.startMarkerType;
        const em = s.endMarkerType;
        borderFrontStyle.value = { value: sm || MarkerType.Line, content: sm || MarkerType.Line };
        borderEndStyle.value = { value: em || MarkerType.Line, content: `end-${em || MarkerType.Line}` };
    }
}
function exchange() {
    const len = props.shapes.length;
    if (len === 1) {
        const e = props.context.editor4Shape(props.shapes[0]);
        e.exchangeMarkerType();
        init_v();
    }
}
const stop = watch(() => props.shapes, init_v);
const stop2 = watch(() => props.view, init_v);

onMounted(init_v);
onUnmounted(() => {
    stop();
    stop2();
});
</script>
<template>
    <div class="apex-select-wrap">
        <div class="select-wrap">
            <Select class="select" :source="borderFrontStyleOptionsSource" :selected="borderFrontStyle"
                @select="borderApexStyleSelect" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem"></Select>
            <Select class="select" :selected="borderEndStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :source="borderEndStyleOptionsSource"
                @select="borderApexStyleSelect"></Select>
        </div>

        <div class="change" @click="exchange">
            <svg-icon icon-class="exchange"></svg-icon>
        </div>
    </div>
</template>
<style scoped lang="scss">
.apex-select-wrap {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    padding: 6px 28px 6px 20px;
    align-items: center;
    //justify-content: space-between;

    .select-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 144px;
        height: 100%;

        .select {
            flex: 0 0 68px;
            height: 32px;
        }
    }

    .change {
        display: flex;
        width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: var(--default-radius);
        margin-left: 4px;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .change:hover {
        background-color: #F5F5F5;
    }
}
</style>