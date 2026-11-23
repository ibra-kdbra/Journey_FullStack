import fs from "fs";
import os from "os";
import path from "path";

import { CategoryRepositoryInMemory } from "../../repositories/in-memory/CategoryRepositoryInMemory";
import { ImportCategoryUseCase } from "./ImportCategoryUseCase";

let categoryRepositoryInMemory: CategoryRepositoryInMemory;
let importCategoryUseCase: ImportCategoryUseCase;
let tmpDir: string;

function csvFile(content: string) {
    const filePath = path.join(tmpDir, "categories.csv");
    fs.writeFileSync(filePath, content);
    return { path: filePath } as Express.Multer.File;
}

describe("Import Category", () => {
    beforeEach(() => {
        categoryRepositoryInMemory = new CategoryRepositoryInMemory();
        importCategoryUseCase = new ImportCategoryUseCase(categoryRepositoryInMemory);
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "import-category-"));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it("creates the categories missing from the CSV", async () => {
        await importCategoryUseCase.execute(csvFile("SUV,Sport utility\nSedan,Four doors\n"));

        expect(categoryRepositoryInMemory.categories.map((c) => c.name)).toEqual(["SUV", "Sedan"]);
    });

    it("does not duplicate categories that already exist", async () => {
        await categoryRepositoryInMemory.create({ name: "SUV", description: "existing" });

        await importCategoryUseCase.execute(csvFile("SUV,Sport utility\nSedan,Four doors\n"));

        expect(categoryRepositoryInMemory.categories).toHaveLength(2);
        expect(categoryRepositoryInMemory.categories[0].description).toBe("existing");
    });

    it("removes the uploaded file before resolving", async () => {
        const file = csvFile("SUV,Sport utility\n");

        await importCategoryUseCase.execute(file);

        expect(fs.existsSync(file.path)).toBe(false);
    });

    it("reports a failed cleanup instead of leaving an unhandled rejection", async () => {
        const unlink = jest
            .spyOn(fs.promises, "unlink")
            .mockRejectedValueOnce(new Error("unlink failed"));

        await expect(importCategoryUseCase.execute(csvFile("SUV,Sport utility\n"))).rejects.toThrow(
            "unlink failed",
        );
        expect(categoryRepositoryInMemory.categories).toHaveLength(0);
        unlink.mockRestore();
    });

    it("propagates repository errors", async () => {
        jest.spyOn(categoryRepositoryInMemory, "create").mockRejectedValueOnce(
            new Error("db down"),
        );

        await expect(importCategoryUseCase.execute(csvFile("SUV,Sport utility\n"))).rejects.toThrow(
            "db down",
        );
    });
});
