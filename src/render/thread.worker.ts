/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the Vextra project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

self.onmessage = (e: MessageEvent) => {
    const data = e.data as { id: number, args: any };

    let result
    let err
    try {
        result = render(data.args)
    } catch (e) {
        console.error(e)
        err = e
    }

    self.postMessage({id: data.id, result, err });
}

function render(args: {}) {

}