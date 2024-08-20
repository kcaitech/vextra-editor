<script setup lang="ts">
// import UserAvatar from './UserAvatar.vue';
// import Share from './Share/Share.vue';
import Scale from './Scale.vue';
import {} from 'vue';
import { Context } from '@/context';
// import Collaborator from './Collaboration/Collaborator.vue';
import LableToggle from './LableToggle.vue';
import PublishEnter from './Publish/index.vue';

interface Props {
    context: Context
}

const props = defineProps<Props>();

const plugins = props.context.pluginsMgr.search2('toolbar.others');
const comps: { component: any, params?: any }[] = []
comps.push(...plugins.begin)
// comps.push({ component: PublishEnter })
comps.push({ component: LableToggle })
comps.push({ component: Scale })
comps.push(...plugins.end)

</script>
<template>
<div class="others" @dblclick.stop>
    <component v-for="c in comps" :is=c.component :context="props.context" :params="c.params"/>
</div>
</template>

<style scoped lang="scss">
.others {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 0;

    div {
        margin: auto 0 auto 8px;
    }
}
</style>