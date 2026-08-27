import { ICreateRentalDTO } from "../dtos/ICreateRentalDTO";
import { Rental } from "../infra/typeorm/entities/Rental";

interface IRentalsRepository {
    create(data: ICreateRentalDTO): Promise<Rental>;
    findOpenRentalByCar(carId: string): Promise<Rental | undefined>;
    findOpenRentalByUser(userId: string): Promise<Rental | undefined>;
}
export { IRentalsRepository };
