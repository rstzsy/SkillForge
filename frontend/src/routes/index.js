import HomePage from "../pages/HomePage/HomePage";
import Listen from '../pages/ListenPage/ListenPage';
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";

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
        // isShowHeader: true,
        // isShowFooter: true
    }
]