import HomePage from "../pages/HomePage/HomePage";
import Listen from '../pages/ListenPage/ListenPage';
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ListenDetail from "../pages/ListenPage/ListenDetail";
import Score from "../pages/ListenPage/ScorePage"

export const routes = [
    {
        path: '/', 
        page: HomePage,
        isShowHeader: true,
        isShowFooter: true

    },
    {
        path: '/login',
        page: Login,
    },
    {
        path: '/register',
        page: Register,
    },
    {
        path: '/listen',
        page: Listen,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/listen/:id',
        page: ListenDetail,
    },
    {
        path: '/score/:id',
        page: Score,
        isShowHeader: true,
        isShowFooter: true
    },
]