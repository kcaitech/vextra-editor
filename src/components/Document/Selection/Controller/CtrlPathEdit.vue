<script lang="ts" setup>
import PointsPathEditContainer from "@/components/Document/Selection/Controller/Points/PointsPathEditContainer.vue";
import {Context} from "@/context";

interface Props {
    context: Context
}

const props = defineProps<Props>();
</script>
<template>
    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
         data-area="controller"
         xmlns:xhtml="http://www.w3.org/1999/xhtml" preserveAspectRatio="xMinYMin meet"
         :width="200" :height="200" overflow="visible"
    >
        <PointsPathEditContainer :context="props.context"></PointsPathEditContainer>
    </svg>
</template>
<style lang="scss" scoped>

</style>