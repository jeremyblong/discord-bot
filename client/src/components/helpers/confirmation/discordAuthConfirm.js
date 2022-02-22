import React, { useEffect, useState } from 'react';
import "./styles.css";
import axios from "axios";
import { useParams, useNavigate } from 'react-router-dom'
import { NotificationManager } from "react-notifications";

const REACT_APP_BASE_SERVER_URL = "http://localhost:50451";

const DiscordConfirmationCallbackHelper = (props) => {

    const [ enteredUsername, updateEnteredUsername ] = useState("");
    
    const { token } = useParams();

    const navigate = useNavigate();

    console.log("token!", token);

    const tokenDecoded = decodeURIComponent(token);

    console.log("token!", tokenDecoded);

    useEffect(() => {
        
        if (typeof token !== "undefined" && token !== null) {
            
            console.log("running...");

            const config = {
                params: {
                    token: tokenDecoded
                }
            };

            axios.get(`${REACT_APP_BASE_SERVER_URL}/get/user/info/save`, config).then((res) => {
                if (res.data.message === "Successfully saved user data!") {
                    console.log(res.data);
                    
                    const { result } = res.data;

                    NotificationManager.success("Successfully saved user data to the database properly! Please continue to discord to interact further...", "Successfully registered/saved user!", 4750);
                    
                } else if (res.data.message === "User already exists! Do nothing...") {
                    console.log("err", res.data);

                    NotificationManager.warning("User has ALREADY registered and/or exists already, please continue to discord to interact further...", "Already registered and/or exists!", 4750);
                } else {
                    NotificationManager.error("An unknown error has occurred while attempting to save the related user data...", "Error attempting to register user!", 4750);
                }
            }).catch((err) => {
                console.log(err);
            })
        } 
    }, []);

    const handleUserAdditionAndRedirect = () => {
        console.log("handleUserAdditionAndRedirect...!");

        const channelID = "943199288891162686";

        if (typeof enteredUsername !== "undefined" && enteredUsername.length > 0) {
            axios.post(`${process.env.REACT_APP_BASE_SERVER_URL}/add/new/user/group`, {
                token, 
                channelID,
                username: enteredUsername
            }).then((res) => {
                if (res.data.message === "Successfully added new user to group!") {
                    console.log(res.data);

                    NotificationManager.success("Successfully added user to message-thread and/or the related discord chat!", "Successfully join discord chat!", 4750);
                } else {
                    console.log("err", res.data);
                }
            }).catch((err) => {
                console.log(err);
            })
        } else {
            NotificationManager.warning("You MUST enter a value BEFORE proceeding with this specific action - enter your username & try this action again!", "Enter your username before submitting!", 4750);
        }
    }
    return (
        <div>
            <div className="thankyou-page">
                <div className="_header">
                    <div className="logo">
                        <img src="https://codexcourier.com/images/banner-logo.png" alt="" />
                    </div>
                    <h1>You're now good to go & ready to participate in our discord channel/server!</h1>
                </div>
                <div className="_body">
                    <div className="_box">
                        <h2>
                            <strong>You're now good to go to participate in the discord</strong> related groups/channels & any other related functionality you wish to partcipate in...
                        </h2>
                        <label>Enter your discord username before proceeding...</label>
                        <input type={"text"} onChange={(e) => updateEnteredUsername(e.target.value)} value={enteredUsername} className={"form-control"} />
                        <hr />
                        <p>
                           Thanks for going through the Oauth2 flow and completing any required pre-staged steps in order to register user's for our discord bot/server!
                        </p>
                    </div>
                </div>
                <div className="_footer">
                    <p>Having trouble? <a href="">Contact us</a></p>
                    <a onClick={() => handleUserAdditionAndRedirect()} className='btn-info custom-btn-discord-redirect'>Go to discord channel/server-chat!</a>
                </div>
            </div>
        </div>
    );
};

export default DiscordConfirmationCallbackHelper;