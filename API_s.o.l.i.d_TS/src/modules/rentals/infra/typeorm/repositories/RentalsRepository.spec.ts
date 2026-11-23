import "reflect-metadata";
import { randomUUID } from "node:crypto";

import { AppDataSource } from "../../../../../shared/infra/typeorm";
import { UserRepository } from "../../../../accounts/infra/typeorm/repositories/UserRepository";
import { Category } from "../../../../cars/infra/typeorm/entities/Category";
import { CarsRepository } from "../../../../cars/infra/typeorm/repositories/CarsRepository";
import { Rental } from "../entities/Rental";
import { RentalsRepository } from "./RentalsRepository";

/**
 * Integration test against the migrated schema: creating a rental must work
 * without endDate/total, and only open rentals (endDate IS NULL) may block a
 * car or a user.
 */
describe("RentalsRepository (integration)", () => {
    let rentals: RentalsRepository;
    let carId: string;
    let userId: string;
    let categoryId: string;

    beforeAll(async () => {
        await AppDataSource.initialize();
        await AppDataSource.runMigrations();

        const category = await AppDataSource.getRepository(Category).save(
            AppDataSource.getRepository(Category).create({
                name: `rentals-spec-${randomUUID()}`,
                description: "rentals spec",
            }),
        );
        categoryId = category.id as string;

        const suffix = randomUUID();
        const car = await new CarsRepository().create({
            name: "Rental spec car",
            description: "d",
            daily_Rate: 100,
            license_plate: suffix.slice(0, 7),
            fine_amount: 10,
            brand: "b",
            categoryId,
        });
        carId = car.id;

        const users = new UserRepository();
        await users.create({
            name: "Rental spec user",
            password: "x",
            email: `${suffix}@rentals.spec`,
            driver_license: "1234",
        });
        const user = await users.findByEmail(`${suffix}@rentals.spec`);
        userId = (user as NonNullable<typeof user>).id;

        rentals = new RentalsRepository();
    });

    afterAll(async () => {
        await AppDataSource.query(`DELETE FROM rentals WHERE "carId" = $1`, [carId]);
        await AppDataSource.query(`DELETE FROM cars WHERE id = $1`, [carId]);
        await AppDataSource.query(`DELETE FROM users WHERE id = $1`, [userId]);
        await AppDataSource.query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
        await AppDataSource.destroy();
    });

    it("creates a rental and treats it as open", async () => {
        const rental = await rentals.create({
            carId,
            userId,
            expectedReturnDate: new Date(Date.now() + 3 * 24 * 3600 * 1000),
        });

        expect(rental.startDate).toBeInstanceOf(Date);
        expect((await rentals.findOpenRentalByCar(carId))?.id).toBe(rental.id);
        expect((await rentals.findOpenRentalByUser(userId))?.id).toBe(rental.id);
    });

    it("does not treat a returned rental as open", async () => {
        await AppDataSource.getRepository(Rental).update({ carId }, { endDate: new Date() });

        expect(await rentals.findOpenRentalByCar(carId)).toBeNull();
        expect(await rentals.findOpenRentalByUser(userId)).toBeNull();
    });
});
