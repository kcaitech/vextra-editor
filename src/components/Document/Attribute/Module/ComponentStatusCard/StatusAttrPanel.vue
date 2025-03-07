<script lang="ts" setup>
import { Context } from "@/context";
import PopoverHeader from "@/components/common/PopoverHeader.vue";
import { useI18n } from "vue-i18n";
import { Variable } from "@kcdesign/data";
import { AttriListItem } from "@/utils/symbol";

const props = defineProps<{ context: Context, variable: Variable, item: AttriListItem }>();
const emits = defineEmits<{ (e: "close"): void; }>();
const { t } = useI18n()

function blur(event: KeyboardEvent | FocusEvent) {
    const e = (event.target as HTMLInputElement);
    if (event instanceof KeyboardEvent && event.key === 'Enter') {
        e.blur();
        e.style.border = "none";
    } else if (event instanceof FocusEvent) {
        e.blur();
        e.style.border = "none";
    }
}

function selectAllText(event: FocusEvent) {
    const e = (event.target as HTMLInputElement);
    e.select(); // 选择输入框内的文本
    e.style.border = "1px solid #1878F5";
}

function modifyName(event: Event) {
    const e = (event.target as HTMLInputElement);
    const value = e.value;
    const shape = props.context.selection.symbolshape;
    if (!shape) return;
    const editor = props.context.editor4Shape(shape);
    editor.modifyVariableName(props.variable, value);
    e.style.border = "none";
}

function modifyStateValue(event: Event, index: number) {
    const e = (event.target as HTMLInputElement);
    const value = e.value;
    const shape = props.context.selection.symbolshape;
    if (!shape) return;
    const item = shape.childs[index];
    const editor = props.context.editor4Shape(item);
    editor.modifyStateSymTagValue(props.variable.id, value);
    e.style.border = "none";

}
</script>
<template>
    <div id="symbol-state-attr-panel" class="symbol-state-attr-panel">
        <PopoverHeader :title="t('compos.comp_state_attr')" :create="false" @close="emits('close')" />
        <div class="scroll">
            <div class="attr_name">
                <div class="title">{{ t('compos.attr_name') }}</div>
                <div class="input-box">
                    <input type="text" :value="variable.name" @focus="selectAllText" @change="modifyName"
                        @keydown="blur" @blur="blur">
                </div>
            </div>
            <div class="state_value">
                <div class="title">{{ t('compos.state_value') }}</div>
                <div class="input-box" v-for="(v, index) in item.values" :key="index">
                    <input type="text" :value="v" @focus="selectAllText" @change="(e) => modifyStateValue(e, index)"
                        @keydown="blur" @blur="blur">
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
.symbol-state-attr-panel {
    width: 230px;
    height: fit-content;
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.18);
    background-color: #FFFFFF;
    border-radius: 8px;
    box-sizing: border-box;
    font-size: 12px;

    .scroll {
        max-height: 300px;
        overflow-y: auto;

        &::-webkit-scrollbar {
            width: 7px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 3.5px;
            background: #efefef;
        }
    }

    .title {
        height: 22px;
        display: flex;
        align-items: center;
        color: rgba(0, 0, 0, 0.5);
    }

    .attr_name {
        width: 100%;
        padding: 0 12px;
        padding-top: 12px;
        box-sizing: border-box;

        .input-box {
            display: flex;
            align-items: center;
            width: 100%;
            height: 32px;
            margin: 6px 0;

            input {
                width: 100%;
                font-size: 12px;
                margin: 0;
                height: 32px;
                background-color: #F5F5F5;
                border-radius: 6px;
                outline: none;
                padding: 0 8px;
                box-sizing: border-box;
                border: none;
            }
        }
    }

    .state_value {
        width: 100%;
        padding: 0 12px;
        padding-bottom: 12px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 6px;

        .input-box {
            display: flex;
            align-items: center;
            width: 100%;
            height: 32px;

            input {
                width: 100%;
                font-size: 12px;
                margin: 0;
                height: 32px;
                border-radius: 6px;
                outline: none;
                padding: 0 8px;
                box-sizing: border-box;
                border: none;

                &:hover {
                    background-color: #F5F5F5;
                }

                &:focus {
                    background-color: rgb(240, 240, 240);
                }
            }
        }
    }
}
</style>