<script setup lang="ts">
import { Context } from '@/context';
import { VariableType } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
import SelectMenu from '../PopoverMenu/ComposAttri/SelectMenu.vue';
import { ArrowDown } from '@element-plus/icons-vue'
import { ref } from 'vue';

const { t } = useI18n();

interface Props {
    context: Context,
    addType: VariableType | undefined,
}

interface Emits {
    (e: "select", index: number): void;
    (e: "change", value: string): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
const textDefaultValue = ref('');
const selectoption = ref(false);
const menuItems = ['显示', '隐藏'];
const defaultValue = ref('显示');
const menuIndex = ref(0);
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
</script>

<template>
    <div class="container">
        <span>默认值</span>
        <div v-if="props.addType === VariableType.Visible" class="show">
            <div class="input" @click.stop="showMenu">
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
            <el-input v-model="textDefaultValue" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" resize="none"
                :placeholder="t('compos.default_text_input')" @keydown.stop @change="change" />
        </div>
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
    }

    :deep(.el-textarea) {
        width: 100%;

        .el-textarea__inner {
            font-size: 12px;
            min-height: 30px !important;
            background-color: var(--grey-light);
            box-shadow: none;

            &:focus {
                box-shadow: 0 0 0 1px var(--active-color) inset;
            }
        }
    }

}

.show {
    .input {
        position: relative;
        width: 100%;
        height: 30px;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        padding-left: 11px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        background-color: var(--grey-light);

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
}</style>