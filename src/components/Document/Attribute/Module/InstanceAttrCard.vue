<script setup lang="ts">
import { Context } from '@/context';
import ComponentDialog from './ComponentDialog.vue';
import { ArrowDown, MoreFilled } from '@element-plus/icons-vue';
import SelectMenu from '../PopoverMenu/SelectMenu.vue';
import { useI18n } from 'vue-i18n';
import { VariableType } from '@kcdesign/data';
import { ref } from 'vue';
const { t } = useI18n();
const props = defineProps<{
    context: Context
    type: VariableType
}>()

const selectoption = ref(false)
const showMenu = () => {
    if (selectoption.value) return selectoption.value = false
    selectoption.value = true;
}
const menuItems = ['默认']

const showCompsDialog = ref(false);
const comps_posi = ref({ x: 0, y: 0 });
const comps = ref<HTMLDivElement>();
const compsDialog = () => {
    // props.context.component.set_scroll_target(props.shape.refId);
    if (comps.value) {
        const el = comps.value.getBoundingClientRect();
        comps_posi.value.x = el.x - (el.width + 32);
        comps_posi.value.y = el.y;
    }
    showCompsDialog.value = true;
}
const closeDialog = () => {
    showCompsDialog.value = false;
}

const textValue = ref('文本内容')
const inputRef = ref<any>()
const selectAllText = () => {
    inputRef.value.select()
}

const open = ref(false);
</script>

<template>
    <div class="module_state_item" v-if="type === VariableType.Status">
        <div class="state_item">
            <div class="state_name"><span>{{  }}</span></div>
            <div class="state_value" style="padding: 0;">
                <div class="input" @click="showMenu">
                    <span>{{  }}</span>
                    <el-icon>
                        <ArrowDown
                            :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                    </el-icon>
                    <SelectMenu v-if="selectoption" :top="33" width="100%" :menuItems="menuItems" :context="context">
                    </SelectMenu>
                </div>
            </div>
        </div>
        <div class="delete"></div>
    </div>
    <div class="module_state_item" ref="comps" v-if="type === VariableType.SymbolRef">
        <div class="state_item">
            <div class="state_name"><span>{{ 111 }}</span></div>
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
    <div class="module_state_item" v-if="type === VariableType.Text">
        <div class="state_item">
            <div class="state_name"><span>{{ }}</span></div>
            <div class="state_value" style="padding: 0;">
                <el-input ref="inputRef" v-model="textValue" @focus="selectAllText" />
            </div>
        </div>
        <div class="delete"></div>
    </div>
    <div class="open" v-if="type === VariableType.Visible">
        <div>
            <span class="title">{{ t('compos.layer_show') }}:</span>
            <div class="switch">
                <div>
                    <span class="name">{{  }}</span>
                    <el-switch v-model="open" size="small" style="margin-left: 10px;--el-switch-on-color: #9775fa" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped lang="scss">
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
            width: 40%;
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
:deep(.el-select-dropdown__item.selected) {
    color: #9775fa !important;
    font-size: 12px;
}

:deep(.el-select .el-input.is-focus .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
    background-color: var(--grey-light);
}

:deep(.el-select .el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset !important;
}
</style>