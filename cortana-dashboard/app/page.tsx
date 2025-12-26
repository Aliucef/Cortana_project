"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Cortana3D from "@/components/dashboard/Cortana3D";
import { StatCard } from "@/components/ui/GlassCard";
import { DollarSign, Dumbbell, Target, TrendingUp } from "lucide-react";
import { getDashboardOverview, type DashboardOverview } from "@/lib/api";

export default function Home() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverview();
  }, []);

  async function loadOverview() {
    setLoading(true);
    try {
      const data = await getDashboardOverview(1);
      setOverview(data);
    } catch (error) {
      console.error("Failed to load overview:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">
          Welcome back, Chief
        </h1>
        <p className="text-gray-500 text-sm">
          Here's your overview for today
        </p>
      </motion.div>

      {/* Cortana 3D Visualization */}
      <Cortana3D />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <StatCard
          label="This Month's Spending"
          value={loading ? "Loading..." : `$${overview?.finance.total_expenses.toFixed(2) || "0.00"}`}
          change={-15}
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          trend="down"
          delay={0.1}
        />

        <StatCard
          label="Workouts This Week"
          value={loading ? "Loading..." : `${overview?.health.workouts_this_week || 0}`}
          change={25}
          icon={<Dumbbell className="w-5 h-5 text-green-600" />}
          trend="up"
          delay={0.2}
        />

        <StatCard
          label="Current Weight"
          value={loading ? "Loading..." : overview?.health.current_weight ? `${overview.health.current_weight} kg` : "N/A"}
          change={12}
          icon={<Target className="w-5 h-5 text-purple-600" />}
          trend="up"
          delay={0.3}
        />

        <StatCard
          label="Net Balance"
          value={loading ? "Loading..." : `$${overview?.finance.net_balance.toFixed(2) || "0.00"}`}
          change={0}
          icon={<TrendingUp className="w-5 h-5 text-gray-600" />}
          trend="neutral"
          delay={0.4}
        />
      </div>
    </div>
  );
}
