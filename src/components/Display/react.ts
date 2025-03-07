/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * 更新时机
 * Auto 自动更新
 * Focus 图层得到聚焦时候更新
 * Static 不更新
 */
export enum RefreshTiming {
    Auto,
    Focus,
    Static
}