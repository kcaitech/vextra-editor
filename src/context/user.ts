import { WatchableObject } from "@kcdesign/data";

interface UserInfo {
    id: string
    nickname: string
    avatar: string
}

interface UserConfig {
    pixelAlignment: boolean;
    pixelGrid: boolean;
}

export class User extends WatchableObject {
    static GRID_STATUS_CHANGE = 1;

    private m_username: string = ''
    private m_pixel_alignment: boolean = true;
    private m_pixel_grid: boolean = true;

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

    get initConfig(): string {
        const conf: UserConfig = {
            pixelAlignment: true,
            pixelGrid: true
        };
        return JSON.stringify(conf);
    }

    updateUserConfig() {
        const conf = JSON.parse(localStorage.getItem('userConfig') || this.initConfig) as UserConfig;
        this.m_pixel_alignment = conf.pixelAlignment;

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

export class DocumentInfo extends WatchableObject {
    private m_document_info: DocInfo;
    private m_document: Document | undefined;
    private m_user: DocUser | undefined;
    private m_shares_count: number = 0;
    private m_application_count: number = 0;

    constructor(docInfo: DocInfo) {
        super();
        this.m_document_info = docInfo
        this.m_document = docInfo.document
        this.m_user = docInfo.user
        this.m_shares_count = docInfo.shares_count
        this.m_application_count = docInfo.application_count
    }

    get DocumentInfo() {
        return this.m_document_info
    }

    get getDocument() {
        return this.m_document
    }

    get documentUser() {
        return this.m_user
    }

    get sharesCount() {
        return this.m_shares_count
    }

    get applicationCount() {
        return this.m_application_count
    }
}

export { DocInfo, UserInfo }