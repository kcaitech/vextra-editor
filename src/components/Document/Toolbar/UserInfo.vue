<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';
import Share from './Share/Share.vue';
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
        <Share :context="props.context"></Share>
        <UserAvatar :context="props.context"></UserAvatar>
        <Scale :context="props.context"></Scale>
    </div>
</template>

<style scoped lang="scss">
.user-info {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    position: absolute;
    right: 8px;

    div {
        margin: auto 4px;
    }
}
</style>