/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { IStorage } from '@kcdesign/data'

export * from './plugins'
export * from "./context"
export * from "./net"
export * from "./selection"
export * from "./workspace"
export * from "./toolbox"
export type DocumentProps = (
    { source: 'storage', storage: IStorage, path: string, fid: string, versionId: string } |
    { source: 'file', file: File, fmt: 'moss' | 'sketch' | 'fig' } |
    { source: 'new' })
// { coop?: ICoopNet } & // 通过CoopRepo设置
// { communication?: ICommunication } &
// { readonly?: boolean }