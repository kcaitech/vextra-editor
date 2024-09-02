<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import ListView, { IDataIter, IDataSource } from "@/components/common/ListView.vue";
import PageItem, { ItemData } from "./PreviewPageItem.vue";
import { Context } from "@/context";
import { useI18n } from 'vue-i18n';
import { Document, Page, PageListItem, PageView } from '@kcdesign/data';
import { Preview } from "@/context/preview";
import { selectedShape, setWindowTitle } from "@/utils/preview";
import { Selection } from "@/context/selection";

type List = InstanceType<typeof ListView>;

interface Props {
    context: Context
    page: PageView
}

interface Emits {
    (e: "fold", fold: boolean): void;
}

const { t } = useI18n();
const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const pagelist = ref<List>();
const list_body = ref<HTMLDivElement>()
const ListH = ref<number>(0)
const pageH = ref<number>(0)
const fold = ref<boolean>(false)
const cur_page_name = ref<string>(t('navi.page'));
const previewWatcher = (type: number | string) => {
    if (type === Selection.CHANGE_PAGE) {
        getPageName();
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }
}
const getPageName = () => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const pages = props.context.data.pagesList
    const name = pages.find(item => item.id === page.id)?.name
    cur_page_name.value = name || t('navi.page');
}
const rightTarget = ref<string>('');
const pageList = ref<HTMLDivElement>()

function document_watcher(...args: any[]) {
    if (args.includes('pagesList')) {
        const page = props.context.selection.selectedPage;
        if (page) {
            const _page = props.context.data.pagesList.find(item => item.id === page.id);
            if (!_page) {
                const pages = props.context.data.pagesList;
                const index = props.context.preview.pageIndex;
                if (index === -1 || index === pages.length) {
                    const first_page = props.context.data.pagesList[0];
                    props.context.data.pagesMgr.get(first_page.id).then((page: Page | undefined) => {
                        if (page) {
                            const pagedom = props.context.getPageDom(page).dom;
                            props.context.selection.selectPage(pagedom);
                            selectedShape(props.context, pagedom, t);
                            setWindowTitle(props.context, pagedom);
                        }
                    })
                } else {
                    const select_page = props.context.data.pagesList[index];
                    props.context.data.pagesMgr.get(select_page.id).then((page: Page | undefined) => {
                        if (page) {
                            const pagedom = props.context.getPageDom(page).dom;
                            props.context.selection.selectPage(pagedom);
                            selectedShape(props.context, pagedom, t);
                            setWindowTitle(props.context, pagedom);
                        }
                    })
                }
            }
        }
    }

    pageSource.notify(0, 0, 0, Number.MAX_VALUE);
}

class Iter implements IDataIter<ItemData> {
    private __document: Document;
    private __preview: Selection;
    private __index: number;

    constructor(context: Context, index: number) {
        this.__document = context.data;
        this.__preview = context.selection;
        this.__index = index;
    }

    hasNext(): boolean {
        return this.__index < this.__document.pagesList.length;
    }

    next(): ItemData {
        const id: PageListItem = this.__document.pagesList[this.__index];
        this.__index++;
        const slectedPage = this.__preview.selectedPage;
        return {
            name: id.name,
            id: id.id,
            selected: slectedPage !== undefined && slectedPage.id == id.id,
            context: props.context,
            rightTarget: rightTarget.value === id.id
        }
    }
}

const pageSource = new class implements IDataSource<ItemData> {
    private m_onchange?: (index: number, del: number, insert: number, modify: number) => void;

    indexOf(data: ItemData): number {
        throw new Error("Method not implemented.");
    }

    length(): number {
        return props.context.data.pagesList.length;
    }

    iterAt(index: number): IDataIter<ItemData> {
        return new Iter(props.context, index);
    }

    onChange(l: (index: number, del: number, insert: number, modify: number) => void): void {
        this.m_onchange = l;
    }

    notify(index: number, del: number, insert: number, modify: number) {
        this.m_onchange && this.m_onchange(index, del, insert, modify);
    }
}

