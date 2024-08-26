<script setup lang="ts">
import { Context } from '@/context';

interface Props {
    context: Context
}

const props = defineProps<Props>();

const plugins = props.context.pluginsMgr.search2('preview.toolbar.home');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
comps.push(...plugins.end)

</script>

<template>
    <div class="container" @dblclick.stop>
        <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>

<style scoped lang="scss">
.container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: auto;
    height: 32px;
}
</style>