"use client";

import React from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddClientButton() {
  const router = useRouter();

  const handleAddClient = () => {
    router.push("/clients/new");
  };

  return (
    <Button
      variant="default"
      className="bg-[#682A53] hover:bg-[#682A53]/90 text-white"
      onClick={handleAddClient}
    >
      <Plus className="h-4 w-4 mr-2" />
      Add New Client
    </Button>
  );
}
