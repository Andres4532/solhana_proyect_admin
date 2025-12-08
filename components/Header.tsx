'use client'

import { usePathname } from 'next/navigation'
import styles from './Header.module.css'

const getPageTitle = (pathname: string): string => {
  const titles: { [key: string]: string } = {
    '/': 'Panel Principal',
    '/pedidos': 'Pedidos',
    '/productos': 'Productos',
    '/clientes': 'Clientes',
    '/analiticas': 'Analíticas',
    '/diseno': 'Diseño',
    '/configuracion': 'Configuración',
    '/ayuda': 'Ayuda',
  }
  return titles[pathname] || 'Panel Principal'
}

export default function Header() {
  const pathname = usePathname()
  const title = getPageTitle(pathname)

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.actions}>
        <button className={styles.iconButton} aria-label="Notificaciones">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className={styles.iconButton} aria-label="Perfil">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  )
}

