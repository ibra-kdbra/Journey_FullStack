import { User } from "../models/User"

interface FileExporter {
    /** Writes the export and resolves with the path of the generated file. */
    exportFile(data: User[]): Promise<string>
    /** File extension without the dot, used for the download name. */
    readonly extension: string
}

export default FileExporter
