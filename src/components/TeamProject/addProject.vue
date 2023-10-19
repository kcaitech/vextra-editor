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
                <div class="title">{{ t('Createteam.project_name') }}<span>{{ t('Createteam.required') }}</span></div>
                <input ref="projectinput" type="text" :placeholder="t('Createteam.project_name_tips')" v-model="inputValue"
                    maxlength="20" required>
            </div>
            <div class="project-description">
                <div class="title">{{ t('Createteam.project_description') }}<span>{{ t('Createteam.optional') }}</span>
                </div>
                <textarea name="" id="" cols="30" rows="10" :placeholder="t('Createteam.project_description_tips')"
                    v-model="textareaValue" maxlength="120" />
            </div>
        </div>
        <div class="addproject">
            <button type="submit" :disabled=isDisabled @click.stop.once="createProject">确认</button>
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
.card-container {
    position: absolute;
    background-color: white;
    width: 420px;
    border-radius: 5px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 12px;
    font-size: 14px;
    z-index: 1000;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;

    .heard {
        display: flex;
        align-items: center;
        justify-content: space-between;

        .title {
            font-size: 18px;
            font-weight: 600;
            color: #3D3D3D
        }

        .close {
            width: 18px;
            height: 18px;
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
        margin-top: 16px;

        .project-name,
        .project-description {
            margin-top: 12px;
            color: #3D3D3D;

            .title {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;

                span {
                    font-weight: 500;
                }
            }

            input {
                padding: 2px 8px;
                width: 100%;
                height: 32px;
                border: none;
                outline-style: none;
                background-color: rgba(0, 0, 0, 0.08);
                border-radius: 4px;
                box-sizing: border-box;

                &:focus {
                    border: 2px solid #9775fa;
                    padding: 0px 6px;
                }
            }

            textarea {
                padding: 8px;
                width: 100%;
                height: 120px;
                border: none;
                outline-style: none;
                resize: none;
                font-family: none;
                background-color: rgba(0, 0, 0, 0.08);
                border-radius: 4px;
                box-sizing: border-box;

                &:focus {
                    border: 2px solid #9775fa;
                    padding: 6px;
                }
            }
        }
    }

    .addproject {
        text-align: center;
        margin-top: 12px;

        button {
            cursor: pointer;
            color: white;
            font-size: 14px;
            letter-spacing: 1px;
            width: 80px;
            height: 32px;
            border: none;
            background-color: #9775fa;
            box-shadow: 1px 1px 3px #b1b1b1, -1px -1px 3px #b1b1b1;
            border-radius: 4px;
            // box-shadow: 1px 1px 3px rgb(0, 0, 0);

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }

            &:active {
                background-color: #9775fa;
            }

            &:disabled {
                background-color: rgba(98, 67, 237, 0.3);
                box-shadow: none;
            }
        }
    }
}
</style>
