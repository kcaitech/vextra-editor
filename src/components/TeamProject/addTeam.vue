<template>
    <div class="card-container">
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
                <div class="title">{{ t('Createteam.team_name') }}<span>{{ t('Createteam.required') }}</span></div>
                <input type="text" :placeholder="t('Createteam.team_name_tips')" v-model="inputValue" maxlength="20"
                    required>
            </div>
            <div class="team-description">
                <div class="title">{{ t('Createteam.team_description') }}<span>{{ t('Createteam.optional') }}</span></div>
                <textarea name="" id="" cols="30" rows="10" :placeholder="t('Createteam.team_description_tips')"
                    v-model="textareaValue" maxlength="120" />
            </div>
            <div class="team-avatar">
                <div class="title">{{ t('Createteam.team_avatar') }}<span>{{ t('Createteam.optional') }}</span></div>
                <div class="avatar-content">
                    <input type="file" accept=".jpg, .png" @change="selectimg($event)">
                    <svg-icon v-if="isshow" icon-class="close"></svg-icon>
                    <p v-if="isshow">{{ t('Createteam.avatar_restriction') }}</p>
                    <img v-else :src=imgsrc alt="Team Avatar" style="width: 64px;height:64px;border-radius: 50%;">
                </div>
            </div>
        </div>
        <div class="addteam">
            <button type="submit" :disabled=isDisabled @click.stop.once="createTeam">{{ t('Createteam.add_team') }}</button>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { Ref, computed, inject, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/apis/users'
import { useRoute } from 'vue-router'
const { t } = useI18n();
const route = useRoute()
const emits = defineEmits(['close'])
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
            ElMessage.success(t('percenter.successtips'))
            state(true)  //改变updatestate的值为TRUE
            route.params.id = data.id
        } else {
            ElMessage.error(message)
        }
    } catch (error) {
        ElMessage.error(t('home.other_tips'))
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

const close = () => {
    emits('close')
}

</script>
<style lang="scss" scoped>
.card-container {
    position: absolute;
    background-color: white;
    width: 480px;
    height: 560px;
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

        .team-name,
        .team-description,
        .team-avatar {
            margin-top: 16px;
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
                padding: 6px 12px;
                width: calc(100% - 24px);
                height: 24px;
                border: none;
                outline-style: none;
                box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
                border-radius: 3px;
                font-size: 14px;
            }

            textarea {
                padding: 6px 12px;
                width: calc(100% - 24px);
                height: 120px;
                border: none;
                outline-style: none;
                box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
                border-radius: 3px;
                resize: none;
                font-size: 14px;
                font-family: none;
            }

            .avatar-content {
                width: 100%;
                height: 130px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
                border-radius: 3px;

                svg {
                    width: 32px;
                    height: 32px;
                    transform: rotateZ(45deg);
                    fill: rgba(61, 61, 61, 0.6);
                }

                p {
                    font-size: 14px;
                    color: rgba(61, 61, 61, 0.5);
                }

                input {
                    position: absolute;
                    width: 100%;
                    height: 130px;
                    opacity: 0;
                    z-index: 999;

                    &:hover {
                        cursor: pointer;

                        &+svg+P {
                            color: #9775fa;
                        }

                        &+svg {
                            fill: #9775fa;
                        }
                    }
                }


            }
        }
    }

    .addteam {
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
