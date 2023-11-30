<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { onMounted, reactive, ref } from 'vue'
import { Context } from '@/context';
import { fontNameListEn, fontNameListZh, FontAvailable } from './FontNameList'
import { InfoFilled } from '@element-plus/icons-vue'
import Tooltip from '@/components/common/Tooltip.vue';
const { t } = useI18n();
const emit = defineEmits<{
    (e: 'setFont', font: string): void
}>()
const props = defineProps<{
    fontName: string,
    context: Context
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
    emit('setFont', font)
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

function checkFontsAvailability(fontName: string[], fontList: FontName, lang: string) {
    const promises = fontName.map(name => FontAvailable(name));
    Promise.all(promises)
        .then(results => {
            if (lang === 'ch') {
                const ch = fontName.filter((name, index) => results[index]);
                fontList.ch.push(...ch)
            } else {
                const en = fontName.filter((name, index) => results[index]);
                fontList.en.push(...en)
            }
        })
        .catch(error => {
            console.error('Error checking font availability:', error);
        });
}

const getAllTextFontName = () => {
    const pageFont = props.context.selection.selectedPage?.getUsedFontNames()
    if (pageFont) {
        const font = (Array.from(pageFont) as string[])
        const promises = font.map(name => FontAvailable(name));
        Promise.all(promises).then(res => {
            const usedSuccess = font.filter((name, index) => res[index]);
            fontList.used.success.push(...usedSuccess)
            const usedFailurel = font.filter((name, index) => {
                if (!res[index]) {
                    return name
                }
            });
            fontList.used.failurel.push(...usedFailurel)
        }).catch(err => {
            console.log(err);
        })
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
        const body_h = document.body.clientHeight;
        const { y, height } = font_context.value.getBoundingClientRect();
        const su = body_h - y;
        const cur_t = su - height;
        if (cur_t - 10 < 0) {
            font_context.value.style.top = cur_t + 20 + 'px';
        }
    }
}

onMounted(() => {
    getAllTextFontName()
    checkFontsAvailability(fontNameListZh, fontList, 'ch')
    checkFontsAvailability(fontNameListEn, fontList, 'en')
    get_top_posi();
})
</script>

<template>
    <div class="font-container" ref="font_context">
        <div class="search">
            <svg-icon icon-class="search"></svg-icon>
            <input type="text" v-model="searchFont" :placeholder="t('attr.search_for_fonts')" @input="onSearchFont">
        </div>
        <div class="font-scroll">
            <el-scrollbar v-if="searchFont.trim().length === 0">
                <div class="text_title">
                    <span class="font-title">{{ t('attr.used_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldUsed ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon icon-class="down"
                            @click="unfoldFontName(1)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.used.success" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '25px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
                <div class="item failurel" v-for="item in fontList.used.failurel" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '25px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
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
                    <span class="title_svg" :style="{ transform: !isUnfoldZh ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(2)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.ch" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldZh ? '25px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
                <div class="line"></div>
                <div class="text_title">
                    <span class="font-title">{{ t('attr.english_font') }}</span>
                    <span class="title_svg" :style="{ transform: !isUnfoldEn ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(3)"></svg-icon></span>
                </div>
                <div class="item" v-for="item in fontList.en" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldEn ? '25px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span> {{ item }}</span>
                </div>
            </el-scrollbar>
            <el-scrollbar v-else>
                <div class="text_title"
                    v-if="filterFontList.used.success.length !== 0 && filterFontList.used.failurel.length !== 0">
                    <span class="font-title">{{ t('attr.used_font') }}</span>
                    <span class="title_svg"
                        :style="{ transform: !isUnfoldUsed ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon icon-class="down"
                            @click="unfoldFontName(1)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.used.success.length !== 0 && filterFontList.used.failurel.length !== 0">
                    <div class="item" v-for="item in filterFontList.used.success" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldUsed ? '25px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                        <span v-html="highlightText(item)"></span>
                    </div>
                </template>
                <div class="item failurel" v-for="item in filterFontList.used.failurel" :key="item"
                    :style="{ fontFamily: item, height: isUnfoldUsed ? '25px' : '0px', transition: '0.2s' }"
                    @click="selectFont(item)">
                    <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                    <span v-html="highlightText(item)"></span>
                    <Tooltip :content="`${t('attr.font_is_not')}`">
                        <el-icon>
                            <InfoFilled />
                        </el-icon>
                    </Tooltip>
                </div>
                <div class="text_title" v-if="filterFontList.ch.length !== 0">
                    <span class="font-title">{{ t('attr.chinese_font') }}</span>
                    <span class="title_svg" :style="{ transform: !isUnfoldZh ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(2)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.ch.length !== 0">
                    <div class="item" v-for="item in filterFontList.ch" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldZh ? '25px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
                        <span v-html="highlightText(item)"></span>
                    </div>
                </template>
                <div class="text_title" v-if="filterFontList.en.length !== 0">
                    <span class="font-title">{{ t('attr.english_font') }}</span>
                    <span class="title_svg" :style="{ transform: !isUnfoldEn ? `rotate(-90deg)` : `rotate(0deg)` }"><svg-icon
                            icon-class="down" @click="unfoldFontName(3)"></svg-icon></span>
                </div>
                <template v-if="filterFontList.en.length !== 0">
                    <div class="item" v-for="item in filterFontList.en" :key="item"
                        :style="{ fontFamily: item, height: isUnfoldEn ? '25px' : '0px', transition: '0.2s' }"
                        @click="selectFont(item)">
                        <div class="choose" :style="{ visibility: item == fontName ? 'visible' : 'hidden' }"></div>
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
    position: absolute;
    top: 30px;
    right: 22px;
    width: 208;
    height: 440px;
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
        height: 400px;
        box-sizing: border-box;
        padding-bottom: 10px;

        .text_title {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title_svg {
                margin-right: 20px;

                >svg {
                    width: 11px;
                    height: 11px;
                }
            }
        }

        .font-title {
            display: flex;
            align-items: center;
            padding: 0 10px;
            height: 25px;
            color: rgb(0, 0, 0, .5);
        }

        .line {
            width: 100%;
            height: 11px;
            border-width: 5px 0 5px 0;
            border-style: solid;
            border-color: #fff;
            box-sizing: border-box;
            background-color: rgb(0, 0, 0, .05);
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
                margin-right: 5px
            }

            ;

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
}</style>