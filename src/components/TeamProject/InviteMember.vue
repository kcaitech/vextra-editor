<template>
    <div class="card-container">
        <div class="heard">
            <div class="title">
                邀请同事加入团队
            </div>
            <div class="close" @click.stop="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="centent">
            <div class="permission-setting">
                <span>权限设置</span>
                <el-select class="select" v-model="value" value-key="id" filterable style="width: 120px;">
                    <el-option v-for="{ id, label } in options" :key="id" :value="id" :label="label" />
                </el-select>
            </div>
            <div>发送链接或二维码给同事申请加入</div>
            <div>邀请链接开关：<el-switch v-model="value2" class="ml-2"
                    style="--el-switch-on-color: #9775fa" /></div>
            <input type="text" placeholder="test" :disabled="!value2">
            <div>同事申请后，需管理员确认后才能加入</div>
        </div>
        <div class="invitemember">
            <button type="submit" @click.stop="createProject">复制链接</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/apis/users'
import { ElMessage } from 'element-plus'


const { t } = useI18n();
const emits = defineEmits(['close'])
const props = defineProps<{
    teamid: string
}>()
const inputValue = ref('')
const textareaValue = ref('')
const isDisabled = computed(() => inputValue.value.trim() === '')
const value = ref({ id: 0, label: '可编辑' })
const options = [{ id: 0, label: '可编辑' }, { id: 1, label: '仅阅读' }]
const value2=ref(false)

const createProject = () => {
    console.log(value.value);

}

const close = () => {
    emits('close')
}

</script>
<style lang="scss" scoped>
.card-container {
    position: absolute;
    background-color: white;
    width: 480px;
    height: 400px;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 16px 24px;
    z-index: 1000;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);

    .heard {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
            font-size: 24px;
            font-weight: 600;
            color: #3D3D3D
        }

        .close {
            width: 24px;
            height: 24px;
            padding: 4px;

            &:hover {
                background-color: #f3f0ff;
                border-radius: 3px;
                cursor: pointer;

                >svg {
                    fill: #9775fa;
                }
            }

            &:active>svg {
                transform: scale(0.9);
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .centent {
        margin-top: 12px;
        font-size: 16px;

        .permission-setting {
            margin-top: 16px;
            color: #3D3D3D;
            display: flex;
            align-items: center;

            .select {
                margin-left: 8px;
            }
        }
    }

    .invitemember {
        text-align: center;
        margin-top: 40px;

        button {
            cursor: pointer;
            color: white;
            font-size: 18px;
            letter-spacing: 2px;
            width: 120px;
            height: 48px;
            border: none;
            background-color: #9775fa;
            border-radius: 4px;
            box-shadow: 1px 1px 3px rgb(0, 0, 0);

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }

            &:active {
                background-color: #9775fa;
            }

            &:disabled {
                background-color: rgba(98, 67, 237, 0.3);
            }
        }
    }
}
</style>
