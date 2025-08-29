"use client";

import React from "react";
import CreateEmployeeForm from "../components/CreateEmployeeForm";

export default function NewEmployeePage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[#682A53]">Add New Employee</h1>
      </div>
      <CreateEmployeeForm />
    </div>
  );
}
