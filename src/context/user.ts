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
    avatar?: string,
    nickname?: string,
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

            conf.pixelAlignment = __temp.pixelAlignment || true;
            conf.pixelGrid = __temp.pixelGrid || true;
            conf.rule = __temp.rule || true;
            conf.slow = __temp.slow || 1;
            conf.fast = __temp.fast || 10;
        }
        this.m_pixel_alignment = conf.pixelAlignment;
        this.m_pixel_grid = conf.pixelGrid;
        this.m_rule = conf.rule;
        this.m_slow = conf.slow;
        this.m_fast = conf.fast;

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