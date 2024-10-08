const sendAzkar = require('@root/src/utils/functions/sendAzkar');
const ControlData = require('@utils/functions/ControlData');
const joinAndPlayQuran = require('@utils/functions/joinAndPlayQuran');
const chalk = require('chalk');
const { ActivityType, Guild, } = require('discord.js');
const gr = chalk.hex('#00D100');
const un = chalk.underline;

module.exports = {
  name: 'ready',
  /**
   * @param {import("@base/baseClient")} client 
   */
  async execute(client) {

    await client.DBConnect();
    await client.registerInteractions();
    const db = await client.db.table("channels");

    const commands = client.slashCommands.map(({ execute, ...data }) => data);
    setTimeout(() => {
      console.log(gr(`Logged In As ` + un(`${client.user.username}`)));
      console.log(chalk.cyan(`Servers:` + un(`${client.guilds.cache.size}`)), chalk.red(`Users:` + un(`${client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString()}`)), chalk.blue(`Commands:` + un(` ${client.commands.size}` + ` TOTAL Commands ${client.commands.size + commands.length}`)));
    }, 3000);
    client.user.setStatus("idle")
    client.user.setActivity({ name: `Loading....`, type: ActivityType.Playing })
    setTimeout(() => client.user.setStatus("online"), 40000);
    setInterval(() => {
      let ServersStatus = client.Radio.size
      client.user.setActivity({ name: `in ${ServersStatus}/${client.channels.cache.size} Channels`, type: ActivityType.Listening })
    }, 1 * 1000 * 60);

    let RadioChannels = await db.values() || [];
    if (RadioChannels.length === 0) return

    setTimeout(async () => {
      const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
      // if (process.env.testMode) return console.log("stop run radio is test mode".red);
      for (let data of RadioChannels) {

        let guild = await client.guilds.fetch(data.guildId).catch(() => null)
        if (!guild?.id) continue

        if (data.enabled) {
          // to run azkar
          if (data.msgTimeSend) {
            await sendAzkar(client, guild, data)

          } else {
            // To run Radio 

            await sleep(500)
            /**@type {Guild} */
            let conn = await joinAndPlayQuran(client, data.channelId, guild, data.url)
            if (conn === null) {
              console.log("no channel in server  " + guild.name + " " + guild.id);
              continue
            }
            if (conn === "cantConnect") continue
            client.Radio.set(data.guildId, conn)
            // await db.set(`${data.guildId}_radioChannel..enabled`, true)
            // if (guild.id !== "1171512753802969098") continue
            let data1 = await db.get(`${data.guildId}_radioChannel`)
            let msg = await guild.channels.cache.get(data1.ch)?.messages.fetch(data1.msgId).catch(err => null)
            if (!msg?.id) {

              // await db.set(`${data.guildId}_radioChannel..enabled`, false)
              console.log("cant find msg in server  " + guild.name.yellow + " " + guild.id.red);
            }
            if (msg?.id) msg?.edit(ControlData(client, data1)).catch(err => console.log(err))
          }
        }

      }
    }, 1000);


  },
};
