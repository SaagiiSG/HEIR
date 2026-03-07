interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  return (
    <div className="min-h-[34px] bg-black text-white flex items-center justify-center text-[11px] tracking-wide px-4 py-2 text-center">
      {text}
    </div>
  );
}
