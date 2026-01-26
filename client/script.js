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