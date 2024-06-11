<script setup lang="ts">
// import UserAvatar from './UserAvatar.vue';
// import Share from './Share/Share.vue';
import Scale from './Scale.vue';
import { } from 'vue';
import { Context } from '@/context';
// import Collaborator from './Collaboration/Collaborator.vue';
import LableToggle from './LableToggle.vue';
interface Props {
    context: Context
}
const props = defineProps<Props>();

</script>
<template>
    <div class="user-info" @dblclick.stop>
        <!-- <Collaborator :context="props.context"></Collaborator>
        <UserAvatar :context="props.context"></UserAvatar>
        <Share :context="props.context"></Share> -->
        <LableToggle :context="props.context"></LableToggle>
        <Scale :context="props.context"></Scale>
    </div>
</template>

<style scoped lang="scss">
.user-info {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 0px;

    div {
        margin: auto 0 auto 8px;
    }
}
</style>