import HomePage from "../pages/HomePage/HomePage";
import Listen from '../pages/ListenPage/ListenPage';
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ListenDetail from "../pages/ListenPage/ListenDetail";
import Score from "../pages/ListenPage/ScorePage"
import Read from "../pages/ReadPage/ReadPage";
import WritePage from "../pages/WritePage/WritePage";
import WriteDetail from "../pages/WritePage/WriteDetail";
import ReadDetail from "../pages/ReadPage/ReadDetail";
import ScoreRead from "../pages/ReadPage/ScoreReadPage";
import Account from "../pages/Account/Account";
import Contact from "../pages/ContactPage/Contact";
import SpeakPage from "../pages/SpeakPage/SpeakPage";
import SpeakDetail from "../pages/SpeakPage/SpeakDetail";

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
        path: '/write',
        page: WritePage,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/write/:id',
        page: WriteDetail,
    },
    {
        path: '/speak',
        page: SpeakPage,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/speak/:id',
        page: SpeakDetail,
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
    {
        path: '/account',
        page: Account,
        isShowHeader: true,
        isShowFooter: true
    },
    {
        path: '/contact',
        page: Contact,
        isShowHeader: true,
        isShowFooter: true
    },
]