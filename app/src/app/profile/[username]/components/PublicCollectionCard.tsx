import { Copy, SquareArrowOutUpRight } from "lucide-react";
import { toast } from "sonner";

interface Props {
  name: string;
  username: string;
  slug: string;
}

export default function PublicCollectionCard({ name, username, slug }: Props) {
  const url = `/share/${username}/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${url}`);
      toast.success("Link Copied to Clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const handleOpen = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-sm text-zinc-300 transition hover:border-indigo-500/60 hover:bg-indigo-500/5 hover:text-indigo-200">
      <span
        onClick={handleOpen}
        className="font-medium truncate cursor-pointer"
      >
        {name}
      </span>

      <div className="flex items-center gap-2">
        <Copy
          onClick={handleCopy}
          size={16}
          className="shrink-0 opacity-60 hover:opacity-100"
        />
        <SquareArrowOutUpRight
          onClick={handleOpen}
          size={14}
          className="shrink-0 opacity-60 hover:opacity-100"
        />
      </div>
    </div>
  );
}
