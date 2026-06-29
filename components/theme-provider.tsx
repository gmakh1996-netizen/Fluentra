"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * App-wide dark/light/system theme. Toggling sets `.dark` on <html>, which all
 * design tokens in globals.css key off. `disableTransitionOnChange` prevents a
 * color flash when switching.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
