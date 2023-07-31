<script setup lang="ts">
import { Context } from '@/context';
import { ref } from 'vue'
interface Props {
    context: Context
    info: any
}
const props = defineProps<Props>();
const showInfo = ref(false)
const timer = ref()
const showStaffInfo = () => {
    timer.value = setTimeout(() => {
        showInfo.value = true
    }, 500)
}
const closeStaff = () => {
    showInfo.value = false
    clearTimeout(timer.value)
}
</script>

<template>
    <div class="info_container" @mouseenter="showStaffInfo" @mouseleave="closeStaff">
        <div class="popup" v-if="showInfo">
            <div>
                <div class="avatar"></div>
                <div class="name">{{ info.name }}</div>
            </div>
            <div>
                <div class="author">权限:</div>
                <div class="perm">{{ info.perm }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.info_container {
    position: relative;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    background-color: red;
    text-align: center;
    margin-left: 3px;
    font-size: var(--font-default-fontsize);
    .popup {
        position: absolute;
        top: 33px;
        left: 0;
        width: 100px;
        background-color: yellow;
        border-radius: 4px;
        box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
        padding: var(--default-padding-half) 0;
        >div {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 30px;
            width: 100%;
            padding: 0 var(--default-padding-half);
            box-sizing: border-box;
        }
        .avatar {
            width: 25px;
            height: 25px;
            background-color: red;
            border-radius: 50%;
        }
        .name {
            width: 60%;            
        }
        .author {
            width: 40%;
        }
        .perm {
            width: 60%;
        }
    }
}
</style>