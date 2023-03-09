<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:36:00
 * @FilePath: \kcdesign\src\components\Document\Navigation\index.vue
-->
<script setup lang="ts">
import { defineProps } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
import Tabs from "@/components/common/Tabs.vue";

const props = defineProps<{ context: Context }>();

</script>

<template>
    <section>
        <!-- <PageList class="page-navi" :context="props.context" v-bind="$attrs"></PageList>
        <div class="line" />
        <ShapeList class="shape-navi" :context="props.context"></ShapeList> -->
        <Tabs :context="props.context" v-bind="$attrs"></Tabs>
    </section>
</template>

<style scoped lang="scss">
section {
    width: 100%;
    height: 100%;
    // > .page-navi {
    //     flex: 0 0 auto;
    //     max-height: 50%;
    // }

    // > .line {
    //     width: 100%;
    //     height: 3px;
    //     background-color: var(--theme-color-line);
    //     flex: 0 0 auto;
    // }

    // > .shape-navi {
    //     width: 100%;
    //     height: 100%;
    //     flex: 1 1 auto;
    // }
}
</style>
