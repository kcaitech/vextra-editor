<template>
    <div class="crad-box">
        <div class="title">
            <div class="text">举报</div>
            <div class="close">
                <svg-icon icon-class="report-close"></svg-icon>
            </div>
        </div>
        <div class="tips">请选择要举报的问题类型，并填写详细举报内容。</div>
        <form ref="myfrom" @submit.prevent="tankuang(myfrom)">
            <div class="type">
                <label for="selectOption">举报类型<svg-icon icon-class="tips-icon"></svg-icon></label>
                <select id="selectOption" v-model="selectedOption" required>
                    <option value="" disabled selected hidden>请选择类型</option>
                    <option value="option1">欺诈</option>
                    <option value="option2">色情低俗</option>
                    <option value="option3">不当言论</option>
                    <option value="option4">其他</option>
                </select>
            </div>
            <div class="content">
                <label for="textInput">举报内容<svg-icon icon-class="tips-icon"></svg-icon></label>
                <textarea type="text" id="textInput" placeholder="请填写详细内容" v-model="textInput" :maxlength="300" required></textarea>
            </div>
            <div class="imgs">
                <div style="width: 58px;">上传截图</div>
                <label for="imageInput"><svg-icon icon-class="add-icon"></svg-icon>添加文件</label>
                <span>添加png、jpg格式文件，最多可上传5张</span>
                <input style="height: 0;width: 0;opacity: 0;" ref="inputfile" type="file" id="imageInput"
                    @change="handleImageUpload($event)" accept=".png, .jpeg, .jpg"
                    :disabled="myfiles.length >= 5 ? true : false" multiple />
            </div>
            <div class="img-item" v-for="(item, index) in myfiles" :key="index">
                <div class="left">
                    <svg-icon icon-class="annex-icon"></svg-icon>
                    {{ item.name }}
                </div>
                <div class="del-bnt" @click.stop="deleteimg(index)"><svg-icon icon-class="delete-icon"></svg-icon></div>
            </div>
            <br>
            <div class="bottom">
                <button class="confirm" type="submit" :disabled="!isFormValid">提交举报</button>
                <button class="cancel" type="button">取消</button>
            </div>
        </form>
    </div>
</template>
<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, nextTick, reactive, ref } from 'vue';

const selectedOption = ref("")
const textInput = ref("")
const myfiles = ref<any[]>([])
const myfrom = ref()
const inputfile = ref()
const form = reactive({
    type: '',
    desc: '',
    imgs: [],
})

const isFormValid = computed(() => {
    return selectedOption.value !== "" && textInput.value !== ""
})

const deleteimg = (index: number) => {
    inputfile.value = ''
    myfiles.value.splice(index, 1)
}

const tankuang = (data: any) => {
    const mydata = new FormData(data)
    for (let i = 0; i < myfiles.value.length; i++) {
        mydata.append('img[]', myfiles.value[i])
    }
    mydata.append('type', selectedOption.value)
    mydata.append('text', textInput.value)
    nextTick(() => {
        mydata.forEach((value, key) => {
            console.log(`${key}:${value}`);
        })
    })
}

const handleImageUpload = (e: any) => {
    const files = e.target.files
    const failfile = []
    if (files) {
        for (let i = 0; i < Math.min(files.length, 5); i++) {
            if (myfiles.value.length < 5 && e.target.accept.includes(files[i].name.substring(files[i].name.lastIndexOf('.')).toLowerCase())) {
                myfiles.value.push(files[i])
            } else if (!e.target.accept.includes(files[i].name.substring(files[i].name.lastIndexOf('.')).toLowerCase())) {
                failfile.push(files[i].name)
            } else {

            }
        }
    }
    if (failfile.length > 0) {
        ElMessage.error({ duration: 1500, message: `${failfile.join(', ')},文件格式不符。` })
    }
    e.target.value = ''
}

</script>
<style lang="scss" scoped>
.crad-box {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
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

    .title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        line-height: 64px;

        .text {
            font-size: 16px;
            font-weight: 600;
        }

        .close {
            display: flex;
            width: 16px;
            height: 16px;

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

            svg {
                width: 14px;
                height: 14px;
                color: rgba(51, 51, 51, 1);
            }
        }

    }

    .img-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 24px;
        margin-left: 82px;
        border-radius: 4px;

        .left {
            display: flex;
            align-items: center;
            gap: 4px;

            svg {
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

            svg {
                width: 14px;
                height: 14px;
                color: rgba(140, 140, 140, 1);
            }
        }

        &:hover {
            background-color: rgba(245, 245, 245, 1);
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
        }
    }
}
</style>
