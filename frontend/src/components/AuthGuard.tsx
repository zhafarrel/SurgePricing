"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const authCheck = () => {
      const token = localStorage.getItem("token");
      const publicPaths = ["/login", "/register"];
      const isPublicPath = publicPaths.includes(pathname);

      if (!token && !isPublicPath) {
        setAuthorized(false);
        router.push("/login");
      } else {
        setAuthorized(true);
      }
    };

    authCheck();
  }, [pathname, router]);

  if (!authorized) {
    const isPublicPath = ["/login", "/register"].includes(pathname);
    if (!isPublicPath) return null;
  }

  return <>{children}</>;
}
