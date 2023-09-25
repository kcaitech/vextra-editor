<script setup lang="ts">
import { ref } from "vue";
import { Context } from "@/context";
import developing from "@/assets/development.svg"
import { useI18n } from 'vue-i18n';
import ShowHiddenLeft from "./ShowHiddenLeft.vue";
import ComponentList from "@/components/common/ComponentList.vue";
import ComponentPageCardVue from "./Component/ComponentPageCard.vue";
import ComponentPageList from "./Component/ComponentPageList.vue";
const props = defineProps<{ context: Context, leftTriggleVisible: boolean, showLeft: boolean }>();
const { t } = useI18n();
const emit = defineEmits<{ (e: 'showNavigation'): void }>()
const showHiddenLeft = () => {
    emit('showNavigation')
}

const activeNames = ref(['1'])
</script>

<template>
    <div class="comps-container">
        <ComponentList v-slot="type">
            <el-scrollbar>
                <div class="demo-collapse">
                    <el-collapse v-model="activeNames">
                        <el-collapse-item title="页面1" name="1">
                            <ComponentPageList v-if="type.type === 'list'" :context="context"></ComponentPageList>
                            <ComponentPageCardVue v-if="type.type === 'card'" :context="context"></ComponentPageCardVue>
                        </el-collapse-item>
                        <el-collapse-item title="页面2" name="2">
                      
                        </el-collapse-item>
                    </el-collapse>
                </div>
            </el-scrollbar>
        </ComponentList>
        <ShowHiddenLeft :showLeft="showLeft" :leftTriggleVisible="leftTriggleVisible" @showNavigation="showHiddenLeft">
        </ShowHiddenLeft>
    </div>
</template>

<style scoped lang="scss">
.comps-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    background-color: #fff;
    font-size: 10px;
    box-sizing: border-box;
    overflow: hidden;

    .el-scrollbar {
        padding-right: 10px;
        .demo-collapse {
            box-sizing: border-box;
        }
        .el-collapse {
            --el-collapse-border-color: none;
            :deep(.el-collapse-item__content) {
                padding-bottom: 10px;
            }
        }

    }
    :deep(.el-collapse-item__header) {
        height: 35px;
        font-size: 10px;
        border-bottom-color:transparent;
        border-radius: 4px;
        &:hover {
            background-color: var(--grey-light);
        }
        padding-left: 4px;
    }
}
</style>