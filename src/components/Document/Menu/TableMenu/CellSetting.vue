/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { Context } from '@/context';
import { Close } from '@element-plus/icons-vue'
import { TableView } from '@kcdesign/data';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
interface Props {
    context: Context,
    params: {
        cellStatus: string
        close: () => void
        visible: boolean;
    }
}
const props = defineProps<Props>();
// const emit = defineEmits<{
//     (e: 'close'): void;
// }>();
const dialogVisible = ref(true);
const rowNum = ref(1);
const radioRanks = ref('top');
const colNum = ref(1);
const rowBotom = ref(1);
const colRight = ref(1);

const escClose = (e: KeyboardEvent) => {
    e.stopPropagation();
    // emit('close');
    props.params.close()
}

const InsertCell = (state: string) => {
    const shape: TableView = props.context.selection.selectedShapes[0] as TableView;
    const layout = (shape as TableView).getLayout();
    const table = props.context.tableSelection;
    const editor = props.context.editor4Table(shape);
    if (table.tableColEnd !== -1 && table.tableRowEnd !== -1) {
        const grid = layout.grid.get(table.tableRowStart, table.tableColStart);
        if (state === 'top') {
            editor.insertMultiRow(table.tableRowStart, grid.frame.height, rowNum.value);
        } else if (state === 'bottom') {
            editor.insertMultiRow(table.tableRowEnd + 1, grid.frame.height, rowBotom.value);
        }
        else if (state === 'left') {
            editor.insertMultiCol(table.tableColStart, grid.frame.width, colNum.value);
        }
        else if (state === 'right') {
            editor.insertMultiCol(table.tableColEnd + 1, grid.frame.width, colRight.value);
        }
    } else if (table.editingCell) {
        const grid = layout.grid.get(table.editingCell.index.row, table.editingCell.index.col);
        if (state === 'top') {
            editor.insertMultiRow(table.editingCell.index.row, grid.frame.height, rowNum.value);
        } else if (state === 'bottom') {
            editor.insertMultiRow(table.editingCell.index.row + 1, grid.frame.height, rowBotom.value);
        }
        else if (state === 'left') {
            editor.insertMultiCol(table.editingCell.index.col, grid.frame.width, colNum.value);
        }
        else if (state === 'right') {
            editor.insertMultiCol(table.editingCell.index.col + 1, grid.frame.width, colRight.value);
        }
    }
    table.resetSelection();
    table.setEditingCell();
    // emit('close');
    props.params.close()
}

onMounted(() => {
    document.addEventListener('keydown', escClose);
})
onUnmounted(() => {
    document.removeEventListener('keydown', escClose);
})
</script>

<template>
    <div class="container" @mousedown.stop v-if="props.params.visible">
        <el-dialog v-model="dialogVisible" :title="t('table.insert_column')" width="200px" draggable align-center
            :modal="false" v-if="props.params.cellStatus === 'insert'" :close-on-click-modal="false" :close-on-press-escape="false"
            :show-close="false" :lock-scroll="false">
            <div class="close" @click="props.params.close()"><el-icon>
                    <Close />
                </el-icon></div>
            <div class="body">
                <div class="addcol" :style="{ opacity: radioRanks === 'top' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="top"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'top'">{{ t('table.top_insert') }}</span>
                    <el-input-number v-model="rowNum" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'bottom' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="bottom"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'bottom'">{{ t('table.bottom_insert') }}</span>
                    <el-input-number v-model="rowBotom" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'left' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="left"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'left'">{{ t('table.left_insert') }}</span>
                    <el-input-number v-model="colNum" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" />
                </div>
                <div class="addcol" :style="{ opacity: radioRanks === 'right' ? 1 : .5 }">
                    <el-radio-group v-model="radioRanks">
                        <el-radio label="right"></el-radio>
                    </el-radio-group>
                    <span @click="radioRanks = 'right'">{{ t('table.right_insert') }}</span>
                    <el-input-number v-model="colRight" :min="1" :max="50" size="small" :controls="true"
                        controls-position="right" />
                </div>
            </div>
            <div class="save">
                <div @click="InsertCell(radioRanks)">{{ t('table.confirm') }}</div>
            </div>
        </el-dialog>
    </div>
</template>

<style lang="scss" scoped>
:deep(.el-dialog__title) {
    font-size: 13px;
}

:deep(.el-dialog__body) {
    padding: 10px;
    padding-top: 0px;
}

:deep(.el-dialog__header) {
    padding: 10px;
}

:deep(.el-dialog__headerbtn) {
    height: 34px;
}

:deep(.el-input__wrapper) {
    padding-left: 10px;
    padding-right: 35px;
}

:deep(.el-radio__label) {
    display: none;
}

.container {
    .close {
        position: absolute;
        top: 14px;
        right: 16px;
    }

    .body {
        font-size: var(--font-default-fontsize);
        display: flex;
        flex-direction: column;

        .row {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                margin-right: 5px;
            }
        }

        .col {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                margin-right: 5px;
            }
        }

        .addcol {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            height: 25px;

            span {
                width: 90px;
                margin-left: 5px;
                margin-right: 5px;
            }
        }
    }
}

.save {
    display: flex;
    justify-content: center;
    margin-top: 10px;

    div {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        width: 60px;
        height: 22px;
        background-color: var(--active-color);
        color: #fff;
        font-size: var(--font-default-fontsize);
    }
}

:deep(.el-input-number__increase.is-disabled) {
    cursor: default;
}

:deep(.el-input-number__decrease.is-disabled) {
    cursor: default;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
    border-color: var(--active-color);
    background: var(--active-color);
}
</style>