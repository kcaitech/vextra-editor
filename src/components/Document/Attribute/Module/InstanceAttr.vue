<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
import TypeHeader from '../TypeHeader.vue';
import { ref, nextTick, onUnmounted, watch, onMounted, computed } from 'vue'
import ComponentDialog from './ComponentDialog.vue';
import { shape_track, get_shape_within_document } from '@/utils/content';
import { Shape, SymbolRefShape, Variable, VariableType } from '@kcdesign/data';
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue';
import SelectMenu from '../PopoverMenu/SelectMenu.vue';
import { tr } from 'element-plus/es/locale';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    shape: SymbolRefShape
}>()

const resetMenu = ref(false)
const openClose = ref(false)
const showCompsDialog = ref(false)
const textValue = ref('文本内容')
const menuItems = ['默认']
const attrValue = ref('默认')
const comps = ref<HTMLDivElement>();
const comps_posi = ref({ x: 0, y: 0 });
const reflush = ref(0);
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
    if (comps.value) {
        const el = comps.value.getBoundingClientRect();
        comps_posi.value.x = el.x - (el.width + 32);
        comps_posi.value.y = el.y;
    }
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
        const shapes = editor.extractSymbol(props.shape);
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
const inputRef = ref<any>()
const selectAllText = () => {
    inputRef.value.select()
}
const variables = ref<Variable[]>([]);
const visibles = ref<Variable[]>([]);
const textContents = ref<Variable[]>([]);
const instances = ref<Variable[]>([]);
const attrStates = ref<Variable[]>([]);

const watchShape = () => {
    varUnwatch(variables.value as Variable[])
    variables.value = props.shape.variables;
    updateData();
    varWatch(variables.value as Variable[])
}

const updateData = () => {
    visibles.value = variables.value.filter(item => item.type === VariableType.Visible) || [];
    instances.value = variables.value.filter(item => item.type === VariableType.Instance) || [];
    textContents.value = variables.value.filter(item => item.type === VariableType.Text) || [];
    attrStates.value = variables.value.filter(item => item.type === VariableType.Status) || [];
}

const varWatch = (variables: Variable[]) => {
    variables.forEach(item => {
        item.watch(updateData)
    })
}
const varUnwatch = (variables: Variable[]) => {
    variables.forEach(item => {
        item.unwatch(updateData)
    })
}


onMounted(() => {
    watchShape();
    props.shape.watch(watchShape)
    watch(() => props.shape, (nVal, oVal) => {
        oVal.unwatch(watchShape);
        nVal.watch(watchShape);
    })
})
onUnmounted(() => {
    props.shape.unwatch(watchShape)
    document.removeEventListener('click', closeResetMenu)
})
</script>

<template>
    <TypeHeader :title="t('compos.instance_attr')" class="mt-24">
        <template #tool>
            <div class="edit-comps">
                <div class="edit_svg" @click.stop="editComps">
                    <svg-icon icon-class="edit-comp"></svg-icon>
                </div>
                <div class="reset_svg" @click.stop="selectReset">
                    <el-icon>
                        <MoreFilled />
                    </el-icon>
                    <div class="reset_menu" v-if="resetMenu">
                        <div class="untie" @click="untie">
                            <span>{{ t('compos.untie') }}</span>
                            <span>快捷键</span>
                        </div>
                        <div class="untie">{{ t('compos.reset_all_attr') }}</div>
                    </div>
                </div>
            </div>
        </template>
    </TypeHeader>
    <div class="module_container" :reflush="reflush !== 0 ? reflush : undefined">
        <div class="module_state_item" v-for="(item, index) in attrStates" :key="index">
            <div class="state_item">
                <div class="state_name"><span>{{ item.name }}</span></div>
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
        <div class="module_state_item" ref="comps" v-for="(item, index) in instances" :key="index">
            <div class="state_item">
                <div class="state_name"><span>{{ item.name }}</span></div>
                <div class="state_value border" @click="compsDialog">
                    <span style="color: #606266;">默认</span>
                    <svg-icon icon-class="down" style="color: #a8abb2;"></svg-icon>
                </div>
            </div>
            <div class="delete"></div>
            <ComponentDialog v-if="showCompsDialog" :context="context" right="250px" top="0" @closeDialog="closeDialog"
                :comps_posi="comps_posi">
            </ComponentDialog>
        </div>
        <div class="module_state_item" v-for="(item, index) in textContents" :key="index">
            <div class="state_item">
                <div class="state_name"><span>{{ item.name }}</span></div>
                <div class="state_value" style="padding: 0;">
                    <el-input ref="inputRef" v-model="textValue" @focus="selectAllText" />
                </div>
            </div>
            <div class="delete"></div>
        </div>
        <div class="open" v-if="visibles.length > 0">
            <div>
                <span class="title">{{ t('compos.layer_show') }}:</span>
                <div class="switch">
                    <div v-for="(item, index) in visibles" :key="index">
                        <span class="name">{{ item.name }}</span>
                        <el-switch v-model="item.value" size="small"
                            style="margin-left: 10px;--el-switch-on-color: #9775fa" />
                    </div>
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

            .switch {
                >div {
                    display: flex;
                    align-items: center;
                }
            }

            .name {
                width: 60px;
                margin-right: 5px;
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