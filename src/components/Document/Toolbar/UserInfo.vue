<script setup lang="ts">
import UserAvatar from './UserAvatar.vue';
import Share from './Share/Share.vue';
import Scale from './Scale.vue';
import { defineProps } from 'vue';
import { Context } from '@/context';
interface Props {
    context: Context
}
const props = defineProps<Props>();

</script>

<template>
    <div class="user-info">
        <Share :context="props.context"></Share>
        <UserAvatar user="kc"></UserAvatar>
        <Scale :context="props.context"></Scale>
    </div>
</template>

<style scoped lang="scss">
.user-info {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;

    div {
        margin: auto 4px;
    }
}

.svg-container {
    cursor: pointer;
    width: 28px;
    height: 28px;
    color: #fff;
    border: 1px solid #fff;
    border-radius: 50%;

    >svg {
        width: 100%;
        height: 100%;
    }
}
</style>