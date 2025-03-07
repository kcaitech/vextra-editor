/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { IEventEmitter } from "@kcdesign/data";
import { IScout } from "./scout";

export * from "./scout"

export interface IToolBox {
    get scout(): IScout;
    // get storage(): Map<string, any>;
    get event(): IEventEmitter;
}