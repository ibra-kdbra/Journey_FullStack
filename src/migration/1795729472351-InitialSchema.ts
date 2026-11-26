import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1795729472351 implements MigrationInterface {
    name = 'InitialSchema1795729472351'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`clients\` (\`id\` int NOT NULL AUTO_INCREMENT, \`contactName\` varchar(255) NOT NULL, \`address\` varchar(255) NOT NULL, \`phoneNumber\` varchar(255) NOT NULL, \`description\` text NULL, \`userId\` varchar(255) NOT NULL, \`inactiveAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`orders\` (\`id\` int NOT NULL AUTO_INCREMENT, \`status\` enum ('DRAFT', 'PROCESSING', 'CANCELLED', 'DELIVERED', 'RETURNED', 'COMPLETED') NOT NULL DEFAULT 'DRAFT', \`paymentType\` enum ('CASH', 'E_TRANSFER', 'CHEQUE', 'CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL', 'GOOGLE_PAY', 'APPLE_PAY', 'ALIPAY') NOT NULL DEFAULT 'E_TRANSFER', \`expectedDeliveryDate\` datetime NOT NULL, \`expectedPickupDate\` datetime NOT NULL, \`note\` text NULL, \`userId\` text NOT NULL, \`completedAt\` datetime NULL, \`inactiveAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`clientId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`order_product\` (\`id\` varchar(36) NOT NULL, \`productName\` varchar(255) NOT NULL, \`status\` varchar(255) NOT NULL, \`quantity\` int NOT NULL, \`price\` int NOT NULL, \`total\` int NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`orderId\` int NULL, \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`product_history_logs\` (\`id\` varchar(36) NOT NULL, \`quantity\` int NOT NULL, \`type\` enum ('EXPORTED', 'IMPORTED') NOT NULL DEFAULT 'IMPORTED', \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`productId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`category\` enum ('FISH', 'SHELLFISH', 'CRUSTACEAN', 'MOLLUSK', 'SEAWEED', 'OTHER') NOT NULL, \`unit\` text NULL, \`price\` decimal(10,2) NOT NULL, \`stockQuantity\` int NOT NULL, \`currency\` enum ('CAD', 'USD') NOT NULL DEFAULT 'CAD', \`photoUrl\` text NULL, \`inactiveAt\` datetime NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` varchar(36) NOT NULL, \`phoneNumber\` text NOT NULL, \`nickname\` varchar(255) NULL, \`email\` varchar(255) NULL, \`role\` enum ('ADMIN', 'CUSTOMER', 'RESTAURANT') NOT NULL DEFAULT 'CUSTOMER', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`notification\` (\`id\` varchar(36) NOT NULL, \`type\` varchar(255) NOT NULL, \`startAt\` datetime NOT NULL, \`endAt\` datetime NOT NULL, \`sendAt\` datetime NULL, \`durationDays\` int NOT NULL, \`messageBody\` varchar(255) NOT NULL, \`preferredLanguage\` varchar(255) NOT NULL DEFAULT 'ZH', \`countryCode\` varchar(255) NOT NULL DEFAULT 'HK', \`phoneNumber\` varchar(255) NOT NULL, \`referenceId\` varchar(255) NULL, \`createdFrom\` varchar(255) NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reports\` (\`id\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` varchar(255) NOT NULL, \`mediaUrl\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`orders\` ADD CONSTRAINT \`FK_1457f286d91f271313fded23e53\` FOREIGN KEY (\`clientId\`) REFERENCES \`clients\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_product\` ADD CONSTRAINT \`FK_3fb066240db56c9558a91139431\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`order_product\` ADD CONSTRAINT \`FK_073c85ed133e05241040bd70f02\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`product_history_logs\` ADD CONSTRAINT \`FK_70d932bb7377319f1b8e167550d\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`product_history_logs\` DROP FOREIGN KEY \`FK_70d932bb7377319f1b8e167550d\``);
        await queryRunner.query(`ALTER TABLE \`order_product\` DROP FOREIGN KEY \`FK_073c85ed133e05241040bd70f02\``);
        await queryRunner.query(`ALTER TABLE \`order_product\` DROP FOREIGN KEY \`FK_3fb066240db56c9558a91139431\``);
        await queryRunner.query(`ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_1457f286d91f271313fded23e53\``);
        await queryRunner.query(`DROP TABLE \`reports\``);
        await queryRunner.query(`DROP TABLE \`notification\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_history_logs\``);
        await queryRunner.query(`DROP TABLE \`order_product\``);
        await queryRunner.query(`DROP TABLE \`orders\``);
        await queryRunner.query(`DROP TABLE \`clients\``);
    }

}
