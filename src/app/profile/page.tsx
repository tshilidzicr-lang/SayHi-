"use client";

export const dynamic = "force-dynamic";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/ui/BottomNav";
import { Camera, LogOut, Save, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { supabaseUser, profile, loading } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();

  const isSetup = searchParams.get("setup") === "true";

  const supabase = createClient();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [age, setAge] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !supabaseUser) {
      router.replace("/auth");
    }
  }, [supabaseUser, loading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setBio(profile.bio || "");
      setAge(profile.age?.toString() || "");
      setPhotoUrl(profile.photo_url || "");
    }
  }, [profile]);

  const saveProfile = async () => {
    if (!supabaseUser) return;

    setSaving(true);

    try {
      const uid = (supabaseUser as any)?.id;

      await supabase.from("users").upsert({
        id: uid,
        name,
        bio,
        age: age ? parseInt(age) : null,
        photo_url: photoUrl,
      });
