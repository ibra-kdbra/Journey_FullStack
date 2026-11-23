import path from "path";
import FileExporter from "../../interfaces/FileExporter";
import { User } from "../../models/User";
import { newExportPath } from "../../helpers/exportPath";
import pdfmake = require("pdfmake");

export default class PdfExporter implements FileExporter {
    readonly extension = 'pdf';
   
    async exportFile(data: User[]) {

        // public/ lives at the project root, not next to the compiled sources
        const folderPath = path.join(process.cwd(), 'public');
        const filePath = await newExportPath(this.extension);

        var fonts = {
            Roboto: {
                normal: folderPath + '/fonts/Roboto-Regular.ttf',
                bold: folderPath + '/fonts/Roboto-Medium.ttf',
                italics: folderPath + '/fonts/Roboto-Italic.ttf',
                bolditalics: folderPath + '/fonts/Roboto-MediumItalic.ttf'
            }
        };

        // pdfmake 0.3 no longer ships pdfmake/src/printer; use the server-side API
        pdfmake.setFonts(fonts);

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

        const pdfDoc = pdfmake.createPdf(docDefinition);
        await pdfDoc.write(filePath);
        return filePath;
    }
}