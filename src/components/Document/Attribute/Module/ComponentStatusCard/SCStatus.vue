/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { Context } from "@/context";
import { AttriListItem, delete_variable, is_status_allow_to_delete } from "@/utils/symbol";
import { reactive, ref } from "vue";
import { Variable } from "@kcdesign/data";
import { useI18n } from "vue-i18n";
import StatusAttrPanel from "./StatusAttrPanel.vue";

interface Props {
    context: Context
    item: AttriListItem
    variable: Variable
}

const props = defineProps<Props>();
const isWarnRepeat = ref(false);
const isWarnNull = ref(false);
const { t } = useI18n();

const compLibStatus = reactive<ElementStatus>({ id: '#symbol-state-attr-panel', visible: false });
const compPanelStatusMgr = new ElementManager(
    props.context,
    compLibStatus,
    { whiteList: ['.symbol-state-attr-panel', '.module_item_left'] }
);

function showCompLib(event: MouseEvent) {
    let e: Element | null = event.target as Element;
    while (e) {
        if (e.classList.contains('module_item_left')) {
            compPanelStatusMgr.showBy(e, { once: { offsetLeft: -240, offsetTop: 0 } });
            break;
        }
        e = e.parentElement;
    }
}

function _delete() {
    const sym = props.context.selection.symbolshape;
    if (!sym) return;
    if (!is_status_allow_to_delete(sym)) return;
    delete_variable(props.context, props.variable);
}

import delete_icon from '@/assets/icons/svg/delete.svg';
import comp_state_icon from '@/assets/icons/svg/comp-state.svg';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { ElementManager, ElementStatus } from "@/components/common/elementmanager";
import { onUnmounted } from "vue";

onUnmounted(() => {
    compPanelStatusMgr.unmounted();
});
</script>
<template>
    <div class="module_attr_item">
        <div class="attr_con">
            <div class="module_item_left" @click="showCompLib">
                <div class="module_name">
                    <SvgIcon :icon="comp_state_icon" />
                </div>
                <div class="name_i" :title="props.item.values.toString()">
                    <span style="width:35%;">{{ props.variable.name }}</span>
                    <span style="width: 65%;">{{ props.item.values.toString() }}</span>
                </div>
            </div>
            <div class="delete" @click="_delete">
                <SvgIcon :icon="delete_icon" />
            </div>
        </div>
        <p class="warn" v-if="isWarnRepeat">{{ t('compos.duplicate_name') }}</p>
        <p class="warn" v-if="isWarnNull">{{ t('compos.validate_info_2') }}</p>
        <StatusAttrPanel v-if="compLibStatus.visible" :context="context" :variable="variable" :item="item"
            @close="() => compPanelStatusMgr.close()">
        </StatusAttrPanel>
    </div>
</template>
<style scoped lang="scss">
.module_attr_item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    width: 100%;

    .attr_con {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 32px;
        box-sizing: border-box;
    }

    .module_item_left {
        display: flex;
        align-items: center;
        border-radius: var(--default-radius);
        background-color: #F5F5F5;
        width: calc(100% - 32px);
        height: 32px;

        .module_name {
            width: 30px;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #595959;

            >svg {
                width: 14px;
                height: 14px;
            }

            .name {
                max-width: 50px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        >.name_i {
            flex: 1;
            display: flex;
            max-width: calc(100% - 30px);

            >span {
                display: block;
                box-sizing: border-box;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                padding-right: 10px;
            }
        }

        .module_name-2 {
            display: flex;
            align-items: center;

            >svg {
                width: 14px;
                height: 14px;
                margin: 0px 10px;
            }

            .name {
                max-width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }

        .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 120px;
        }
    }

    .module_item_left:hover {
        background-color: #EBEBEB;
    }

    .warn {
        font-size: 12px;
        color: red;
        padding: 0;
        color: red;
        margin: 3px;
    }

    .delete {
        flex: 0 0 28px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        height: 28px;
        border-radius: var(--default-radius);
        transition: .2s;

        >svg {
            width: 16px;
            height: 16px;
        }
    }

    .delete:hover {
        background-color: #F5F5F5;
    }
}

:deep(.el-input__inner) {
    --el-input-inner-height: 100%;
}

:deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--active-color) inset;
}
</style>