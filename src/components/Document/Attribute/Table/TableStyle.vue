/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script lang="ts" setup>
import { ShapeView } from '@kcdesign/data';
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
const { t } = useI18n();
interface Props {
    context: Context
    shape: ShapeView 
}
const props = defineProps<Props>();
</script>

<template>
    <div class="table-panel">
        <TypeHeader :title="t('table.table_style')" class="mt-24" :active="true">
        </TypeHeader>
        <div class="table-container">
            <div class="box-falst">
                <div></div>
                <div></div>
            </div>
            <div class="box-falst">
                <div></div>
                <div></div>
            </div>
        </div>
       
    </div>
</template>

<style lang="scss" scoped>
.table-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .table-container {
        display: flex;
        flex-direction: column;
        .box-falst {
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            div {
                width: 45%;
                height: 70px;
                background-color: var(--active-color);
            }
        }
    }
}
</style>