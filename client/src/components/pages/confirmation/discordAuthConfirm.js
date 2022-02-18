import React from 'react';
import DiscordConfirmationCallbackHelper from "../../helpers/confirmation/discordAuthConfirm.js";

const DiscordConfirmationCallbackPage = (props) => {
  return (
    <div>
        <DiscordConfirmationCallbackHelper props={props} />
    </div>
  );
};

export default DiscordConfirmationCallbackPage;