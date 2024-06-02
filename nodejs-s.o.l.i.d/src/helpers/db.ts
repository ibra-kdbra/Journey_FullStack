import { Sequelize } from "sequelize-typescript";
import config from "./EnvConfig";

const { username, password, database, host } = config

const sequelize = new Sequelize({
    username,
    password,
    database,
    host,
    logging: false,
    dialect: "mysql",
});

export default sequelize