// 锁定类型枚举，对应后端 DocLockedType
export enum DocLockedType {
    LockedTypeMedia = 0,   // 图片审核不通过
    LockedTypeText = 1,    // 文本审核不通过
    LockedTypePage = 2,    // 页面审核不通过
    LockedTypeComment = 3  // 评论审核不通过
}

// DocumentLock 结构，对应后端的 DocumentLock struct
export interface DocumentLock {
    document_id: string;      // 文档ID
    locked_reason: string;    // 锁定原因，最大255字符
    lock_type: DocLockedType; // 锁定类型
    lock_target: string;      // 锁定目标：page id, comment id, media id
    locked_words: string;     // 文本内容，最大255字符
}
