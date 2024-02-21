<template>
    <div class="main">
        <div class="nav">
            <div class="home" @click="closePersonalCenter">
                <svg-icon icon-class="home"></svg-icon>
            </div>
        </div>
        <div class="container">
            <span class="jbxx">{{ t('percenter.essential_information') }}</span>
            <div class="content">
                <div class="left">
                    <div class="avatar">
                        <img v-if="circleUrl" :src="circleUrl" alt="avatar">
                        <span v-else>{{ uname?.slice(0, 1) }}</span>
                    </div>
                    <div class="text">
                        <div class="title">{{ t('percenter.head_portrait') }}</div>
                        <div class="details">{{ t('percenter.avatar_restriction') }}</div>
                    </div>
                </div>
                <div class="right">
                    <button type="button" @click.prevent="openDialog">{{ t('percenter.modify_profile_picture') }}</button>
                </div>
            </div>
            <div class="content">
                <div class="left">
                    <div class="text">
                        <div class="title">{{ t('percenter.username') }}
                        </div>
                        <div v-if="!shownicknameinput" class="details">{{ uname }}</div>
                        <div v-else>
                            <input v-focus class="newname" type="text" :value=uname @input="tips" @keyup.enter="changename">
                            <span></span>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <button v-if="!shownicknameinput" type="button" @click.prevent="updatename">{{
                        t('percenter.edit_user_name') }}</button>
                    <div class="changeBtn" v-if="shownicknameinput">
                        <button class="affirm" type="button" @click="changename">{{ t('percenter.affirm') }}</button>
                        <button class="cancel" type="button" @click="shownicknameinput = false">{{
                            t('percenter.cancel') }}</button>
                    </div>
                </div>
            </div>
            <div class="content">
                <div class="left">
                    <div class="text">
                        <div class="title">{{ t('percenter.userID') }}</div>
                        <div class="details">{{ id }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref } from 'vue'
import * as user_api from '@/request/users'
import { ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const shownicknameinput = ref(false)
const state = reactive({
    circleUrl: localStorage.getItem('avatar'),
    uname: localStorage.getItem('nickname'),
    id: localStorage.getItem('userId')
})
const { circleUrl, uname, id } = toRefs(state)

function openDialog() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/png, image/jpeg, image/jpg'
    input.addEventListener('change', handleFileSelected)
    input.click()

}

async function handleFileSelected(event: any,) {
    const file = event.target.files[0]
    const fileName = file.name
    const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
    const allowedFormats = ['.jpg', '.png', '.jpeg']
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    try {
        if (file && file.size <= maxSizeInBytes && allowedFormats.includes(fileExtension)) {
            const formData = new FormData()
            formData.append('file', file)
            const { code, data: { avatar }, message } = await user_api.Setusericon(formData) as any;
            if (code == 0) {
                circleUrl.value = avatar
                ElMessage.success(t('percenter.successtips'))
                localStorage.setItem('avatar', avatar)
            } else {
                ElMessage.error(message)
            }
        } else {
            // 文件大小超出限制
            ElMessage.error(t('percenter.errortips'))
        }
    } catch (error) {
        ElMessage.error(t('home.other_tips'))
    }

}

function updatename() {
    shownicknameinput.value = true
}

async function changename() {
    const input: any = document.querySelector('.newname')
    const pattern = /^.{1,20}$/
    if (pattern.test(input.value)) {
        if (input.value != uname.value) {
            try {
                const { code, message } = await user_api.Setusernickname({ nickname: input.value }) as any
                if (code == 0) {
                    uname.value = input.value
                    ElMessage.success(t('percenter.successtips'))
                    shownicknameinput.value = false
                    localStorage.setItem('nickname', input.value)
                } else {
                    ElMessage.error(message === '审核不通过' ? t('system.sensitive_reminder') : t('percenter.errortips1'))
                }
            } catch (error) {
                ElMessage.error(t('home.other_tips'))
            }
        } else {
            shownicknameinput.value = false
        }
    }
}

