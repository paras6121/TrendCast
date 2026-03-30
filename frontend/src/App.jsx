import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import AppPage from "./components/AppPage";

export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleToken = params.get("token");
    const googleName = params.get("name");
    const googleEmail = params.get("email");
    const googleAvatar = params.get("avatar");
    if (googleToken) {
      const userData = { name: googleName, email: googleEmail, avatar: googleAvatar };
      localStorage.setItem("tc_token", googleToken);
      localStorage.setItem("tc_user", JSON.stringify(userData));
      setToken(googleToken); setUser(userData);
      window.history.replaceState({}, '', '/');
      setAuthChecked(true);
      setPage("app");
      return;
    }
    const savedToken = localStorage.getItem("tc_token");
    const savedUser = localStorage.getItem("tc_user");
    if (savedToken && savedUser) { setToken(savedToken); setUser(JSON.parse(savedUser)); }
    setAuthChecked(true);
  }, []);

  function handleLogin(userData, userToken) {
    setUser(userData); setToken(userToken); setPage("app");
  }

  function handleLogout() {
    localStorage.removeItem("tc_token");
    localStorage.removeItem("tc_user");
    setUser(null); setToken(null); setPage("landing");
  }

  if (!authChecked) return null;

  if (page === "app") {
    return <AppPage user={user} token={token} onLogout={handleLogout} onLogin={handleLogin} onGoHome={() => setPage("landing")} />;
  }

  return <LandingPage onLogin={handleLogin} user={user} onLaunchApp={() => setPage("app")} />;
}