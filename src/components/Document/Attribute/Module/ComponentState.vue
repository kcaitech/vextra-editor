<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue'
import ComponentAttr from './ComponentAttr.vue';
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const attrValueInput = ref('默认')
const editAttrValue = ref(false)
const revalueInput = ref<HTMLInputElement>()

const onRevalue = () => {
    editAttrValue.value = true
    nextTick(() => {
        if(revalueInput.value) {
            revalueInput.value?.focus()
            revalueInput.value?.select()
        }
    })
}

const closeValueInput = () => {
    if(attrValueInput.value.trim().length === 0) return editAttrValue.value = false
    editAttrValue.value = false
}

const onEditAttrValue = (e: KeyboardEvent) => {
    if(attrValueInput.value.trim().length === 0) return editAttrValue.value = false
    if(e.code === 'Enter' || e.code === 'NumpadEnter') {
        editAttrValue.value = false
    }
}
</script>

<template>
    <TypeHeader :title="'组件状态'" class="mt-24">
        <template #tool>
            <div style="height: 22px;"></div>
        </template>
    </TypeHeader>
    <div class="module_container">
        <div class="module_state_item">
            <div class="module_con">
                <div class="state_item">
                    <div class="state_name">属性1</div>
                    <div class="state_value" v-if="!editAttrValue" @dblclick="onRevalue">默认</div>
                    <div class="module_input" v-if="editAttrValue"><el-input v-model="attrValueInput" ref="revalueInput" @blur="closeValueInput" @keydown="onEditAttrValue"/></div>
                </div>
                <div class="delete"></div>
            </div>
            <div class="warn" v-if="editAttrValue">属性值重复，请重新输入</div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.module_container {
    font-size: var(--font-default-fontsize);
    .module_state_item {
        display: flex;
        flex-direction: column;
        margin-bottom: 3px;
        .module_con {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 30px;
        }
        .state_item {
            display: flex;
            align-items: center;
            width: 100%;
            height: 30px;
            .state_name {
                display: flex;
                align-items: center;
                width: 30%;
                height: 100%;
            }
            .state_value {
                display: flex;
                align-items: center;
                padding-left: 10px;
                flex: 1;
                height: 100%;
                background-color: #ccc;
            }
        }
        .module_input {
            display: flex;
            align-items: center;
            padding-left: 10px;
            width: 100%;
            height: 30px;
            .el-input {
                font-size: 10px;
                height: 25px;
            }
        }
        .warn {
            margin-left: 30%;
            color: red;
        }
        .delete {
            flex: 0 0 22px;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 22px;
            height: 22px;
        }
    }
}
    

</style>