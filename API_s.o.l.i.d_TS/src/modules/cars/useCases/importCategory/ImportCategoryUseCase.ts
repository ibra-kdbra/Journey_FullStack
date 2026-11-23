import { parse } from "csv-parse";
import fs from "fs";
import { inject, injectable } from "tsyringe";

import { CategoryRepository } from "../../infra/typeorm/repositories/CategoryRepository";
import { ICategoryRepository } from "../../repositories/ICategoriesRepository";

interface IImportCategory {
    name: string;
    description: string;
}
@injectable()
class ImportCategoryUseCase {
    constructor(
        @inject(CategoryRepository)
        private categoriesRepository: ICategoryRepository,
    ) {}

    loadCategories(file: Express.Multer.File): Promise<IImportCategory[]> {
        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(file.path);
            const categories: IImportCategory[] = [];

            const parseFile = parse();

            stream.pipe(parseFile);

            parseFile
                .on("data", async (line) => {
                    const [name, description] = line;
                    categories.push({ name, description });
                })
                .on("end", () => {
                    // Wait for the upload to be removed before resolving: an
                    // un-awaited unlink rejects later as an unhandled rejection.
                    fs.promises.unlink(file.path).then(() => resolve(categories), reject);
                })
                .on("error", (err) => {
                    fs.promises.unlink(file.path).catch(() => undefined);
                    reject(err);
                });
        });
    }

    async execute(file: Express.Multer.File): Promise<void> {
        const categories = await this.loadCategories(file);
        for (const { name, description } of categories) {
            const existCategory = await this.categoriesRepository.findByName(name);
            if (!existCategory) {
                await this.categoriesRepository.create({ name, description });
            }
        }
    }
}

export { ImportCategoryUseCase };
