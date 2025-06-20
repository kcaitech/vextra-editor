/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * 文档编辑器组件
 * @description 用于渲染和编辑设计文档的主要组件
 */
export { default as DocumentVue } from "./components/Document/index.vue"

/**
 * 移动端文档编辑器组件
 * @description 针对移动端优化的文档编辑器组件
 */
export { default as MobileDocumentVue } from "./components/Mobile/Document.vue"

export { default as View } from "./components/common/ShapeDesc/View.vue"

/**
 * 预览组件
 * @description 用于预览设计文档的组件
 */
export { default as PreviewVue } from "./components/Preview/index.vue"

export { default as StaticShape } from "./components/Document/Content/StaticShape.vue"

import '@/style/constant.scss'
import '@/style/app.scss'
export {i18n_messages as i18n} from '@/i18n';

export * from "./openapi";

export { initModule } from "./basic/initmodule";

export { DragKit } from "./components/common/draggable";

export { ShapeDescContext } from "./components/common/ShapeDesc/shapeDescContext";

export { openDocument, exportDocument } from "./functions";