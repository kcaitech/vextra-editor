<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-03-09 14:36:00
 * @FilePath: \kcdesign\src\components\Document\Navigation\index.vue
-->
<script setup lang="ts">
import {Context} from "@/context";
import Tabs from "@/components/Document/Navigation/LeftTabs.vue";
import {PageView} from "@kcdesign/data";

const props = defineProps<{ context: Context, page: PageView, leftTriggerVisible: boolean, showLeft: boolean }>();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()

const showHiddenLeft = () => {
    emit('showNavigation')
}
</script>

<template>
    <Tabs :context="props.context" v-bind="$attrs" :page="page" :showLeft="showLeft"
          :leftTriggerVisible="leftTriggerVisible" @showNavigation="showHiddenLeft"></Tabs>
</template>
