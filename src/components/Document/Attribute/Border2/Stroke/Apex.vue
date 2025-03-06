<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue';
import { MarkerType, PathShapeView } from '@kcdesign/data';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { genOptions } from '@/utils/common';
import { Context } from '@/context';
import { hidden_selection } from '@/utils/content';
import { get_actions_border_Apex, get_actions_border_endpoint, get_actions_border_exchange } from '@/utils/shape_style';
import { useI18n } from 'vue-i18n';

import SvgIcon from '@/components/common/SvgIcon.vue';
interface Props {
    context: Context
    manager: StrokeFillContextMgr
    trigger: any[]
}
const { t } = useI18n();
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
    if (selected.content.startsWith('end')) {
        props.manager.setShapesMarkerType(selected.value as MarkerType, true);
    } else {
        props.manager.setShapesMarkerType(selected.value as MarkerType, false);
    }
}

function apexStyleSelect(selected: SelectItem) {
    props.manager.setShapesEndpoint(selected.value as MarkerType);
}

const shaow_apex = ref(false);
function init_v() {
    const len = props.manager.flat.length;
    s_mixed.value = false;
    e_mixed.value = false;
    shaow_apex.value = props.manager.flat.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));
    if (shaow_apex.value) {
        apexStyle();
        return;
    }
    const shape = props.manager.flat[0];
    const sm = shape.startMarkerType;
    const em = shape.endMarkerType;
    if (len === 1) {
        borderFrontStyle.value = { value: sm || MarkerType.Line, content: sm || MarkerType.Line };
        borderEndStyle.value = { value: em || MarkerType.Line, content: `end-${em || MarkerType.Line}` };
    } else if (len > 1) {
        s_mixed.value = !(props.manager.flat.every(v => v.startMarkerType === sm));
        e_mixed.value = !(props.manager.flat.every(v => v.endMarkerType === em));
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
    const len = props.manager.flat.length;
    shaow_apex.value = props.manager.flat.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));
    apex_mixed.value = false;
    const shape = props.manager.flat[0];
    const sm = shape.startMarkerType;
    const em = shape.endMarkerType;
    if (len === 1) {
        const v = em !== sm ? `${t('attr.mixed')}` : (em === MarkerType.Round || em === MarkerType.Square || em === MarkerType.Line || !em) ? em : `${t('attr.mixed')}`;
        if (v === `${t('attr.mixed')}`) {
            apex_mixed.value = true;
            borderApexStyle.value = { value: `${t('attr.mixed')}`, content: `${t('attr.mixed')}` };
        } else {
            borderApexStyle.value = { value: v || MarkerType.Line, content: `end-${v || MarkerType.Line}` };
        }
    } else if (len > 1) {
        const start = !(props.manager.flat.every(v => v.startMarkerType === sm));
        const end = !(props.manager.flat.every(v => v.endMarkerType === em));
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
    props.manager.exchangeShapesMarkerType();
}

const watchList: any[] = [
    watch(() => props.trigger, (v) => {
        if (v?.includes('borders') || v?.includes('variables') || v?.includes('endMarkerType') || v?.includes('startMarkerType')) {
            init_v();
        }
    })
];


onMounted(init_v);
onUnmounted(() => {
    watchList.forEach(stop => stop());
});

import exchange_icon from '@/assets/icons/svg/exchange.svg';
import { StrokeFillContextMgr } from '../ctx';
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
            <SvgIcon :icon="exchange_icon" />
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
    justify-content: space-between;
    gap: 8px;

    .select-wrap {
        display: flex;
        align-items: center;
        width: calc(100% - 19px);
        height: 100%;
        gap: 6px;

        .select {
            flex: 1 1 calc(50% - 20px);
            height: 32px;
        }
    }

    .change {
        display: flex;
        min-width: 28px;
        height: 28px;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: var(--default-radius);
        // margin-left: 4px;

        >img {
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