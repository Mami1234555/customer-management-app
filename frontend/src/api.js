import axios from 'axios'

// Axiosの共通設定
const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
    withXSRFToken: true,
})

// CSRFトークンを保存する
let csrfToken = null

// CSRFトークンを取得する
export const fetchCsrfToken = async () => {
    const response = await api.get('/auth/csrf')

    csrfToken = response.data.token

    return csrfToken
}

// POST・PUT・DELETEの前にCSRFトークンを設定する
api.interceptors.request.use((config) => {
    const method = config.method?.toLowerCase()

    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        if (csrfToken) {
            config.headers['X-XSRF-TOKEN'] = csrfToken
        }
    }

    return config
})

export default api
