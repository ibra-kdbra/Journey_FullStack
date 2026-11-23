import FileExporter from "../../interfaces/FileExporter";
import { Workbook } from 'exceljs';
import { User } from "../../models/User";
import path from "path";
import fs from "fs";

export default class ExcelExporter implements FileExporter {

    async exportFile(data: User[]) {
        const workbook = new Workbook();

        // Create a worksheet
        const worksheet = workbook.addWorksheet('Sheet 1');

        // Define the column headers
        worksheet.addRow(['Name', 'Email']);

        // Add data rows
        data.forEach((row) => {
            worksheet.addRow([row.name, row.email]);
        });

        // public/ lives at the project root, not next to the compiled sources
        const folderPath = path.join(process.cwd(), 'public/excel');
        await fs.promises.mkdir(folderPath, { recursive: true });
        const filePath = path.join(folderPath, 'export.xlsx');

        await workbook.xlsx.writeFile(filePath);
    }
}