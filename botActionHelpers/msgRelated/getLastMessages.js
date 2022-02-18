const { MessageEmbed } = require("discord.js");


const getLastMsgs = async (msg) => {
    // fetching the last 10 messages
    const msgs = await msg.channel.messages.fetch({ limit: 10 });

    const embeds = [];
  
    msgs.map((msg, index) => {
        console.log("msg", msg);

        const embed = new MessageEmbed().setColor('#0CE0B6').setTitle(`Message ${index + 1}`).setDescription(`${msg}`).setFooter('Thanks for interacting with our custom discord chat bot!');

        embeds.push(embed);
    });
    return embeds;
};

module.exports = {
    getLastMsgs
};