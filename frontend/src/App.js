import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Default from "./component/Default/Default";
import { routes } from "./routes"

function App() {
  return (
    <div>
      <Router>
        <Routes>
          {routes.map((route) => {
            const Page = route.page
            const EmptyWrapper = ({ children }) => <>{children}</>;
            const Layout = route.isShowHeader ? Default : EmptyWrapper;
            return (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <Layout
                    showHeader={route.isShowHeader ?? true}                   >
                    <Page />
                  </Layout>
                } />
            )
          })}
        </Routes>
      </Router>
    </div>
  );
}

export default App;