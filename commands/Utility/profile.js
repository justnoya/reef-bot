const { Container, TextDisplay, Separator, Section, Thumbnail, IS_COMPONENTS_V2 } = require('../../V2components');

module.exports = {
  name: "profile",
  category: "utility",
  description: "Show a user's profile and badges",
  args: false,
  aliases: ["badge", "badges", "achievement", "achievements"],
  usage: ["profile", "profile @user"],
  owner: false,
  run: async (client, message, args) => {
    const accent = '#FFFFFF';

    let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.author;
    if (user.id === client.user.id) user = message.author;

    let voted = false;
    try { voted = await client.topgg?.hasVoted(user.id); } catch (_) {}
    const uprem = await client.db.get(`uprem_${user.id}`);

    const badgeLines = [];
    if (client.config.owner.filter(x => x && x.trim() !== '').includes(user.id))
      badgeLines.push(`<:owner:979635607141756978> **Creator**`);

    try {
      const guildd = await client.guilds.fetch("805734218122264606");
      const sus    = await guildd.members.fetch(user.id);
      if (sus.roles.cache.has("920657484585250827")) badgeLines.push(`<:dev:978563383580295188> **Developer**`);
      if (sus.roles.cache.has("920657485298270209")) badgeLines.push(`<:staff:984369673715982378> **Staff**`);
      if (sus.roles.cache.has("920657486409768961")) badgeLines.push(`<:mod:984369659094654996> **Moderator**`);
      if (sus.roles.cache.has("979644017807597568")) badgeLines.push(`<:bug:984369647040204820> **Bug Hunter**`);
      if (sus.roles.cache.has("920657496182521856")) badgeLines.push(`<:early:978563383479636019> **Supporter**`);
      if (sus.roles.cache.has("920657495427538974")) badgeLines.push(`<:friends:984372535862919188> **Close Friend**`);
    } catch (_) {}
    if (uprem || voted) badgeLines.push(`<a:prime:1028203449977933854> **Premium User**`);

    const badges = badgeLines.length ? badgeLines.join('\n') : '`No Badge Available`';

    const container = new Container()
      .setAccentColor(accent)
      .addComponents(
        new Section()
          .addComponents(
            new TextDisplay(`## ${user.username}`),
            new TextDisplay(`<@${user.id}>`)
          )
          .setAccessory(new Thumbnail().setURL(user.displayAvatarURL({ dynamic: true, size: 1024 }))),
        new Separator().setDivider(true).setSpacing('Small'),
        new TextDisplay(`**Achievements & Badges**\n${badges}`)
      );

    message.channel.send({ components: [container.toJSON()], flags: IS_COMPONENTS_V2 });
  }
};
