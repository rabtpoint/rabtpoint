const initials=(name='U')=>name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
export default function Avatar({user,size='md'}){ return user?.photo?<img className={`avatar avatar-${size}`} src={user.photo} alt={user.name}/>:<span className={`avatar avatar-${size} avatar-fallback`}>{initials(user?.name)}</span>; }
