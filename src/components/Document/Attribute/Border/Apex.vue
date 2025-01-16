<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue';
import { MarkerType, PathShapeView, ShapeType, ShapeView } from '@kcdesign/data';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { genOptions } from '@/utils/common';
import { Context } from '@/context';
import { hidden_selection } from '@/utils/content';
import { flattenShapes } from '@/utils/cutout';
import { get_actions_border_Apex, get_actions_border_endpoint, get_actions_border_exchange } from '@/utils/shape_style';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import SvgIcon from '@/components/common/SvgIcon.vue';
interface Props {
    context: Context
    shapes: ShapeView[]
    view: number
    trigger: any[]
    reflush_apex: number
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
    [MarkerType.Round, MarkerType.Round],
]);
const borderEndStyle = ref<SelectItem>({ value: MarkerType.Line, content: `end-${MarkerType.Line}` });
const borderEndStyleOptionsSource: SelectSource[] = genOptions([
    [MarkerType.Line, `end-${MarkerType.Line}`],
    [MarkerType.OpenArrow, `end-${MarkerType.OpenArrow}`],
    [MarkerType.FilledArrow, `end-${MarkerType.FilledArrow}`],
    [MarkerType.FilledCircle, `end-${MarkerType.FilledCircle}`],
    [MarkerType.FilledSquare, `end-${MarkerType.FilledSquare}`],
    [MarkerType.Square, `end-${MarkerType.Square}`],
    [MarkerType.Round, `end-${MarkerType.Round}`],
]);
const borderApexStyle = ref<SelectItem>({ value: MarkerType.Line, content: `end-${MarkerType.Line}` });
const borderApexStyleOptionsSource: SelectSource[] = genOptions([
    [MarkerType.Line, `end-${MarkerType.Line}`],
    [MarkerType.Square, `end-${MarkerType.Square}`],
    [MarkerType.Round, `end-${MarkerType.Round}`],
]);
const s_mixed = ref(false);
const e_mixed = ref(false);
const apex_mixed = ref(false);
function borderApexStyleSelect(selected: SelectItem) {
    const page = props.context.selection.selectedPage;
    const shapes = flattenShapes(props.shapes).filter(s => s.type !== ShapeType.Group);
    if (selected.content.startsWith('end')) {
        borderEndStyle.value = selected;
        if (shapes.length === 1) {
            const e = props.context.editor4Shape(shapes[0]);
            e.setMarkerType(selected.value as MarkerType, true);
        } else {
            const actions = get_actions_border_Apex(shapes, selected.value as MarkerType, true);
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesMarkerType(actions);
            }
        }
    } else {
        if (shapes.length === 1) {
            const e = props.context.editor4Shape(shapes[0]);
            e.setMarkerType(selected.value as MarkerType, false);
        } else {
            const actions = get_actions_border_Apex(shapes, selected.value as MarkerType, false);
            if (page) {
                const editor = props.context.editor4Page(page);
                editor.setShapesMarkerType(actions);
            }
        }
        borderFrontStyle.value = selected;
    }
    hidden_selection(props.context);
}

function apexStyleSelect(selected: SelectItem) {
    const page = props.context.selection.selectedPage;
    const shapes = flattenShapes(props.shapes).filter(s => s.type !== ShapeType.Group);
    const actions = get_actions_border_endpoint(shapes, selected.value as MarkerType);
    if (page) {
        const editor = props.context.editor4Page(page);
        editor.setShapesEndpoint(actions);
    }
    borderApexStyle.value = selected;
    hidden_selection(props.context);
}

const shaow_apex = ref(false);
function init_v() {
    const shapes = flattenShapes(props.context.selection.selectedShapes).filter(s => s.type !== ShapeType.Group);
    const len = shapes.length;
    s_mixed.value = false;
    e_mixed.value = false;
    shaow_apex.value = shapes.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));
    if (shaow_apex.value) {
        apexStyle();
        return;
    }
    if (len === 1) {
        const s = shapes[0];
        const sm = s.startMarkerType;
        const em = s.endMarkerType;
        borderFrontStyle.value = { value: sm || MarkerType.Line, content: sm || MarkerType.Line };
        borderEndStyle.value = { value: em || MarkerType.Line, content: `end-${em || MarkerType.Line}` };
    } else if (len > 1) {
        const s = shapes[0];
        const sm = s.startMarkerType;
        const em = s.endMarkerType;
        s_mixed.value = !(shapes.every(v => v.startMarkerType === sm));
        e_mixed.value = !(shapes.every(v => v.endMarkerType === em));
        if (!s_mixed.value) {
            borderFrontStyle.value = { value: sm || MarkerType.Line, content: sm || MarkerType.Line };
        } else {
            borderFrontStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        }
        if (!e_mixed.value) {
            borderEndStyle.value = { value: em || MarkerType.Line, content: `end-${em || MarkerType.Line}` };
        } else {
            borderEndStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        }
    }
}

