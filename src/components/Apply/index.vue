<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted, watchEffect } from 'vue'
import { ElMessage } from 'element-plus'
import { router } from '../../router'
import { useRoute } from 'vue-router'
import * as share_api from '../../apis/share'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const radio = ref('1')
const textarea = ref('')
const disabled = ref(false)
const docInfo: any = ref({})
const route = useRoute()
const linkValid = ref(true)
let permType = undefined
const onSave = () => {
    disabled.value = true
    if (docInfo.value.shares_count >= 5) {
        ElMessage({
            message: `${t('apply.maximum_share')}`
        })
        router.push('/')
    }
    if (radio.value === '1') {
        if (docInfo.value.application_count.value >= 3) {
            ElMessage({
                message: `${t('apply.request_access')}`
            })
            return
        }
    }
    if (radio.value === '2') {
        if (docInfo.value.application_count >= 3) {
            ElMessage({
                message: `${t('apply.request_access')}`
            })
            return
        }
    }
    postDocumentAuthority({ doc_id: route.query.id, perm_type: Number(radio.value), applicant_notes: textarea.value })
}
watch(radio, () => {
    disabled.value = false
})
watch(textarea, () => {
    disabled.value = false
})
const getDocumentAuthority = async () => {
    const { data } = await share_api.getDocumentAuthorityAPI({ doc_id: route.query.id })
    permType = data.perm_type
    if(permType !== 0) {
        router.push({
            name: 'document',
            query: {
                id: route.query.id
            }
        })
    }
}


getDocumentAuthority()
const getDocumentInfo = async () => {
    try{
        const data = await share_api.getDocumentInfoAPI({ doc_id: route.query.id })
        docInfo.value = data.data
        if(docInfo.value.application_count >= 3) {
            ElMessage({
                message: `${t('apply.request_access')}`
            })
        }
        if(docInfo.value.document.doc_type === 0) {
            linkValid.value = false
        }else {
            linkValid.value = true
        }
    }catch (err) {
        console.log(err);
        
    }
}
getDocumentInfo()
const postDocumentAuthority = async (data: { doc_id: any, perm_type: number, applicant_notes: any }) => {
    await share_api.postDocumentAuthorityAPI(data)
}
let timer: any = null

onMounted(() => {  
    timer = setInterval(() => {
    getDocumentAuthority()
    }, 10000) 
})
onUnmounted(() => {
    clearInterval(timer)
})
</script>

<template>
    <div class="container" v-if="docInfo.document">
        <div class="header">
            <div class="svgBox" @click="() => { router.push({ name: 'apphome' }) }">
                <svg-icon class="svg" icon-class="home_0508"></svg-icon>
            </div>
            <div class="user-avatar">
                <img src="../../assets/pd-logo-svg.svg">
            </div>
        </div>
        <div class="context" v-if="linkValid">
            <span style="font-weight: bold;">{{ docInfo.document.name }}</span>
            <div class="svg-file">
                <svg-icon class="svg" icon-class="file-rectangle"></svg-icon>
            </div>
            <span>{{ t('apply.no_file_access_permission') }}</span>
            <div class="file-info">
                <div class="file-name">
                    <span>{{ t('apply.file_attribution') }}:</span>
                    <p class="name">{{ docInfo.user.nickname }}</p>
                </div>
                <div class="file-name">
                    <span>{{ t('apply.apply_for_permission') }}:</span>
                    <div class="my-4 flex items-center text-sm">
                        <el-radio-group v-model="radio" class="ml-4">
                            <el-radio label="1" size="small">{{ t('apply.read_only') }}</el-radio>
                            <el-radio label="3" size="small">{{ t('share.editable') }}</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div class="textarea">
                    <span>{{ t('apply.remarks') }}:</span>
                    <el-input class="text" v-model="textarea" :autosize="{ minRows: 3, maxRows: 6 }" maxlength="50"
                        size="small" :placeholder="t('apply.please_remarks')" show-word-limit type="textarea" />
                </div>
                <div class="button"><el-button :disabled="disabled" color="#0d99ff" size="small"
                        @click="onSave">{{ t('apply.apply_for_permission') }}</el-button></div>
            </div>
        </div>
        <div v-else class="context">
            <div class="svg-file">
                <svg-icon class="svg" icon-class="file-void"></svg-icon>
            </div>
            <span>{{ t('apply.no_file_access_permission') }}</span>
            <span class="text">{{ t('apply.file_deleted') }}</span>
        </div>
    </div>
</template>
<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    font-size: var(--font-default-fontsize);

    .header {
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid var(--theme-color-line);
        padding: 0 var(--default-margin);

        .svgBox {
            width: 28px;
            height: 28px;

            .svg {
                width: 80%;
                height: 80%;
            }
        }

        .user-avatar {
            cursor: pointer;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background-color: #fff;
            text-align: center;

            >img {
                width: 90%;
                height: 90%;
            }
        }
    }

    .context {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        >.text {
            margin-top: 10px;
        }

        .svg-file {
            margin: var(--default-margin);
            padding-left: 40px;

            >.svg {
                color: #ccc;
                width: 90%;
                height: 90%;
            }
        }

        .file-info {
            width: 250px;
            height: 200px;
            margin-top: 40px;
            border-radius: 4px;
            padding: var(--default-padding);
            background-color: #f5f5f5;

            .file-name {
                display: flex;
                align-items: center;

                >span {
                    display: block;
                    width: 60px;
                }

            }

            .textarea {
                display: flex;

                span {
                    display: block;
                    width: 60px;
                    margin-top: 10px;
                }

                >.text {
                    flex: 1;
                    margin-top: 10px;
                    margin-right: 10px;
                }
            }

            .button {
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }
        }
    }
}</style>