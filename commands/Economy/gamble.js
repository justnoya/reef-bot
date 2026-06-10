const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("discord.js");
const User = require("../../Models/User.js");

module.exports = {
  name: "gamble",
  description: "Gamble coins with another user",
  category: "economy",
  aliases: ["bet"],
  cooldown: 5,

  run: async (client, message, args, prefix) => {
    const color = message.guild.members.me.displayHexColor !== "#000000"
      ? message.guild.members.me.displayHexColor
      : client.config.embedColor;

    const user = message.mentions.users.first();
    const sender = message.author;
    const money = parseInt(args[1]);

    if (!user) return message.channel.send("You need to mention someone to gamble with!");
    if (!args[1]) return message.channel.send("Enter an amount to bet.");
    if (isNaN(args[1])) return message.channel.send("That's not a valid number.");
    if (money < 1) return message.channel.send("You can't gamble less than 1 coin!");
    if (user.id === sender.id) return message.channel.send("You can't gamble with yourself!");
    if (user.bot) return message.channel.send("You can't gamble with a bot!");

    let sendermoney = (await User.findOne({ userId: sender.id })) || new User({ userId: sender.id });
    let usermoney = (await User.findOne({ userId: user.id })) || new User({ userId: user.id });

    if (money > sendermoney.wallet) return message.channel.send("You don't have enough coins to gamble!");
    if (money > usermoney.wallet) return message.channel.send("The user you're challenging doesn't have enough coins!");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Accept").setStyle(3).setCustomId("gamble_accept"),
      new ButtonBuilder().setLabel("Decline").setStyle(4).setCustomId("gamble_reject")
    );
    const rowDisabled = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel("Accept").setStyle(3).setCustomId("gamble_accept_d").setDisabled(true),
      new ButtonBuilder().setLabel("Decline").setStyle(4).setCustomId("gamble_reject_d").setDisabled(true)
    );

    const msg = await message.channel.send({
      content: `${user}, **${sender.username}** challenged you to a **${money}** coin gamble!`,
      components: [row],
    });

    const filter = async (inter) => {
      if (inter.user.id === user.id) return true;
      await inter.reply({ content: `Only **${user.tag}** can respond to this challenge!`, ephemeral: true });
      return false;
    };

    const collector = msg.createMessageComponentCollector({ filter, time: 30_000 });
    let handled = false;

    collector.on("collect", async (i) => {
      if (handled) return;
      handled = true;
      collector.stop();
      await i.deferUpdate();

      if (i.customId === "gamble_reject") {
        return msg.edit({ content: `**${user.tag}** declined the gamble.`, components: [rowDisabled] });
      }

      await msg.edit({ content: "3... 2... 1...", components: [rowDisabled] });

      // Fresh random on every gamble, not a module-level constant
      const senderWins = Math.random() < 0.5;

      sendermoney = (await User.findOne({ userId: sender.id })) || sendermoney;
      usermoney   = (await User.findOne({ userId: user.id }))   || usermoney;

      if (senderWins) {
        sendermoney.wallet += money;
        usermoney.wallet   -= money;
        await sendermoney.save();
        await usermoney.save();
        return setTimeout(() => msg.edit({ content: `🎉 **${sender.username}** won **${money}** ${money === 1 ? "coin" : "coins"}!` }), 1500);
      } else {
        sendermoney.wallet -= money;
        usermoney.wallet   += money;
        await sendermoney.save();
        await usermoney.save();
        return setTimeout(() => msg.edit({ content: `🎉 **${user.username}** won **${money}** ${money === 1 ? "coin" : "coins"}!` }), 1500);
      }
    });

    collector.on("end", () => {
      if (!handled) msg.edit({ content: "Gamble timed out.", components: [rowDisabled] }).catch(() => {});
    });
  },
};
