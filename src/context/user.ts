/*
 * Copyright (c) 2023-2024 KCai Technology(kcaitech.com). All rights reserved.
 *
 * This file is part of the vextra.io/vextra.cn project, which is licensed under the AGPL-3.0 license.
 * The full license text can be found in the LICENSE file in the root directory of this source tree.
 *
 * For more information about the AGPL-3.0 license, please visit:
 * https://www.gnu.org/licenses/agpl-3.0.html
 */

import { WatchableObject } from "@kcdesign/data";

interface UserInfo {
    id: string
    nickname: string
    avatar: string
}

export interface UserConfig {
    pixelAlignment: boolean;
    pixelGrid: boolean;
    rule: boolean;
    slow: number;
    fast: number;
    pageListSpace: {
        height: number;
        fold: boolean;
    }
}

export type DocSelectionData = {
    select_page_id: string,
    select_shape_id_list: string[],
    hover_shape_id?: string,
    cursor_start?: number,
    cursor_end?: number,
    cursor_at_before?: boolean,
    // 以下字段仅读取时有效
    user_id?: string,
    permission?: number,
    user?: UserInfo,
    enter_time?: number,
}

export class User extends WatchableObject {
    static GRID_STATUS_CHANGE = 1;
    static RULE_STATUS_CHANGE = 2;

    private m_username: string = ''
    private m_pixel_alignment: boolean = true;
    private m_pixel_grid: boolean = true;
    private m_rule: boolean = true;
    private m_slow: number = 1;
    private m_fast: number = 10;
    private m_page_list_space = { height: 120, fold: false };

    constructor() {
        super();
    }

    get userName() {
        return this.m_username;
    }

    get isPixelAlignMent() {
        return this.m_pixel_alignment;
    }

    get isPixelGrid() {
        return this.m_pixel_grid;
    }

    get isRuleVisible() {
        return this.m_rule;
    }

    get step() {
        return { slow: this.m_slow, fast: this.m_fast }
    }

    get pageListSpace() {
        return this.m_page_list_space;
    }

    modifyPageListSpaceHeight(v: number) {
        this.m_page_list_space.height = v;

        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.pageListSpace.height = v;
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }
    modifyPageListSpaceFold(v: boolean) {
        this.m_page_list_space.fold = v;

        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.pageListSpace.fold = v;
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    modifysetStepSlow(v: number) {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.slow = v;
        this.m_slow = v;
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    modifysetStepFast(v: number) {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.fast = v;
        this.m_fast = v
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    modifyPixelAlignment(v: boolean) {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.pixelAlignment = v;
        this.m_pixel_alignment = v;
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    modifyPixelGrid(v: boolean) {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.pixelGrid = v;
        this.m_pixel_grid = v;
        this.notify(User.GRID_STATUS_CHANGE);
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    modifyRuleVisible(v: boolean) {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        conf.rule = v;
        this.m_rule = v;
        this.notify(User.RULE_STATUS_CHANGE);
        localStorage.setItem('userConfig', JSON.stringify(conf));
    }

    static CONF = {
        pixelAlignment: true,
        pixelGrid: true,
        rule: true,
        slow: 1,
        fast: 10,
        pageListSpace: {
            height: 120,
            fold: false
        }
    };

    get initConfig(): string {
        const conf: UserConfig = User.CONF;
        return JSON.stringify(conf);
    }

    updateUserConfig() {
        let conf = JSON.parse(localStorage.getItem('userConfig')!) as UserConfig;
        if (!conf) conf = User.CONF;

        if ((Object.keys(conf).length !== Object.keys(User.CONF).length)) {
            const __temp = JSON.parse(JSON.stringify(conf));
            conf = User.CONF;

            conf.pixelAlignment = __temp.pixelAlignment ?? true;
            conf.pixelGrid = __temp.pixelGrid ?? true;
            conf.rule = __temp.rule ?? true;
            conf.slow = __temp.slow ?? 1;
            conf.fast = __temp.fast ?? 10;
            conf.pageListSpace.height = __temp?.pageListSpace?.height ?? 120;
            conf.pageListSpace.fold = __temp?.pageListSpace?.fold ?? false;
        }
        this.m_pixel_alignment = conf.pixelAlignment;
        this.m_pixel_grid = conf.pixelGrid;
        this.m_rule = conf.rule;
        this.m_slow = conf.slow;
        this.m_fast = conf.fast;
        this.m_page_list_space = conf.pageListSpace;

        localStorage.setItem('userConfig', JSON.stringify(conf));
    }
}

interface Document {
    id: string
    created_at: string
    updated_at: string
    user_id: string
    path: string
    doc_type: number
    name: string
    size: number
}

interface DocUser {
    id: string
    nickname: string
    avatar: string
}

interface Favorites {
    id: string
    is_favorite: boolean
}

interface Permission {
    id: string
    perm_type: number
}

interface Project {
    id: string
    name: string
}

interface DocInfo {
    apply_list: any;
    document: Document
    user: DocUser
    document_favorites: Favorites
    document_permission: Permission
    shares_count: number
    application_count: number
    project: Project
}

export { DocInfo, UserInfo }