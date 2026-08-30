import { Repository } from "typeorm";

import { AppDataSource } from "../../../../../shared/infra/typeorm";
import { ICreateUserDTO } from "../../../dtos/ICreateUserDTO";
import { IUserRepository } from "../../../repositories/IUserRepository";
import { User } from "../entities/User";

class UserRepository implements IUserRepository {
    private repository: Repository<User>;

    constructor() {
        this.repository = AppDataSource.getRepository(User);
    }

    async create({
        name,
        password,
        email,
        driver_license,
        id,
        avatar,
    }: ICreateUserDTO): Promise<void> {
        const user = this.repository.create({
            name,
            password,
            email,
            driver_license,
            id,
            avatar,
        });
        await this.repository.save(user);
    }
    async findByEmail(email: string): Promise<User | null> {
        const user = await this.repository.findOneBy({ email });
        return user;
    }
    async findById(id: string): Promise<User | null> {
        const user = await this.repository.findOneBy({ id });
        return user;
    }
}

export { UserRepository };
