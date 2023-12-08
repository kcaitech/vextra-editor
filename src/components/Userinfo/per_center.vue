<template>
    <div class="main">
        <div class="nav">
            <div class="close" @click="closePersonalCenter">
                <el-icon size="25">
                    <Close />
                </el-icon>
            </div>
            <h1>{{ t('percenter.personal_center') }}</h1>
        </div>
        <div class="icon">
            <span class="jbxx">{{ t('percenter.essential_information') }}</span>
            <div class="one">
                <div class="two">
                    <div class="three">
                        <div class="tx">
                            <el-avatar v-if="circleUrl" :src="circleUrl" @error="errorHandler">
                                <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                            </el-avatar>
                            <el-avatar v-else> {{ uname?.slice(0, 1) }} </el-avatar>
                        </div>
                        <div class="text">
                            <span style="font-size: 14px;font-weight: bold;">{{ t('percenter.head_portrait') }}</span>
                            <span style="font-size: 12px;color: #b3b3b3;">{{ t('percenter.avatar_restriction') }}</span>
                        </div>
                    </div>
                    <a href="" class="btn" @click.prevent="openDialog">{{ t('percenter.modify_profile_picture') }}</a>
                </div>
            </div>
            <div class="one">
                <div class="two">
                    <div class="three">
                        <div class="text">
                            <span style="font-size: 14px;font-weight: bold;">{{ t('percenter.username') }}</span>
                            <span style="font-size: 12px;color: #b3b3b3; line-height: 22px; margin-top: 2px;"
                                v-if="!shownicknameinput">{{
                                    uname }}</span>
                            <div v-else>
                                <input class="newname" type="text" :value=uname @input="tips" @keyup.enter="changename">
                                <span></span>
                            </div>

                        </div>

                    </div>
                    <a href="" class="btn" @click.prevent="updatename" v-if="!shownicknameinput">{{
                        t('percenter.edit_user_name') }}</a>
                    <div v-if="shownicknameinput">
                        <button class="affirm" @click="changename">{{ t('percenter.affirm') }}</button>
                        <button class="cancel" @click="shownicknameinput = false">{{ t('percenter.cancel') }}</button>
                    </div>
                </div>
            </div>
            <div class="one">
                <div class="two">
                    <div class="three">
                        <div class="text">
                            <span style="font-size: 14px;font-weight: bold;">{{ t('percenter.userID') }}</span>
                            <span style="font-size: 12px;color: #b3b3b3;">{{ id }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { reactive, toRefs, ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
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
const errorHandler = () => true

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
    setTimeout(() => {
        const input: any = document.querySelector('.newname')
        input.focus()
    }, 100);
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
.el-avatar {
    --el-avatar-bg-color: #9775fa;
    font-weight: 700;
}

.main {
    width: 100vw;
    height: 100vh;
    background: rgba(213, 213, 213, 0.2);
}

.newname {
    outline: none;
    height: 22px;
    box-sizing: border-box;

    &:hover {
        border-radius: 2px;
        border: 2px rgb(69, 69, 255) solid;
        border-color: rgb(69, 69, 255);
    }

    &:focus {
        border-radius: 2px;
        border: 2px rgb(69, 69, 255) solid;
        border-color: rgb(69, 69, 255);
    }
}

.newname+span {
    font-size: 12px;
    line-height: 22px;
    margin-left: 5px;
    color: red;
}

button {
    width: 60px;
    margin-left: 10px;
    border: 1px silver solid;
    border-radius: 2px;
}


.affirm {
    background: rgb(69, 69, 255);
    color: white;
    border-color: rgb(69, 69, 255);

    &:hover {
        background: rgba(80, 80, 255, 0.884);
    }
}

.cancel {
    background: rgb(255, 255, 255);
    color: black;

    &:hover {
        background: rgba(208, 208, 208, 0.167);
    }
}


.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row-reverse;
    margin: 0 0 20px 0;
    border-radius: 5px;
    background: rgb(255, 255, 255);
    box-shadow: rgba(255, 255, 255, 0.9) 0px 1px 3px, rgba(0, 0, 0, 0.5) 0px 1px 2px;

    .close {
        margin: 0 20px;
    }

    .close:hover {
        color: rgb(69, 69, 255);
        cursor: pointer;
    }
}

h1 {
    text-align: center;
    letter-spacing: 5px;
    margin: 10px 20px;
}

.icon {
    width: 800px;
    position: absolute;
    top: 100px;
    left: 50%;
    padding: 20px;
    transform: translate(-50%);
    box-sizing: border-box;
    border-radius: 5px;
    background: white;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;

    .jbxx {
        display: inline-block;
        font-weight: bold;
        margin-bottom: 20px;

    }

    .one {
        width: auto;
        height: auto;
        padding: 0px 20px;
        margin-bottom: 20px;

        .two {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .three {
                display: flex;
                flex-direction: row;
                align-items: center;

                .tx {
                    display: flex;
                    margin-right: 10px;
                }

                .text {
                    display: flex;
                    flex-direction: column;
                    box-sizing: border-box;

                }
            }
        }

        .btn {
            font-size: 12px;
            font-weight: 600;
            width: auto;
            height: 40px;
            line-height: 40px;
            color: rgb(55, 65, 252);
            text-decoration: none
        }
    }
}

@media screen and (max-width: 800px) {
    .icon {
        width: 100%;
    }

}
</style>
