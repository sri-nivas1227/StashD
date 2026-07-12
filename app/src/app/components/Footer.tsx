import Image from "next/image";
import Logo from "@/app/assets/StashD-Logo-White.png";
import GitHub from "@/app/assets/mark-github-24.svg";
import LinkedIn from "@/app/assets/linkedin-svgrepo-com.svg";
import GoFundMe from "@/app/assets/gofundme-svgrepo-com.svg";
import XTwitter from "@/app/assets/twitter-x.svg";
import Link from "next/link";
import { FOOTER_LINKS, SOCIAL_LINKS } from "@/config/constants";
export default function Footer() {
  return (
    <footer className="w-full px-4 sm:px-8 md:px-16 m-auto py-4 border-t border-zinc-800 text-center text-sm text-zinc-500">
      <main className="p-1 grid grid-cols-1 md:grid-cols-3 items-center justify-between gap-8 md:gap-4">
        <section className="flex flex-col items-center justify-center gap-2">
          <Image alt="Logo" src={Logo} className="w-24 md:w-32" />
          <span className="text-xs sm:text-sm">
            Stash your Links. Stay Organized.
          </span>
        </section>
        <section className="">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={FOOTER_LINKS.ABOUT} className="whitespace-nowrap">
              About
            </Link>
            <Link href={FOOTER_LINKS.CHANGELOG} className="whitespace-nowrap">
              Changelog
            </Link>
            <Link href={FOOTER_LINKS.REPORT_ISSUE} className="whitespace-nowrap">
              Report an Issue
            </Link>
            <Link href={FOOTER_LINKS.TERMS} className="whitespace-nowrap">
              Privacy Policy & Terms
            </Link>
          </div>
        </section>
        <section className="">
          <ul className="flex items-center justify-center gap-4">
            <li className="">
              <Link href={SOCIAL_LINKS.GITHUB} target="_blank">
                <Image
                  alt="GitHub"
                  src={GitHub}
                  title="GitHub"
                  className="w-8 h-8 invert inline-block"
                />
              </Link>
            </li>
            <li className="">
              <Link href={SOCIAL_LINKS.LINKEDIN} target="_blank">
                <Image
                  alt="LinkedIn"
                  src={LinkedIn}
                  title="LinkedIn"
                  className="w-8 h-8 invert inline-block"
                />
              </Link>
            </li>
            <li className="">
              <Link href={SOCIAL_LINKS.X_TWITTER} target="_blank">
                <Image
                  alt="XTwitter"
                  src={XTwitter}
                  title="X/Twitter"
                  className="w-7 h-7 invert inline-block"
                />
              </Link>
            </li>
            <li className="">
              <Link href={SOCIAL_LINKS.GOFUNDME} target="_blank">
                <Image
                  alt="GoFundMe"
                  src={GoFundMe}
                  title="GoFundMe"
                  className="w-9 h-9 invert inline-block"
                />
              </Link>
            </li>
          </ul>
        </section>
      </main>
      <div className="">
        Built with ❤️ by{" "}
        <a
          href="https://srinivasmekala.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Srinivas Mekala
        </a>
        . All rights reserved.
      </div>
      <div className="mt-1">
        &copy; {new Date().getFullYear()} StashD. Version 1.0.0.
      </div>
    </footer>
  );
}
