<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick } from 'vue'
import ComponentDialog from './ComponentDialog.vue';
const { t } = useI18n();
const props = defineProps<{
    context: Context
}>()

const resetMenu = ref(false)
const openName = ref(false)
const openClose = ref(false)
const showCompsDialog = ref(false)
const options = [
    {
        value: '默认',
        label: '默认',
    },
    {
        value: '状态1',
        label: '状态1',
    }
]
const attrValue = ref('默认')
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('mousedown', closeResetMenu)
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false
    }
    document.removeEventListener('mousedown', closeResetMenu)
}

const closeDialog = () => {
    showCompsDialog.value = false;
}
</script>

<template>
    <TypeHeader :title="'实例属性'" class="mt-24">
        <template #tool>
            <div class="edit-comps">
                <div class="edit_svg">
                    <svg-icon icon-class="add"></svg-icon>
                </div>
                <div class="reset_svg" @click="selectReset">
                    <svg-icon icon-class="add"></svg-icon>
                    <div class="reset_menu" v-if="resetMenu">
                        <div class="untie">
                            <span>解绑</span>
                            <span>快捷键</span>
                        </div>
                        <div class="reset">重置全部属性</div>
                    </div>
                </div>
            </div>
        </template>
    </TypeHeader>
    <div class="module_container">
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name">属性1</div>
                <div class="state_value" style="padding: 0;">
                    <el-select v-model="attrValue" class="m-2" placeholder="Select">
                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                </div>
            </div>
            <div class="delete"></div>
        </div>
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name">实例1</div>
                <div class="state_value border" @click="showCompsDialog = true">
                    <span>默认</span>
                    <svg-icon icon-class="down"></svg-icon>
                </div>
            </div>
            <div class="delete"></div>
            <ComponentDialog v-if="showCompsDialog" :context="context" right="250px" top="0" @closeDialog="closeDialog"></ComponentDialog>
        </div>
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name">文本</div>
                <div class="state_value border">
                    <span>文本内容</span>
                </div>
            </div>
            <div class="delete"></div>
        </div>
        <div class="open">
            <div>
                <span class="title">图层显示:</span>
                <div>
                    <span>名称1</span>
                    <el-switch v-model="openName" size="small" style="margin-left: 10px;--el-switch-on-color: #9775fa" />
                </div>
            </div>
            <div>
                <span class="title"></span>
                <div>
                    <span>关闭图标</span>
                    <el-switch v-model="openClose" size="small" style="margin-left: 10px;--el-switch-on-color: #9775fa" />
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.edit-comps {
    width: 44px;
    height: 22px;
    display: flex;
    align-items: center;

    .edit_svg {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;

        >svg {
            width: 50%;
            height: 50%;
        }
    }

    .reset_svg {
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

        .reset_menu {
            position: absolute;
            top: 25px;
            right: 0;
            width: 150px;
            padding: 5px 0;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 100;

            .untie {
                height: 25px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 10px;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }

            .reset {
                height: 25px;
                width: 100%;
                display: flex;
                align-items: center;
                padding: 0 10px;
                box-sizing: border-box;

                &:hover {
                    background-color: var(--active-color);
                    color: #fff;
                }
            }
        }
    }

}

.module_container {
    font-size: var(--font-default-fontsize);
    margin-bottom: 10px;

    .module_state_item {
        position: relative;
        display: flex;
        align-items: center;
        margin-bottom: 3px;
        margin-top: 5px;

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
                justify-content: space-between;
                padding: 0 10px;
                flex: 1;
                height: 100%;
                border-radius: 4px;

                >svg {
                    width: 12px;
                    height: 12px;
                }

                .el-select {
                    width: 100%;
                    height: 30px;
                    font-size: 10px;

                    >div {
                        height: 100%;
                    }

                    .el-option {
                        font-size: 10px
                    }

                    :deep(.el-input__wrapper) {
                        height: 30px;
                        font-size: 10px;
                        background-color: var(--grey-light);
                    }
                }
            }
            .border {
                background-color: var(--grey-light);
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

    .open {
        margin-bottom: 3px;

        >div {
            display: flex;

            .title {
                width: 60px;
                margin-right: 5px;
                padding-top: 2px;
            }

            >div {
                flex: 1;
            }
        }
    }
}
:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 10px;
}
:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
    background-color: var(--grey-light);
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}
</style>