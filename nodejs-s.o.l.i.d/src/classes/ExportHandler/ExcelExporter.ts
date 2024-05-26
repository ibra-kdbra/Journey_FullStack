import FileExporter from "../../interfaces/FileExporter";
import { Workbook } from 'exceljs';
import { User } from "../../models/User";
import path from "path";

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

        const filePath = path.join(__dirname, '../../public/excel/export.xlsx');

        workbook.xlsx.writeFile(filePath);
    }
}