import React from 'react';
import axios from "axios";
import { Button } from "reactstrap";


const REACT_APP_BASE_SERVER_URL = "http://localhost:50451";

const ConnectToDiscordHelper = () => {
    return (
        <div>
            <div className="container">
                <div className="top" />
                <div className="bottom" />
                <div className="center">
                    <h2 className='text-center-align'>Please Sign-In To Your Discord Account</h2>
                    {/* <input type="email" placeholder="email" />
                    <input type="password" placeholder="password" /> */}
                    <a href={`${REACT_APP_BASE_SERVER_URL}/api/discord/login`} color={"info"} className={"btn-info btn-custom"}>Connect Your Discord Account</a>
                <h2>&nbsp;</h2>
                </div>
            </div>
        </div>
    );
};

export default ConnectToDiscordHelper;
