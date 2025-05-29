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
import { Context } from '@/context';
import { Text, VariableType } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import { onMounted, ref, watch } from 'vue';
import Select, { SelectItem, SelectSource } from '@/components/common/Select.vue';
import { genOptions } from '@/utils/common';

const { t } = useI18n();

interface Props {
    context: Context,
    addType: VariableType | undefined,
    default_value?: string | boolean | Text,
    dft_show?: boolean,
    warn?: boolean
}

interface Emits {
    (e: "select", index: number): void;

    (e: "change", value: string): void;

    (e: "input", value: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const textDefaultValue = ref(props.default_value as string || '');
const optionsSource: SelectSource[] = genOptions([
    ['显示', '显示'],
    ['隐藏', '隐藏'],
]);
const curVal = ref<SelectItem>(optionsSource[0].data);
const fixed = ref(false);

watch(() => props.default_value, (v) => {
    if (!fixed.value && typeof v === 'string') {
        textDefaultValue.value = v as string;
        emits("change", textDefaultValue.value);
    }
    if (!props.dft_show) {
        return;
    }

    if (v) {
        curVal.value = optionsSource[0].data;
    } else {
        curVal.value = optionsSource[1].data;
    }
}, { immediate: true })

const handleShow = (val: SelectItem) => {
    curVal.value = val;
    const idx = val.value === '显示' ? 0 : 1;
    emits('select', idx);
}

function change(v: string) {
    emits("change", v);
    input_v.value?.blur();
}

const input_v = ref();
const keysumbit = (e: KeyboardEvent) => {
    const { shiftKey, ctrlKey, metaKey } = e;
    if (e.key === 'Enter') {
        if (ctrlKey || metaKey || shiftKey) {
            input_v.value = input_v.value + '\n'
        } else {
            input_v.value.blur();
        }
    }
}

watch(() => props.warn, (v) => {
    if (v && input_v.value) {
        input_v.value.focus();
    }
})
const is_select = ref(false);
function click(e: Event) {
    const el = e.target as HTMLInputElement;
    if (el.selectionStart !== el.selectionEnd) {
        return;
    }
    if (is_select.value) return;
    el.select();
    is_select.value = true;
}
const get_text = () => {
    if (props.default_value && props.default_value instanceof Text) {
        textDefaultValue.value = props.default_value.getText(0, Infinity);
    }
}
onMounted(() => {
    if (props.addType === VariableType.Text) {
        get_text();
        emits("change", textDefaultValue.value);
    }
})
</script>

<template>
    <div class="container">
        <span style="color: #737373;">{{ t('compos.dltv') }}</span>
        <div v-if="props.addType === VariableType.Visible" class="show">
            <Select class="select" :source="optionsSource" :selected="curVal" @select="handleShow"></Select>
        </div>
        <div v-if="props.addType === VariableType.Text">
            <input ref="input_v" type="text" v-model="textDefaultValue" :placeholder="t('compos.default_text_input')"
                @keydown.stop="keysumbit" @change="change(textDefaultValue)" @input="fixed = true" @click="click" @blur="is_select = false" />
        </div>
    </div>
    <div class="warning" v-if="props.warn && props.addType === VariableType.Text && textDefaultValue.trim().length < 1">
        <p class="warn">{{ t('compos.validate_info_3') }}</p>
    </div>
</template>

<style scoped lang="scss">
.container {
    min-height: 30px;
    width: 100%;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    span {
        width: 60px;
    }

    >div {
        flex: 1;

        input {
            outline: none;
            border: none;
            border: 1px solid #F5F5F5;
            width: 100%;
            height: 32px;
            font-size: 12px;
            border-radius: 6px;
            padding: 7px 12px;
            background-color: #F5F5F5;
            box-sizing: border-box;

            &:hover {
                background-color: #EBEBEB;
            }

            &:focus {
                background-color: #F5F5F5 !important;
                border: 1px solid #1878F5;
            }
        }
    }
}

.warning {
    width: 100%;
    height: 25px;
    display: flex;
    align-items: center;
    box-sizing: border-box;

    .warn {
        font-size: 12px;
        padding: 0;
        color: red;
        margin: 3px;
        margin-left: 70px;
    }
}

.show {
    .select {
        width: 168px;
        height: 32px;

        :deep(.trigger) {
            padding: 0 12px;
        }
    }
}

:deep(.el-textarea__inner::-webkit-scrollbar) {
    width: 6px;
}

:deep(.el-textarea__inner::-webkit-scrollbar-thumb) {
    border-radius: 3px;
    -moz-border-radius: 3px;
    -webkit-border-radius: 3px;
    background-color: #c3c3c3;
}

:deep(.el-textarea__inner::-webkit-scrollbar-track) {
    background-color: transparent;
}
</style>