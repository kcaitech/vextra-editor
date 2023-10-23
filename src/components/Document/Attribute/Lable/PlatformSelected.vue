<script lang="ts" setup>
import { Context } from "@/context";
import { ArrowDown } from '@element-plus/icons-vue';
import { nextTick, ref } from "vue";
import LableDropMenu from "./LableDropMenu.vue";
const props = defineProps<{
    context: Context
}>();

const selectoption = ref(false);
const selsectedShow = ref(false);
const multiple = ref(1);
const platform = ref(1);
const platformMenuItems = ref<string[]>([
    'iOS', 'Web', 'Android', '微信小程序'
])
const pxMenuItems = ref<string[]>([
    '像素 x0.5', '像素 x1', '像素 x2'
])

const onSelected = () => {
    if(selsectedShow.value) {
        props.context.menu.lableMenuMount('platform');
    }else {
        props.context.menu.lableMenuMount();
    }
    selsectedShow.value = !selsectedShow.value;
}
const listMenuStatus = (i: number) => {
    platform.value = i;
    props.context.menu.setPlatfrom(i);
}
const multiples = [0.5, 1, 2];
const pxMenuStatus = (i: number) => {
    multiple.value = i;
    props.context.menu.setLableMulriple(multiples[i]);
}
const close = () => {
    selsectedShow.value = false;
}
</script>

<template>
    <div class="container">
        <span class="name">开发平台</span>
        <div class="selected">
            <div class="platform-input" @click.stop="onSelected">
                <span>{{ platformMenuItems[platform] }}</span>
                <el-icon>
                    <ArrowDown
                        :style="{ transform: selectoption ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.3s' }" />
                </el-icon>
                <LableDropMenu v-if="selsectedShow" :context="context" :Items="platformMenuItems" :pxItems="pxMenuItems" :choose="platform"
                    :choose2="multiple" @close="close" @listMenuStatus="listMenuStatus"
                    @pxMenuStatus="pxMenuStatus"></LableDropMenu>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.container {
    width: 100%;
    height: 50px;
    display: flex;
    padding: 10px 8px;
    padding-right: 10px;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;

    .name {
        font-weight: bold;
        margin-right: 15px;
    }

    .selected {
        flex: 1;

        .platform-input {
            position: relative;
            width: 100%;
            height: 30px;
            border-radius: 4px;
            padding-left: 11px;
            box-sizing: border-box;
            display: flex;
            align-items: center;
            background-color: var(--grey-light);

            span {
                flex: 1;
            }

            .el-icon {
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }
    }
}</style>