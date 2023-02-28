<!--
 * @LastEditors: Zrx georgezrx@163.com
 * @LastEditTime: 2023-02-28 16:52:53
 * @FilePath: \kcdesign\src\components\Document\Toolbar\UserInfo.vue
-->
<script setup lang="ts">
import ToolButton from './ToolButton.vue';
import UserAvatar from './UserAvatar.vue';

</script>

<template>
    <div class="user-info">
        <ToolButton>
            <div class="svg-container" title="play">
                <svg-icon icon-class="play"></svg-icon>
            </div>
        </ToolButton>
        <UserAvatar user="kc"></UserAvatar>
    </div>
    
</template>

<style scoped lang="scss">
    .user-info {
        box-sizing: border-box;
        display: flex;
        flex-direction: row;
        position: absolute;
        right: 0;
        transform: translateX(-10%);
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
        > svg {
            width: 100%;
            height: 100%;
        }
    }
</style>