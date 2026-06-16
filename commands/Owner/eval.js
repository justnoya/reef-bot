const { EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require("discord.js");
const { post } = require("node-superfetch");

module.exports = {
  name: "eval",
  description: "Evaluates the given code",
  aliases: ["ev"],
  owner: true,

  run: async (client, message, args) => {
    const color = '#FFFFFF';

    const nembed = new EmbedBuilder()
      .setColor('#FFFFFF')
      .setDescription("<:11:1052589045374533653> Only bot owners can run this command.")
      .setFooter({ text: message.author.tag });

    if (!client.config.owner.includes(message.author.id))
      return message.channel.send({ embeds: [nembed] });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setEmoji("993492852023762965")
        .setCustomId("DELETE_BUT")
        .setStyle(4)
    );

    const code = args.join(" ");
    if (!code) return message.channel.send({ content: "```js\nundefined```", components: [row] });

    let output = "";

    try {
      let evaled = await eval(code);
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled, { depth: 0 });

      // Sanitize: escape backticks, zero-width space after @, redact token
      evaled = clean(evaled, client.token);

      if (evaled.length > 1800) {
        try {
          const { body } = await post("https://hastebin.com/documents").send(evaled);
          output = `https://hastebin.com/${body.key}.js`;
        } catch {
          output = "```js\n[Output too long and hastebin failed]```";
        }
      } else {
        output = "```js\n" + evaled + "```";
      }
    } catch (error) {
      const err = clean(String(error), client.token);
      output = "```js\n" + err + "```";
    }

    return message.channel.send({ content: output, components: [row] });
  },
};

function clean(string, token) {
  if (typeof string !== "string") return String(string);
  return string
    .replace(/`/g, "`\u200b")
    .replace(/@/g, "@\u200b")
    .replace(token ?? "", "[REDACTED]");
}
