import { randomUUID } from "node:crypto";
import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity("carsImage")
class CarImage {
    @PrimaryColumn()
    id: string;
    @Column()
    carId: string;
    @Column()
    imageName: string;
    @CreateDateColumn()
    created_at: Date;

    constructor() {
        if (!this.id) {
            this.id = randomUUID();
        }
    }
}

export { CarImage };
