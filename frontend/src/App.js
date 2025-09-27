import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { routes } from "./routes"
function App() {
  // return (
  //   <div className="App">
  //     <header className="App-header">
  //       <img src={logo} className="App-logo" alt="logo" />
  //       <p>
  //         Edit <code>src/App.js</code> and save to reload.
  //       </p>
  //       <a
  //         className="App-link"
  //         href="https://reactjs.org"
  //         target="_blank"
  //         rel="noopener noreferrer"
  //       >
  //         Learn React
  //       </a>
  //     </header>
  //   </div>
  // );
  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page
            const EmptyWrapper = ({ children }) => <>{children}</>;
            //const Layout = route.isShowHeader || route.isShowFooter ? Default : EmptyWrapper;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Page />
                  // Hoặc dùng Layout:
                  // <Layout
                  //   showHeader={route.isShowHeader ?? true}
                  //   showFooter={route.isShowFooter ?? true}
                  // >
                  //   <Page />
                  // </Layout>
                }
              />
            )
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
