/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { ref } from 'vue';
import { message } from "@/utils/message";
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
const { t } = useI18n();

interface Props {
    context: Context
}
const props = defineProps<Props>();
const emit = defineEmits<{
    (e: 'close'): void;
}>()
const grid = ref(Array.from({ length: 10 }, () => Array(10).fill(false)));
const highlightedRow = ref(-1);
const highlightedCol = ref(-1);
const inputRow = ref<number>();
const inputCol = ref<number>();

function highlightCells(row: number, col: number) {
    highlightedRow.value = row;
    highlightedCol.value = col;
}
function resetHighlightedCells() {
    highlightedRow.value = -1;
    highlightedCol.value = -1;
}
function isHighlighted(row: any, col: any) {
    return row <= highlightedRow.value && col <= highlightedCol.value;
}

const createTable = (row?: number, col?: number) => {
    if (!row || !col) return;
    const r = Number(row).toFixed(0).trim();
    const c = Number(col).toFixed(0).trim();
    const rows = Number(r);
    const cols = Number(c);
    if (isNaN(rows) || isNaN(cols)) return message('danger', t('system.illegal_input'));
    if (rows && rows > 0 && rows <= 50 && cols && cols > 0 && cols <= 50) {
        props.context.tool.insertTable({ row: rows, col: cols });
        emit('close');
    } else return message('danger', t('system.illegal_input'));
}

</script>

<template>
    <div class="table_container" @click.stop @mousedown.stop>
        <div class="table-title">
            <span>{{t('table.insert_table')}}</span>
            <span><span>{{ highlightedRow + 1 }}{{ t('table.row') }}</span><strong style="font-size: 16px;font-weight: 400"> · </strong><span>{{ highlightedCol +
                1 }}{{ t('table.col') }}</span></span>
        </div>
        <div class="table-cell">
            <div class="grid-container">
                <table class="grid-table" border="1">
                    <tbody>
                        <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
                            <td v-for="(cell, colIndex) in row" :key="colIndex"
                                :class="{ 'grid-cell': true, 'highlighted': isHighlighted(rowIndex, colIndex) }"></td>
                        </tr>
                    </tbody>
                </table>
                <table class="hover-table" border="1">
                    <tbody>
                        <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
                            <td v-for="(cell, colIndex) in row" :key="colIndex" :class="{ 'hover-cell': true }"
                                @mouseenter="highlightCells(rowIndex, colIndex)" @mouseleave="resetHighlightedCells"
                                @click="createTable(highlightedRow + 1, highlightedCol + 1)"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="table-state">{{ t('table.column_table') }}</div>
        <div class="table-input">
            <div class="row">
                <span>{{t('table.row_num')}}:</span>
                <input type="text" v-model="inputRow" placeholder="1~50">
            </div>
            <div class="col">
                <span>{{t('table.col_num')}}:</span>
                <input type="text" v-model="inputCol" placeholder="1~50">
            </div>
        </div>
        <div class="table-button">
            <button @click="createTable(inputRow, inputCol)"
                :style="{ background: inputRow && inputCol ? '#1878F5' : '#BDE2FF' }">{{t('table.confirm')}}</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.table_container {
    position: absolute;
    z-index: 999;
    width: auto;
    height: auto;
    border-radius: 4px;
    padding: 4px 12px;
    background-color: #FFFFFF;
    border: 1px solid #F0F0F0;
    box-shadow:  0px 4px 16px 0px rgba(0, 0, 0, 0.18);
    box-sizing: border-box;
    font-size: var(--font-default-fontsize);

    .table-title {
        height: 40px;
        padding: 14px 0;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        >:first-child {
            margin-right: 12px;
            font-weight: 500;
            line-height: 12px;
            color: #3D3D3D;
        }

        >:last-child {
            display: flex;
            align-items: center;
            color: #8C8C8C;
            height: 12px;
        }
    }

    .grid-container {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        border-spacing: 15px 10px;
    }

    .grid-table {
        padding: 3px;
        border: 1px solid #BFBFBF;
        border-collapse: separate;
        border-radius: 2px;
        border-spacing: 4px;
    }

    .grid-cell {
        width: 21px;
        height: 14px;
        border-radius: 2px;
        border: 1px solid #D9D9D9;
    }

    .highlighted {
        background-color: #BDE2FF;
        border: 1px solid #1878F5;
    }

    .table-state {
        font-size: 12px;
        line-height: 12px;
        padding: 16px 0 8px 0;
    }

    .table-input {
        display: flex;
        justify-content: space-between;

        .row {
            display: flex;
            align-items: center;

            >span {
                width: 36px;
                height: 12px;
                font-family: HarmonyOS Sans;
                font-size: 12px;
                line-height: 12px;
                color: #3D3D3D;
            }

            >input {
                width: 72px;
                border-radius: var(--default-radius);
                height: 30px;
                font-size: var(--font-default-fontsize);
                box-sizing: border-box;
                padding: 4px 27px 4px 12px;
                line-height: 22px;
                background: #F5F5F5;
                border: none;
            }

            input:focus {
                outline: none;
            }

            input::placeholder {
                color: #BFBFBF;
            }
        }

        .col {
            display: flex;
            align-items: center;

            >span {
                width: 36px;
                height: 12px;
                font-family: HarmonyOS Sans;
                font-size: 12px;
                line-height: 12px;
                color: #3D3D3D;
            }

            >input {
                width: 72px;
                border-radius: var(--default-radius);
                height: 30px;
                font-size: var(--font-default-fontsize);
                box-sizing: border-box;
                padding: 4px 27px 4px 12px;
                line-height: 22px;
                background: #F5F5F5;
                border: none;
            }

            input:focus {
                outline: none;
            }

            input::placeholder {
                color: #BFBFBF;
            }
        }
    }

    .hover-table {
        position: absolute;
        border-collapse: collapse;
        border: none;

        .hover-cell {
            width: 19px;
            height: 20px;
            border: none;
            top: 9px;
            left: 4px;
        }
    }

    .table-button {
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 10px 0;

        button {
            width: 228px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: none;
            border-radius: var(--default-radius);
            color: #FFFFFF;
        }
    }
}</style>