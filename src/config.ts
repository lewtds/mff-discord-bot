import { config } from "dotenv";

config();

export const CONFIG = {
    DISCORD_TOKEN: getThrow('DISCORD_TOKEN', process.env.DISCORD_TOKEN),
    DISCORD_CLIENT_ID: getThrow('DISCORD_CLIENT_ID', process.env.DISCORD_CLIENT_ID),
    DISCORD_GUILD_ID: getThrow('DISCORD_GUILD_ID', process.env.DISCORD_GUILD_ID),
    DISCORD_CLIENT_SECRET: getThrow('DISCORD_CLIENT_SECRET', process.env.DISCORD_CLIENT_SECRET),
}

function getThrow(name: string, val?: string) {
    if (!val) {
        throw new Error(`${name} is missing`);
    }

    return val;
}
