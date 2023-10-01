export const SCREEN_SIZE = {
    KEY: 'documentFullScreen',
    FULL: 'full',
    NORMAL: 'normal'
}; // 编辑器屏幕尺寸
export const WEAKEN_ANIMATION = false; // 弱化动画

export const SKIP_LOGIN = false; // 跳过登录过程，直接进入个人首页，开发使用

const production = true;
export const BASE_SCHEME = production ? "https" : "https";
export const BASE_HOST = production ? "protodesign.cn" : "protodesign.cn";
export const BASE_PATH = `${BASE_SCHEME}://${BASE_HOST}`;
export const API_PATH = production ? "/api/v1" : "/api_test/v1";
export const API_URL = `${BASE_PATH}${API_PATH}`;
// export const STORAGE_URL = `${BASE_SCHEME}://storage.${BASE_HOST}`;
// export const STORAGE_URL = "https://oss-cn-hangzhou.aliyuncs.com";
export const STORAGE_URL = "https://storage1.protodesign.cn";
export const COMMUNICATION_URL = `wss://${BASE_HOST}${API_PATH}/communication`;