<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { nextTick, onMounted, reactive, ref } from 'vue'
import { Context } from '@/context';
import { fontNameListEn, fontNameListZh, FontAvailable, fontWeightList, isSupportFontFamily } from './FontNameList'
import { InfoFilled } from '@element-plus/icons-vue'
import Tooltip from '@/components/common/Tooltip.vue';
import SvgIcon from "@/components/common/SvgIcon.vue";
import { watch } from 'vue';
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'setFont', font: string): void;
    (e: "setFontWeight", weight: number, italic: boolean): void;
}>()
const props = defineProps<{
    fontName: string,
    context: Context,
    fontWeight: string,
    showFont: boolean,
    fontNameEl?: HTMLDivElement
}>()
type FontName = {
    used: {
        success: string[],
        failurel: string[]
    },
    ch: string[],
    en: string[]
}
const searchFont = ref('')
const fontList = reactive<FontName>({
    used: {
        success: [],
        failurel: []
    },
    ch: [],
    en: []
})

const filterFontList = reactive<FontName>({
    used: {
        success: [],
        failurel: []
    },
    ch: [],
    en: []
})
const font_context = ref<HTMLDivElement>();
const selectFont = (font: string) => {
    const results = fontWeightList(font, true);
    const weight = results.filter((item: any) => item.key === props.fontWeight);
    if (weight.length === 0) {
        emit('setFontWeight', 400, false);
    }
    emit('setFont', font);
}

const escapeRegExp = (text: string) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
const onSearchFont = () => {
    const pattern = new RegExp(escapeRegExp(searchFont.value), 'i');
    const chList = fontList.ch.filter(item => pattern.test(item))
    const enList = fontList.en.filter(item => pattern.test(item))
    const usedSuccess = fontList.used.success.filter(item => pattern.test(item))
    const usedFailureL = fontList.used.failurel.filter(item => pattern.test(item))
    filterFontList.ch = []
    filterFontList.en = []
    filterFontList.used.success = []
    filterFontList.used.failurel = []
    filterFontList.ch.push(...chList)
    filterFontList.en.push(...enList)
    filterFontList.used.success.push(...usedSuccess)
    filterFontList.used.failurel.push(...usedFailureL)
    filterFontList.ch = Array.from(new Set(filterFontList.ch));
    filterFontList.en = Array.from(new Set(filterFontList.en));
    filterFontList.used.success = Array.from(new Set(filterFontList.used.success));
    filterFontList.used.failurel = Array.from(new Set(filterFontList.used.failurel));
}

function highlightText(text: string) {
    if (searchFont.value) {
        const regex = new RegExp(searchFont.value, 'gi');
        return text.replace(regex, match => `<span style="color: red;">${match}</span>`);
    }
    return text;
}

const getAllTextFontName = async () => {
    try {
        const pageFont = props.context.selection.selectedPage?.data.getUsedFontNames()
        if (pageFont) {
            const font = (Array.from(pageFont) as string[])
            const result = await Promise.all(font.map(name => isSupportFontFamily(name).length > 0));
            const usedSuccess = font.filter((name, index) => result[index]);
            fontList.used.success.push(...usedSuccess)
            const usedFailurel = font.filter((name, index) => {
                if (!result[index]) {
                    return name
                }
            });
            fontList.used.failurel.push(...usedFailurel)
        }
    } catch (error) {
        console.error('Error checking font availability:', error);
    }
}
const isUnfoldUsed = ref(true)
const isUnfoldZh = ref(true)
const isUnfoldEn = ref(true)
const unfoldFontName = (num: number) => {
    if (num === 1) {
        isUnfoldUsed.value = !isUnfoldUsed.value
    } else if (num === 2) {
        isUnfoldZh.value = !isUnfoldZh.value
    } else if (num === 3) {
        isUnfoldEn.value = !isUnfoldEn.value
    }
}

const get_top_posi = () => {
    if (font_context.value) {
        const p_container = props.fontNameEl?.getBoundingClientRect()
        if(p_container) {
            const body_h = document.body.clientHeight;
            const { y, height } = font_context.value.getBoundingClientRect();
            font_context.value.style.top = p_container.y + 'px';
            const su = body_h - p_container.y;
            const cur_t = su - height;
            if (cur_t - 10 < 0) {
                font_context.value.style.top = p_container.y + cur_t - 10 + 'px';
            }
        }
    }
}
watch(() => props.showFont, (v) => {
    if (v) {
        const { zh, en } = props.context.workspace.fontNameList;
        fontList.ch = [...zh];
        fontList.en = [...en];
        nextTick(() => {
            get_top_posi();
        })
    }
})

onMounted(() => {
    getAllTextFontName()
    get_top_posi();
})
</script>

