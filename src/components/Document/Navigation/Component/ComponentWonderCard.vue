<script setup lang="ts">
import { SymbolShape } from "@kcdesign/data";
import ShapeCard from "@/components/common/ShapeCard.vue";

interface Props {
    data: SymbolShape
}
const props = defineProps<Props>();
</script>
<template>
    <div class="compo-preview-container">
        <ShapeCard :shape="props.data" class="render-wrap" :size="96"></ShapeCard>
    </div>
</template>
<style scoped lang="scss">
.compo-preview-container {
    width: 100px;
    height: 100px;

    .render-wrap {
        margin-top: 2px;
        margin-left: 2px;
    }
}
</style>