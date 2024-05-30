<script setup lang="ts">
import UserAvatar from '../../Document/Toolbar/UserAvatar.vue';
import Share from '../../Document/Toolbar/Share/Share.vue';
import Scale from './Scale.vue';
import { } from 'vue';
import { Context } from '@/context';
interface Props {
    context: Context
}
const props = defineProps<Props>();

</script>
<template>
    <div class="user-info" @dblclick.stop>
        <UserAvatar :context="props.context"></UserAvatar>
        <Share :context="props.context"></Share>
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