<template>
    <div class="crad-box">
        <div class="title">
            <div class="text">{{ t('report.title') }}</div>
            <div class="close" @click.stop="emits('close')">
                <svg-icon icon-class="report-close"></svg-icon>
            </div>
        </div>
        <div class="tips">{{ t('report.tips') }}</div>
        <form @submit.prevent="submitreport()">
            <div class="type">
                <label for="selectOption">{{ t('report.type') }}<svg-icon icon-class="tips-icon"></svg-icon></label>
                <select id="selectOption" v-model="selectedOption" required>
                    <option value="" disabled selected hidden>{{ t('report.type_normal') }}</option>
                    <option value=0>{{ t('report.type_value1') }}</option>
                    <option value=1>{{ t('report.type_value2') }}</option>
                    <option value=2>{{ t('report.type_value3') }}</option>
                    <option value=3>{{ t('report.type_value4') }}</option>
                </select>
            </div>
            <div class="content">
                <label for="textInput">{{ t('report.report_content') }}<svg-icon icon-class="tips-icon"></svg-icon></label>
                <textarea type="text" id="textInput" :placeholder="t('report.report_normal')" v-model="textInput"
                    :maxlength="300" required></textarea>
            </div>
            <div class="imgs">
                <div style="width: 58px;">{{ t('report.upload_img') }}</div>
                <label for="imageInput" :class="{ 'disabled': myfiles.length >= 5 ? true : false }"><svg-icon
                        icon-class="add-icon"></svg-icon>{{ t('report.select_img') }}</label>
                <span>{{ t('report.img_tips') }}</span>
                <input style="height: 0;width: 0;opacity: 0;" type="file" id="imageInput"
                    @change="handleImageUpload($event)" accept=".png, .jpeg, .jpg"
                    :disabled="myfiles.length >= 5 ? true : false" multiple />
            </div>
            <div class="img-item" v-for="( item, index ) in  myfiles " :key="index">
                <div class="left">
                    <svg-icon icon-class="annex-icon"></svg-icon>
                    <span>{{ item.name }}</span>
                </div>
                <div class="del-bnt" @click.stop="deleteimg(index)"><svg-icon icon-class="delete-icon"></svg-icon></div>
            </div>
            <div class="filetips" v-if="$route.name === 'document'">
                <input type="checkbox" id="filetips" v-model="filepath">
                <label for="filetips">{{ t('report.filet_ips') }}</label>
            </div>
            <div class="bottom">
                <button class="confirm" type="submit" :disabled="!isFormValid">{{ t('report.submit') }}</button>
                <button class="cancel" type="button" @click.stop="emits('close')">{{ t('report.cancel') }}</button>
            </div>
        </form>
    </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import select from '@/assets/select-icon.svg'
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/request/users'


const emits = defineEmits<{
    (event: 'close'): void
}>()

const { t } = useI18n()
const route = useRoute()
const selectedOption = ref("")
const textInput = ref("")
const myfiles = ref<any[]>([])
const filepath = ref(route.name === 'document' ? true : false)

const isFormValid = computed(() => {
    return selectedOption.value !== "" && textInput.value !== ""
})

const deleteimg = (index: number) => {
    myfiles.value.splice(index, 1)
}

const submitreport = async () => {
    if (!isFormValid.value) return
    const mydata = new FormData()
    mydata.append('type', selectedOption.value)
    mydata.append('content', textInput.value)
    for (let i = 0; i < myfiles.value.length; i++) {
        mydata.append('files', myfiles.value[i])
    }
    mydata.append('page_url', location.href)
    try {
        const { code } = await user_api.Feedback(mydata)
        if (code === 0) {
            emits('close')
            ElMessage.success('提交成功')
        }
    } catch (error) {
        ElMessage.error('提交失败')
    }
}

