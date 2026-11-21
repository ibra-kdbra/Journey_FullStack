import { randomUUID } from "node:crypto";
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

import { Car } from "../../../../cars/infra/typeorm/entities/Car";

@Entity("rentals")
class Rental {
    @PrimaryColumn()
    id: string;

    @ManyToOne(() => Car)
    @JoinColumn({ name: "carId" })
    car: Car;
    @Column()
    carId: string;
    @Column()
    userId: string;
    @Column({ type: "timestamp" })
    startDate: Date;
    @Column({ type: "timestamp", nullable: true })
    endDate: Date | null;
    @Column()
    expectedReturnDate: Date;
    @Column({ type: "numeric", nullable: true })
    total: number | null;
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;

    constructor() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }
}
export { Rental };
