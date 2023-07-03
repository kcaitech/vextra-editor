<script setup lang="ts">
import TypeHeader from '../TypeHeader.vue';
import { useI18n } from 'vue-i18n';
import SelectFont from './SelectFont.vue';
const { t } = useI18n();
</script>

<template>
    <div class="text-panel">
        <TypeHeader :title="t('attr.text')" class="mt-24">
            <template #tool>
                <div class="trigger" >
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
            </template>
        </TypeHeader>
        <div class="text-container">
            <div class="text-top">
                <div class="select-font jointly-text">
                    <span>思源黑体</span>
                    <svg-icon icon-class="down"></svg-icon>
                    <!-- <SelectFont></SelectFont> -->
                </div>
            </div>
            <div class="text-middle">
                <div class="text-size jointly-text">
                    <span>12</span>
                    <svg-icon icon-class="down"></svg-icon>
                    <div class="font-size-list">
                        <div>10</div>
                        <div>12</div>
                        <div>14</div>
                        <div>16</div>
                        <div>18</div>
                        <div>24</div>
                        <div>36</div>
                        <div>48</div>
                        <div>64</div>
                    </div>
                </div>
                <div class="overbold jointly-text">
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
                <div class="overbold jointly-text">
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
                <div class="overbold jointly-text">
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
                <div class="overbold jointly-text">
                    <svg-icon icon-class="gear"></svg-icon>
                </div>
            </div>
            <div class="text-bottom">
                <div class="level-aligning jointly-text">
                    <i class="jointly-text"><svg-icon icon-class="flex-end-col"></svg-icon></i>
                    <i class="jointly-text"><svg-icon icon-class="flex-end"></svg-icon></i>
                    <i class="jointly-text"><svg-icon icon-class="flex-start-col"></svg-icon></i>
                    <i class="jointly-text"><svg-icon icon-class="flex-start"></svg-icon></i>
                </div>
                <div class="vertical-aligning jointly-text">
                    <i class="jointly-text"><svg-icon icon-class="flex-end-col"></svg-icon></i>
                    <i class="jointly-text"><svg-icon icon-class="flex-end"></svg-icon></i>
                    <i class="jointly-text"><svg-icon icon-class="flex-start-col"></svg-icon></i>
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped lang="scss">
.text-panel {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 12px 10px;
    box-sizing: border-box;
    .trigger {
        width: 22px;
        height: 22px;
        display: flex;
        justify-content: center;
        align-items: center;
        > svg {
            width: 50%;
            height: 50%;
            transition: 0.5s;
        }
        svg:hover {
        transform: rotate(90deg);
      }
    }
    .text-container {
        font-size: var(--font-default-fontsize);
        .jointly-text {
            height: 25px;
            border-radius: 4px;
            background-color: var(--input-background);
            display: flex;
            justify-content: space-between;
            align-items: center;    
            >svg {
                width: 12px;
                height: 12px;
            } 
        }
        .text-top {
            margin-bottom: 10px;
            .select-font {
                position: relative;
                padding: 0 10px;
            }
        }
        .text-middle{
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 10px;
            .text-size {
                position: relative;
                width: 80px;
                padding: 0 10px;
                .font-size-list {
                    position: absolute;
                    top: 30px;
                    left: 0px;
                    width: 100px;
                    height: 225px;
                    background-color: #fff;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
                    padding: 10px 0;
                    >div {
                        display: flex;
                        align-items: center;
                        width: 100%;
                        padding: 0 10px;
                        height: 25px;
                        box-sizing: border-box;

                        :hover {
                            background-color: var(--input-background);
                        }
                    }
                }
            }
            .overbold {
                width: 25px;
                display: flex;
                justify-content: center;
            }
        }
        .text-bottom{
            display: flex;
            align-items: center;
            justify-content: space-between;
            .level-aligning {
                width: 45%;
                padding: 0 10px;
            }
            .vertical-aligning {
                width: 34%;
                padding: 0 10px;
            }
        }
    }
}

</style>