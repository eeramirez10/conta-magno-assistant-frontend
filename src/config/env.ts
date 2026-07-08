
const apiUrl = import.meta.env.VITE_API_URL;

if(!apiUrl){
  throw new Error('Falta VITE_API_URL en .env.local')
}

export const env = {
  apiUrl
}