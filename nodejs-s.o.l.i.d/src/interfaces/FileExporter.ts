import { WriteStream } from "fs"
import { User } from "../models/User"

interface FileExporter {
    exportFile(data: User[]): Promise<void | WriteStream>
}

export default FileExporter