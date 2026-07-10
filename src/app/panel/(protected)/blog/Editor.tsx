"use client";

import { useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useEditor, useEditorState, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Markdown, type MarkdownStorage } from "tiptap-markdown";

// tiptap-markdown v0.9 `MarkdownStorage`'i export eder ama @tiptap/core'un
// (augment edilmek üzere boş bırakılmış) `Storage` arayüzünü GENİŞLETMEZ; bu
// yüzden `editor.storage.markdown` tipi eksik. Aşağıdaki augmentation onu ekler
// ki çağrı yeri sözleşmedeki gibi `editor.storage.markdown.getMarkdown()` kalsın.
declare module "@tiptap/core" {
  interface Storage {
    markdown: MarkdownStorage;
  }
}

type Props = {
  initialMarkdown: string;
  onChange: (md: string) => void;
};

function ToolbarButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active ?? false}
      title={label}
      onClick={onClick}
      className={`rounded px-2.5 py-1.5 text-sm text-forest transition-colors hover:bg-cream ${
        active ? "bg-cream" : ""
      }`}
    >
      {children}
    </button>
  );
}

function Separator() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-stone" />;
}

export default function Editor({ initialMarkdown, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // SSR (App Router) hidrasyon uyuşmazlığını önler
    extensions: [
      // Tiptap v3'te StarterKit Link'i içerir — ayrı eklenti gerekmez.
      StarterKit.configure({ link: { openOnClick: false } }),
      Image,
      Markdown,
    ],
    content: initialMarkdown, // tiptap-markdown içerik olarak markdown'ı ayrıştırır
    editorProps: {
      attributes: {
        class: "article-prose min-h-[20rem] bg-warm-white p-4 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
  });

  // Araç çubuğu aktif-biçim durumları için reaktif seçici (v3 önerdiği yol;
  // useEditor varsayılan olarak her işlemde yeniden render etmez).
  const active = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      h3: editor?.isActive("heading", { level: 3 }) ?? false,
      bulletList: editor?.isActive("bulletList") ?? false,
      orderedList: editor?.isActive("orderedList") ?? false,
      blockquote: editor?.isActive("blockquote") ?? false,
      link: editor?.isActive("link") ?? false,
    }),
  });

  if (!editor) {
    return (
      <div className="min-h-[20rem] rounded-lg border border-stone bg-warm-white p-4 text-forest-muted shadow-sm">
        Editör yükleniyor…
      </div>
    );
  }

  function openLinkPrompt() {
    if (!editor) return;
    const previousHref = editor.getAttributes("link").href;
    const previous = typeof previousHref === "string" ? previousHref : "";
    const url = window.prompt("Bağlantı adresi (URL):", previous);
    if (url === null) return; // iptal edildi
    const trimmed = url.trim();
    if (trimmed === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
  }

  async function handleImageSelected(e: ChangeEvent<HTMLInputElement>) {
    if (!editor) return;
    const file = e.target.files?.[0];
    e.target.value = ""; // aynı dosyanın tekrar seçilebilmesi için sıfırla
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("dosya", file); // endpoint alan adı: "dosya"
      // trailingSlash:true — sonu "/" olan URL'e POST (308 yönlendirmesi olmadan).
      const res = await fetch("/panel/blog/gorsel/", {
        method: "POST",
        body: formData,
      });
      const data: { url?: string; hata?: string } | null = await res
        .json()
        .catch(() => null);
      if (!res.ok || !data?.url) {
        setUploadError(data?.hata ?? "Görsel yüklenemedi. Lütfen tekrar deneyin.");
        return;
      }
      editor.chain().focus().setImage({ src: data.url }).run();
    } catch {
      setUploadError("Görsel yüklenemedi. Lütfen tekrar deneyin.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-stone shadow-sm">
      <div className="flex flex-wrap items-center gap-1 border-b border-stone bg-cream p-2">
        <ToolbarButton
          label="Kalın"
          active={active?.bold}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <span className="font-bold">Kalın</span>
        </ToolbarButton>
        <ToolbarButton
          label="İtalik"
          active={active?.italic}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <span className="italic">İtalik</span>
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Başlık (H2)"
          active={active?.h2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          Başlık
        </ToolbarButton>
        <ToolbarButton
          label="Alt başlık (H3)"
          active={active?.h3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          Alt başlık
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Madde listesi"
          active={active?.bulletList}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          Madde listesi
        </ToolbarButton>
        <ToolbarButton
          label="Numaralı liste"
          active={active?.orderedList}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          Numaralı liste
        </ToolbarButton>
        <ToolbarButton
          label="Alıntı"
          active={active?.blockquote}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          Alıntı
        </ToolbarButton>

        <Separator />

        <ToolbarButton
          label="Bağlantı ekle"
          active={active?.link}
          onClick={openLinkPrompt}
        >
          Bağlantı
        </ToolbarButton>
        <ToolbarButton
          label="Görsel ekle"
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? "Yükleniyor…" : "Görsel"}
        </ToolbarButton>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleImageSelected}
      />

      <EditorContent editor={editor} />

      {uploadError && (
        <p className="mt-2 text-sm font-semibold text-forest">{uploadError}</p>
      )}
    </div>
  );
}
