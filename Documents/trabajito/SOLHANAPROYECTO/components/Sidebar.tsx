'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

interface NavItem {
  name: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { name: 'Panel Principal', href: '/', icon: 'dashboard' },
  { name: 'Pedidos', href: '/pedidos', icon: 'shopping_cart' },
  { name: 'Productos', href: '/productos', icon: 'inventory_2' },
  { name: 'Clientes', href: '/clientes', icon: 'group' },
  { name: 'Analíticas', href: '/analiticas', icon: 'bar_chart' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <div>
            <h1 className={styles.logoTitle}>SOLHANA</h1>
            <p className={styles.logoSubtitle}>Panel de Administración</p>
          </div>
        </div>
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
          >
            <span className={`material-symbols-outlined ${pathname === item.href ? 'fill' : ''}`}>
              {item.icon}
            </span>
            <span>{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.footer}>
        <Link 
          href="/diseno" 
          className={styles.viewStoreButton}
        >
          Ver tienda
        </Link>
        <div className={styles.footerLinks}>
          <Link href="/configuracion" className={styles.navItem}>
            <span className="material-symbols-outlined">settings</span>
            <span>Configuración</span>
          </Link>
          <Link href="/ayuda" className={styles.navItem}>
            <span className="material-symbols-outlined">help</span>
            <span>Ayuda</span>
          </Link>
        </div>
      </div>
    </aside>
  )
}

