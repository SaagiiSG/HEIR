"use client";

import Link from "next/link";

export interface CustomerRow {
  id: string;
  ovog?: string;
  ner?: string;
  email?: string;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

interface CustomerTableProps {
  customers: CustomerRow[];
  locale?: string;
}

export function CustomerTable({ customers, locale = "mn" }: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <p className="text-[13px] text-gray-400 py-8 text-center">
        {locale === "mn" ? "Хэрэглэгч байхгүй" : "No customers"}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Нэр" : "Name"}
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              И-мэйл
            </th>
            <th className="text-left py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Бүртгэсэн" : "Registered"}
            </th>
            <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500 pr-4">
              {locale === "mn" ? "Захиалга" : "Orders"}
            </th>
            <th className="text-right py-3 font-normal text-[11px] uppercase tracking-wide text-gray-500">
              {locale === "mn" ? "Нийт зарцуулсан" : "Total Spent"}
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
              <td className="py-3 pr-4">
                <Link href={`/${locale}/admin/customers`} className="hover:underline">
                  {[c.ovog, c.ner].filter(Boolean).join(" ") || "—"}
                </Link>
              </td>
              <td className="py-3 pr-4 text-gray-500">{c.email ?? "—"}</td>
              <td className="py-3 pr-4 text-gray-500">
                {new Date(c.created_at).toLocaleDateString(locale === "mn" ? "mn-MN" : "en-US")}
              </td>
              <td className="py-3 pr-4 text-right">{c.order_count ?? 0}</td>
              <td className="py-3 text-right">
                ₮{(c.total_spent ?? 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
