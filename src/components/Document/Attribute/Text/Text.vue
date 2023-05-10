<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24">
            <template #tool>
                <div class="trigger" >
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="text-container">
            
        </div>
    </div>

</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .trigger {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
            width: 50%;
            height: 50%;
            transition: 0.5s;
        }
        svg:hover {
        transform: rotate(90deg);
      }
    }
}

</style>