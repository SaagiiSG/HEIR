export default async function LockdownPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isMn = locale === "mn";

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 text-center">
      <h1 className="text-[13px] font-normal tracking-[0.2em] uppercase mb-8">HEIR</h1>

      <p className="text-[28px] md:text-[36px] font-normal leading-[1.2] mb-6 max-w-md">
        {isMn ? "Дэлгүүр түр хаалттай" : "Store temporarily closed"}
      </p>

      <p className="text-[13px] text-gray-500 leading-[1.8] max-w-xs mb-12">
        {isMn
          ? "Бид шинэ зүйлд бэлдэж байна. Удахгүй буцаж ирнэ."
          : "We are preparing something new. Check back soon."}
      </p>

      <a
        href="https://instagram.com/heir.rchive"
        target="_blank"
        rel="noopener noreferrer"
        className="text-[11px] uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
      >
        @heir.rchive
      </a>
    </div>
  );
}
