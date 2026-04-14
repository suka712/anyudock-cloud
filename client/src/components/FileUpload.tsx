import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react'

export function FileUpload() {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const queryClient = useQueryClient()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)])
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }, [])

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadFiles = async () => {
    setUploading(true)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileName', file.name)
        
        await api('/file', {
          method: 'POST',
          body: formData,
          // Remove default Content-Type header so fetch sets it automatically with boundary
          headers: {} 
        })
      }
      setFiles([])
      await queryClient.invalidateQueries({ queryKey: ['files'] })
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div 
        className={`relative border-8 border-dashed transition-all p-12 text-center flex flex-col items-center justify-center gap-4 ${
          dragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-primary/20 hover:border-primary/40'
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
            Drop files here
          </p>
          <p className="text-lg font-bold opacity-60 uppercase italic">
            or click to browse from your machine
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="border-4 border-primary bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="bg-primary text-background p-4 border-b-4 border-primary flex justify-between items-center">
            <h3 className="text-xl font-black uppercase italic tracking-tighter">Queue ({files.length})</h3>
            <button onClick={() => setFiles([])} className="hover:scale-110 transition-transform">
              <X size={24} strokeWidth={3} />
            </button>
          </div>
          <div className="p-4 max-h-64 overflow-y-auto space-y-2">
            {files.map((file, i) => (
              <div key={i} className="flex items-center justify-between p-3 border-4 border-primary/10 hover:border-primary transition-colors bg-background">
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileIcon className="shrink-0" size={20} />
                  <span className="font-bold truncate uppercase text-sm">{file.name}</span>
                  <span className="text-[10px] font-black opacity-40 uppercase">{(file.size / 1024 / 1024).toFixed(2)}MB</span>
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
