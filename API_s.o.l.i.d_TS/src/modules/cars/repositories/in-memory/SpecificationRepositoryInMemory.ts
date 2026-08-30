import { Specification } from "../../infra/typeorm/entities/Specification";
import { ICreateSpecificationDTO, ISpecificationsRepository } from "../ISpecificationsRepository";

class SpecificationsRepositoryInMemory implements ISpecificationsRepository {
    specifications: Specification[] = [];

    async create({ description, name }: ICreateSpecificationDTO): Promise<Specification> {
        const specification = new Specification();

        Object.assign(specification, {
            description,
            name,
        });

        this.specifications.push(specification);
        return specification;
    }

    async findByName(name: string): Promise<Specification | null> {
        return this.specifications.find((specification) => specification.name === name) ?? null;
    }
    async findByIds(ids: string[]): Promise<Specification[]> {
        // Specification.id is optional on the entity, so guard before matching.
        const allSpecifications = this.specifications.filter(
            (specification) => specification.id !== undefined && ids.includes(specification.id),
        );

        return allSpecifications;
    }
}

export { SpecificationsRepositoryInMemory };
