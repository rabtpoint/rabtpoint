import { urls } from '../config/urls';
const getToken=()=>localStorage.getItem('rabtpoint_token');
export const api=async(path,options={})=>{ const token=getToken(); const response=await fetch(`${urls.api}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...options.headers}}); const data=await response.json().catch(()=>({})); if(!response.ok) throw new Error(data.message||'Request failed'); return data; };
export const saveSession=({token,user})=>{ localStorage.setItem('rabtpoint_token',token); localStorage.setItem('rabtpoint_user',JSON.stringify(user)); };
export const readSession=()=>{ const token=localStorage.getItem('rabtpoint_token'); const user=localStorage.getItem('rabtpoint_user'); return {token,user:user?JSON.parse(user):null}; };
export const clearSession=()=>{ localStorage.removeItem('rabtpoint_token'); localStorage.removeItem('rabtpoint_user'); };
