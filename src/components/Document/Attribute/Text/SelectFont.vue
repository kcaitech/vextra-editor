<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { ref } from 'vue'
import { Context } from '@/context';
import { Shape, ShapeType } from '@kcdesign/data';
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'setFont', font: string): void
}>()
const props = defineProps<{
    fontName: string,
    context: Context
}>()
type FontName = {
    used: string[],
    ch: string[],
    en: string[]
}
const searchFont = ref('')
const fontList = ref<FontName>({
    used: [],
    ch: ['宋体', '黑体', '仿宋', '微软雅黑', '新宋体', '楷体', '等线', 'OPPOSans', 'PingFangSC-Regular'],
    en: ['Arial', 'Adobe Arabic', 'Adobe Gothic Std', 'Candara', 'Courier New',
        'Comic Sans MS', 'D-DIN', 'Ink Free', 'Impact', 'Mv Boli']
})

const filterFontList = ref<FontName>({
    used: [],
    ch: [],
    en: []
})

const selectFont = (font: string) => {
    emit('setFont', font)
}

const getAllTextFontName = () => {
    const shapes = props.context.selection.selectedPage?.childs
    if (shapes) {
        const textShape = shapes.filter((item: Shape) => {
            if (item.type === ShapeType.Text) {
                return item
            }
        })
        // textShape.forEach(item => {
        //     // fontList.value.used.push(item.text.attr.fontName)
        // })
    }
}
getAllTextFontName()

const escapeRegExp = (text: string) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
const onSearchFont = () => {
    const pattern = new RegExp(escapeRegExp(searchFont.value), 'i');
    const chList = fontList.value.ch.filter(item => pattern.test(item))
    const enList = fontList.value.en.filter(item => pattern.test(item))
    const usedList = fontList.value.used.filter(item => pattern.test(item))
    filterFontList.value.ch = []
    filterFontList.value.en = []
    filterFontList.value.used = []
    filterFontList.value.ch.push(...chList)
    filterFontList.value.en.push(...enList)
    filterFontList.value.used.push(...usedList)
    filterFontList.value.ch = Array.from(new Set(filterFontList.value.ch));
    filterFontList.value.en = Array.from(new Set(filterFontList.value.en));
    filterFontList.value.used = Array.from(new Set(filterFontList.value.used));
}
</script>

<template>
    <div class="font-container">
        <div class="search">
            <svg-icon icon-class="search"></svg-icon>
            <input type="text" v-model="searchFont" :placeholder="t('attr.search_for_fonts')" @input="onSearchFont">
        </div>
        <div class="font-scroll">
            <el-scrollbar v-if="searchFont.trim().length === 0">
                <span class="font-title">已使用字体</span>
                <div class="item" v-for="item in fontList.used" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
                <div class="item-none" style="height: 40px;" v-if="fontList.used.length === 0">
                    <div class="none-font">当前无已使用字体</div>
                </div>
                <span class="font-title">中文字体</span>
                <div class="item" v-for="item in fontList.ch" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
                <span class="font-title">英文字体</span>
                <div class="item" v-for="item in fontList.en" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
            </el-scrollbar>
            <el-scrollbar v-else>
                <span class="font-title" v-if="filterFontList.used.length !== 0">已使用字体</span>
                <div class="item" v-for="item in filterFontList.used" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span style="color: #000;"> {{ item.split(searchFont)[0] }}</span><span style="color: red;"> {{
                        searchFont }}</span> <span style="color: #000;"> {{ item.split(searchFont)[1] }}</span>
                </div>
                <span class="font-title" v-if="filterFontList.ch.length !== 0">中文字体</span>
                <div class="item" v-for="item in filterFontList.ch" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span style="color: #000;"> {{ item.split(searchFont)[0] }}</span><span style="color: red;"> {{
                        searchFont }}</span> <span style="color: #000;"> {{ item.split(searchFont)[1] }}</span>
                </div>
                <span class="font-title" v-if="filterFontList.en.length !== 0">英文字体</span>
                <div class="item" v-for="item in filterFontList.en" :key="item" :style="{ fontFamily: item }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span style="color: #000;"> {{ item.split(searchFont)[0] }}</span><span style="color: red;"> {{
                        searchFont }}</span> <span style="color: #000;"> {{ item.split(searchFont)[1] }}</span>
                </div>
                <div class="item-none" style="height: 40px;" v-if="filterFontList.en.length === 0 && filterFontList.ch.length === 0">
                    <div class="none-font">查找不到相关字体</div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.font-container {
    position: absolute;
    top: 30px;
    right: 22px;
    width: 208;
    height: 300px;
    border-radius: 4px;
    background-color: #fff;
    border: 1px solid #ccc;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 100;

    .search {
        width: auto;
        height: 26px;
        margin: 7px 10px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background-color: var(--grey-light);
        padding: 4px var(--default-padding-half);
        border-radius: 4px;

        >svg {
            width: 12px;
            height: 12px;
        }

        >input {
            flex: 1 1 auto;
            border: none;
            outline: none;
            margin-left: 4px;
            background-color: transparent;
            font-size: var(--font-default-fontsize);
        }
    }

    .font-scroll {
        height: 260px;

        .font-title {
            padding: 0 10px;
            margin: 5px 0;
            height: 25px;
        }

        .item {
            display: flex;
            align-items: center;
            height: 25px;
            padding: 0 10px;
            margin: 0;

            &:hover {
                background-color: var(--input-background);
            }

            .choose {
                box-sizing: border-box;
                width: 10px;
                height: 6px;
                margin-right: 10px;
                margin-left: 2px;
                border-width: 0 0 1px 1px;
                border-style: solid;
                border-color: rgb(0, 0, 0, .75);
                transform: rotate(-45deg) translateY(-30%);
            }
        }

        .item-none {
            display: flex;
            align-items: center;
            height: 25px;
            padding: 0 10px;
            margin: 0;

            .none-font {
                margin: 10px auto;
                font-size: 10px;
                color: rgb(0, 0, 0, .5);
            }
        }
    }
}
</style>