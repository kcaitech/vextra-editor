<template>
    <div class="card-container" @keyup.esc="close" @keyup.enter="createProject">
        <div class="heard">
            <div class="title">
                {{ t('Createteam.add_project') }}
            </div>
            <div class="close" @click.stop="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="centent">
            <div class="project-name">
                <div class="title">
                    {{ t('Createteam.project_name') }}
                    <span>{{ t('Createteam.required') }}</span>
                </div>
                <input
                    :style="{ backgroundColor: inputValue !== '' ? 'rgba(245, 245, 245, 1)' : '', color: inputValue !== '' ? '#262626' : '' }"
                    ref="projectinput" type="text" :placeholder="t('Createteam.project_name_tips')" v-model="inputValue"
                    maxlength="20" required>
            </div>
            <div class="project-description">
                <div class="title">
                    {{ t('Createteam.project_description') }}
                    <span>{{ t('Createteam.optional') }}</span>
                </div>
                <textarea
                    :style="{ backgroundColor: textareaValue !== '' ? 'rgba(245, 245, 245, 1)' : '', color: textareaValue !== '' ? '#262626' : '' }"
                    name="" id="" cols="30" rows="10" :placeholder="t('Createteam.project_description_tips')"
                    v-model="textareaValue" maxlength="120"></textarea>
            </div>
        </div>
        <div class="addproject">
            <button type="button" :disabled=isDisabled @click.stop="createProject">{{ t('projectlist.confirm1') }}</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus'
import { router } from '@/router';
const { t } = useI18n();
const emits = defineEmits<{
    (e: 'close'): void
}>()
const props = defineProps<{
    teamid: string
}>()

const projectinput = ref()
const inputValue = ref('')
const textareaValue = ref('')
const isDisabled = computed(() => inputValue.value.trim() === '')
const { updateprojectliststate } = inject('shareData') as {
    updateprojectliststate: (b: boolean) => void;
};

const createProject = async () => {
    if (inputValue.value.trim() === '') {
        ElMessage.error('项目名称不能为空')
        return
    }
    try {
        const { code, message, data } = await user_api.CreateProject({ team_id: props.teamid, name: inputValue.value, description: textareaValue.value })
        if (code === 0) {
            emits('close')
            updateprojectliststate(true)
            nextTick(() => {
                router.push({ path: '/apphome/project/' + data.id });
            })
        } else {
            ElMessage.error(message)
        }
    } catch (error) {
        ElMessage.error(t('home.other_tips'))
    }
}

nextTick(() => {
    projectinput.value.focus()
})

const close = () => {
    emits('close')
}

</script>
<style lang="scss" scoped>
@keyframes move {
    from {
        transform: translate(-50%, -20%);
        opacity: 0;
    }

    to {
        transform: translate(-50%, 0);
        opacity: 1;
    }
}

.card-container {
    position: absolute;
    width: 400px;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 0 24px;
    background-color: rgba(255, 255, 255, 1);
    border-radius: 16px;
    border: 1px solid #F0F0F0;
    box-sizing: border-box;
    z-index: 1000;
    animation: move 0.25s ease-in-out;

    .heard {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;

        .title {
            font-size: 16px;
            font-weight: 600;
            color:#3D3D3D;
        }

        .close {
            display: flex;
            width: 16px;
            height: 16px;
            padding: 4px;
            border-radius: 6px;

            &:hover {
                background-color: rgb(243, 243, 245);
                cursor: pointer;
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .centent {

        .project-name,
        .project-description {
            display: flex;
            flex-direction: column;
            margin: 0 0 12px 0;

            .title {
                line-height: 34px;
                font-size: 13px;
                color: #262626;
                font-weight: 400;
            }

            input,
            textarea {
                padding: 7px 12px;
                width: 100%;
                font-size: 13px;
                color: #BFBFBF;
                border: none;
                outline-style: none;
                border-radius: 6px;
                border: 1px solid rgba(245, 245, 245, 1);
                background-color: rgba(245, 245, 245, 1);
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(235, 235, 235, 1);
                }

                &:focus {
                    border: 1px solid #1878F5;
                    background-color: rgba(245, 245, 245, 1) !important;
                }
            }

            input {
                height: 36px;
            }

            textarea {
                height: 80px;
                resize: none;
                font-family: none;
            }
        }
    }

    .addproject {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 64px;
        margin-bottom: 8px;

        button {
            cursor: pointer;
            color: white;
            font-size: 14px;
            font-weight: 500;
            width: 214px;
            height: 40px;
            border: none;
            border-radius: 6px;
            background-color: rgba(24, 120, 245, 1);

            &:hover {
                background-color: rgba(66, 154, 255, 1);
            }

            &:active {
                background-color: rgba(10, 89, 207, 1);
            }

            &:disabled {
                background-color: rgba(189, 226, 255, 1);
            }
        }
    }
}
</style>
