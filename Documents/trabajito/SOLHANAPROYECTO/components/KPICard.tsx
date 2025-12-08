import styles from './KPICard.module.css'

interface KPICardProps {
  title: string
  value: string
  change: string
  isPositive: boolean
}

export default function KPICard({ title, value, change, isPositive }: KPICardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value}>{value}</p>
      <p className={`${styles.change} ${isPositive ? styles.positive : styles.negative}`}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          {isPositive ? 'trending_up' : 'trending_down'}
        </span>
        <span>{change}</span>
      </p>
    </div>
  )
}


