import { Router } from "express";
import multer from "multer";

import { CreateCategoryController } from "../../../../modules/cars/useCases/createCategory/CreateCategoryController";
import { ImportCategoryController } from "../../../../modules/cars/useCases/importCategory/ImportCategoryController";
import { ListCategoriesController } from "../../../../modules/cars/useCases/listCategories/ListCategoriesController";
import { ensureAdmin } from "../middlewares/ensureAdmin";
import { ensureAuthenticated } from "../middlewares/ensureAuthenticated";

const categoriesRoutes = Router();

// Only authenticated admins reach multer (see the route below); the limits
// bound what they can write to disk.
const upload = multer({
    dest: "./tmp",
    limits: { fileSize: 1024 * 1024, files: 1 },
    fileFilter: (req, file, callback) => {
        const isCsv =
            file.mimetype === "text/csv" ||
            (file.mimetype === "application/vnd.ms-excel" &&
                file.originalname.toLowerCase().endsWith(".csv"));
        callback(null, isCsv);
    },
});
const listCategoriesController = new ListCategoriesController();
const importCategoryController = new ImportCategoryController();
const createCategoryController = new CreateCategoryController();

categoriesRoutes.post("/", ensureAuthenticated, ensureAdmin, createCategoryController.handle);

categoriesRoutes.get("/", listCategoriesController.handle);

categoriesRoutes.post(
    "/import",
    ensureAuthenticated,
    ensureAdmin,
    upload.single("file"),
    importCategoryController.handle,
);

export { categoriesRoutes };
