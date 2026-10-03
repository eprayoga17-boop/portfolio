"use client";
import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Star, Trash, UploadSimple } from "@phosphor-icons/react";
import { addImage, deleteImage, moveImage, setCover, updateImageAlt, type ActionResult } from "@/app/admin/actions";
import { STORAGE_BUCKET, imageUrl } from "@/lib/images";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import type { ProjectImage } from "@/lib/types";

const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 25 * 1024 * 1024; // before re-encoding; the bucket itself caps stored files at 8 MB
const MAX_EDGE = 2560;

/**
 * Re-encodes in the browser to WebP (max 2560px). Besides saving space this
 * strips EXIF metadata, which can hold GPS location and camera serials.
 */
async function toWebp(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/webp", 0.86),
  );
  return { blob, width, height };
}

export function ImageManager({
  projectId,
  images,
  coverPath,
}: {
  projectId: string;
  images: ProjectImage[];
  coverPath: string | null;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  const report = (r: ActionResult, success?: string) => {
    setMsg(r.ok ? { ok: true, text: r.message ?? success ?? "Done." } : { ok: false, text: r.error });
    if (r.ok) router.refresh();
  };

  const upload = () =>
    startTransition(async () => {
      setMsg(null);
      if (!file) return setMsg({ ok: false, text: "Choose an image first." });
      if (!ACCEPT.includes(file.type)) return setMsg({ ok: false, text: "Use JPG, PNG, WebP or AVIF. SVG isn't allowed." });
      if (file.size > MAX_BYTES) return setMsg({ ok: false, text: "That file is over 25 MB." });
      if (alt.trim().length === 0) return setMsg({ ok: false, text: "Write alt text first. Describe what's in the image." });

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return setMsg({ ok: false, text: "Storage isn't configured." });

      let encoded;
      try {
        encoded = await toWebp(file);
      } catch {
        return setMsg({ ok: false, text: "Couldn't read that image." });
      }
      const path = `projects/${projectId}/${crypto.randomUUID()}.webp`;
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, encoded.blob, { contentType: "image/webp", upsert: false, cacheControl: "31536000" });
      if (error) return setMsg({ ok: false, text: "Upload was rejected. Is your session still MFA-verified?" });

      const r = await addImage({ projectId, path, alt: alt.trim(), width: encoded.width, height: encoded.height });
      if (!r.ok) await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      report(r, "Image added.");
      if (r.ok) {
        setFile(null);
        setAlt("");
        if (fileInput.current) fileInput.current.value = "";
      }
    });

  return (
    <section aria-labelledby="images-title" className="grid gap-6">
      <h2 id="images-title" className="display text-2xl">
        Images
      </h2>

      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={`chamfer px-4 py-3 font-semibold ${msg.ok ? "bg-cobalt text-on-cobalt" : "bg-orange text-on-orange"}`}
        >
          {msg.text}
        </p>
      )}

      <div className="chamfer-lg grid gap-4 bg-surface-2 p-5">
        <div>
          <label htmlFor="file" className="mb-1.5 block text-sm font-bold">
            Image file
          </label>
          <input
            ref={fileInput}
            id="file"
            type="file"
            accept={ACCEPT.join(",")}
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:font-bold file:text-paper"
          />
          <p className="mt-1 text-xs text-muted">Converted to WebP in your browser (max 2560px) and stripped of metadata.</p>
        </div>
        <div>
          <label htmlFor="alt" className="mb-1.5 block text-sm font-bold">
            Alt text
          </label>
          <input
            id="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            maxLength={300}
            placeholder="e.g. Mie Umi Instagram grid with green noodle bowls"
            className="w-full bg-surface px-3 py-2.5 outline-none ring-[1.5px] ring-muted focus:ring-[3px] focus:ring-cobalt"
          />
        </div>
        <button type="button" onClick={upload} disabled={busy} className="btn btn-primary chamfer w-fit">
          <UploadSimple size={18} weight="bold" aria-hidden /> {busy ? "Working..." : "Upload image"}
        </button>
      </div>

      {images.length === 0 ? (
        <p className="text-muted">No images yet. The first one you upload can be set as the cover.</p>
      ) : (
        <ol className="grid gap-4">
          {images.map((img, i) => (
            <li key={img.id} className="chamfer grid gap-4 bg-surface p-3 ring-1 ring-line md:grid-cols-[180px_1fr_auto]">
              <div className="relative aspect-video overflow-hidden bg-surface-2">
                <Image src={imageUrl(img.path)} alt="" fill sizes="180px" className="object-cover" />
              </div>
              <form
                className="grid content-start gap-2"
                action={(fd) =>
                  startTransition(async () => report(await updateImageAlt(img.id, String(fd.get("alt") ?? ""))))
                }
              >
                <label htmlFor={`alt-${img.id}`} className="text-sm font-bold">
                  Alt text {coverPath === img.path && <span className="ml-2 bg-orange px-1.5 text-xs text-on-orange">Cover</span>}
                </label>
                <input
                  id={`alt-${img.id}`}
                  name="alt"
                  defaultValue={img.alt}
                  maxLength={300}
                  className="w-full bg-paper px-3 py-2 outline-none ring-[1.5px] ring-muted focus:ring-[3px] focus:ring-cobalt"
                />
                <button className="w-fit text-sm font-bold underline underline-offset-4" disabled={busy}>
                  Save alt text
                </button>
              </form>
              <div className="flex items-start gap-1">
                <IconBtn label="Move up" disabled={busy || i === 0} onClick={() => startTransition(async () => report(await moveImage(projectId, img.id, "up")))}>
                  <ArrowUp size={18} weight="bold" />
                </IconBtn>
                <IconBtn label="Move down" disabled={busy || i === images.length - 1} onClick={() => startTransition(async () => report(await moveImage(projectId, img.id, "down")))}>
                  <ArrowDown size={18} weight="bold" />
                </IconBtn>
                <IconBtn label="Use as cover" disabled={busy} onClick={() => startTransition(async () => report(await setCover(projectId, img.id)))}>
                  <Star size={18} weight="bold" />
                </IconBtn>
                <IconBtn label="Delete image" disabled={busy} onClick={() => startTransition(async () => report(await deleteImage(img.id), "Image deleted."))}>
                  <Trash size={18} weight="bold" />
                </IconBtn>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function IconBtn({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="chamfer grid h-11 w-11 place-items-center bg-surface-2 hover:bg-orange hover:text-on-orange disabled:opacity-40"
    >
      {children}
    </button>
  );
}
