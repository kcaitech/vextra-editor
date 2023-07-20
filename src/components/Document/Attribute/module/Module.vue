<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue'
const props = defineProps<{
    context: Context
}>()
const { t } = useI18n();
const compsType = ref(false)
const selectComps = ref<HTMLDivElement>()
const attrInput = ref('属性1')
const attrValueInput = ref('默认')
const showRename = ref(false)
const editAttrValue = ref(false)
const renameInput = ref<HTMLInputElement>()
const revalueInput = ref<HTMLInputElement>()
const curModuleState = ref(false)

const selectCompsType = () => {
    if(compsType.value) {
        return compsType.value = false
    }
    compsType.value = true
    document.addEventListener('mousedown', closeCompsType)
}

const closeCompsType = (e: Event) => {
    if (e.target instanceof Element && !e.target.closest('.add-comps')) {
        compsType.value = false
    }
    document.removeEventListener('mousedown', closeCompsType)
}

const onRename = () => {
    showRename.value = true
    nextTick(() => {
        if(renameInput.value) {
            renameInput.value?.focus()
            renameInput.value?.select()
        }
    })
}

const closeInput = () => {
    if(attrInput.value.trim().length === 0) return showRename.value = false
    showRename.value = false
}

const editName = (e: KeyboardEvent) => {
    if(attrInput.value.trim().length === 0) return showRename.value = false
    if(e.code === 'Enter' || e.code === 'NumpadEnter') {
        showRename.value = false
    }
}

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
    <div class="module-panel">
        <TypeHeader :title="t('navi.comps')" class="mt-24" v-if="curModuleState">
            <template #tool>
                <div class="add-comps" @click="selectCompsType">
                    <svg-icon icon-class="add"></svg-icon>
                    <div class="selectType" v-if="compsType" ref="selectComps">
                        <div class="type-title">请选择属性类型:</div>
                        <div class="status">
                            <svg-icon icon-class="pattern-arrow"></svg-icon>
                            <span>组件状态</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="eye-open"></svg-icon>
                            <span>显示状态</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="pattern-rectangle"></svg-icon>
                            <span>实例切换</span>
                        </div>
                        <div class="status">
                            <svg-icon icon-class="text"></svg-icon>
                            <span>文本内容</span>
                        </div>
                    </div>
                </div>
            </template>
        </TypeHeader>
        <TypeHeader :title="'组件状态'" class="mt-24" v-else></TypeHeader>
        <div class="module_container">
            <div class="module_attr_item"  v-if="curModuleState">
                <div class="module_item_left" @dblclick="onRename" v-if="!showRename">
                    <div class="module_name">
                        <svg-icon icon-class="pattern-arrow"></svg-icon>
                        <span>属性1</span>
                    </div>
                    <div><span>默认</span></div>
                </div>
                <div class="module_input" v-else><el-input v-model="attrInput" ref="renameInput" @blur="closeInput" @keydown="editName"/></div>
                <div class="delete">
                    <svg-icon icon-class="delete"></svg-icon>
                </div>
            </div>
            <div class="module_state_item" v-else>
                <div class="state_item">
                    <div class="state_name">属性1</div>
                    <div class="state_value" v-if="!editAttrValue" @dblclick="onRevalue">默认</div>
                    <div class="module_input" v-else><el-input v-model="attrValueInput" ref="revalueInput" @blur="closeValueInput" @keydown="onEditAttrValue"/></div>
                </div>
                <div class="delete">
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.module-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .add-comps {
        position: relative;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 50%;
            height: 50%;
        }

        transition: .2s;
        .selectType {
            position: absolute;
            top: 25px;
            right: 0;
            width: 120px;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 5px 0;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 100;
            .type-title {
                display: flex;
                align-items: center;
                height: 30px;
                padding: 0 10px;
            }
            .status {
                display: flex;
                align-items: center;
                height: 25px;
                padding: 2px 10px;
                >svg {
                    width: 14px;
                    height: 14px;
                    margin-right: 10px;
                }
                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }

    .module_container {
        font-size: var(--font-default-fontsize);
        height: 30px;
        .module_attr_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .module_item_left {
                display: flex;
                align-items: center;
                background-color: #ccc;
                width: 100%;
                height: 30px;
                .module_name {
                    width: 45%;
                    >svg{
                        width: 10px;
                        height: 10px;
                        margin: 0 10px;
                    }
                }
            }
            .module_input {
                display: flex;
                align-items: center;
                width: 100%;
                height: 30px;
                .el-input {
                    font-size: 10px;
                    height: 25px;
                }
            }
            .delete {
                flex: 0 0 22px;
                display: flex;
                justify-content: center;
                align-items: center;
                width: 22px;
                height: 22px;

                >svg {
                    width: 11px;
                    height: 11px;
                }

                transition: .2s;
            }
        }
        .module_state_item {
            display: flex;
            align-items: center;
            justify-content: space-between;
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
    
}
</style>