<template>
    <div class="font-container" ref="font_context" v-if="showFont">
        <div class="search">
            <svg-icon icon-class="search"></svg-icon>
            <input type="text" v-model="searchFont" :placeholder="t('attr.search_for_fonts')" @input="onSearchFont">
        </div>
        <div class="font-scroll">
            <el-scrollbar v-if="searchFont.trim().length === 0">
                <div class="text_title">
                    <span class="font-title">{{ t('attr.used_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldUsed ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(1)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.used.success" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '32px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <!--                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                    <svg-icon icon-class="page-select"
                        :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                    <span> {{ item }}</span>
                </div>
                <div class="item failurel" v-for="item in fontList.used.failurel" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '32px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <!--                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                    <svg-icon icon-class="page-select"
                        :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                    <span> {{ item }}</span>
                    <Tooltip :content="`${t('attr.font_is_not')}`">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                    </Tooltip>
                </div>
                <div class="item-none" style="height: 40px;"
                    v-if="fontList.used.success.length === 0 && fontList.used.failurel.length === 0">
                    <div class="none-font">{{ t('attr.no_font_is_currently_in_use') }}</div>
                </div>
                <div class="line"></div>
                <div class="text_title">
                    <span class="font-title">{{ t('attr.chinese_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldZh ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(2)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.ch" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldZh ? '32px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <!--                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                    <svg-icon icon-class="page-select"
                        :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                    <span> {{ item }}</span>
                </div>
                <div class="line"></div>
                <div class="text_title">
                    <span class="font-title">{{ t('attr.english_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldEn ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(3)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.en" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldEn ? '32px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <!--                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                    <svg-icon icon-class="page-select"
                        :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                    <span> {{ item }}</span>
                </div>
            </el-scrollbar>
            <el-scrollbar v-else>
                <div class="text_title"
                    v-if="filterFontList.used.success.length !== 0 && filterFontList.used.failurel.length !== 0">
                    <span class="font-title">{{ t('attr.used_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldUsed ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(1)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.used.success.length !== 0 && filterFontList.used.failurel.length !== 0">
                    <div class="item" v-for="item in filterFontList.used.success" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldUsed ? '32px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <!--                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                        <svg-icon icon-class="page-select"
                            :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                        <span v-html="highlightText(item)"></span>
                    </div>
                </template>
                <div class="item failurel" v-for="item in filterFontList.used.failurel" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '32px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <!--                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                    <svg-icon icon-class="page-select"
                        :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                    <span v-html="highlightText(item)"></span>
                    <Tooltip :content="`${t('attr.font_is_not')}`">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                    </Tooltip>
                </div>
                <div class="text_title" v-if="filterFontList.ch.length !== 0">
                    <span class="font-title">{{ t('attr.chinese_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldZh ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(2)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.ch.length !== 0">
                    <div class="item" v-for="item in filterFontList.ch" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldZh ? '32px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <!--                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                        <svg-icon icon-class="page-select"
                            :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                        <span v-html="highlightText(item)"></span>
                    </div>
                </template>
                <div class="text_title" v-if="filterFontList.en.length !== 0">
                    <span class="font-title">{{ t('attr.english_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldEn ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(3)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.en.length !== 0">
                    <div class="item" v-for="item in filterFontList.en" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldEn ? '32px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <!--                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>-->
                        <svg-icon icon-class="page-select"
                            :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></svg-icon>
                        <span v-html="highlightText(item)"></span>
                    </div>
                </template>
                <div class="item-none" style="height: 40px;"
                    v-if="filterFontList.en.length === 0 && filterFontList.ch.length === 0">
                    <div class="none-font">{{ t('attr.find_the_fonts') }}</div>
                </div>
            </el-scrollbar>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.font-container {
    position: fixed;
    right: 254px;
    top: 36px;
    width: 224px;
    height: 580px;
    border-radius: 8px;
    background-color: #fff;
    border: 1px solid #F0F0F0;
    box-shadow: 0px 2px 16px 0px rgba(0, 0, 0, 0.08);
    z-index: 1001;

    .search {
        width: auto;
        height: 32px;
        margin: 8px;
        display: flex;
        align-items: center;
        box-sizing: border-box;
        background-color: #F5F5F5;
        padding: 10px 0 8px 10px;
        border-radius: 8px;

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
        height: 540px;
        box-sizing: border-box;
        padding-bottom: 8px;

        .text_title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title_svg {
                margin-right: 8px;

                >svg {
                    width: 12px;
                    height: 12px;
                }
            }
        }

        .font-title {
            display: flex;
            align-items: center;
            padding: 0 8px;
            height: 32px;
            line-height: 14px;
            color: #8C8C8C;
        }

        .line {
            width: 100%;
            height: 8px;
            border-width: 7px 0 0 0;
            border-style: solid;
            border-color: #fff;
            box-sizing: border-box;
            background-color: #EBEBEB;
        }

        .item {
            display: flex;
            align-items: center;
            height: 25px;
            padding: 0 10px;
            margin: 0;
            overflow: hidden;

            >span {
                display: block;
                width: 130px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-right: 5px;
                margin-left: 8px;
            }

            ;

            &:hover {
                background-color: var(--input-background);
            }

            >svg {
                width: 12px;
                height: 12px;
            }

            .el-icon {
                height: 100%;
                width: 25px;

                >svg {
                    width: 16px;
                    height: 16px;
                    color: rgb(0, 0, 0, .5);
                }
            }
        }

        .failurel {
            color: rgb(0, 0, 0, .2);
        }

        .item-none {
            display: flex;
            align-items: center;
            height: 25px;
            padding: 0 10px;
            margin: 0;

            .none-font {
                margin: 10px auto;
                font-size: var(--font-default-fontsize);
                color: rgb(0, 0, 0, .5);
            }
        }
    }
}
</style>