function toggle() {
    fold.value = !fold.value;
    getPageName();
    emit('fold', fold.value);
    nextTick(() => {
        const id = props.context.selection.selectedPage?.id;
        const index = props.context.data.pagesList.findIndex((item) => item.id === id);
        if (list_body.value) {
            ListH.value = list_body.value.clientHeight
        }
        scrollList(index);
    })
    if (!fold.value) {
        const timer = setTimeout(() => {
            pageSource.notify(0, 0, 0, Number.MAX_VALUE);
            clearTimeout(timer);
        }, 100);
    }
}

const scrollList = (index: number) => {
    if (pagelist.value && index >= 0) {
        const itemScrollH = index * 32
        if (itemScrollH + 29 >= ListH.value - pagelist.value.scroll.y) {
            if ((itemScrollH) + pagelist.value.scroll.y >= ListH.value) {
                pagelist.value.clampScroll(0, -(itemScrollH - ListH.value))
            }
        } else if (itemScrollH + 29 < -(pagelist.value.scroll.y)) {
            pagelist.value.clampScroll(0, -itemScrollH)
        }
    }
}

const setSelectedPageVisible = () => {
    const page = props.context.selection.selectedPage;
    if (!page) return;
    const index = props.context.data.pagesList.findIndex((item) => item.id === page.id);
    scrollList(index);
    setTimeout(() => {
        pageSource.notify(0, 0, 0, Number.MAX_VALUE);
    }, 200)
}

onMounted(() => {
    getPageName();
    props.context.selection.watch(previewWatcher);
    props.context.data.watch(document_watcher);
    if (list_body.value) {
        pageH.value = list_body.value.clientHeight; //list可视高度
        setSelectedPageVisible();
    }
});

onUnmounted(() => {
    props.context.selection.unwatch(previewWatcher);
    props.context.data.unwatch(document_watcher);
});
</script>

<template>
    <div class="pagelist-wrap" ref="pageList">
        <div class="header">
            <div class="title">{{ fold ? cur_page_name : t('navi.page') }}</div>
            <div class="btn">
                <div class="shrink" @click="toggle">
                    <svg-icon icon-class="down"
                        :style="{ transform: fold ? 'rotate(-90deg)' : 'rotate(0deg)' }"></svg-icon>
                </div>
            </div>
        </div>
        <div class="body" ref="list_body" :style="{ height: fold ? 0 : 'calc(100% - 40px)' }">
            <ListView ref="pagelist" :source="pageSource" :item-view="PageItem" :item-width="0" :context="props.context"
                :pageHeight="pageH" :item-height="32" :first-index="0" v-bind="$attrs" orientation="vertical"
                location="pagelist">
            </ListView>
        </div>
    </div>
</template>

<style scoped lang="scss">
.pagelist-wrap {
    height: 100%;
    box-sizing: border-box;
    padding-left: 6px;

    .header {
        width: 100%;
        height: 40px;
        display: flex;
        padding-right: 6px;
        font-size: var(--font-default-fontsize);
        box-sizing: border-box;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        color: #434343;

        .title {
            height: 40px;
            line-height: 40px;
            max-width: calc(100% - 70px);
            margin-left: 8px;
            text-overflow: ellipsis;
            white-space: nowrap;
            overflow: hidden;
        }

        .btn {
            display: flex;
            height: 100%;
            align-items: center;

            >div {
                width: 28px;
                height: 28px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--default-radius);

                &:hover {
                    background-color: #F5F5F5;
                }

                >svg {
                    width: 16px;
                    height: 16px;
                }
            }
        }
    }

    .body {
        height: calc(100% - 30px);

        >.container {
            height: 100%;
        }
    }

    :deep(.port) {
        transform: translateX(-6px);
    }
}

.items-wrap {
    font-size: var(--font-default-fontsize);
    height: 32px;
    line-height: 32px;
    padding: 0px 24px;
    box-sizing: border-box;

    &:hover {
        background-color: var(--active-color);
        color: #ffffff;
    }
}

.items-wrap-disable {
    font-size: var(--font-default-fontsize);
    height: 32px;
    padding: 0px 24px;
    line-height: 32px;
    box-sizing: border-box;
    color: grey;
}
</style>