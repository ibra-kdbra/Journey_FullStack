import { randomUUID } from "node:crypto";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryColumn,
} from "typeorm";

import { Category } from "./Category";
import { Specification } from "./Specification";

@Entity("cars")
class Car {
    @PrimaryColumn()
    id: string;
    @Column()
    name: string;
    @Column()
    description: string;
    @Column()
    daily_Rate: number;
    @Column()
    available: boolean;
    @Column()
    license_plate: string;
    @Column()
    fine_amount: number;
    @Column()
    brand: string;
    @ManyToOne(() => Category)
    @JoinColumn({ name: "categoryId" })
    category: Category;
    @ManyToMany(() => Specification)
    @JoinTable({
        name: "specificationsCars",
        joinColumns: [{ name: "carId" }],
        inverseJoinColumns: [{ name: "specificationId" }],
    })
    specifications: Specification[];

    @Column()
    categoryId: string;
    @CreateDateColumn()
    created_at: Date;

    constructor() {
        if (!this.id) {
            this.id = randomUUID();
            this.available = true;
        }
    }
}
export { Car };