const apexStyle = () => {
    const shapes = flattenShapes(props.context.selection.selectedShapes).filter(s => s.type !== ShapeType.Group);
    const len = shapes.length;
    shaow_apex.value = shapes.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));
    apex_mixed.value = false;
    if (len === 1) {
        const s = shapes[0];
        const sm = s.startMarkerType;
        const em = s.endMarkerType;
        const v = em !== sm ? `${t('attr.mixed')}` : (em === MarkerType.Round || em === MarkerType.Square || em === MarkerType.Line || !em) ? em : `${t('attr.mixed')}`;
        if (v === `${t('attr.mixed')}`) {
            apex_mixed.value = true;
            borderApexStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        } else {
            borderApexStyle.value = { value: v || MarkerType.Line, content: `end-${v || MarkerType.Line}` };
        }
    } else if (len > 1) {
        const s = shapes[0];
        const sm = s.startMarkerType;
        const em = s.endMarkerType;
        const start = !(shapes.every(v => v.startMarkerType === sm));
        const end = !(shapes.every(v => v.endMarkerType === em));
        if (start === end && sm === em) {
            const v = em === MarkerType.Round || em === MarkerType.Square || em === MarkerType.Line || !em ? em : `${t('attr.mixed')}`
            if (v === `${t('attr.mixed')}`) {
                apex_mixed.value = true;
                borderApexStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
            } else {
                borderApexStyle.value = { value: v || MarkerType.Line, content: `end-${v || MarkerType.Line}` };
            }
        } else {
            apex_mixed.value = true;
            borderApexStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        }
    }
}
function exchange() {
    const page = props.context.selection.selectedPage;
    const shapes = flattenShapes(props.shapes).filter(s => s.type !== ShapeType.Group);
    const len = shapes.length;
    if (len === 1) {
        const e = props.context.editor4Shape(shapes[0]);
        e.exchangeMarkerType();
        init_v();
    } else {
        const actions = get_actions_border_exchange(shapes);
        if (page) {
            const editor = props.context.editor4Page(page);
            editor.exchangeShapesMarkerType(actions);
        }
    }
}
const stop = watch(() => props.shapes, init_v);
const stop2 = watch(() => props.view, init_v);
const stop3 = watch(() => props.trigger, v => { // 监听选区图层变化
    if (v.length > 0 && (v.includes('style') || v.includes('variable') || v.includes('pathsegs'))) init_v();
});
const stop4 = watch(() => props.reflush_apex, () => {
    apexStyle();
})

onMounted(init_v);
onUnmounted(() => {
    stop();
    stop2();
    stop3();
    stop4();
});

import exchange_icon from '@/assets/icons/svg/exchange.svg';
</script>
<template>
    <div class="apex-select-wrap" v-if="!shaow_apex">
        <div class="select-wrap">
            <Select class="select" :source="borderFrontStyleOptionsSource" :selected="borderFrontStyle"
                @select="borderApexStyleSelect" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :mixed="s_mixed"></Select>
            <Select class="select" :selected="borderEndStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :source="borderEndStyleOptionsSource"
                @select="borderApexStyleSelect" :mixed="e_mixed"></Select>
        </div>

        <div class="change" @click="exchange">
            <SvgIcon :icon="exchange_icon"/>
        </div>
    </div>
    <div class="apex-select-wrap" v-if="shaow_apex">
        <div class="select-apex">
            <Select class="select" :selected="borderApexStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :source="borderApexStyleOptionsSource"
                @select="apexStyleSelect" :mixed="apex_mixed"></Select>
        </div>
        <div style="width: 28px; height: 28px;"></div>
    </div>
</template>
<style scoped lang="scss">
.apex-select-wrap {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    padding-top: 2px;
    padding-bottom: 6px;
    justify-content: space-between;
    gap: 6px;

    .select-wrap {
        display: flex;
        align-items: center;
        width: calc(100% - 59px);
        height: 100%;
        gap: 6px;
        margin-left: 19px;

        .select {
            flex: 0 0 50%;
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
        // margin-left: 4px;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .name {
        margin-left: 28px;
        width: 80px;
    }

    .select-apex {
        display: flex;
        align-items: center;
        flex: 1;
        height: 100%;
        margin-left: 19px;        
        box-sizing: border-box;

        .select {
            width: 87.5px;
            height: 32px;
        }
    }

    .change:hover {
        background-color: #F5F5F5;
    }
}
</style>