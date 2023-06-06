<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:36:00
 * @FilePath: \kcdesign\src\components\Document\Navigation\index.vue
-->
<script setup lang="ts">
import {} from "vue";
import { Context } from "@/context";
import Tabs from "@/components/Document/Navigation/LeftTabs.vue";
import { Page } from "@kcdesign/data";

const props = defineProps<{ context: Context, page: Page }>();

</script>

<template>
    <Tabs :context="props.context" v-bind="$attrs" :page="page"></Tabs>
</template>
