import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import { getJwtSecret } from "../../../../config/auth";
import { AppError } from "../../../../shared/errors/AppError";
import { IUserRepository } from "../../repositories/IUserRepository";

interface IResponse {
    user: {
        name: string;
        email: string;
    };
    token: string;
}

interface IRequest {
    email: string;
    password: string;
}
@injectable()
class AuthenticateUserUseCase {
    constructor(@inject("UserRepository") private userRepository: IUserRepository) {}

    async execute({ email, password }: IRequest): Promise<IResponse> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new AppError("Email Or Password incorrect");
        }
        const passwordMatch = await compare(password, user.password);
        if (!passwordMatch) {
            throw new AppError("Email Or Password incorrect");
        }
        const token = sign({}, getJwtSecret(), {
            subject: user.id,
            expiresIn: "1d",
        });
        const tokenReturn: IResponse = {
            token,
            user: {
                name: user.name,
                email: user.email,
            },
        };

        return tokenReturn;
    }
}
export { AuthenticateUserUseCase };
