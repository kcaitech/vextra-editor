<!--
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 -->

<script setup lang="ts">
import { computed } from 'vue';
import { DocLockedType, DocumentLock } from './type';

// 定义组件props
interface Props {
  modelValue: boolean;
  title?: string;
  documentLocks: DocumentLock[];
}

const props = withDefaults(defineProps<Props>(), {
  title: '审查结果',
  documentLocks: () => []
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

// 计算属性
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 按类型分组的审查结果
const groupedLocks = computed(() => {
  const groups = {
    comments: [] as DocumentLock[],
    texts: [] as DocumentLock[],
    images: [] as DocumentLock[],
    pages: [] as DocumentLock[]
  };
  
  props.documentLocks.forEach(lock => {
    switch (lock.lock_type) {
      case DocLockedType.LockedTypeComment:
        groups.comments.push(lock);
        break;
      case DocLockedType.LockedTypeText:
        groups.texts.push(lock);
        break;
      case DocLockedType.LockedTypeMedia:
        groups.images.push(lock);
        break;
      case DocLockedType.LockedTypePage:
        groups.pages.push(lock);
        break;
    }
  });
  
  return groups;
});

const totalLocks = computed(() => props.documentLocks.length);

// 获取锁定类型的中文描述
const getTypeText = (type: DocLockedType) => {
  switch (type) {
    case DocLockedType.LockedTypeComment: return '评论';
    case DocLockedType.LockedTypeText: return '文本';
    case DocLockedType.LockedTypeMedia: return '图片';
    case DocLockedType.LockedTypePage: return '页面';
    default: return '未知';
  }
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="title"
    width="70%"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="review-result">
      <!-- 统计信息 -->
      <div class="result-summary">
        <el-card class="summary-card">
          <div class="summary-content">
            <div class="summary-icon">
              <el-icon size="32" color="#f56c6c">
                <Warning />
              </el-icon>
            </div>
            <div class="summary-text">
              <h3>审查结果</h3>
              <p v-if="totalLocks === 0" class="no-issues">🎉 恭喜！所有内容审查通过</p>
              <p v-else class="has-issues">发现 <strong>{{ totalLocks }}</strong> 项内容需要修改</p>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 审查结果列表 -->
      <div v-if="totalLocks > 0" class="result-content">
        <el-tabs type="border-card">
          <!-- 评论问题 -->
          <el-tab-pane v-if="groupedLocks.comments.length > 0" :label="`评论 (${groupedLocks.comments.length})`">
            <div class="lock-list">
              <div v-for="lock in groupedLocks.comments" :key="lock.lock_target" class="lock-item">
                <el-card>
                  <div class="lock-header">
                    <el-tag type="danger">{{ getTypeText(lock.lock_type) }}</el-tag>
                    <span class="lock-target">ID: {{ lock.lock_target }}</span>
                  </div>
                  <div class="lock-content">
                    <div class="lock-words">
                      <strong>内容：</strong>{{ lock.locked_words }}
                    </div>
                    <div class="lock-reason">
                      <strong>原因：</strong>{{ lock.locked_reason }}
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <!-- 文本问题 -->
          <el-tab-pane v-if="groupedLocks.texts.length > 0" :label="`文本 (${groupedLocks.texts.length})`">
            <div class="lock-list">
              <div v-for="lock in groupedLocks.texts" :key="lock.lock_target" class="lock-item">
                <el-card>
                  <div class="lock-header">
                    <el-tag type="danger">{{ getTypeText(lock.lock_type) }}</el-tag>
                    <span class="lock-target">ID: {{ lock.lock_target }}</span>
                  </div>
                  <div class="lock-content">
                    <div class="lock-words">
                      <strong>内容：</strong>{{ lock.locked_words }}
                    </div>
                    <div class="lock-reason">
                      <strong>原因：</strong>{{ lock.locked_reason }}
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <!-- 图片问题 -->
          <el-tab-pane v-if="groupedLocks.images.length > 0" :label="`图片 (${groupedLocks.images.length})`">
            <div class="lock-list">
              <div v-for="lock in groupedLocks.images" :key="lock.lock_target" class="lock-item">
                <el-card>
                  <div class="lock-header">
                    <el-tag type="danger">{{ getTypeText(lock.lock_type) }}</el-tag>
                    <span class="lock-target">ID: {{ lock.lock_target }}</span>
                  </div>
                  <div class="lock-content">
                    <div class="lock-words">
                      <strong>文件：</strong>{{ lock.locked_words }}
                    </div>
                    <div class="lock-reason">
                      <strong>原因：</strong>{{ lock.locked_reason }}
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>

          <!-- 页面问题 -->
          <el-tab-pane v-if="groupedLocks.pages.length > 0" :label="`页面 (${groupedLocks.pages.length})`">
            <div class="lock-list">
              <div v-for="lock in groupedLocks.pages" :key="lock.lock_target" class="lock-item">
                <el-card>
                  <div class="lock-header">
                    <el-tag type="danger">{{ getTypeText(lock.lock_type) }}</el-tag>
                    <span class="lock-target">ID: {{ lock.lock_target }}</span>
                  </div>
                  <div class="lock-content">
                    <div class="lock-words">
                      <strong>页面：</strong>{{ lock.locked_words }}
                    </div>
                    <div class="lock-reason">
                      <strong>原因：</strong>{{ lock.locked_reason }}
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.review-result {
  .result-summary {
    margin-bottom: 20px;
    
    .summary-card {
      .summary-content {
        display: flex;
        align-items: center;
        gap: 16px;
        
        .summary-icon {
          flex-shrink: 0;
        }
        
        .summary-text {
          h3 {
            margin: 0 0 8px 0;
            color: #303133;
            font-size: 18px;
          }
          
          .no-issues {
            color: #67c23a;
            margin: 0;
            font-size: 16px;
          }
          
          .has-issues {
            color: #f56c6c;
            margin: 0;
            font-size: 16px;
            
            strong {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
  
  .result-content {
    .lock-list {
      max-height: 400px;
      overflow-y: auto;
      
      .lock-item {
        margin-bottom: 12px;
        
        .lock-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          
          .lock-target {
            font-size: 12px;
            color: #909399;
            font-family: monospace;
          }
        }
        
        .lock-content {
          .lock-words, .lock-reason {
            margin-bottom: 8px;
            color: #606266;
            
            strong {
              color: #303133;
              margin-right: 8px;
            }
            
            &:last-child {
              margin-bottom: 0;
            }
          }
          
          .lock-words {
            padding: 8px 12px;
            background: #f5f7fa;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
          }
          
          .lock-reason {
            color: #f56c6c;
          }
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>