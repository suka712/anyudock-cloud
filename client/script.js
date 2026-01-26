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

if (localStorage.getItem('token')) {
  document.getElementById('login-form').style.display = 'none'
  document.getElementById('dashboard').style.display = 'block'
}

// 

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

async function uploadFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${config.BACKEND_URL}/upload`, { method: 'POST', body: formData })
  const data = await res.json()
  console.log('Uploaded:', data.url)
}