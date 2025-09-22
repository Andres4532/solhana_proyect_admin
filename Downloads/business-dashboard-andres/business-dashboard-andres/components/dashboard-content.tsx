"use client"

import { DashboardOverview } from "./dashboard-overview"
import { ProductsSection } from "./products-section"
import { OrdersSection } from "./orders-section"
import { HistorySection } from "./history-section"
import { CustomersSection } from "./customers-section"
import { ScheduleSection } from "./schedule-section"
import { SettingsSection } from "./settings-section"
import { MotoSection } from "./moto-section"
import { useNavigation } from "../src/contexts/NavigationContext"

export function DashboardContent() {
  const { activeSection } = useNavigation()

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview />
      case "products":
        return <ProductsSection />
      case "orders":
        return <OrdersSection />
      case "history":
        return <HistorySection />
      case "customers":
        return <CustomersSection />
      case "schedule":
        return <ScheduleSection />
      case "moto":
        return <MotoSection />
      case "settings":
        return <SettingsSection />
      default:
        return <DashboardOverview />
    }
  }

  return <div className="p-6">{renderSection()}</div>
}
