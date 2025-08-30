import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Clock,
  Users,
  Target,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Client } from "../types/pipeline";

interface PipelineStatsProps {
  clients: Client[];
}

export function PipelineStats({ clients }: PipelineStatsProps) {
  const stats = {
    total: clients.length,
    sales: clients.filter((c) => c.status === "sales").length,
    resume: clients.filter((c) => c.status === "resume").length,
    marketing: clients.filter((c) => c.status === "marketing").length,
    completed: clients.filter((c) => c.status === "completed").length,
    backedOut: clients.filter((c) => c.status === "backed-out").length,
    onHold: clients.filter((c) => c.status === "on-hold").length,
    remarketing: clients.filter((c) => c.status === "remarketing").length,
    active: clients.filter(
      (c) => !["backed-out", "completed"].includes(c.status)
    ).length,
  };

  const conversionRate =
    stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const activeRate =
    stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.active}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-purple-500" />
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.marketing}</div>
            <div className="text-xs text-muted-foreground">Marketing</div>
          </div>
          <Target className="w-4 h-4 text-green-600" />
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.onHold}</div>
            <div className="text-xs text-muted-foreground">On Hold</div>
          </div>
          <Clock className="w-4 h-4 text-gray-500" />
        </div>
      </Card>

      <Card className="p-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{stats.backedOut}</div>
            <div className="text-xs text-muted-foreground">Backed Out</div>
          </div>
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
      </Card>
    </div>
  );
}
