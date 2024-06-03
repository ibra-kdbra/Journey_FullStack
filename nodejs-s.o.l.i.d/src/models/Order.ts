import { DataTypes, Model } from "sequelize";
import sequelize from '../helpers/db';
import OrderAttributes from "../interfaces/types/OrderAttributes";
import { User } from "./User";

class Order extends Model<OrderAttributes> implements OrderAttributes {
    declare id: number;
    declare userId: number;
    declare product: string;
    declare quantity: number;
    declare price: number;
    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;
}

Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        product: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: 'Order',
        tableName: 'orders',
    }
);


export default Order

