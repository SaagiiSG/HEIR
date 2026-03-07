 "use client";

 import Link from "next/link";
 import { ArrowLeft } from "lucide-react";

 interface AdminBackLinkProps {
   href: string;
   locale: string;
   labelMn?: string;
   labelEn?: string;
 }

 export function AdminBackLink({
   href,
   locale,
   labelMn = "Буцах",
   labelEn = "Back",
 }: AdminBackLinkProps) {
   const label = locale === "mn" ? labelMn : labelEn;

   return (
     <Link
       href={href}
       className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[11px] text-gray-600 hover:text-black hover:border-black bg-white shadow-sm/50 hover:shadow-sm transition-all"
     >
       <ArrowLeft className="w-3 h-3" strokeWidth={1.5} />
       {label}
     </Link>
   );
 }

