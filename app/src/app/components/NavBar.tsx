"use client";
import Link from "next/link";
import { PersonStanding } from "lucide-react";
import { useEffect, useState } from "react";
import { extractTokenAction, logoutAction } from "../actions";
import { useRouter } from "next/navigation";
import { ROUTES, UI_CONFIG, APP_CONFIG } from "@/config/constants";
// get logo from public folder
import Logo from "@/app/assets/StashD-Logo-White.png";
import Image from "next/image";

export default function NavBar() {
  const [username, setUsername] = useState<string | null>("");
  const router = useRouter();

  const getUsername = async () => {
    const response = await extractTokenAction();
    if (response && typeof response === "object") {
      return (response as any).name;
    }
    return null;
  };
  useEffect(() => {
    getUsername().then((value) => setUsername(value));
  }, []);
  return (
    <nav className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-700/50 backdrop-blur-md">
      <div className="mx-auto flex md:w-2/3 w-md items-center justify-between px-4 py-3">
        <Link href={ROUTES.HOME} className="flex items-center justify-center">
          {/* <LinkIcon className="w-6 h-6" /> */}
          <Image src={Logo} alt="StashD Logo" className="w-28" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              title="User profile"
              onClick={() => router.push("/profile")}
              className="cursor-pointer inline-flex items-center justify-center"
            >
              <PersonStanding className="md:w-10 md:h-10" />
              {username && (
                <span className=" text-white capitalize rounded-full px-1">
                  {username}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
