import { IsNull, Repository } from "typeorm";

import { AppDataSource } from "../../../../../shared/infra/typeorm";
import { ICreateRentalDTO } from "../../../dtos/ICreateRentalDTO";
import { IRentalsRepository } from "../../../repositories/IRentalsRepository";
import { Rental } from "../entities/Rental";

class RentalsRepository implements IRentalsRepository {
    private repository: Repository<Rental>;
    constructor() {
        this.repository = AppDataSource.getRepository(Rental);
    }

    async create({ userId, carId, expectedReturnDate }: ICreateRentalDTO): Promise<Rental> {
        const rental = this.repository.create({
            userId,
            carId,
            expectedReturnDate,
            startDate: new Date(),
        });
        await this.repository.save(rental);

        return rental;
    }
    async findOpenRentalByCar(carId: string): Promise<Rental | null> {
        const openByCar = await this.repository.findOneBy({ carId, endDate: IsNull() });
        return openByCar;
    }
    async findOpenRentalByUser(userId: string): Promise<Rental | null> {
        const openByUser = await this.repository.findOneBy({ userId, endDate: IsNull() });
        return openByUser;
    }
}

export { RentalsRepository };
