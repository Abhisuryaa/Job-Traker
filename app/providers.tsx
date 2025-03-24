"use client";

import { SessionProvider } from "next-auth/react";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 