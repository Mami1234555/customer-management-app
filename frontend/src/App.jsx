import { useEffect, useState } from 'react'
import api, { fetchCsrfToken } from './api'
import { Search, UserRoundPlus } from 'lucide-react'
import './App.css'

// 施術内容の選択肢
const treatmentOptions = [
    'カット',
    'カラー',
    'パーマ',
    '縮毛矯正',
    'トリートメント',
    'ヘッドスパ',
    'フェイシャルマッサージ',
    'アイラッシュ'
]

// 登録済みの施術内容を選択項目と自由入力に分ける
const parseTreatmentDetails = (details) => {
    if (!details) {
        return { selected: [], custom: '' }
    }

    const items = details
        .split(/[・、,，]/)
        .map((item) => item.trim())
        .filter(Boolean)

    const selected = items.filter((item) =>
        treatmentOptions.includes(item)
    )

    const custom = items
        .filter((item) => !treatmentOptions.includes(item))
        .join('・')

    return { selected, custom }
}

function App() {
    // 表示する画面
    const [page, setPage] = useState('top')

    // ログイン状態
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loginUser, setLoginUser] = useState(null)

    // ログインフォーム
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(true)
    const [authError, setAuthError] = useState('')

    // 顧客情報
    const [editingCustomerId, setEditingCustomerId] = useState(null)
    const [customers, setCustomers] = useState([])

    // 検索条件
    const [customerId, setCustomerId] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [visitDay, setVisitDay] = useState('')

    // 新規登録・編集フォーム
    const [newCustomer, setNewCustomer] = useState({
        customerName: '',
        visitDay: '',
        treatmentDetails: '',
        topic: '',
        handover: '',
    })

    // 施術内容の複数選択・自由入力
    const [selectedTreatments, setSelectedTreatments] = useState([])
    const [customTreatment, setCustomTreatment] = useState('')

    // 状態管理
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')

    // 顧客情報を取得
    const fetchCustomers = async (params = {}) => {
        try {
            setLoading(true)
            setError('')

            const response = await api.get('/customers', { params })
            setCustomers(response.data)

        } catch (error) {
            console.error('顧客情報取得エラー:', error)
            setError('顧客情報の取得に失敗しました。')

        } finally {
            setLoading(false)
        }
    }

    // 画面を開いたときにログイン状態を確認
    useEffect(() => {
        const checkLogin = async () => {
            try {
                await fetchCsrfToken()

                const response = await api.get('/auth/me')

                setLoginUser(response.data)
                setIsLoggedIn(true)
                setPage('top')

            } catch (error) {
                console.log('ログインしていません')
                setIsLoggedIn(false)
                setLoginUser(null)

            } finally {
                setAuthLoading(false)
                setLoading(false)
            }
        }

        checkLogin()
    }, [])

    // ログイン処理
    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            setAuthLoading(true)
            setAuthError('')

            await fetchCsrfToken()

            const response = await api.post('/auth/login', {
                username,
                password,
            })

            setLoginUser(response.data)
            setIsLoggedIn(true)
            setUsername('')
            setPassword('')

            await fetchCsrfToken()

            setPage('top')
            setMessage('')
            setError('')

        } catch (error) {
            console.error('ログインエラー:', error)

            setIsLoggedIn(false)
            setLoginUser(null)

            setAuthError(
                error.response?.data?.message ||
                'ログインに失敗しました。IDとパスワードを確認してください。'
            )

        } finally {
            setAuthLoading(false)
        }
    }

    // ログアウト処理
    const handleLogout = async () => {
        try {
            setError('')
            setMessage('')

            await fetchCsrfToken()
            await api.post('/auth/logout')

            setIsLoggedIn(false)
            setLoginUser(null)
            setUsername('')
            setPassword('')
            setAuthError('')
            setCustomers([])
            setPage('top')

        } catch (error) {
            console.error('ログアウトエラー:', error)
            setError('ログアウトに失敗しました。')
        }
    }

    // フォームを初期状態に戻す
    const resetCustomerForm = () => {
        setNewCustomer({
            customerName: '',
            visitDay: '',
            treatmentDetails: '',
            topic: '',
            handover: '',
        })

        setSelectedTreatments([])
        setCustomTreatment('')
    }

    // 顧客検索画面を開く
    const openSearchPage = () => {
        setPage('list')
        setMessage('')
        setError('')
        fetchCustomers()
    }

    // 顧客検索
    const searchCustomers = () => {
        const params = {}

        if (customerId.trim()) {
            params.customerId = customerId
        }

        if (customerName.trim()) {
            params.customerName = customerName.trim()
        }

        if (visitDay) {
            params.visitDay = visitDay
        }

        fetchCustomers(params)
    }

    // 検索条件をクリア
    const clearSearch = () => {
        setCustomerId('')
        setCustomerName('')
        setVisitDay('')
        fetchCustomers()
    }

    // 登録・編集フォームの入力内容を更新
    const handleInputChange = (e) => {
        const { name, value } = e.target

        setNewCustomer((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    // 施術内容の選択・解除
    const handleTreatmentChange = (treatment) => {
        setSelectedTreatments((prev) =>
            prev.includes(treatment)
                ? prev.filter((item) => item !== treatment)
                : [...prev, treatment]
        )
    }

    // 保存用の施術内容を作成
    const buildTreatmentDetails = () => {
        const treatments = [...selectedTreatments]

        if (customTreatment.trim()) {
            treatments.push(customTreatment.trim())
        }

        return treatments.join('・')
    }

    // 新規顧客登録画面を開く
    const openRegisterPage = () => {
        resetCustomerForm()
        setEditingCustomerId(null)
        setError('')
        setMessage('')
        setPage('register')
    }

    // 顧客編集画面を開く
    const handleEdit = (customer) => {
        setEditingCustomerId(customer.customerId)

        const parsedTreatment = parseTreatmentDetails(
            customer.treatmentDetails
        )

        setNewCustomer({
            customerName: customer.customerName || '',
            visitDay: customer.visitDay || '',
            treatmentDetails: customer.treatmentDetails || '',
            topic: customer.topic || '',
            handover: customer.handover || '',
        })

        setSelectedTreatments(parsedTreatment.selected)
        setCustomTreatment(parsedTreatment.custom)

        setError('')
        setMessage('')
        setPage('edit')
    }

    // 新規顧客登録
    const handleRegister = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)
            setError('')
            setMessage('')

            const customerData = {
                ...newCustomer,
                visitDay: newCustomer.visitDay || null,
                treatmentDetails: buildTreatmentDetails(),
            }

            const response = await api.post('/customers', customerData)

            resetCustomerForm()
            setPage('top')

            setMessage(
                `${response.data.customerName}さんを登録しました！`
            )

        } catch (error) {
            console.error('顧客登録エラー:', error)
            setError('顧客登録に失敗しました。入力内容を確認してください。')

        } finally {
            setSaving(false)
        }
    }

    // 顧客情報を更新
    const handleUpdate = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)
            setError('')
            setMessage('')

            const customerData = {
                ...newCustomer,
                visitDay: newCustomer.visitDay || null,
                treatmentDetails: buildTreatmentDetails(),
            }

            const response = await api.put(
                `/customers/${editingCustomerId}`,
                customerData
            )

            setEditingCustomerId(null)
            resetCustomerForm()
            setPage('list')

            await fetchCustomers()

            setMessage(
                `${response.data.customerName} 様の情報を更新しました！`
            )

        } catch (error) {
            console.error('顧客更新エラー:', error)
            setError('顧客情報の更新に失敗しました。')

        } finally {
            setSaving(false)
        }
    }


    // 施術内容入力欄
    const renderTreatmentFields = () => (
        <div className="form-group">
            <label>施術内容</label>

            <p className="treatment-description">
                該当する施術内容を選択してください（複数選択可）。
            </p>

            <div className="treatment-options">
                {treatmentOptions.map((treatment) => (
                    <label
                        className="treatment-option"
                        key={treatment}
                    >
                        <input
                            type="checkbox"
                            checked={selectedTreatments.includes(treatment)}
                            onChange={() => handleTreatmentChange(treatment)}
                        />
                        <span>{treatment}</span>
                    </label>
                ))}
            </div>

            {/* その他の施術・自由入力 */}
            <div className="treatment-custom-section">
                <label
                    htmlFor="customTreatment"
                    className="treatment-custom-label"
                >
                    <span>その他の施術・自由入力</span>
                    <span className="treatment-custom-badge">任意</span>
                </label>

                <p className="treatment-custom-description">
                    上記以外の施術内容があれば入力してください。
                </p>

                <input
                    id="customTreatment"
                    type="text"
                    className="treatment-custom-input"
                    value={customTreatment}
                    onChange={(e) => setCustomTreatment(e.target.value)}
                    placeholder="例：前髪カット、髪質改善など"
                />
            </div>
        </div>
    )

    // ログイン状態の確認中
    if (authLoading) {
        return (
            <div className="container">
                <h1>顧客管理システム</h1>
                <p>ログイン状態を確認しています...</p>
            </div>
        )
    }

    // 未ログインの場合

    // 未ログインの場合
    if (!isLoggedIn) {
        return (
            <div className="login-page">
                <div className="login-card">
                    <div className="login-heading">
                        <h1>顧客管理システム</h1>

                        {/*<p className="login-description">*/}
                        {/*    アカウント情報を入力してください*/}
                        {/*</p>*/}
                    </div>

                    <div className="login-divider"></div>

                    <form onSubmit={handleLogin}>
                        <div className="form-group login-form-group">
                            <label htmlFor="username">
                                ログインID
                            </label>

                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="ログインIDを入力"
                                required
                            />
                        </div>

                        <div className="form-group login-form-group">
                            <label htmlFor="password">
                                パスワード
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="パスワードを入力"
                                required
                            />
                        </div>

                        {authError && (
                            <p className="error">{authError}</p>
                        )}

                        <button
                            type="submit"
                            className="login-submit-button"
                            disabled={authLoading}
                        >
                            {authLoading ? 'ログイン中...' : 'ログイン'}
                        </button>
                    </form>

                    <p className="login-footer">
                        STAFF ONLY
                    </p>
                </div>
            </div>
        )
    }


    // ログイン済みの場合
    return (
        <div className="container">
            <h1>顧客管理システム</h1>

            {/* ログインユーザー情報 */}
            <div className="user-header">
                <p className="user-name">
                    ログイン中：{loginUser?.username}さん
                </p>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    ログアウト
                </button>
            </div>

            {/* 完了メッセージ */}
            {message && (
                <p className="success-message">{message}</p>
            )}

            {/* トップページ */}
            {page === 'top' && (
                <section className="register-section top-section">
                    <div className="top-heading">
                        <p className="top-subtitle">WELCOME BACK</p>
                        <h2>お客様管理システムへようこそ</h2>
                        <p className="top-message">
                            本日もお仕事頑張りましょう。
                        </p>
                        <p className="form-description">
                            ご利用になるメニューを選択してください。
                        </p>
                    </div>

                    <div className="top-menu">
                        <button
                            className="top-menu-button"
                            onClick={openSearchPage}
                        >
                            <Search className="menu-icon" size={32} strokeWidth={1.5} />
                            <span>顧客検索</span>
                            <small>登録済みの顧客情報を検索・確認します。</small>
                        </button>

                        <button
                            className="top-menu-button"
                            onClick={openRegisterPage}
                        >
                            <UserRoundPlus className="menu-icon" size={32} strokeWidth={1.5} />
                            <span>顧客新規登録</span>
                            <small>新しい顧客情報を登録します。</small>
                        </button>
                    </div>
                </section>
            )}

            {/* 顧客検索・一覧画面 */}
            {page === 'list' && (
                <>
                    <div className="button-group">
                        <button
                            className="clear-button"
                            onClick={() => setPage('top')}
                        >
                            トップページへ戻る
                        </button>
                    </div>

                    <section className="search-section">
                        <h2>顧客検索</h2>

                        <div className="search-form">
                            <div className="form-group">
                                <label htmlFor="customerId">顧客ID</label>
                                <input
                                    id="customerId"
                                    type="number"
                                    placeholder="顧客IDを入力"
                                    value={customerId}
                                    onChange={(e) => setCustomerId(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="customerName">顧客名</label>
                                <input
                                    id="customerName"
                                    type="text"
                                    placeholder="顧客名を入力"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="visitDay">来店日</label>
                                <input
                                    id="visitDay"
                                    type="date"
                                    value={visitDay}
                                    onChange={(e) => setVisitDay(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                className="search-button search-submit-button"
                                onClick={searchCustomers}
                            >
                                <Search
                                    className="search-button-icon"
                                    size={17}
                                    strokeWidth={1.8}
                                />
                                <span>検索</span>
                            </button>

                            <button
                                className="clear-button"
                                onClick={clearSearch}
                            >
                                クリア
                            </button>
                        </div>
                    </section>

                    <section className="customer-section">
                        <h2>顧客一覧</h2>

                        {loading && <p>読み込み中...</p>}
                        {error && <p className="error">{error}</p>}

                        {!loading && !error && (
                            <>
                                <p className="result-count">
                                    検索結果：{customers.length}件
                                </p>

                                {customers.length === 0 ? (
                                    <p className="no-result">
                                        該当する顧客情報はありません。
                                    </p>
                                ) : (
                                    <div className="customer-list">
                                        {customers.map((customer) => (
                                            <div
                                                className="customer-card"
                                                key={customer.customerId}
                                            >
                                                <h3>{customer.customerName}&nbsp;様</h3>

                                                <p>
                                                    <strong>顧客ID：</strong>
                                                    {customer.customerId}
                                                </p>

                                                <p>
                                                    <strong>来店日：</strong>
                                                    {customer.visitDay || '未登録'}
                                                </p>

                                                <p>
                                                    <strong>施術内容：</strong>
                                                    {customer.treatmentDetails || '未登録'}
                                                </p>

                                                <p>
                                                    <strong>会話内容：</strong>
                                                    {customer.topic || '未登録'}
                                                </p>

                                                <p>
                                                    <strong>引き継ぎ事項：</strong>
                                                    {customer.handover || '未登録'}
                                                </p>

                                                <div className="button-group">
                                                    <button
                                                        className="search-button"
                                                        onClick={() => handleEdit(customer)}
                                                    >
                                                        編集
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </>
            )}

            {/* 新規顧客登録画面 */}
            {page === 'register' && (
                <section className="register-section">
                    <h2>新規顧客登録</h2>

                    <p className="form-description">
                        新しい顧客情報を入力してください。
                    </p>

                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label htmlFor="newCustomerName">
                                顧客名 <span className="required">必須</span>
                            </label>
                            <input
                                id="newCustomerName"
                                name="customerName"
                                type="text"
                                placeholder="例：山田 花子"
                                value={newCustomer.customerName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newVisitDay">
                                来店日 <span className="required">必須</span>
                            </label>
                            <input
                                id="newVisitDay"
                                name="visitDay"
                                type="date"
                                value={newCustomer.visitDay}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {renderTreatmentFields()}

                        <div className="form-group">
                            <label htmlFor="newTopic">会話内容</label>
                            <textarea
                                id="newTopic"
                                name="topic"
                                placeholder="例：旅行や趣味について"
                                value={newCustomer.topic}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newHandover">引き継ぎ事項</label>
                            <textarea
                                id="newHandover"
                                name="handover"
                                placeholder="例：次回は明るめのカラーを希望"
                                value={newCustomer.handover}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        {error && <p className="error">{error}</p>}

                        <div className="button-group">
                            <button
                                type="submit"
                                className="search-button"
                                disabled={saving}
                            >
                                {saving ? '登録中...' : '顧客を登録する'}
                            </button>

                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => {
                                    resetCustomerForm()
                                    setPage('top')
                                    setError('')
                                }}
                            >
                                トップページへ戻る
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* 顧客情報編集画面 */}
            {page === 'edit' && (
                <section className="register-section">
                    <h2>顧客情報編集</h2>

                    <p className="form-description">
                        顧客情報を修正して更新してください。
                    </p>

                    <form onSubmit={handleUpdate}>
                        <div className="form-group">
                            <label htmlFor="editCustomerName">
                                顧客名 <span className="required">必須</span>
                            </label>
                            <input
                                id="editCustomerName"
                                name="customerName"
                                type="text"
                                value={newCustomer.customerName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="editVisitDay">
                                来店日 <span className="required">必須</span>
                            </label>
                            <input
                                id="editVisitDay"
                                name="visitDay"
                                type="date"
                                value={newCustomer.visitDay}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        {renderTreatmentFields()}

                        <div className="form-group">
                            <label htmlFor="editTopic">会話内容</label>
                            <textarea
                                id="editTopic"
                                name="topic"
                                value={newCustomer.topic}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="editHandover">引き継ぎ事項</label>
                            <textarea
                                id="editHandover"
                                name="handover"
                                value={newCustomer.handover}
                                onChange={handleInputChange}
                                rows="3"
                            />
                        </div>

                        {error && <p className="error">{error}</p>}

                        <div className="button-group">
                            <button
                                type="submit"
                                className="search-button"
                                disabled={saving}
                            >
                                {saving ? '更新中...' : '更新する'}
                            </button>

                            <button
                                type="button"
                                className="clear-button"
                                onClick={() => {
                                    setEditingCustomerId(null)
                                    resetCustomerForm()
                                    setPage('list')
                                    setError('')
                                }}
                            >
                                顧客検索画面へ戻る
                            </button>
                        </div>
                    </form>
                </section>
            )}
        </div>
    )
}

export default App
