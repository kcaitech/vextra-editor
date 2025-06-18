<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '@/components/common/SvgIcon.vue';
import ReviewModal from './ReviewModal.vue';
import error_icon from '@/assets/icons/svg/error.svg'

import { DocLockedType, DocumentLock } from './type';

const showReviewModal = ref(false);

// 模拟从后端获取的审查结果数据
const mockDocumentLocks: DocumentLock[] = [
    {
        document_id: 'doc_123',
        locked_reason: '包含不当内容',
        lock_type: DocLockedType.LockedTypeComment,
        lock_target: 'comment_1',
        locked_words: '这个设计看起来很不错，但是颜色可能需要调整一下'
    },
    {
        document_id: 'doc_123',
        locked_reason: '文本内容不符合规范',
        lock_type: DocLockedType.LockedTypeText,
        lock_target: 'text_1',
        locked_words: '产品标题文本'
    },
    {
        document_id: 'doc_123',
        locked_reason: '图片包含敏感信息',
        lock_type: DocLockedType.LockedTypeMedia,
        lock_target: 'image_1',
        locked_words: 'banner.jpg'
    }
];

const handleReview = () => {
    showReviewModal.value = true;
}

</script>

<template>
    <div class="review_entrance" @click="handleReview">
        <SvgIcon :icon="error_icon"/>
    </div>
    
    <!-- 审查弹框 -->
    <ReviewModal 
        v-model="showReviewModal"
        :documentLocks="mockDocumentLocks"
        title="审查结果"
    />
</template>

<style scoped lang="scss">
.review_entrance {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    cursor: pointer;
    border-radius: 4px;
    box-sizing: border-box;

    >img {
        width: 21px;
        height: 21px;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }
}
</style>