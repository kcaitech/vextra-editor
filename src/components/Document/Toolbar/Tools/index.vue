/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from "vue";
import { Context } from '@/context';
import { Selection } from '@/context/selection';
import Cursor from "../Buttons/Cursor.vue";
import Frame from "../Buttons/Frame.vue";
import GroupUngroup from "../Buttons/GroupUngroup.vue";
import CreateText from "../Buttons/CreateText.vue";
import Contact from "../Buttons/CreateContact.vue";
import { WorkSpace } from "@/context/workspace";
import { Action, Tool } from "@/context/tool";
import PathEditTool from "@/components/Document/Toolbar/PathEditTool.vue";
import PathShape from "@/components/Document/Toolbar/Buttons/PathShape.vue";
import Export from "../Buttons/Export.vue";
import VertLine from "./VertLine.vue";
import { watchReadyonly } from "@/components/common/watchreadonly";
import Mask from "@/components/Document/Toolbar/Buttons/Mask.vue";

interface Props {
    context: Context
    selection: Selection
}

const props = defineProps<Props>();
const selected = ref<string>(Action.AutoV);
const is_path_edit = ref<boolean>(false);

function select(action: string) {
    props.context.tool.setAction(action);
}

const isLabel = ref(props.context.tool.isLable);

function tool_watcher(t?: number) {
    if (t === Tool.CHANGE_ACTION) {
        selected.value = props.context.tool.action;
    } else if (t === Tool.LABLE_CHANGE) {
        isLabel.value = props.context.tool.isLable;
    }
}

function workspace_watcher(t: number) {
    if (t === WorkSpace.PATH_EDIT_MODE) {
        is_path_edit.value = props.context.workspace.is_path_edit_mode
    }
}

const readonly = watchReadyonly(props.context, () => {
    updateComps()
    updateDevComps()
});

const cursorParams = {
    get edit() {
        return !readonly.value;
    },
    get active() {
        return selected.value === Action.AutoV || selected.value === Action.AutoK;
    }
}

const _comps = shallowRef<{ component: any, params?: any }[]>([])

function updateComps() {
    _comps.value = [];
    let comps = _comps.value;

    const toolsPlugins = props.context.pluginsMgr.search2('toolbar.tools');
    comps.push(...toolsPlugins.begin)
    comps.push(
        {
            component: Cursor,
            params: cursorParams
        })

    if (!readonly.value) {
        comps.push({ component: VertLine },
            {
                component: Frame,
                params: {
                    get active() {
                        return selected.value === Action.AddFrame
                    },
                }
            },
            { component: PathShape },
            {
                component: CreateText,
                params: {
                    get active() {
                        return selected.value === Action.AddText;
                    },
                }
            },
            { component: VertLine }
        )
        // const efficientPlugins = props.context.pluginsMgr.search2('toolbar.tools.efficient');
        // comps.push(...efficientPlugins.begin)
        // comps.push({ component: CompsVue })
        comps.push({ component: GroupUngroup })
        comps.push({ component: Mask });
        // comps.push(...efficientPlugins.end)

        comps.push({ component: VertLine })
        comps.push(
            // 先屏蔽掉表格
            // {
            //     component: Table,
            //     params: {
            //         get active() {
            //             return selected.value === Action.AddTable
            //         },
            //         select,
            //     }
            // },
            {
                component: Contact,
                params: {
                    get active() {
                        return selected.value === Action.AddContact
                    }
                }
            },
        )
        const efficientPlugins = props.context.pluginsMgr.search2('toolbar.tools.efficient');
        comps.push(...efficientPlugins.begin)
        comps.push(...efficientPlugins.end)

    } else {
        comps.push(
            {
                component: Export,
                params: {
                    get active() {
                        return selected.value === Action.Export
                    }
                }
            })
        comps.push(...toolsPlugins.end)
    }
}

updateComps()

const devcomps = shallowRef<{ component: any, params?: any }[]>([])

function updateDevComps() {
    const comps = devcomps.value;
    comps.length = 0;

    const toolsPlugins = props.context.pluginsMgr.search2('devmode.toolbar.tools');
    comps.push(...toolsPlugins.begin)
    comps.push(
        {
            component: Cursor,
            params: cursorParams
        })

    comps.push(
        {
            component: Export,
            params: {
                get active() {
                    return selected.value === Action.Export
                }
            }
        })

    comps.push(...toolsPlugins.end)

}

updateDevComps()

// hooks
onMounted(() => {
    props.context.tool.watch(tool_watcher);
    props.context.workspace.watch(workspace_watcher);
});
onUnmounted(() => {
    props.context.tool.unwatch(tool_watcher);
    props.context.tool.unwatch(workspace_watcher);
})

</script>

<template>
    <!-- 路径编辑 -->
    <PathEditTool v-if="is_path_edit" class="editor-tools" :context="props.context" :selected="selected"/>
    <!-- 开发模式 --><!-- 可编辑或者只读 -->
    <div v-else-if="isLabel" class="editor-tools" @dblclick.stop>
        <component v-for="c in devcomps" :is=c.component :context="props.context" :params="c.params" />
    </div>
    <!-- 正常工具栏 --><!-- 可编辑或者只读 -->
    <div v-else class="editor-tools" @dblclick.stop>
        <component v-for="c in _comps" :is=c.component :context="props.context" :params="c.params" />
    </div>
</template>

<style scoped lang="scss">
.editor-tools {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);

    &::-webkit-scrollbar {
        width: 0;
        height: 0;
    }

    &::-webkit-scrollbar-track {
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb:hover {
        background-color: transparent;
    }

    &::-webkit-scrollbar-thumb:active {
        background-color: transparent;
    }
}
</style>