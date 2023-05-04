<script lang="ts" setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { router } from '../../router'
import { useRoute } from 'vue-router'
import * as share_api from '../../apis/share'
const radio = ref('1')
const textarea = ref('')
const disabled = ref(false)
const maxShare = ref(0)
const idRead = ref(0)
const idEdit = ref(0)
const docID = ''
const docInfo: any = ref({})
const route = useRoute()
const onSave = () => {
    disabled.value = true
    if (maxShare.value >= 5) {
        ElMessage({
            message: '该文件已达最大分享人数，请联系创建者处理'
        })
    }
    if (radio.value === '1') {
        idRead.value++
        if (idRead.value > 3) {
            ElMessage({
                message: '您已多次申请访问权限，请等待创建者处理'
            })
        }
    }
    if (radio.value === '2') {
        idEdit.value++
        if (idEdit.value > 3) {
            ElMessage({
                message: '您已多次申请访问权限，请等待创建者处理'
            })
        }
    }
    postDocumentAuthority({ doc_id: docID, perm_type: Number(radio.value), remarks: textarea })
}
watch(radio, () => {
    disabled.value = false
})
watch(textarea, () => {
    disabled.value = false
})
const getDocumentAuthority = async () => {
    const { data } = await share_api.getDocumentAuthorityAPI({ doc_ic: docID })
}
getDocumentAuthority()
const getDocumentInfo = async () => {
    const data = await share_api.getDocumentInfoAPI({ doc_ic: docID })
    docInfo.value = data.data
}
getDocumentInfo()
const postDocumentAuthority = async (data: { doc_id: string, perm_type: number, remarks: any }) => {
    await share_api.postDocumentAuthorityAPI(data)
}
const getShareList = async () => {
    const { data } = await share_api.getShareListAPI({ doc_id: docID })
    maxShare.value = data.length
}
getShareList()
</script>

<template>
    <div class="container">
        <div class="header">
            <div class="svgBox" @click="() => { router.push({ name: 'apphome' }) }">
                <svg-icon class="svg" icon-class="home"></svg-icon>
            </div>
            <div class="user-avatar">
                <img src="../../assets/pd-logo-svg.svg">
            </div>
        </div>
        <div class="context">
            <span style="font-weight: bold;">{{ docInfo.document.name }}</span>
            <div class="svg-file">
                <svg-icon class="svg" icon-class="file-rectangle"></svg-icon>
            </div>
            <span>无文件访问权限</span>
            <div class="file-info">
                <div class="file-name">
                    <span>文件归属:</span>
                    <p class="name">{{ docInfo.user.nickname }}</p>
                </div>
                <div class="file-name">
                    <span>申请权限:</span>
                    <div class="my-4 flex items-center text-sm">
                        <el-radio-group v-model="radio" class="ml-4">
                            <el-radio label="1" size="small">仅阅读</el-radio>
                            <el-radio label="3" size="small">可编辑</el-radio>
                        </el-radio-group>
                    </div>
                </div>
                <div class="textarea">
                    <span>备注:</span>
                    <el-input class="text" v-model="textarea" :autosize="{ minRows: 3, maxRows: 6 }" maxlength="50"
                        size="small" placeholder="请输入申请备注" show-word-limit type="textarea" />
                </div>
                <div class="button"><el-button :disabled="disabled" color="#0d99ff" size="small"
                        @click="onSave">申请权限</el-button></div>
            </div>
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