const handleImageUpload = (e: any) => {
    const files = e.target.files
    const types = e.target.accept
    const failfile = []
    const alreadyexists = []
    const laveimg = myfiles.value.length
    if (files) {
        for (let i = 0; i < Math.min(files.length, 5 - laveimg); i++) {
            const imgtype = files[i].name.substring(files[i].name.lastIndexOf('.')).toLowerCase()
            const isFilePresent = myfiles.value.some(file => file.name === files[i].name);
            if (myfiles.value.length < 5 && types.includes(imgtype) && !isFilePresent) {
                myfiles.value.push(files[i])
            } else if (!types.includes(imgtype)) {
                failfile.push(files[i].name)
            } else {
                alreadyexists.push(files[i].name)
            }
        }
    }
    if (failfile.length > 0 || alreadyexists.length > 0) {
        ElMessage.error({ duration: 3000, message: "图片格式不符或图片已存在" })
    }
    e.target.value = ''
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

.disabled {
    opacity: 0.4;
    background-color: rgba(255, 255, 255, 1) !important;
}

.crad-box {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, 0%);
    width: 582px;
    height: auto;
    background-color: white;
    box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    border: 1px solid #F0F0F0;
    padding: 0 24px 8px 24px;
    box-sizing: border-box;
    font-size: 13px;
    z-index: 1000;
    animation: move 0.25s ease-in-out;

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;

        .text {
            font-size: 16px;
            font-weight: 600;
        }

        .close {
            display: flex;
            width: 28px;
            height: 28px;
            padding: 6px;
            border-radius: 6px;
            box-sizing: border-box;

            &:hover {
                background-color: rgba(247, 247, 249, 1);
            }

            &:active {
                background-color: rgba(243, 243, 245, 1);
            }

            svg {
                width: 100%;
                height: 100%;
            }
        }
    }

    .tips {
        line-height: 38px;
        font-weight: 500;
    }

    .type,
    .content,
    .imgs {
        display: flex;
        gap: 24px;
    }

    .type {
        display: flex;
        align-items: center;
        height: 48px;

        select {
            width: 104px;
            height: 32px;
            padding-left: 12px;
            border: none;
            outline: none;
            border-radius: 6px;
            background: #F5F5F5;

            option:hover {
                background-color: rgba(245, 245, 245, 1);
            }
        }

        svg {
            width: 6px;
            height: 15px;
            color: red;
        }
    }

    .content {
        height: 188px;

        textarea {
            width: 446px;
            height: 172px;
            padding: 9px 12px;
            border: none;
            outline: none;
            border-radius: 6px;
            background: #F5F5F5;
            resize: none;
            box-sizing: border-box;
        }

        svg {
            width: 6px;
            height: 15px;
            color: red;
        }
    }

    .imgs {
        display: flex;
        align-items: center;
        height: 48px;

        span {
            position: relative;
            right: 16px;
            font-size: 12px;
            color: rgba(140, 140, 140, 1);
        }

        label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 106px;
            height: 36px;
            border: 1px solid #F0F0F0;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            color: rgba(51, 51, 51, 1);
            box-sizing: border-box;

            &:hover {
                background-color: rgba(247, 247, 249, 1);
            }

            &:active {
                background-color: rgba(243, 243, 245, 1);
            }

            svg {
                width: 14px;
                height: 14px;
                color: rgba(51, 51, 51, 1);
            }
        }

    }

    .img-item {
        display: grid;
        grid-template-columns: 23fr 1fr;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        margin-left: 82px;
        border-radius: 4px;

        .left {
            display: grid;
            grid-template-columns: 1fr 23fr;
            align-items: end;
            gap: 4px;

            span {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
            }

            svg {
                margin-left: 4px;
                width: 14px;
                height: 14px;
            }
        }

        .del-bnt {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            border-radius: 0px 4px 4px 0px;
            visibility: hidden;

            svg {
                width: 14px;
                height: 14px;
                color: rgba(140, 140, 140, 1);
            }

            &:hover {
                background-color: rgba(240, 240, 240, 1);
            }
        }

        &:hover {
            background-color: rgba(245, 245, 245, 1);

            .del-bnt {
                visibility: visible;
            }
        }
    }

    .filetips {
        display: flex;
        align-items: center;
        height: 48px;
        gap: 6px;

        input[type=checkbox] {
            margin: 3px 0 0 0;
            padding: 0;
            width: 14px;
            height: 14px;
            border-radius: 4px;
        }

        input[type=checkbox]:checked::after {
            position: absolute;
            width: 14px;
            height: 14px;
            margin: -1px 0 0 -1px;
            content: "";
            color: #FFFFFF;
            border-radius: 4px;
            border: 1px solid rgba(24, 120, 245, 1);
            background-image: url('@/assets/select-icon.svg');
            background-repeat: no-repeat;
            background-position: center center;
            background-size: 60% 40%;
            background-color: rgba(24, 120, 245, 1);
        }
    }

    .bottom {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        height: 64px;

        button {
            width: 100px;
            height: 40px;
            border: none;
            border-radius: 6px;
            outline: none;
            text-align: center;
        }

        .confirm {
            color: rgba(255, 255, 255, 1);
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

        .cancel {
            color: rgba(51, 51, 51, 1);
            background-color: #FFFFFF;
            border: 1px solid #F0F0F0;

            &:hover {
                background-color: rgba(247, 247, 249, 1);
            }

            &:active {
                background-color: rgba(243, 243, 245, 1);
            }

            &:disabled {
                opacity: 0.4;
                background-color: rgba(255, 255, 255, 1);
            }
        }
    }
}
</style>
