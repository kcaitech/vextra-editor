<script lang="ts" setup>
import { Shape } from '@kcdesign/data';
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/context';
const { t } = useI18n();
interface Props {
    context: Context
    shapes: Shape[]
}
const props = defineProps<Props>();
</script>

<template>
    <div class="table-panel">
        <TypeHeader :title="t('table.table_style')" class="mt-24">
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