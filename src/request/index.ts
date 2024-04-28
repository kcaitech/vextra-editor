import axios from 'axios'
import { API_URL } from '@/settings';
import { router } from '@/router'
import { ElMessage } from 'element-plus'

declare module "axios" {
    interface AxiosResponse<T = any> {
        errorinfo: null
        code: number
        message: string
        error: object
    }
    export function create(config?: AxiosRequestConfig): AxiosInstance;
}

const service = axios.create({
    baseURL: API_URL,
    timeout: 60000,
})

// 请求拦截器
service.interceptors.request.use(function (config) {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}, function (error) {
    return Promise.reject(error);
});


// 响应拦截器
let timer: any
service.interceptors.response.use(function (response) {
    const dataAxios = response.data || {}
    if (dataAxios.code === 0) {
        return Promise.resolve(dataAxios)
    } else if (dataAxios && dataAxios.code && dataAxios.code === 400) {
        return Promise.resolve(dataAxios)
    } else if (dataAxios && dataAxios.code && dataAxios.code === -1) {
        return Promise.resolve(dataAxios)
    }else if (dataAxios && dataAxios.code && dataAxios.code === 403) {
        return Promise.resolve(dataAxios)
    }  else {
        if (dataAxios && dataAxios.code && dataAxios.code === 401) {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                ElMessage({ duration: 3000, message: '登录失效，请重新登录', type: 'info' })
                clearTimeout(timer)
            }, 500);
            if(navigator.userAgent.includes('miniProgram')){
                router.push('/wxlogin')
            }else{
                router.push('/login')
            }
            localStorage.removeItem('token')
        }
        return Promise.reject(response)
    }
}, function (error) {
    return Promise.reject(error);
});


export default service