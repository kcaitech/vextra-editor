<!--
 * @Author: Zrx georgezrx@163.com
 * @Date: 2023-03-09 11:15:13
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:34:55
 * @FilePath: \kcdesign\src\components\Document\Navigation\ShapeTab.vue
-->
<script setup lang="ts">
import { defineProps } from "vue";
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
const props = defineProps<{ context: Context }>();

</script>

<template>
    <div class="shapetab-container">
        <PageList class="page-navi" :context="props.context" v-bind="$attrs"></PageList>
        <div class="line" />
        <ShapeList class="shape-navi" :context="props.context"></ShapeList>
    </div>
    
</template>

<style scoped lang="scss">
.shapetab-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-flow: column nowrap;
    > .page-navi {
        flex: 0 0 auto;
        max-height: 50%;
    }
    > .shape-navi {
        width: 100%;
        height: 100%;
        flex: 1 1 auto;
    }
    > .line {
        width: 100%;
        height: 3px;
        background-color: var(--theme-color-line);
        flex: 0 0 auto;
    }
}
</style>