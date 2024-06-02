export default interface OrderAttributes {
    id: number;
    userId: number;
    product: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
}