function tips(e: any) {
    const tips: any = document.querySelector('.newname + span')
    if (e.srcElement.value == '') {
        tips.innerHTML = t('percenter.usernametips_null')
    } else if (e.srcElement.value.length <= 20) {
        tips.innerHTML = ''
    } else {
        tips.innerHTML = t('percenter.usernametips_length')
    }
}

function closePersonalCenter() {
    history.back()
}


</script>
<style lang="scss" scoped>
.main {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: #fff;
}

.newname {
    outline: none;
    max-width: 352px;
    height: 36px;
    padding: 7px 12px;
    border-radius: 6px;
    font-size: 13px;
    color: #000000;
    border: 1px solid #F5F5F5;
    background-color: #F5F5F5;
    box-sizing: border-box;

    &:hover {
        border: 1px solid #EBEBEB;
        background-color: #EBEBEB;
    }

    &:focus {
        border: 1px solid #1878F5;
        background-color: #F5F5F5;
    }
}

.newname+span {
    font-size: 12px;
    line-height: 22px;
    margin-left: 5px;
    color: red;
}

.nav {
    display: flex;
    width: 100%;
    height: 52px;
    align-items: center;
    border-bottom: 1px solid #EBEBEB;

    .home {
        width: 32px;
        height: 32px;
        padding: 6px;
        margin-left: 8px;
        border-radius: 6px;
        box-sizing: border-box;

        &:hover {
            background-color: #F5F5F5;
        }

        &:active {
            background-color: #EBEBEB;
        }

        svg {
            fill: #000000;
            width: 100%;
            height: 100%;
        }
    }
}


.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 700px;
    box-sizing: border-box;


    .jbxx {
        font-size: 18px;
        font-weight: 700;
        width: 100%;
        height: 66px;
        padding: 28px 0 12px 0;
        box-sizing: border-box;
    }

    .content {
        width: 100%;
        height: 90px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        box-shadow: inset 0px -1px 0px 0px #F0F0F0;
        gap: 8px;

        .left {
            display: flex;
            align-items: center;
            gap: 16px;

            .avatar {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 48px;
                height: 48px;
                background-color: #1878F5;
                border-radius: 100%;
                box-sizing: border-box;

                img {
                    width: 100%;
                    height: 100%;
                    border-radius: 100%;
                    object-fit: cover;
                }

                span {
                    font-size: 16px;
                    font-weight: 500;
                    color: white;
                }
            }

            .text {
                display: flex;
                flex-direction: column;
                gap: 10px;

                .title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #000000;
                }

                .details {
                    font-size: 13px;
                    font-weight: 400;
                    color: #777777;
                }
            }
        }

        .right {
            display: flex;
            align-items: center;
            gap: 8px;

            button {
                outline: none;
                border: 1px solid #F0F0F0;
                background-color: transparent;
                font-size: 14px;
                font-weight: 500;
                margin: auto;
                width: auto;
                height: 36px;
                border-radius: 6px;
                color: #333333;
                padding: 8px 14px;
                box-sizing: border-box;

                &:hover {
                    background-color: #F5F5F5;
                }

                &:active {
                    background-color: #EBEBEB;
                }
            }

            .changeBtn {
                display: flex;
                align-items: center;
                gap: 8px;

                .affirm {
                    color: #fff;
                    background-color: #1878F5;

                    &:hover {
                        background-color: #429AFF;
                    }

                    &:active {
                        background-color: #0A59CF;
                    }
                }

                .cancel {
                    background-color: transparent;

                    &:hover {
                        background-color: #F5F5F5;
                    }

                    &:active {
                        background-color: #EBEBEB;
                    }
                }
            }
        }
    }
}

@media (max-width:700px) {
    .container {
        width: 100%;
        padding: 0 12px;
    }
}
</style>
