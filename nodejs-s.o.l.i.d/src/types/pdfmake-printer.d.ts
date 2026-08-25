/**
 * `@types/pdfmake` only describes pdfmake's *browser* entry point (`createPdf`).
 * The server-side printer lives at `pdfmake/src/printer` and ships no types, so
 * we declare the slice of it this project actually uses.
 */
declare module "pdfmake/src/printer" {
    import type { TDocumentDefinitions, TFontDictionary } from "pdfmake/interfaces";
    import type { Readable } from "stream";

    interface PDFKitDocument extends Readable {
        end(): void;
    }

    class PdfPrinter {
        constructor(fonts: TFontDictionary);
        createPdfKitDocument(
            docDefinition: TDocumentDefinitions,
            options?: Record<string, unknown>,
        ): PDFKitDocument;
    }

    export = PdfPrinter;
}
