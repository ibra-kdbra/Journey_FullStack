import { Model, DataTypes } from 'sequelize';
import sequelize from '../helpers/db';
import { hashPassword } from '../services';
import UserAttributes from '../interfaces/types/UserAttributes';
import Order from './Order';

export class User extends Model<UserAttributes> implements UserAttributes {

    setPassword(password: string) {
        this.password = password;
    }

    declare id: number;
    declare name: string;
    declare email: string;
    declare password: string;
    declare Orders: Order[]
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(128),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
    },
    {
        tableName: 'users',
        sequelize,
        timestamps: false
    }
);


User.hasMany(Order)
Order.belongsTo(User, {constraints: true, onDelete:'CASCADE'})

User.beforeUpdate((user: User) => {
    if (user.changed('password')) {
        user.setPassword(hashPassword(user.password))
    }
});

User.beforeCreate((user: User) => {
    user.setPassword(hashPassword(user.password))
});
