import HomePage from "../pages/HomePage/HomePage";
import Listen from '../pages/ListenPage/ListenPage';
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ListenDetail from "../pages/ListenPage/ListenDetail";
import Score from "../pages/ListenPage/ScorePage"
import Read from "../pages/ReadPage/ReadPage";
import ReadDetail from "../pages/ReadPage/ReadDetail";
import ScoreRead from "../pages/ReadPage/ScoreReadPage";

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
    {
        path: '/read',
        page: Read,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/read/:id',
        page: ReadDetail,
    },
    {
        path: '/score/read/:id',
        page: ScoreRead,
        isShowHeader: true,
        isShowFooter: true
    },
]