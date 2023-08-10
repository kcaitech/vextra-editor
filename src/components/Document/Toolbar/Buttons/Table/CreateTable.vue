<script setup lang="ts">
import { ref } from 'vue';
const grid = ref(Array.from({ length: 10 }, () => Array(10).fill(false)));
const highlightedRow = ref(-1);
const highlightedCol = ref(-1);
const inputRow = ref<number>()
const inputCol = ref<number>()

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
    console.log(row,'行', col,'列');
    
}
</script>

<template>
    <div class="table_container">
        <div class="table-title">
            <span>插入表格</span>
            <span><span>{{highlightedRow + 1}}行</span><strong style="font-size: 16px;"> · </strong><span>{{highlightedCol + 1}}列</span></span>
        </div>
        <div class="table-cell">
            <div class="grid-container">
                <table class="grid-table" border="1">
                    <tbody>
                        <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
                        <td
                            v-for="(cell, colIndex) in row"
                            :key="colIndex"
                            :class="{ 'grid-cell': true, 'highlighted': isHighlighted(rowIndex, colIndex) }"
                        ></td>
                        </tr>
                    </tbody>
                </table>
                <table class="hover-table" border="1">
                    <tbody>
                        <tr v-for="(row, rowIndex) in grid" :key="rowIndex">
                        <td
                            v-for="(cell, colIndex) in row"
                            :key="colIndex"
                            :class="{ 'hover-cell': true }"
                            @mouseenter="highlightCells(rowIndex, colIndex)"
                            @mouseleave="resetHighlightedCells"
                            @click="createTable(highlightedRow + 1, highlightedCol + 1)"
                        ></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div class="table-state">指定行列表格</div>
        <div class="table-input">
            <div class="row">
                <span>行数:</span>
                <input type="text" v-model="inputRow">
            </div>
            <div class="col">
                <span>列数:</span>
                <input type="text" v-model="inputCol">
            </div>
        </div>
        <div class="table-button">
            <button @click="createTable(inputRow, inputCol)">确定</button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.table_container {
    position: absolute;
    z-index: 999;
    width: 250px;
    height: 380px;
    border-radius: 4px;
    padding: 10px;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    font-size: var(--font-default-fontsize);
    .table-title {
        >:first-child {
            margin-right: 10px;
            font-size: 13px;
        }
        >:last-child {
            color: #7D7D7D;
        }
    }
    .grid-container {
        position: relative;
        margin-top: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-spacing: 15px 10px;
    }

    .grid-table {
        padding: 3px;
        border-color: rgba(0, 0, 0, 0.5);
        border-collapse: separate;
        border-radius: 2px;
    }
   

    .grid-cell {
        width: 17px;
        height: 17px;
        border-radius: 3px;
        border-color: rgba(0, 0, 0, 0.3);
    }

    .highlighted {
        background-color: var(--active-color);
        opacity: 0.5;
    }
    .table-state {
        margin-top: 8px;
        font-size: 13px;
    }
    .table-input {
        display: flex;
        margin-top: 8px;
        .row {
            display: flex;
            align-items: center;
            margin-right: 10px;
            >input {
                margin-left: 5px;
                width: 60px;
                border-radius: 4px;
                height: 20px;
                border: 1px solid rgba(0, 0, 0, 0.3);
            }
            input:focus {
                outline: none;
            }
        }
        .col {
            display: flex;
            align-items: center;
            >input {
                margin-left: 5px;
                width: 60px;
                border-radius: 4px;
                height: 20px;
                border: 1px solid rgba(0, 0, 0, 0.3);
            }
            input:focus {
                outline: none;
            }
        }
    }
    .hover-table {
        position: absolute;
        top: 5px;
        left: 5px;
        border-collapse: collapse;
        border: none;
        .hover-cell {
            width: 20px;
            height: 20px;
            border: none;
        }
    }
    .table-button {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 15px;
        button {
            width: 70px;
            height: 26px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #fff;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
            
        }
    }
}
</style>