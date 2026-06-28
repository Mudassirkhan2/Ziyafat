"use client";

import { useEffect } from "react";
import { API_BASE } from "@/lib/api";

export default function ColdStartPing() {
  useEffect(() => {
    fetch(`${API_BASE}/api/v1/ping`, { credentials: "omit" }).catch(() => {});
  }, []);

  return null;
}
