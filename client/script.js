import { config } from './config.js'

const login = async (username, password) => {
  const response = await fetch(`${config.BACKEND_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })

  if (!response.ok) {
    throw new Error('login failed')
  }

  const data = await response.json()
  localStorage.setItem('token', data.token)

  loadFiles()
}

const handleLogin = async () => {
  const username = document.getElementById('username').value
  const password = document.getElementById('password').value

  try {
    await login(username, password)
    document.getElementById('login-form').style.display = 'none'
    document.getElementById('dashboard').style.display = 'block'
  } catch (e) {
    console.log('Failed to login:', e)
  }
}

document.getElementById('login-button').addEventListener('click', handleLogin)

// --------------------------Drag & Drop--------------------------

const dropzone = document.getElementById('dropzone')
const fileInput = document.getElementById('fileInput')

dropzone.addEventListener('click', () => fileInput.click())

fileInput.addEventListener('change', (e) => {
  if (e.target.files.length) uploadFile(e.target.files[0])
})

dropzone.addEventListener('dragover', (e) => {
  e.preventDefault()
  dropzone.classList.add('dragging')
})

dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'))

dropzone.addEventListener('drop', (e) => {
  e.preventDefault()
  dropzone.classList.remove('dragging')
  if (e.dataTransfer.files.length) uploadFile(e.dataTransfer.files[0])
})

// --------------------------Features--------------------------

const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${config.BACKEND_URL}/file`, {
    method: 'POST',
    body: formData,
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  const data = await res.json()
  console.log('Uploaded:', data.url)
  loadFiles()
}

const loadFiles = async () => {
  try {
    console.log('loadFiles started running')

    document.getElementById('fileEmptyMessage').style.display = 'none'
    document.getElementById('fileLoadingMessage').style.display = 'block'
  
    const res = await fetch(`${config.BACKEND_URL}/file`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
  
    if (!res.ok || !res) {
      throw new Error('fail to fetch file')
    }
    
    let files = await res.json()
    if (files.length === 0) {
      console.log('loadFiles detected empty file list')
      document.getElementById('fileList').innerHTML = ''
      document.getElementById('fileLoadingMessage').style.display = 'none'
      document.getElementById('fileEmptyMessage').style.display = 'block'
      return
    } 
  
    document.getElementById('fileList').innerHTML = files.map(f =>
      `
        <div class="file-item">
          <svg class="delete-button" onclick="deleteFile('${f.key}')" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-icon lucide-trash">
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <div class="file-name" onclick="downloadFile('${f.key}')">
            ${String(f.key).split('-').at(-1)}
          </div>
        </div>
        `
    ).join('')
    document.getElementById('fileLoadingMessage').style.display = 'none'
    document.getElementById('fileEmptyMessage').style.display = 'none'
    console.log('loadFiles ran successfully')
  } catch (e) {
    console.log('Failed to load file - default to empty:', e)
    document.getElementById('fileList').innerHTML = ''
    document.getElementById('fileLoadingMessage').style.display = 'none'
    document.getElementById('fileEmptyMessage').style.display = 'block'
    console.log('loadFiles errored out')
  }
}

window.downloadFile = async (key) => {
  if (!key) {
    console.log('Download failed', res.status)
    return
  }
  const res = await fetch(`${config.BACKEND_URL}/file/${key}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  const { url } = await res.json()

  window.open(url)

  console.log('Opened to download:', key)
}

window.deleteFile = async (key) => {
  try {
    const res = await fetch(`${config.BACKEND_URL}/file/${key}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })

    if (!res.ok) {
      throw new Error(`Failed to deletefile: ${res.status}`)
    }

    console.log('Deleted file:', key)
    loadFiles()
  } catch (e) {
    console.log('Failed to delete file:', e)
  }
}

// --------------------------First load--------------------------

if (localStorage.getItem('token')) {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('dashboard').style.display = 'block'
  loadFiles()
}