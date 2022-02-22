import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ConnectToDiscordPage from "./components/pages/auth/connectDiscordAccount.js";
import DiscordConfirmationCallbackPage from "./components/pages/confirmation/discordAuthConfirm.js";
import "./mainStyles.css";
import './App.css';
import { NotificationContainer } from 'react-notifications';

function App() {
  return (
    <div className="App">
    <NotificationContainer/>
      <Router>
        <Routes>
          <Route exact path="/" element={<ConnectToDiscordPage />} />
          <Route exact path="/callback/discord/:token" element={<DiscordConfirmationCallbackPage />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
