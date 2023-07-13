export const SCREEN_SIZE = {
    KEY: 'documentFullScreen',
    FULL: 'full',
    NORMAL: 'normal'
}; // 编辑器屏幕尺寸
export const WEAKEN_ANIMATION = false; // 弱化动画

export const SKIP_LOGIN = false; // 跳过登录过程，直接进入个人首页，开发使用

const production = true
export const BASE_HOST = production ? "protodesign.cn" : "protodesign.cn";
export const API_SCHEME = production ? "https" : "https";
export const API_PATH = production ? "/api/v1" : "/api_test/v1";
export const API_URL = `${API_SCHEME}://${BASE_HOST}${API_PATH}`;
export const STORAGE_URL = `${API_SCHEME}://storage.${BASE_HOST}`;
export const COMMUNICATION_URL = `wss://${BASE_HOST}${API_PATH}/communication`;

// todo 改成使用上面的
export const FILE_UPLOAD = production ? 'wss://protodesign.cn/api/v1' : 'wss://protodesign.cn/api_test/v1';
export const FILE_DOWNLOAD = production ? "https://storage.protodesign.cn" : "https://storage.protodesign.cn";
//请求根路径
export const BASE_URL = production ? 'https://protodesign.cn/api/v1' : 'https://protodesign.cn/api_test/v1';