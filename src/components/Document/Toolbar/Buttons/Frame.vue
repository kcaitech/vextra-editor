<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { useI18n } from 'vue-i18n';
import Tooltip from '@/components/common/Tooltip.vue';
import { Context } from '@/context';
import { useFrame } from "@/components/Document/Creator/execute";

interface Props {
    context: Context;
    params: {
        active: boolean,
    }
}
const { t } = useI18n();
defineProps<Props>();

</script>

<template>
  <ToolButton ref="button" :selected="params.active" style="width: 32px">
        <Tooltip :content="`${t('shape.artboard')} &nbsp;&nbsp; F`" :offset="10">
          <div class="svg-container" @click="() => {useFrame(context)}">
            <svg-icon icon-class="frame"/>
          </div>
        </Tooltip>
    </ToolButton>
</template>

<style scoped lang="scss">
.svg-container {
    width: 32px;
    height: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

    >svg {
        width: 18px;
        height: 18px;
    }
}
</style>