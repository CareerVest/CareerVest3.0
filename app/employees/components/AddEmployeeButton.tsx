"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddEmployeeButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/employees/new");
  };

  return (
    <Button
      onClick={handleClick}
      className="bg-[#682A53] hover:bg-[#5a2347] text-white"
    >
      <Plus className="mr-2 h-4 w-4" />
      Add Employee
    </Button>
  );
}
