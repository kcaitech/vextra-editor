<template>
    <div class="set-container">
        <div class="name-container">
            <div class="left">
                <div class="title">团队名称</div>
                <div class="text">{{ teamName }}</div>
            </div>
            <div class="right">
                <button type="button">修改名称</button>
            </div>
        </div>
        <div class="description-container">
            <div class="left">
                <div class="title">团队描述</div>
                <div class="text">{{ Description }}</div>
            </div>
            <div class="right"> <button type="button">修改描述</button></div>

        </div>
        <div class="avatar-container">
            <div class="left">
                <div class="title">团队头像</div>
                <div class="text">{{ t('Createteam.avatar_restriction') }}</div>
            </div>
            <div class="right">
                <button type="button">修改头像</button>
            </div>

        </div>
        <div class="dissolve-container">
            <div class="left">
                <div class="title">解散团队</div>
                <div class="text">解散团队，删除团队文件，不可恢复</div>
            </div>
            <div class="right">
                <button class="disband" type="button" @click.stop="disband(teamID)">解散团队</button>
            </div>

        </div>
    </div>
</template>
<script setup lang="ts">
import { Ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import * as user_api from '@/apis/users'
const { t } = useI18n();

const { teamID, teamName, teamAvatar, teamDescription } = inject('shareData') as {
    teamID: Ref<string>;
    teamName: Ref<string>;
    teamAvatar: Ref<string>;
    teamDescription: Ref<string>;
}

const Description = computed(() => {
    if (teamDescription.value != '') {
        return teamDescription.value
    } else {
        return '你还没有填写团队描述，快去填写吧。'
    }

})

const disband = (async (id: string) => {
    try {
        const { code, message } = await user_api.Disband({ team_id: id })
        if (code === 0) {
            console.log('1');
            
        }

    } catch (error) {

    }
})


</script>
<style lang="scss" scoped>
.set-container {
    margin: 16px 32px;

    .name-container,
    .description-container,
    .avatar-container,
    .dissolve-container {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 0 40px 0;

        .left {

            .title {
                font-weight: 600;
                margin-bottom: 12px;
            }

            .text {
                color: #666;
            }
        }

        .right button {
            cursor: pointer;
            color: white;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            width: 80px;
            height: 32px;
            border: none;
            background-color: #9775fa;
            border-radius: 4px;

            &:hover {
                background-color: rgba(150, 117, 250, 0.862745098);
            }

            &:active {
                background-color: #9775fa;
            }
        }

    }

}

.left {}
</style>
