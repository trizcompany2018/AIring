import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Body from './Summary/Body.js'
import Login from './LogIn/Login.js';
import MainBody from './MainBody/MainBody.js';
import ScriptPage from './ScriptPage/ScriptPage.js';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 관리

  return (
    <Router>
      <Routes>
        {/* 기본 경로는 Login */}
        <Route path="/" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

        {/* 로그인했을 경우만 MainBody 접근 가능 */}
        <Route
          path="/main"
          element={
            isLoggedIn ? <MainBody onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/result"
          element={
            isLoggedIn ? <ScriptPage onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" replace />
          }
        />
                <Route
          path="/summary"
          element={
            isLoggedIn ? <Body onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/" replace />
          }
        />
      </Routes>
    </Router>


  );
}

export default App;