/*
 * Copyright (c) 2023-2024 vextra.io. All rights reserved.
 *
 * This file is part of the vextra.io project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import App from "./index.vue";
import '@/style/constant.scss';
import '@/style/app.scss';
import '@/utils/permission';
import { createApp } from "vue";
import i18n from "@/i18n";

const app = createApp(App)
app.use(i18n)
app.mount("#app");