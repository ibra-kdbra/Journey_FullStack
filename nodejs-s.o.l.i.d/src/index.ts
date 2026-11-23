import sequelize from "./helpers/db";
import app from "./app";

(async () => {
    try {
        await sequelize.sync()
        console.log('Connection has been established successfully.');

        app.listen(3000, () => {
            console.log("Server started on port 3000");
        });
    } catch (error) {
        console.error(error);
    }
})()
