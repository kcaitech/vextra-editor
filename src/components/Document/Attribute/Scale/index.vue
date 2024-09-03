<script setup lang="ts">
import TypeHeader from "@/components/Document/Attribute/TypeHeader.vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

</script>
<template>
<div class="scale-panel">
    <TypeHeader :title="t('attr.scale')" class="mt-24" :active="true">
        <template #tool>
            <div class="close">
                <svg-icon icon-class="add"/>
            </div>
        </template>
    </TypeHeader>

</div>
</template>
<style lang="scss" scoped>
.scale-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 8px;
    box-sizing: border-box;
    border-bottom: 1px solid #F0F0F0;

    .close {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        border-radius: var(--default-radius);
        transition: .2s;

        > svg {
            transform: rotate(45deg);
            width: 16px;
            height: 16px;
        }
    }

    .close:hover {
        background-color: #F5F5F5;
    }
}
</style>