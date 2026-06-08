const chalk = require("chalk");
const moment = require("moment");

const BANNER = `
${chalk.cyan(`  ██████╗██╗   ██╗██████╗  ██████╗ ██████╗ ██╗  ██╗`)}
${chalk.cyan(` ██╔════╝╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔══██╗██║ ██╔╝`)}
${chalk.cyan(` ██║      ╚████╔╝ ██████╔╝██║   ██║██████╔╝█████╔╝ `)}
${chalk.cyan(` ██║       ╚██╔╝  ██╔══██╗██║   ██║██╔══██╗██╔═██╗ `)}
${chalk.cyan(` ╚██████╗   ██║   ██████╔╝╚██████╔╝██║  ██║██║  ██╗`)}
${chalk.cyan(`  ╚═════╝   ╚═╝   ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝`)}
${chalk.gray(`  ─────────────────────────────────────────────────────`)}
${chalk.white(`  Multi-Purpose Discord Bot`)}  ${chalk.gray(`·`)}  ${chalk.white(`v3.0.0`)}  ${chalk.gray(`·`)}  ${chalk.cyan(`discord.gg/cybork`)}
${chalk.gray(`  ─────────────────────────────────────────────────────`)}
`;

const LEVELS = {
  log:   { label: "INFO",  color: chalk.bgCyan.black    },
  warn:  { label: "WARN",  color: chalk.bgYellow.black  },
  error: { label: "ERROR", color: chalk.bgRed.black     },
  debug: { label: "DEBUG", color: chalk.bgGreen.black   },
  cmd:   { label: "CMD",   color: chalk.bgWhite.black   },
  event: { label: "EVENT", color: chalk.bgWhite.black   },
  ready: { label: "READY", color: chalk.bgCyan.black    },
};

module.exports = class Logger {
  static banner() {
    console.log(BANNER);
  }

  static log(content, type = "log") {
    const level = LEVELS[type];
    if (!level) throw new TypeError(`Logger type must be one of: ${Object.keys(LEVELS).join(", ")}`);
    const timestamp = chalk.gray(moment().format("DD/MM/YY HH:mm:ss"));
    const tag       = level.color(` ${level.label} `);
    console.log(`  ${timestamp}  ${tag}  ${content}`);
  }
};
