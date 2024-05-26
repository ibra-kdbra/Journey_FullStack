import path from "path";
import FileExporter from "../../interfaces/FileExporter";
import { User } from "../../models/User";
import fs from "fs";
import PdfPrinter from "pdfmake";

export default class PdfExporter implements FileExporter {
   
    async exportFile(data: User[]) {

        const folderPath = path.join(__dirname, '../../public');
        const filePath = path.join(folderPath, '/pdf/export.pdf');

        var fonts = {
            Roboto: {
                normal: folderPath + '/fonts/Roboto-Regular.ttf',
                bold: folderPath + '/fonts/Roboto-Medium.ttf',
                italics: folderPath + '/fonts/Roboto-Italic.ttf',
                bolditalics: folderPath + '/fonts/Roboto-MediumItalic.ttf'
            }
        };

        var printer = new PdfPrinter(fonts)

        var docDefinition = {
            content: [
                { text: 'Users Report', style: 'header' },

                { text: 'A pdf generated report of users data', style: 'subheader' },

                {
                    style: 'tableExample',
                    table: {
                        widths: [100, '*', 100, '*'],
                        body: [
                            ['Name', 'Email'],
                            ...data.map((row) => [row.name, row.email]),
                        ]
                    }
                },
            ],
            styles: {
                header: {
                    bold: true,
                    fontSize: 18,
                }, subheader: {
                    fontSize: 16,
                    bold: true,
                    margin: 5
                },
            },
           
        };

        var pdfDoc = printer.createPdfKitDocument(docDefinition);
        pdfDoc.pipe(fs.createWriteStream(filePath));
        pdfDoc.end();
    }
}