/** useNavbar — mobile sheet open state for Navbar. */
"use client";

import { useState, useCallback } from "react";

export function useNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const toggleMobile = useCallback(() => setMobileOpen((prev) => !prev), []);

  return { mobileOpen, openMobile, closeMobile, toggleMobile };
}
