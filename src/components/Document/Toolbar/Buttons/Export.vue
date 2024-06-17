<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import { Context } from "@/context";
import { useI18n } from "vue-i18n";
import Tooltip from '@/components/common/Tooltip.vue';
import { Action } from '@/context/tool';

const { t } = useI18n();

const props = defineProps<{
    context: Context,
    params: {
        active: boolean,
    }
}>();

const emit = defineEmits<{
    (e: "select", action: string): void;
}>();
const exportClick = () => {
    props.context.menu.setExportDialog(true);
    emit('select', Action.Export);
}

</script>

<template>
    <Tooltip :content="`${t('cutoutExport.export_cutout')}`">
        <ToolButton ref="button" @click.stop="exportClick" style="width: 32px" :selected="props.params.active">
            <div class="svg-container" id="export_dialog">
                <svg-icon icon-class="dialog"></svg-icon>
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
    padding: 6px 6px 6px 6px;
    box-sizing: border-box;

  >svg {
      width: 18px;
      height: 18px;
  }
}
</style>