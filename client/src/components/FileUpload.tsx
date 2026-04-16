import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  Upload,
  X,
  File as FileIcon,
  Loader2,
  FolderArchive,
} from 'lucide-react'
import { readDirectoryEntries, zipFiles } from '@/lib/folder-zip'

type ExpiresIn = '1h' | '6h' | '24h' | '7d' | 'never'

interface QueuedFile {
  file: File
  isFolder: boolean
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB individual file limit

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<QueuedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [zipping, setZipping] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<ExpiresIn>('never')
  const queryClient = useQueryClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const items = e.dataTransfer.items
    if (!items) return

    const newFiles: QueuedFile[] = []

    for (let i = 0; i < items.length; i++) {
      const entry = items[i]?.webkitGetAsEntry?.()

      if (entry?.isDirectory) {
        setZipping(entry.name)
        try {
          const entries = await readDirectoryEntries(
            entry as FileSystemDirectoryEntry,
          )
          if (entries.length > 0) {
            const zipped = await zipFiles(entries, entry.name)
            if (zipped.size > MAX_FILE_SIZE) {
              alert(
                `Folder "${entry.name}" zipped to ${(zipped.size / 1024 / 1024).toFixed(2)}MB which exceeds the 50MB limit.`,
              )
            } else {
              newFiles.push({ file: zipped, isFolder: true })
            }
          }
        } finally {
          setZipping(null)
        }
      } else if (entry?.isFile) {
        const file = e.dataTransfer.files[i]
        if (file) {
          if (file.size > MAX_FILE_SIZE) {
            alert(`File "${file.name}" is too large. Max size is 50MB.`)
          } else {
            newFiles.push({ file, isFolder: false })
          }
        }
      }
    }

    setFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files) {
      const newFiles: QueuedFile[] = []
      for (const file of Array.from(e.target.files)) {
        if (file.size > MAX_FILE_SIZE) {
          alert(`File "${file.name}" is too large. Max size is 50MB.`)
        } else {
          newFiles.push({ file, isFolder: false })
        }
      }
      setFiles((prev) => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setUploading(true)
    try {
      for (const { file } of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', file.name)
        if (expiresIn !== 'never') {
          formData.append('expiresIn', expiresIn)
        }

        await api('/file', {
          method: 'POST',
          body: formData,
          headers: {},
        })
      }
      setFiles([])
      await queryClient.invalidateQueries({ queryKey: ['files'] })
    } catch (error) {
      console.error('Upload failed:', error)
      if (error instanceof Error) {
        alert(`Upload failed: ${error.message}`)
      } else {
        alert('Upload failed. Please try again.')
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className={`relative border-8 border-dashed transition-all p-12 text-center flex flex-col items-center justify-center gap-4 ${
          dragActive
            ? 'border-primary bg-primary/5 scale-[0.99]'
            : 'border-primary/20 hover:border-primary/40'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
        />
        <div className="bg-primary text-background p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Upload size={48} strokeWidth={3} />
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-black uppercase tracking-tighter">
            Drop files or drag folders here
          </p>
          <p className="text-lg font-bold opacity-60 uppercase italic">
            or click to browse — folders auto-zipped
          </p>
        </div>
      </div>

      {zipping && (
        <div className="border-4 border-amber-500 bg-amber-500/10 p-4 flex items-center gap-3">
          <Loader2 className="animate-spin text-amber-500" size={24} />
          <span className="font-black uppercase text-amber-500">
            Zipping: {zipping}...
          </span>
        </div>
      )}

      {files.length > 0 && (
        <div className="border-4 border-primary bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-primary text-background p-4 border-b-4 border-primary flex justify-between items-center">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">
              Queue ({files.length})
            </h3>
            <button
              onClick={() => setFiles([])}
              className="hover:scale-110 transition-transform"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto space-y-2">
            {files.map(({ file, isFolder }, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 border-4 border-primary/10 hover:border-primary transition-colors bg-background"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isFolder ? (
                    <FolderArchive
                      className="shrink-0 text-amber-500"
                      size={20}
                    />
                  ) : (
                    <FileIcon className="shrink-0" size={20} />
                  )}
                  <span className="font-bold truncate uppercase text-sm">
                    {file.name}
                  </span>
                  <span className="text-[10px] font-black opacity-40 uppercase">
                    {(file.size / 1024 / 1024).toFixed(2)}MB
                  </span>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="text-destructive hover:scale-125 transition-transform"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 border-t-4 border-primary/20 space-y-2">
            <label className="text-xs font-black uppercase opacity-60">
              Expiration
            </label>
            <div className="flex gap-1">
              {(['1h', '6h', '24h', '7d', 'never'] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setExpiresIn(opt)}
                  className={`flex-1 py-2 text-sm font-black uppercase border-2 border-primary transition-all ${
                    expiresIn === opt
                      ? 'bg-primary text-background'
                      : 'hover:bg-primary/10'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-primary/5 border-t-4 border-primary">
            <Button
              onClick={uploadFiles}
              disabled={uploading}
              className="w-full rounded-none border-4 border-primary bg-primary text-background hover:bg-background hover:text-primary transition-all py-8 text-2xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Send to S3'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
