import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const activities = [
  {
    id: 1,
    user: "Sarah Johnson",
    action: "Added new client",
    target: "Tech Solutions Inc",
    time: "2 hours ago",
    type: "client",
  },
  {
    id: 2,
    user: "Mike Wilson",
    action: "Completed interview with",
    target: "John Developer",
    time: "4 hours ago",
    type: "interview",
  },
  {
    id: 3,
    user: "Emily Brown",
    action: "Updated marketing campaign",
    target: "Q1 Growth Initiative",
    time: "6 hours ago",
    type: "marketing",
  },
];

export function ActivityTimeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                {index < activities.length - 1 && (
                  <div className="w-0.5 h-8 bg-border mt-1"></div>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{activity.user}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.action} <strong>{activity.target}</strong>
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
