<template>
    <div class="list-item" v-for=" project  in props.data" :key="project.team.id">
        <div class="image">
            <img v-if="team.team.avatar" :src="team.team.avatar" alt="team-icon">
            <span v-else>{{ team.team.name.slice(0, 1) }}</span>
        </div>
        <div class="content">
            <div class="left">
                <span class="name"> {{ team.team.name }}</span>
                <span class="time">{{ team.team.description }}</span>
            </div>
            <!-- <div class="right">
                <div class="share">
                    <svg-icon icon-class="mShare"></svg-icon>
                </div>
                <div class="star">
                    <svg-icon icon-class="mStar"></svg-icon>
                </div>
            </div> -->
        </div>
    </div>
    <Loading v-if="loading" :size="20"></Loading>
    <div v-if="showtips" class="null"><span>还未加入项目</span></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import Loading from '../common/Loading.vue';
import { urlencoded } from 'express';

const props = defineProps<{
    data: any,
}>();

const showtips = ref<boolean>(false)
const loading = ref<boolean>(true)

watch(() => props.data, () => {
    if (props.data.length === 0) {
        showtips.value = true
    } else {
        showtips.value = false
    }
    loading.value = false
})

watch(() => props.data, () => {
    console.log(props.data);

})
</script>

<style lang="scss" scoped>
.null {
    display: flex;
    height: 100%;

    span {
        font-size: 14px;
        color: #BFBFBF;
        font-weight: 500;
        margin: auto;
    }
}

.list-item {
    display: flex;
    align-items: center;
    height: 84px;
    gap: 14px;
    width: 100%;
    overflow: hidden;

    .image {
        width: 40px;
        height: 40px;

        img {
            width: 100%;
            height: 100%;
            border-radius: 100%;
        }

        span {
            background-color: #1878F5;
            color: white;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 100%;
            font-size: 18px;
            font-weight: 500;
        }
    }

    .content {
        display: flex;
        align-items: center;
        width: calc(100% - 54px);

        .left {
            display: flex;
            flex-direction: column;
            gap: 6px;
            width: 100%;
            overflow: hidden;

            .name {
                line-height: 22px;
                font-size: 16px;
                font-weight: 500;
                color: #1F1F1F;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }

            .time {
                line-height: 16px;
                font-size: 13px;
                font-weight: 400;
                color: #8C8C8C;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
            }
        }

        .right {
            display: flex;
            align-items: center;
            gap: 8px;

            .share,
            .star {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;

                svg {
                    width: 24px;
                    height: 24px;
                }
            }

        }
    }
}
</style>
