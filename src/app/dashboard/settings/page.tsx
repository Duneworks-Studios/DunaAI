"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const themes = [
  { id: "duna-dark", label: "Duna Dark" },
  { id: "duna-aurora", label: "Aurora Blue" },
  { id: "duna-noir", label: "Noir Contrast" },
];

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [image, setImage] = useState("");
  const [email, setEmail] = useState("");
  const [theme, setTheme] = useState("duna-dark");
  const [memory, setMemory] = useState("");
  const [memories, setMemories] = useState<{ id: string; content: string }[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const profileRes = await fetch("/api/user");
      if (profileRes.ok) {
        const profile = (await profileRes.json()) as {
          user: {
            name: string | null;
            username: string | null;
            image: string | null;
            email: string;
            themePreset: string | null;
          };
        };
        setName(profile.user.name ?? "");
        setUsername(profile.user.username ?? "");
        setImage(profile.user.image ?? "");
        setEmail(profile.user.email);
        setTheme(profile.user.themePreset ?? "duna-dark");
      } else {
        setName(session?.user?.name ?? "");
        setUsername(session?.user?.username ?? "");
        setImage(session?.user?.image ?? "");
        setEmail(session?.user?.email ?? "");
      }

      const res = await fetch("/api/memory");
      if (res.ok) {
        const j = (await res.json()) as {
          memories: { id: string; content: string }[];
          themePreset: string;
        };
        setMemories(j.memories);
        if (j.themePreset) setTheme(j.themePreset);
      }
    })().catch(() => null);
  }, [session?.user?.email, session?.user?.image, session?.user?.name, session?.user?.username]);

  async function saveProfile() {
    setSaving(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        username: username.trim(),
        image: image.trim() || null,
        themePreset: theme,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const payload = (await res.json().catch(() => null)) as { error?: string } | null;
      toast.error(payload?.error ?? "Could not save profile");
      return;
    }
    await update({ name, username, image: image.trim() || null });
    toast.success("Profile updated");
  }

  async function addMemory() {
    if (!memory.trim()) return;
    const res = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: memory }),
    });
    if (!res.ok) {
      toast.error("Could not save memory");
      return;
    }
    setMemory("");
    const list = await fetch("/api/memory").then((r) => r.json());
    setMemories(list.memories);
    toast.success("Saved to Duna Memory");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 p-6 lg:p-10">
      <div>
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Profile, themes, and Duna Memory for your workspace.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Email</label>
            <Input value={email} disabled />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Display name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Username</label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Avatar URL</label>
            <Input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://cdn.example.com/avatar.png"
            />
            <p className="text-xs text-muted-foreground">
              You can use any public image URL. If storage-backed uploads are added later, this will migrate safely.
            </p>
          </div>
          <Button onClick={() => void saveProfile()} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Theme customizer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-3">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs ${
                  theme === t.id
                    ? "border-sky-500/50 bg-sky-500/10 text-white"
                    : "border-white/10 text-muted-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={() => void saveProfile()}>
            Apply theme
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Duna Memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <textarea
            className="min-h-[100px] w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm outline-none focus:border-sky-500/40"
            placeholder="Paste architecture notes, APIs, or conventions the assistant should remember."
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
          />
          <Button type="button" variant="secondary" onClick={() => void addMemory()}>
            Save memory
          </Button>
          <ul className="space-y-2 text-xs text-muted-foreground">
            {memories.map((m) => (
              <li key={m.id} className="rounded-md border border-white/5 bg-white/[0.02] p-2">
                {m.content.slice(0, 200)}
                {m.content.length > 200 ? "…" : ""}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
