/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import BorderApexStyleItem from './BorderApexStyleItem.vue';
import BorderApexStyleSelectedItem from './BorderApexStyleSelectedItem.vue';
import { MarkerType, PathShapeView } from '@kcaitech/vextra-core';
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { genOptions } from '@/utils/common';
import { Context } from '@/context';
import { useI18n } from 'vue-i18n';
import exchange_icon from '@/assets/icons/svg/exchange.svg';
import { StrokeFillContextMgr } from '../ctx';

import SvgIcon from '@/components/common/SvgIcon.vue';
import { Selection } from "@/context/selection";
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

const show_apex = ref(false);
function init_v() {
    const len = props.manager.flat.length;
    s_mixed.value = false;
    e_mixed.value = false;
    show_apex.value = props.manager.flat.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));

    if (!len) return;
    if (show_apex.value) return apexStyle();

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
    show_apex.value = props.manager.flat.every(v => ((v instanceof PathShapeView) && v.segments.length > 1));
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
    }),
    props.context.selection.watch((t: any) => {
        if (t === Selection.CHANGE_SHAPE) init_v();
    })
];


onMounted(init_v);
onUnmounted(() => {
    watchList.forEach(stop => stop());
});
</script>
<template>
    <div v-if="!show_apex" class="apex-select-wrap">
        <div class="select-wrap">
            <Select class="select" :source="borderFrontStyleOptionsSource" :selected="borderFrontStyle"
                @select="borderApexStyleSelect" :item-view="BorderApexStyleItem"
                    :value-view="BorderApexStyleSelectedItem" :mixed="s_mixed"/>
            <Select class="select" :selected="borderEndStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :source="borderEndStyleOptionsSource"
                    @select="borderApexStyleSelect" :mixed="e_mixed"/>
        </div>

        <div class="change" @click="exchange">
            <SvgIcon :icon="exchange_icon" />
        </div>
    </div>
    <div v-if="show_apex" class="apex-select-wrap">
        <div class="select-apex">
            <Select class="select" :selected="borderApexStyle" :item-view="BorderApexStyleItem"
                :value-view="BorderApexStyleSelectedItem" :source="borderApexStyleOptionsSource"
                    @select="apexStyleSelect" :mixed="apex_mixed"/>
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