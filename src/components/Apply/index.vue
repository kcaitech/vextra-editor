<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { router } from '../../router'
import { useRoute } from 'vue-router'
import * as share_api from '../../request/share'
import { useI18n } from 'vue-i18n'
import { Warning } from '@element-plus/icons-vue'
const { t } = useI18n()
const radio = ref('1')
const textarea = ref('')
const disabled = ref(false)
const docInfo: any = ref({})
const route = useRoute()
const linkValid = ref(true)
let permType = undefined
const status = ref(2)
const messages = ref<string>(t('apply.request_access'))
const execute = ref(false)
const avatar = ref(localStorage.getItem('avatar')!)

const onSave = () => {
    disabled.value = true
    execute.value = true
    if (execute.value) {
        getDocumentInfo()
    }
}

const promptMessage = () => {
    if (docInfo.value.shares_count >= 5) {
        messages.value = t('apply.maximum_share')
        showNotification()
        const routeTimer = setTimeout(() => {
            router.push('/files')
            clearTimeout(routeTimer)
        }, 3000)
    } else {
        if (radio.value === '1') {
            postDocumentAuthority({ doc_id: route.query.id, perm_type: Number(radio.value), applicant_notes: textarea.value })
        } else if (radio.value === '2') {
            postDocumentAuthority({ doc_id: route.query.id, perm_type: Number(radio.value), applicant_notes: textarea.value })
        } else if (radio.value === '3') {
            postDocumentAuthority({ doc_id: route.query.id, perm_type: Number(radio.value), applicant_notes: textarea.value })
        }
    }
}

watch(radio, () => {
    disabled.value = false
})
watch(textarea, () => {
    disabled.value = false
})
const getDocumentAuthority = async () => {
    try {
        const { data } = await share_api.getDocumentAuthorityAPI({ doc_id: route.query.id })
        if (data) {
            permType = data.perm_type
            if (permType !== 0) {
                const query = route.query.page_id ? { id: route.query.id, page_id: route.query.page_id.slice(0, 8) } : { id: route.query.id };
                router.push({
                    name: 'document',
                    query: query
                })
            }
        }
    } catch (err) {
        console.log(err);

    }
}

getDocumentAuthority()
const getDocumentInfo = async () => {
    try {
        const data = await share_api.getDocumentInfoAPI({ doc_id: route.query.id })
        if (data) {
            docInfo.value = data.data
            if (data.code === 400) {
                return linkValid.value = false
            }
            if (docInfo.value.document.doc_type === 0) {
                linkValid.value = false
            } else {
                linkValid.value = true
            }
            if (execute.value) {
                promptMessage()
            }
            if (docInfo.value.apply_list[0].status === 2 && status.value !== 2) {
                status.value = docInfo.value.apply_list[0].status
            } else if (docInfo.value.apply_list[0].status !== 2) {
                status.value = docInfo.value.apply_list[0].status
            }
        }
        execute.value = false
    } catch (err) {
        console.log(err);
        execute.value = false
    }
}

watch(status, () => {
    if (status.value === 2) {
        messages.value = t('apply.not_passed')
        showNotification()
        disabled.value = false
    }
})

getDocumentInfo()
const postDocumentAuthority = async (data: { doc_id: any, perm_type: number, applicant_notes: any }) => {
    const res = await share_api.postDocumentAuthorityAPI(data)
    if (res.code === 400 && (res as any).message === '申请次数已达上限') {
        messages.value = t('apply.request_access')
        showNotification()
    }
}
let timer: any = null

//提示信息
const showHint = ref(false)
const countdown = ref(4)
const startCountdown = (type?: number) => {
    const tipstimer = setInterval(() => {
        if (countdown.value > 1) {
            countdown.value--;
        } else {
            hideNotification(type);
            clearInterval(tipstimer);
        }
    }, 1000);
}
const hideNotification = (type?: number) => {
    showHint.value = false;
    countdown.value = 4;
}
const showNotification = (type?: number) => {
    showHint.value = true;
    startCountdown(type);
}


onMounted(() => {
    timer = setInterval(() => {
        getDocumentInfo()
        getDocumentAuthority()
    }, 10000)
})
onUnmounted(() => {
    clearInterval(timer)
    showHint.value = false;
    countdown.value = 4;

})
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="svgBox" @click.stop="() => { router.push({ name: 'apphome' }) }">
                <svg-icon icon-class="home"></svg-icon>
            </div>
            <div class="user-avatar">
                <img :src="avatar" alt="avatar">
            </div>
        </div>
        <div class="context" v-if="linkValid && docInfo.document">
            <span class="fileName">{{ docInfo.document.name }}</span>
            <div class="svg-file">
                <svg-icon class="svg" icon-class="file-rectangle"></svg-icon>
            </div>
            <span class="not_per">{{ t('apply.no_file_access_permission') }}</span>
            <div class="file-info">
                <div class="file-name">
                    <span>{{ t('apply.file_attribution') }}：</span>
                    <div class="name">{{ docInfo.user.nickname }}</div>
                </div>
                <div class="file-name">
                    <span>{{ t('apply.apply_for_permission') }}：</span>
                    <div>
                        <input id="checkbox1" name="group" type="radio" @change="radio = '1'" checked>
                        <label for="checkbox1">{{ t('apply.read_only') }}</label>
                    </div>
                    <div>
                        <input id="checkbox2" name="group" type="radio" @change="radio = '2'">
                        <label for="checkbox2">{{ t('share.reviewable') }}</label>
                    </div>
                    <div>
                        <input id="checkbox3" name="group" type="radio" @change="radio = '3'">
                        <label for="checkbox3">{{ t('share.editable') }}</label>
                    </div>
                </div>
                <div class="textarea">
                    <span>{{ t('apply.remarks') }}：</span>
                    <textarea name="note" id="note" cols="30" rows="10" v-model="textarea" maxlength="50"
                        :placeholder="t('apply.please_remarks')">
                </textarea>
                </div>
                <div class="button">
                    <button type="button" @click.stop="onSave" :disabled="disabled">
                        {{ t('apply.apply_for_permission') }}
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="context">
            <div class="svg-file">
                <svg-icon class="svg" icon-class="file-void"></svg-icon>
            </div>
            <span class="not_per">{{ t('apply.no_file_access_permission') }}</span>
            <span class="text">{{ t('apply.file_deleted') }}</span>
        </div>
    </div>
    <div v-if="showHint" class="notification">
        <el-icon :size="13">
            <Warning />
        </el-icon>
        <span class="text">{{ messages }}</span>
    </div>
