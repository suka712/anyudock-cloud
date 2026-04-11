export const config = {
  BACKEND_URL: window.location.hostname === 'localhost'
  ? 'http://localhost:8080' 
  : 'https://api.anyudock.cloud'
}