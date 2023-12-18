<template>
    <div class="card-container" @keyup.esc="close" @keyup.enter="createTeam">
        <div class="heard">
            <div class="title">
                {{ t('Createteam.add_team') }}
            </div>
            <div class="close" @click.stop="close">
                <svg-icon icon-class="close"></svg-icon>
            </div>
        </div>
        <div class="centent">
            <div class="team-name">
                <div class="title">
                    {{ t('Createteam.team_name') }}
                    <span>{{ t('Createteam.required') }}</span>
                </div>
                <input
                    :style="{ backgroundColor: inputValue !== '' ? 'rgba(245, 245, 245, 1)' : '', color: inputValue !== '' ? '#262626' : '' }"
                    ref="inputteam" type="text" :placeholder="t('Createteam.team_name_tips')" v-model="inputValue"
                    maxlength="20" required>
            </div>
            <div class="team-description">
                <div class="title">
                    {{ t('Createteam.team_description') }}
                    <span>{{ t('Createteam.optional') }}</span>
                </div>
                <textarea
                    :style="{ backgroundColor: textareaValue !== '' ? 'rgba(245, 245, 245, 1)' : '', color: textareaValue !== '' ? '#262626' : '' }"
                    name="" id="" cols="30" rows="10" :placeholder="t('Createteam.team_description_tips')"
                    v-model="textareaValue" maxlength="120"></textarea>
            </div>
            <div class="team-avatar">
                <div class="title">
                    {{ t('Createteam.team_avatar') }}
                    <span>{{ t('Createteam.optional') }}</span>
                </div>
                <div class="avatar-content" :style="{ backgroundColor: isshow ? '' : 'rgba(250, 250, 250, 1)' }">
                    <input type="file" accept=".jpg, .png" @change="selectimg($event)">
                    <div v-if="isshow" class="closediv">
                        <svg-icon icon-class="close"></svg-icon>
                    </div>
                    <img v-else :src=imgsrc alt="Team Avatar" style="width: 56px;height:56px;border-radius: 50%;">
                    <p>{{ t('Createteam.avatar_restriction') }}</p>
                </div>
            </div>
        </div>
        <div class="addteam">
            <button type="button" :disabled=isDisabled @click.stop="createTeam">{{ t('Createteam.add_team') }}</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/request/users'
import { useRoute } from 'vue-router'
import { router } from '@/router';
const { t } = useI18n();
const route = useRoute()
const emits = defineEmits<{
    (e: 'close'): void
}>()
const inputteam = ref()
const inputValue = ref('')
const textareaValue = ref('')
const isDisabled = computed(() => inputValue.value.trim() === '')
const imgsrc = ref('')
const isshow = ref(true)
const formData = new FormData()

const { state } = inject('shareData') as {
    state: (b: boolean) => void;
}

const createTeam = async () => {
    formData.append('name', inputValue.value)
    if (textareaValue.value != '') {
        formData.append('description', textareaValue.value)
    }
    try {
        const { code, message, data } = await user_api.CreateTeam(formData)
        if (code === 0) {
            emits('close')
            state(true)  //改变updatestate的值为TRUE
            if (route.params.id) {
                router.push({ path: `/apphome/teams/${data.id}` })
                sessionStorage.setItem('index', '6')
            } else {
                router.push({ path: `teams/${data.id}` })
                sessionStorage.setItem('index', '6')
            }
        } else {
            ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder') : message)
            formData.delete('name');
            formData.delete('description');
        }
    } catch (error) {
        emits('close')
        ElMessage.error('创建失败')
    }

}

const selectimg = (e: any) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0]
        const fileName = file.name
        const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file && file.size <= maxSizeInBytes && e.target.accept.includes(fileExtension)) {
            isshow.value = false
            nextTick(() => {
                imgsrc.value = URL.createObjectURL(file)
                formData.delete('avatar')
                formData.append('avatar', file)
            })
        } else {
            ElMessage.error(t('percenter.errortips'))
        }
    }
}

nextTick(() => {
    inputteam.value.focus()
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
    background-color: white;
    width: 400px;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0);
    padding: 0 24px;
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
            color: #3D3D3D;
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

        .team-name,
        .team-description,
        .team-avatar {
            display: flex;
            flex-direction: column;
            margin: 0 0 12px 0;

            .title {
                font-size: 13px;
                font-weight: 400;
                color: #262626;
                line-height: 34px;
            }

            input,
            textarea {
                padding: 7px 12px;
                width: 100%;
                border: none;
                outline-style: none;
                border-radius: 6px;
                font-size: 13px;
                color: #BFBFBF;
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

            .avatar-content {
                width: 100%;
                height: 136px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                background-color: rgba(255, 255, 255, 1);
                border: 1px dashed #EBEBEB;
                box-sizing: border-box;

                &:hover {
                    background-color: rgba(250, 250, 250, 1);
                }

                .closediv {
                    display: flex;
                    width: 56px;
                    height: 56px;
                    background-color: #F5F5F5;
                    border-radius: 50%;
                    border: 1px dashed #D9D9D9;
                    box-sizing: border-box;

                    svg {
                        margin: auto;
                        width: 16px;
                        height: 16px;
                        padding: 3px;
                        transform: rotateZ(45deg);
                        fill: rgba(38, 38, 38, 1);
                    }
                }


                p {
                    font-size: 12px;
                    color: rgba(38, 38, 38, 1);
                }

                input {
                    cursor: pointer;
                    position: absolute;
                    width: 100%;
                    height: 136px;
                    box-sizing: border-box;
                    opacity: 0;
                    z-index: 999;
                }


            }
        }
    }

    .addteam {
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
}</style>
