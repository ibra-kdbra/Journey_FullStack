import FileExporter from "../interfaces/FileExporter"
import { User } from "../models/User";

async function exportData(exportType: FileExporter, data: Array<User>) {
    await exportType.exportFile(data);
}

export default exportData;
