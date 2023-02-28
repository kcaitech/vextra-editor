<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 11:13:39
 * @FilePath: \kcdesign\src\components\Document\Navigation\index.vue
-->
<script setup lang="ts">
import { defineProps, ref } from "vue";
import type { TabsPaneContext } from 'element-plus';
import { Context } from "@/context";
import ShapeList from "./ShapeList.vue";
import PageList from "./PageList.vue";
const props = defineProps<{ context: Context }>();
const activeName = ref('page');

const handleClick = (tab: TabsPaneContext, event: Event) => {};
</script>

<template>
    <section>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane label="图层" name="page">
            <PageList class="page-navi" :context="props.context" v-bind="$attrs"></PageList>
            <div class="line" />
            <ShapeList class="shape-navi" :context="props.context"></ShapeList>
          </el-tab-pane>
          <el-tab-pane label="组件" name="components"></el-tab-pane>
          <el-tab-pane label="资源库" name="template"></el-tab-pane>
        </el-tabs>
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

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

:deep(.el-tabs__header) {
    padding-top: 8px;
    margin-bottom: 4px;
}

:deep(.el-tabs__active-bar) {
    display: none;
}

:deep(.is-active) {
    background-color: #cecece;
    color: #000000;
    border-radius: 5px 5px 0 0;
}

:deep(.el-tabs__item:hover) {
    color: grey;
}

:deep(.el-tabs__item) {
    height: 28px;
    line-height: 28px;
    padding: 0px 16px !important;
}
</style>
