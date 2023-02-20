<script setup lang="ts">
import { defineProps, ref, computed, defineEmits } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
const props = defineProps<{ context: Context }>();

</script>

<template>
    <section>
        <PageList class="page-navi" :context="props.context" v-bind="$attrs"></PageList>
        <div class="line" />
        <ShapeList class="shape-navi" :context="props.context"></ShapeList>
    </section>
</template>

<style scoped>
section {
    width: 100%;
    height: 100%;
}
.page-navi {
    flex: 0 0 auto;
    max-height: 50%;
}

.shape-navi {
    width: 100%;
    height: 100%;
    flex: 1 1 auto;
}

div.line {
    width: 100%;
    height: 1px;
    background-color: var(--theme-color-line);
    flex: 0 0 auto;
}
</style>
