<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick, onUnmounted } from 'vue'
import ComponentDialog from './ComponentDialog.vue';
import { shape_track, get_shape_within_document } from '@/utils/content';
import { Shape, SymbolRefShape } from '@kcdesign/data';
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue';
import SelectMenu from '../PopoverMenu/SelectMenu.vue';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    shapes: Shape[]
}>()

const resetMenu = ref(false)
const openName = ref(false)
const openClose = ref(false)
const showCompsDialog = ref(false)
const textValue = ref('文本内容')
const menuItems = ['默认']

const attrValue = ref('默认')
const selectReset = (e: MouseEvent) => {
    if (resetMenu.value) return resetMenu.value = false
    resetMenu.value = true
    document.addEventListener('click', closeResetMenu)
}

const closeResetMenu = (e: MouseEvent) => {
    if (e.target instanceof Element && !e.target.closest('.reset_svg')) {
        resetMenu.value = false
    }
    document.removeEventListener('click', closeResetMenu)
}

const closeDialog = () => {
    showCompsDialog.value = false;
}
const compsDialog = () => {
    showCompsDialog.value = true;
}

const editComps = () => {
    const refId = props.context.selection.selectedShapes[0].refId;
    const shape = get_shape_within_document(props.context, refId)
    if (shape) {
        shape_track(props.context, shape)
    }
}
const untie = () => {
    const selection = props.context.selection;
    const page = selection.selectedPage;
    if (page) {
        const editor = props.context.editor4Page(page);
        const shapes = editor.extractSymbol(props.shapes[0] as SymbolRefShape);
        if (shapes) {
            selection.selectShape(shapes);
            resetMenu.value = false;
        }
    }
}
const selectoption = ref(false)
const showMenu = () => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
onUnmounted(() => {
    document.removeEventListener('click', closeResetMenu)
})
</script>

<template>
    <TypeHeader :title="'实例属性'" class="mt-24">
        <template #tool>
            <div class="edit-comps">
                <div class="edit_svg" @click.stop="editComps">
                    <svg-icon icon-class="edit-comp"></svg-icon>
                </div>
                <div class="reset_svg" @click.stop="selectReset">
                    <el-icon><MoreFilled /></el-icon>
                    <div class="reset_menu" v-if="resetMenu">
                        <div class="untie" @click="untie">
                            <span>解绑</span>
                            <span>快捷键</span>
                        </div>
                        <div class="untie">重置全部属性</div>
                    </div>
                </div>
            </div>
        </template>
    </TypeHeader>
    <div class="module_container">
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name"><span>属性1</span></div>
                <div class="state_value" style="padding: 0;">
                    <div class="input" @click="showMenu">
                        <span>{{ attrValue }}</span>
                        <el-icon>
                            <ArrowDown
                                :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                        </el-icon>
                        <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="menuItems"></SelectMenu>
                    </div>
                </div>
            </div>
            <div class="delete"></div>
        </div>
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name"><span>实例1</span></div>
                <div class="state_value border" @click="compsDialog">
                    <span style="color: #606266;">默认</span>
                    <svg-icon icon-class="down" style="color: #a8abb2;"></svg-icon>
                </div>
            </div>
            <div class="delete"></div>
            <ComponentDialog v-if="showCompsDialog" :context="context" right="250px" top="0" @closeDialog="closeDialog">
            </ComponentDialog>
        </div>
        <div class="module_state_item">
            <div class="state_item">
                <div class="state_name"><span>文本</span></div>
                <div class="state_value" style="padding: 0;">
                    <el-input v-model="textValue" />
                </div>
            </div>
            <div class="delete"></div>
        </div>
        <div class="open">
            <div>
                <span class="title">图层显示:</span>
                <div>
                    <span class="name">名称1</span>
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
            padding: 10px 0;
            background-color: #fff;
            border-radius: 2px;
            box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.2);
            z-index: 100;

            .untie {
                height: 30px;
                width: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 16px;
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

                span {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            }

            .state_value {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 11px;
                flex: 1;
                height: 100%;
                border-radius: 4px;

                >svg {
                    width: 10px;
                    height: 10px;
                }

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
                        box-shadow: none;

                        &:hover {
                            border-color: var(--grey-light);
                            box-shadow: none;
                        }
                    }
                }

                .el-input {
                    width: 100%;
                    height: 30px;
                    font-size: 10px;

                    :deep(.el-input__inner) {
                        --el-input-inner-height: 100%;
                    }

                    :deep(.el-input__wrapper) {
                        background-color: var(--grey-light);
                        border-color: var(--grey-light);
                        box-shadow: none;

                        &:hover {
                            border-color: var(--grey-light);
                            box-shadow: none;
                        }
                    }

                    :deep(.el-input__wrapper.is-focus) {
                        box-shadow: 0 0 0 1px var(--active-color) inset;
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

            .name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
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