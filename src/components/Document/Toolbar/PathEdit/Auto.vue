<script setup lang="ts">
import ToolButton from '../../Toolbar/Buttons/ToolButton.vue';
import { Action } from "@/context/tool";
import { useI18n } from 'vue-i18n'
import Tooltip from '@/components/common/Tooltip.vue';

const { t } = useI18n()
const props = defineProps<{
    active: boolean
}>();
const emit = defineEmits<{
    (e: "select", action: string): void;
}>();

function select(action: string) {
    emit('select', action);
}
</script>
<template>
    <Tooltip :content="`${t('home.object_selector')} &nbsp;&nbsp; V`">
        <ToolButton ref="button" @click="() => {select(Action.AutoV)}" :selected="props.active" :width="32"
                    :height="32">
            <div class="svg-container">
                <svg-icon icon-class="drag"></svg-icon>
            </div>
        </ToolButton>
    </Tooltip>
</template>
<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #ffffff;

    > svg {
        width: 18px;
        height: 18px;
    }
}
</style>