import React, { Fragment } from "react";
import ConnectToDiscordHelper from "../../helpers/auth/connectDiscordAccount.js";



const ConnectToDiscordPage = (props) => {
    return (
        <Fragment>
            <ConnectToDiscordHelper props={props} />
        </Fragment>
    );
}
export default ConnectToDiscordPage;