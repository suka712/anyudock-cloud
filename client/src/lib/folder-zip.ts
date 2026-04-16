import { zipSync } from 'fflate'

export interface FileEntry {
  path: string
  file: File
}

function fileEntryToFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

function readEntries(
  reader: FileSystemDirectoryReader,
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject))
}

export async function readDirectoryEntries(
  entry: FileSystemDirectoryEntry,
  basePath = '',
): Promise<FileEntry[]> {
  const entries: FileEntry[] = []
  const reader = entry.createReader()

  let batch: FileSystemEntry[]
  do {
    batch = await readEntries(reader)
    for (const child of batch) {
      if (child.name.startsWith('.')) continue

      const childPath = basePath ? `${basePath}/${child.name}` : child.name

      if (child.isFile) {
        const file = await fileEntryToFile(child as FileSystemFileEntry)
        entries.push({ path: childPath, file })
      } else if (child.isDirectory) {
        const subEntries = await readDirectoryEntries(
          child as FileSystemDirectoryEntry,
          childPath,
        )
        entries.push(...subEntries)
      }
    }
  } while (batch.length > 0)

  return entries
}

export async function zipFiles(
  files: FileEntry[],
  folderName: string,
): Promise<File> {
  const data: Record<string, Uint8Array> = {}

  for (const { path, file } of files) {
    const buffer = await file.arrayBuffer()
    data[`${folderName}/${path}`] = new Uint8Array(buffer)
  }

  const zipped = zipSync(data)
  return new File([zipped.buffer as ArrayBuffer], `${folderName}.zip`, {
    type: 'application/zip',
  })
}