</template>
<style lang="scss" scoped>
input[type="radio"] {
    display: none;
}

label {
    position: relative;
    font-size: 13px;
    font-weight: 500;
    width: auto;
    display: block;
    margin: 0 18px;
}

input[type="radio"]:checked+label::after {
    transform: scale(1);
}

input[type="radio"]+label::after {
    position: absolute;
    content: "";
    top: 4px;
    left: -16px;
    width: 10px;
    height: 10px;
    background-color: #1677FF;
    border-radius: 100%;
    box-sizing: border-box;
    border: 1px solid #1677FF;
    transform: scale(0);
    transition: all 0.25s ease;
}

label::before {
    position: absolute;
    content: "";
    width: 14px;
    height: 14px;
    top: 2px;
    left: -18px;
    border-radius: 50%;
    border: 1px solid #1677FF;
    box-sizing: border-box;
}

.container {
    width: 100%;
    height: 100%;
    background-color: #FFFFFF;
    font-size: var(--font-default-fontsize);

    .header {
        height: 52px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #EBEBEB;
        padding: 0 8px;
        box-sizing: border-box;
        z-index: 2;

        .svgBox {
            width: 32px;
            height: 32px;
            padding: 6px;
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

        .user-avatar {
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 100%;
            background-color: #fff;
            text-align: center;
            display: flex;
            align-items: center;
            overflow: hidden;

            >img {
                width: 100%;
                height: 100%;
            }
        }
    }

    .context {
        height: calc(100% - 52px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .fileName {
            font-size: 14px;
            font-weight: 500;
            color: #000;
        }

        .not_per {
            font-size: 13px;
            font-weight: 500;
            color: #8C8C8C;
        }

        >.text {
            font-size: 14px;
            color: #000;
            margin-top: 10px;
        }

        .svg-file {
            height: 140px;
            width: 140px;
            margin: var(--default-margin);

            >.svg {
                width: 100%;
                height: 100%;
                color: #ccc;
            }
        }

        .file-info {
            display: flex;
            flex-direction: column;
            gap: 16px;
            width: auto;
            max-width: 438px;
            height: 338px;
            margin-top: 20px;
            padding: 24px 64px;
            border-radius: 8px;
            border: 1px solid #EBEBEB;
            background-color: #FAFAFA;
            box-sizing: border-box;

            .file-name {
                display: flex;
                align-items: center;
                height: 38px;

                >span {
                    font-size: 13px;
                    font-weight: 400;
                    color: #8C8C8C;
                    white-space: nowrap;
                    width: 65px;
                    text-align: right;
                }

                .name {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    font-size: 13px;
                    font-weight: 500;
                }

            }

            .textarea {
                display: flex;
                margin-top: 16px;

                span {
                    font-size: 13px;
                    font-weight: 400;
                    color: #8C8C8C;
                    white-space: nowrap;
                    width: 65px;
                    text-align: right;
                    padding-top: 7px;
                    box-sizing: border-box;
                }

                textarea {
                    outline: none;
                    resize: none;
                    border: none;
                    width: calc(100% - 65px);
                    max-height: 102px;
                    font-size: 13px;
                    font-weight: 400;
                    border-radius: 6px;
                    background-color: #F0F0F0;
                    padding: 7px 12px;
                    box-sizing: border-box;

                    &::placeholder {
                        color: #BFBFBF;
                        font-size: 13px;
                        font-weight: 400;
                    }
                }
            }

            .button {
                display: flex;
                justify-content: center;
                margin-top: 12px;

                button {
                    outline: none;
                    border: none;
                    font-size: 14px;
                    font-weight: 500;
                    color: white;
                    width: 164px;
                    height: 36px;
                    margin: auto;
                    border-radius: 6px;
                    padding: 8px 14px;
                    background-color: #1878F5;

                    &:hover {
                        background-color: #429AFF;
                    }

                    &:active {
                        background-color: #429AFF;
                    }

                    &:disabled {
                        background-color: #BDE2FF;
                    }
                }
            }
        }
    }
}

.notification {
    position: fixed;
    font-size: var(--font-default-fontsize);
    display: flex;
    align-items: center;
    top: 50px;
    left: 50%;
    transform: translateX(-50%);
    color: red;
    background-color: #fff;
    border: 1px solid #ccc;
    padding: 7px 30px;
    border-radius: 4px;

    .text {
        margin: 0 15px 0 10px;
    }
}

@media (max-width:700px) {
    .file-info {
        padding: 12px !important;
    }
}

@media (max-height:700px) {
    .container {
        height: auto;
    }
}
</style>