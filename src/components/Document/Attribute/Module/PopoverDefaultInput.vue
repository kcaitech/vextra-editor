<script setup lang="ts">
import { Context } from '@/context';
import { Text, VariableType } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import SelectMenu from '../PopoverMenu/ComposAttri/SelectMenu.vue';
import { ArrowDown } from '@element-plus/icons-vue'
import { onMounted, ref, watch } from 'vue';

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
const selectoption = ref(false);
const menuItems = ['显示', '隐藏'];
const defaultValue = ref('显示');
const menuIndex = ref(0);
watch(() => props.default_value, (v) => {
    if (!props.dft_show) return;
    if (v) {
        menuIndex.value = 0;
        defaultValue.value = '显示';
    } else {
        menuIndex.value = 1;
        defaultValue.value = '隐藏';
    }
}, { immediate: true })
const showMenu = () => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
const handleShow = (index: number) => {
    defaultValue.value = menuItems[index];
    menuIndex.value = index;
    emits('select', index);
}

function change(v: string) {
    emits("change", v);
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
        <span style="color: #737373;">默认值</span>
        <div v-if="props.addType === VariableType.Visible" class="show">
            <div class="input" @click.stop="showMenu" :style="{ backgroundColor: selectoption ? '#EBEBEB' : '' }">
                <span>{{ defaultValue }}</span>
                <el-icon>
                    <ArrowDown
                        :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                </el-icon>
                <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="menuItems" :menuIndex="menuIndex"
                    :context="context" @select-index="handleShow" @close="selectoption = false"></SelectMenu>
            </div>
        </div>
        <div v-if="props.addType === VariableType.Text">
            <!-- <el-input v-model="textDefaultValue" type="textarea" ref="input_v" :autosize="{ minRows: 1, maxRows: 4 }"
                      resize="none"
                      :placeholder="t('compos.default_text_input')" @keydown.stop="keysumbit" @change="change"/> -->
            <input ref="input_v" type="text" v-model="textDefaultValue" :placeholder="t('compos.default_text_input')"
                @keydown.stop="keysumbit" @change="change(textDefaultValue)" />
        </div>
    </div>
    <div class="warning" v-if="props.warn && props.addType === VariableType.Text">
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

    // :deep(.el-textarea) {
    //     width: 100%;

    //     .el-textarea__inner {
    //         font-size: 12px;
    //         min-height: 28px !important;
    //         background-color: var(--grey-light);
    //         box-shadow: none;

    //         &:focus {
    //             box-shadow: 0 0 0 1px var(--active-color) inset;
    //         }
    //     }
    // }

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
    .input {
        position: relative;
        width: 100%;
        height: 32px;
        border-radius: 6px;
        padding-left: 11px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        background-color: #F5F5F5;

        &:hover {
            background-color: #EBEBEB;
        }

        &:active {
            background-color: #EBEBEB;
        }

        span {
            flex: 1;
        }

        .el-icon {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
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