import {
  createRoute,
  redirect,
  useNavigate,
  Link,
} from '@tanstack/react-router'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { rootRoute } from './root'
import { authQueryOptions } from '@/lib/auth'
import { api } from '@/lib/api'
import { FileUpload } from '@/components/FileUpload'
import { useCountdown } from '@/lib/countdown'
import {
  FileIcon,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Plus,
  LogOut,
  Grid,
  List,
  Clock,
  HardDrive,
  User as UserIcon,
  Lock,
  Unlock,
  X,
} from 'lucide-react'
import { useState } from 'react'
import '../index.css'

type ShareExpiresIn = '1h' | '24h' | '7d' | 'never'

interface FileMetadata {
  id: string
  name: string
  size: number
  mimeType: string
  isPrivate: boolean
  createdAt: string
  expiresAt: string | null
}

function isFileExpired(file: FileMetadata): boolean {
  return !!file.expiresAt && new Date(file.expiresAt) < new Date()
}

function CountdownBadge({ expiresAt }: { expiresAt: string }) {
  const countdown = useCountdown(expiresAt)
  if (!countdown) return null
  const expired = countdown === 'EXPIRED'
  return (
    <div
      className={`px-2 py-1 text-[10px] font-black uppercase leading-none whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] inline-flex items-center gap-1 ${
        expired ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
      }`}
    >
      <Clock size={10} />
      {countdown}
    </div>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [sharingFileId, setSharingFileId] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<ShareExpiresIn>('1h')

  const { data: user } = useQuery(authQueryOptions)

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['files'],
    queryFn: () => api<FileMetadata[]>('/file'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/file/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })

  const privacyMutation = useMutation({
    mutationFn: ({ id, isPrivate }: { id: string; isPrivate: boolean }) =>
      api(`/file/${id}/privacy`, {
        method: 'PATCH',
        body: JSON.stringify({ isPrivate }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] })
    },
  })

  const shareMutation = useMutation({
    mutationFn: ({
      id,
      expiresIn,
    }: {
      id: string
      expiresIn: ShareExpiresIn
    }) =>
      api<{ id: string }>(`/file/${id}/share`, {
        method: 'POST',
        body: JSON.stringify({ expiresIn }),
      }),
    onSuccess: (data) => {
      setShareToken(data.id)
    },
  })

  const handleSignOut = async () => {
    await api('/auth/signout', { method: 'POST' })
    queryClient.removeQueries({ queryKey: ['auth'] })
    navigate({ to: '/' })
  }

  const handleDownload = (id: string) => {
    window.open(`${import.meta.env.VITE_API_URL}/file/${id}/download`, '_blank')
  }

  const handleOpenShareModal = (id: string) => {
    setSharingFileId(id)
    setShareToken(null)
    setExpiresIn('1h')
  }

  const handleCopySharedLink = (token: string) => {
    const sharedUrl = `${import.meta.env.VITE_API_URL}/file/shared/${token}`
    navigator.clipboard.writeText(sharedUrl)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  )

  const totalSize = files.reduce((acc, f) => acc + f.size, 0)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const sharingFile = files.find((f) => f.id === sharingFileId)

  return (
    <div className="min-h-screen bg-background font-mono selection:bg-primary selection:text-background">
      {/* Share Modal */}
      {sharingFileId && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-lg border-8 border-primary bg-background p-8 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                Share Data
              </h2>
              <button
                onClick={() => setSharingFileId(null)}
                className="text-primary hover:scale-110 transition-transform"
              >
                <Plus size={48} className="rotate-45" strokeWidth={4} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-4 border-primary/20 p-4">
                <p className="text-xs font-black uppercase opacity-50 mb-1">
                  Target File
                </p>
                <p className="text-xl font-black uppercase truncate">
                  {sharingFile?.name}
                </p>
              </div>

              {!shareToken ? (
                <>
                  <div className="space-y-4">
                    <p className="text-xl font-black uppercase italic">
                      Expiration Protocol:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      {(
                        [
                          { label: '1 Hour', val: '1h' },
                          { label: '1 Day', val: '24h' },
                          { label: '7 Days', val: '7d' },
                          { label: 'Never', val: 'never' },
                        ] as const
                      ).map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setExpiresIn(opt.val)}
                          className={`border-4 border-primary p-3 text-lg font-black uppercase transition-all ${
                            expiresIn === opt.val
                              ? 'bg-primary text-background'
                              : 'hover:bg-primary/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      shareMutation.mutate({
                        id: sharingFileId,
                        expiresIn,
                      })
                    }
                    disabled={shareMutation.isPending}
                    className="w-full bg-accent-foreground text-background py-4 text-2xl font-black uppercase border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-background hover:text-primary hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all disabled:opacity-50"
                  >
                    {shareMutation.isPending
                      ? 'Generating...'
                      : 'Generate Secure Link'}
                  </button>
                </>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="border-4 border-primary p-4 bg-primary/5">
                    <p className="text-xs font-black uppercase opacity-50 mb-2 text-primary">
                      Access Token
                    </p>
                    <div className="bg-background border-2 border-primary p-3 font-bold break-all text-sm">
                      {`${import.meta.env.VITE_API_URL}/file/shared/${shareToken}`}
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopySharedLink(shareToken)}
                    className="w-full bg-green-500 text-white py-4 text-2xl font-black uppercase border-4 border-primary shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    {copiedId === shareToken
                      ? 'Copied to Clipboard'
                      : 'Copy Link'}
                  </button>

                  <button
                    onClick={() => {
                      setShareToken(null)
                      setSharingFileId(null)
                    }}
                    className="w-full border-4 border-primary py-2 text-lg font-black uppercase hover:bg-primary/5 transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar/Nav */}
      <nav className="border-b-4 border-primary p-6 flex justify-between items-center bg-background sticky top-0 z-50">
        <Link
          to="/dashboard"
          className="text-3xl font-black uppercase tracking-tighter italic border-3 border-primary pr-1"
        >
          <span className="bg-primary text-background p-1">AnyuDock</span>
          /DASHBOARD
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex text-xl items-center gap-2 border-4 border-primary px-4 py-1 font-black uppercase">
            <UserIcon size={20} />
            {user?.email}
          </div>
          <button
            onClick={handleSignOut}
            className="border-4 border-primary p-2 hover:bg-primary hover:text-background transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="p-6 md:p-12 max-w-7xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Your Files
            </h1>
            <div className="flex flex-wrap gap-4">
              <div className="border-4 border-primary px-6 py-2 bg-primary text-background flex items-center gap-3">
                <HardDrive size={24} strokeWidth={3} />
                <span className="text-xl font-black uppercase">
                  {formatSize(totalSize)} / 50 MB
                </span>
              </div>
              <div className="border-4 border-primary px-6 py-2 flex items-center gap-3">
                <Clock size={24} strokeWidth={3} />
                <span className="text-xl font-black uppercase italic">
                  {files.length} {files.length === 1 ? 'ITEM' : 'ITEMS'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(!isUploadOpen)}
            className="group relative inline-block bg-accent-foreground text-background px-12 py-2 text-xl font-black uppercase hover:bg-background hover:text-primary border-4 min-w-56 border-primary transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1.25 hover:translate-y-1.25"
          >
            <div className="flex items-center gap-4">
              {isUploadOpen ? (
                <>
                  <X strokeWidth={4} />
                  Close
                </>
              ) : (
                <>
                  <Plus strokeWidth={4} />
                  Upload
                </>
              )}
            </div>
          </button>
        </header>

        {/* Upload Drawer (Brutalist style) */}
        {isUploadOpen && (
          <div className="border-8 border-primary p-8 bg-background shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-top-8 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                Transport Data
              </h2>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="text-primary hover:scale-110 transition-transform"
              >
                <Plus size={48} className="rotate-45" strokeWidth={4} />
              </button>
            </div>
            <FileUpload />
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-6 items-stretch md:items-center justify-between border-b-8 border-primary pb-8">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50 group-hover:opacity-100 transition-opacity"
              size={24}
            />
            <input
              type="text"
              placeholder="SEARCH BY NAME..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border-4 border-primary p-4 pl-14 text-xl font-black uppercase placeholder:text-primary/20 focus:ring-0 focus:border-primary outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setView('grid')}
              className={`p-4 border-4 border-primary transition-all ${view === 'grid' ? 'bg-primary text-background' : 'hover:bg-primary/10'}`}
            >
              <Grid size={24} strokeWidth={3} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-4 border-4 border-primary transition-all ${view === 'list' ? 'bg-primary text-background' : 'hover:bg-primary/10'}`}
            >
              <List size={24} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* File Grid/List */}
        {isLoading ? (
          <div className="p-20 text-center">
            <h2 className="text-4xl font-black uppercase animate-pulse">
              Scanning Disk...
            </h2>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-20 text-center border-4 border-dashed border-primary/20">
            <h2 className="text-4xl font-black uppercase opacity-20">
              No data found
            </h2>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="group border-4 border-primary bg-background shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex flex-col"
              >
                {/* Preview/Icon Area */}
                <div className="aspect-square bg-primary/5 border-b-4 border-primary flex items-center justify-center p-8 relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/file/${file.id}/view`}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src =
                          'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xNSAySDdYNHYxNmgxNFY0bC01LTVaIi8+PHBhdGggZD0iTTE1IDJ2NWg1Ii8+PC9zdmc+'
                      }}
                    />
                  ) : (
                    <FileIcon
                      size={80}
                      strokeWidth={1}
                      className="text-primary opacity-20 group-hover:opacity-100 transition-opacity"
                    />
                  )}

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <div className="bg-primary text-background px-2 py-1 text-[10px] font-black uppercase">
                      {file.mimeType.split('/')[1] || 'FILE'}
                    </div>
                    {!file.isPrivate && (
                      <div className="bg-green-500 text-white px-2 py-1 text-[10px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        Public
                      </div>
                    )}
                    {file.expiresAt && (
                      <CountdownBadge expiresAt={file.expiresAt} />
                    )}
                  </div>
                </div>

                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3
                      className="font-black uppercase truncate text-lg tracking-tight"
                      title={file.name}
                    >
                      {file.name}
                    </h3>
                    <p className="text-xs font-bold opacity-50 flex items-center gap-2 uppercase">
                      <span>{formatSize(file.size)}</span>
                      <span>•</span>
                      <span>
                        {new Date(file.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleDownload(file.id)}
                        disabled={isFileExpired(file)}
                        className="border-2 border-primary p-2 flex items-center justify-center gap-2 hover:bg-primary hover:text-background transition-all font-black uppercase text-[10px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-primary"
                      >
                        <Download size={15} strokeWidth={2} />
                        Grab
                      </button>
                      <button
                        onClick={() => handleOpenShareModal(file.id)}
                        disabled={file.isPrivate || isFileExpired(file)}
                        className="border-2 border-primary p-2 flex items-center justify-center gap-2 hover:bg-primary hover:text-background transition-all font-black uppercase text-[10px] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-background disabled:hover:text-primary"
                      >
                        <ExternalLink size={15} strokeWidth={2} />
                        Share
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          privacyMutation.mutate({
                            id: file.id,
                            isPrivate: !file.isPrivate,
                          })
                        }
                        className={`border-2 border-primary p-2 flex items-center hover:bg-green-400 hover:border-green-400 justify-center gap-2 transition-all font-black uppercase text-[10px] ${
                          file.isPrivate
                            ? 'bg-primary text-background'
                            : 'bg-background text-primary'
                        }`}
                      >
                        {file.isPrivate ? (
                          <>
                            <Lock size={15} strokeWidth={2} /> private
                          </>
                        ) : (
                          <>
                            <Unlock size={15} strokeWidth={2} />
                            public
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(file.id)}
                        disabled={deleteMutation.isPending}
                        className="border-2 border-primary p-2 flex items-center justify-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all font-black uppercase text-[10px] disabled:opacity-50"
                      >
                        <Trash2 size={14} strokeWidth={3} />
                        Kill
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-4 border-primary overflow-hidden">
            <table className="w-full text-left uppercase font-black">
              <thead>
                <tr className="bg-primary text-background border-b-4 border-primary">
                  <th className="p-4 tracking-tighter italic">Name</th>
                  <th className="p-4 tracking-tighter italic hidden md:table-cell">
                    Format
                  </th>
                  <th className="p-4 tracking-tighter italic hidden sm:table-cell">
                    Size
                  </th>
                  <th className="p-4 tracking-tighter italic hidden lg:table-cell">
                    Expires
                  </th>
                  <th className="p-4 tracking-tighter italic min-w-40">
                    Status
                  </th>
                  <th className="p-4 tracking-tighter italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-primary/10">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.id}
                    className="hover:bg-primary/5 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileIcon size={20} className="shrink-0" />
                        <span className="truncate max-w-[200px] md:max-w-md">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell opacity-50">
                      {file.mimeType.split('/')[1] || 'DATA'}
                    </td>
                    <td className="p-4 hidden sm:table-cell opacity-50">
                      {formatSize(file.size)}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {file.expiresAt ? (
                        <CountdownBadge expiresAt={file.expiresAt} />
                      ) : (
                        <span className="opacity-30 text-xs">PERMANENT</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() =>
                          privacyMutation.mutate({
                            id: file.id,
                            isPrivate: !file.isPrivate,
                          })
                        }
                        className={`px-3 py-1 text-[10px] font-black border-2 border-primary ${file.isPrivate ? 'bg-primary text-background' : 'bg-background text-primary'}`}
                      >
                        {file.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDownload(file.id)}
                          disabled={isFileExpired(file)}
                          className="hover:scale-125 transition-transform text-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <Download size={18} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => handleOpenShareModal(file.id)}
                          disabled={file.isPrivate || isFileExpired(file)}
                          className="hover:scale-125 transition-transform text-primary disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          <ExternalLink size={18} strokeWidth={3} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(file.id)}
                          className="hover:scale-125 transition-transform text-destructive"
                        >
                          <Trash2 size={18} strokeWidth={3} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <footer className="p-10 border-t-8 border-primary bg-primary text-background mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">
              System Status
            </h3>
            <p className="font-bold uppercase opacity-80">
              All systems operational — S3 link established
            </p>
          </div>
          <div className="flex gap-12 text-center">
            <div>
              <div className="text-4xl font-black italic">{files.length}</div>
              <div className="text-xs font-black uppercase opacity-60">
                FILES
              </div>
            </div>
            <div>
              <div className="text-4xl font-black italic">
                {formatSize(totalSize)} / 50 MB
              </div>
              <div className="text-xs font-black uppercase opacity-60">
                STORAGE ALLOCATION
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: async ({ context }) => {
    try {
      await context.queryClient.ensureQueryData(authQueryOptions)
    } catch {
      throw redirect({ to: '/' })
    }
  },
})
