/*
 * Copyright (c) 2023-2025 KCai Technology (https://kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

export interface INet {
    upload(name: string, data: ArrayBufferLike): Promise<boolean>

    genThumbnail(name: string, contentType: string, data: ArrayBufferLike): Promise<boolean>

    // uploadSymbolResource(name: string, path: string, data: ArrayBufferLike): Promise<boolean>
}