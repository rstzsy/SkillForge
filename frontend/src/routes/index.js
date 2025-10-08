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
import AdminDashboard from "../pages/Admin/AdminDashboard/DashBoard";
import AdminUser from "../pages/Admin/AdminUser/ManageUser";
import UpdateUser from "../pages/Admin/AdminUser/UpdateUser"
import AdminTestResult from "../pages/Admin/AdminTestResult/AdminTestResult";
import AdminListen from "../pages/Admin/AdminListen/AdminListen"
import AdminLearningPath from "../pages/Admin/AdminLearningPath/AdminLearningPath";
import AdminAddListen from "../pages/Admin/AdminListen/AdminAddListen"
import AdminEditListen from "../pages/Admin/AdminListen/AdminEditListen"
import AdminRead from "../pages/Admin/AdminReading/AdminRead"
import AdminAddRead from "../pages/Admin/AdminReading/AdminAddRead"
import AdminEditRead from "../pages/Admin/AdminReading/AdminEditRead"
import TeacherStudent from "../pages/Teacher/TeacherStudent/TeacherStudent";
import TeacherClass from "../pages/Teacher/TeacherClass/TeacherClass";
import AdminWrite from "../pages/Admin/AdminWriting/AdminWrite";
import AdminAddWrite from "../pages/Admin/AdminWriting/AddminAddWrite";
import AdminEditWrite from "../pages/Admin/AdminWriting/AdminEditWrite";
import AdminSpeak from "../pages/Admin/AdminSpeak/AdminSpeak";
import AdminAddSpeak from "../pages/Admin/AdminSpeak/AdminAddSpeak";
import AdminEditSpeak from "../pages/Admin/AdminSpeak/AdminEditSpeak";
import TeacherDashBoard from "../pages/Teacher/TeacherDashBoard/TeacherDashBoard";
import TeacherEditClass from "../pages/Teacher/TeacherClass/TeacherEditClass"
import TeacherRecord from "../pages/Teacher/TeacherRecord/TeacherRecord";
import TeacherEditRecord from "../pages/Teacher/TeacherRecord/TeacherEditRecord"

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
    {
        path: '/admin',
        page: AdminDashboard,
    },
    {
        path: '/admin/manage_user',
        page: AdminUser,
    },
    {
        path: '/admin/manage_user/update/:id',
        page: UpdateUser,
    },
    {
        path: '/admin/manage_user/learning_path/:id',
        page: AdminLearningPath,
    },
    {
        path: '/admin/test_results',
        page: AdminTestResult,
    },
    {
        path: '/admin/practice_listening',
        page: AdminListen,
    },
    {
        path: '/admin/practice_listening/add',
        page: AdminAddListen,
    },
    {
        path: '/admin/practice_listening/edit/:id',
        page: AdminEditListen,
    },
    {
        path: '/admin/practice_reading',
        page: AdminRead,
    },
    {
        path: '/admin/practice_reading/add',
        page: AdminAddRead,
    },
    {
        path: '/admin/practice_reading/edit/:id',
        page: AdminEditRead,
    },
    {
        path: '/admin/practice_writing',
        page: AdminWrite,
    },
    {
        path: '/admin/practice_writing/add',
        page: AdminAddWrite,
    },
    {
        path: '/admin/practice_writing/edit/:id',
        page: AdminEditWrite,
    },
    {
        path: '/admin/practice_speaking',
        page: AdminSpeak,
    },
    {
        path: '/admin/practice_speaking/add',
        page: AdminAddSpeak,
    },
    {
        path: '/admin/practice_speaking/edit/:id',
        page: AdminEditSpeak,
    },
    {
        path: '/teacher/dashboard',
        page: TeacherDashBoard,
    },
    {
        path: '/teacher/manage_student',
        page: TeacherStudent,
    },
    {
        path: '/teacher/manage_class',
        page: TeacherClass,
    },
    {
        path: '/teacher/manage_class/edit/:id',
        page: TeacherEditClass,
    },
    {
        path: '/teacher/manage_record',
        page: TeacherRecord,
    },
    {
        path: '/teacher/manage_record/edit/:id',
        page: TeacherEditRecord,
    },
]