import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Eye, UserCircle } from "lucide-react";

interface RoleSelectorProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

const roles = [
  { value: "Admin", label: "Admin Dashboard", icon: "👑" },
  { value: "Sales_Executive", label: "Sales Executive Dashboard", icon: "💼" },
  { value: "Marketing_Manager", label: "Marketing Manager Dashboard", icon: "📊" },
  { value: "Senior_Recruiter", label: "Senior Recruiter Dashboard", icon: "⭐" },
  { value: "Recruiter", label: "Recruiter Dashboard", icon: "🎯" },
  { value: "Resume_Writer", label: "Resume Writer Dashboard", icon: "📝" },
];

export function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
      <Eye className="h-4 w-4 text-blue-600 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1">
        <span className="text-xs font-medium text-blue-900 whitespace-nowrap">
          Viewing as:
        </span>
        <Select value={currentRole} onValueChange={onRoleChange}>
          <SelectTrigger className="h-8 text-xs border-blue-300 bg-white w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value} className="text-xs">
                <span className="flex items-center gap-2">
                  <span>{role.icon}</span>
                  <span>{role.label}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
