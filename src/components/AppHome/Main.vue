<script setup lang="ts">
import { Menu, Operation } from '@element-plus/icons-vue'
import { RouterView } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { onBeforeUpdate, onMounted, onUnmounted, onUpdated, ref } from 'vue';
import { update } from 'lodash';

const {t} = useI18n()

const titleid = ref(localStorage.getItem('index'))
console.log(titleid.value);
</script>

<template>
    <div class="title">
        <div>
            <span>{{ titleid }}</span>
        </div>
        <!-- <div>
            <el-icon size="25">
                <Menu />
            </el-icon>
            <el-icon size="25">
                <Operation size="30" />
            </el-icon>
        </div> -->
    </div>
    <el-divider />
    <div class="main">
        <RouterView />
    </div>
</template>

<style lang="scss" scoped>
.main .title {
    width: calc(100vw - 381px);
    height: 100vh;
    overflow: scroll;

}

.title {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 40px;

    .el-icon {
        margin-right: 20px;

        &:hover {
            background: rgb(188, 188, 188);
        }
    }

    span {
        width: 80px;
        font-weight: bold;
        letter-spacing: 2px;
    }
}
</style>