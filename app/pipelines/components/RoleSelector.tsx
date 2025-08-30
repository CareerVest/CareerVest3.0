import React from "react";
import { UserRole } from "../../types/pipelines/pipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User, FileText, Target, Users, UserCheck } from "lucide-react";

interface RoleSelectorProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

const roleConfig: Record<
  UserRole,
  {
    title: string;
    description: string;
    permissions: string[];
    icon: React.ComponentType<any>;
    color: string;
  }
> = {
  admin: {
    title: "Admin",
    description: "Full system access",
    permissions: [
      "All stages access",
      "User management",
      "System settings",
      "All client actions",
    ],
    icon: Shield,
    color: "bg-red-500",
  },
  "marketing-manager": {
    title: "Marketing Manager",
    description: "Strategic oversight and management",
    permissions: [
      "All stages access",
      "Performance monitoring",
      "Cross-stage management",
      "Team oversight",
    ],
    icon: Users,
    color: "bg-purple-500",
  },
  "sales-executive": {
    title: "Sales Executive",
    description: "Initial client contact and qualification",
    permissions: [
      "Sales stage access",
      "Move clients to Resume",
      "Handle backouts",
      "Initial client contact",
    ],
    icon: User,
    color: "bg-blue-500",
  },
  "resume-writer": {
    title: "Resume Writer",
    description: "Resume preparation and optimization",
    permissions: [
      "Resume stage access",
      "Initial client calls",
      "Move to Marketing",
      "Resume actions",
    ],
    icon: FileText,
    color: "bg-yellow-600",
  },
  "senior-recruiter": {
    title: "Senior Recruiter",
    description: "Marketing campaign oversight",
    permissions: [
      "Marketing stage access",
      "Campaign management",
      "Assign recruiters",
      "Move to Completed",
    ],
    icon: Target,
    color: "bg-green-600",
  },
  recruiter: {
    title: "Recruiter",
    description: "Campaign execution and client outreach",
    permissions: [
      "Marketing stage access",
      "Client outreach",
      "Follow-up activities",
      "Move to Completed",
    ],
    icon: UserCheck,
    color: "bg-green-500",
  },
};

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Role Simulation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select a role to see different permissions and access levels
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {(Object.keys(roleConfig) as UserRole[]).map((role) => {
            const config = roleConfig[role];
            const Icon = config.icon;
            const isSelected = currentRole === role;

            return (
              <Button
                key={role}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2"
                onClick={() => onRoleChange(role)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className={`w-3 h-3 rounded-full ${config.color}`} />
                  <Icon className="w-4 h-4" />
                  <span>{config.title}</span>
                  {isSelected && (
                    <Badge variant="secondary" className="ml-auto">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-left text-muted-foreground">
                  {config.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {config.permissions.slice(0, 2).map((permission, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {config.permissions.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{config.permissions.length - 2} more
                    </Badge>
                  )}
                </div>
              </Button>
            );
          })}
        </div>

        {/* Current Role Details */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <h4 className="flex items-center gap-2 mb-2">
            <div
              className={`w-3 h-3 rounded-full ${roleConfig[currentRole].color}`}
            />
            Current Role: {roleConfig[currentRole].title}
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            {roleConfig[currentRole].description}
          </p>
          <div className="space-y-1">
            <p className="text-sm">Permissions:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {roleConfig[currentRole].permissions.map((permission, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-current rounded-full" />
                  {permission}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
