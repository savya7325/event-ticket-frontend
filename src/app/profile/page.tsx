"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button,
  Avatar,
  IconButton,
  Stack,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface User {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  avatarUrl?: string | null;
}


export default function ProfilePage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; severity: "success" | "error" | "info"; msg: string }>({
    open: false,
    severity: "info",
    msg: "",
  });
  const [editingName, setEditingName] = useState<boolean>(false);
  const [nameInput, setNameInput] = useState<string>("");

  

  // === Fetch profile on mount ===
    useEffect(() => {
  setMounted(true);
}, []);

useEffect(() => {
  if (!mounted) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const token = JSON.parse(userStr).token;

    fetch(`${API_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await res.json();
        setUser(data.user);
        setNameInput(data.user?.username ?? "");
      })
      .catch((err) => {
        console.error(err);
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [router]);

  // cleanup object URL when selected file changes/unmount
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // === Helpers for showing snackbars ===
  const showSnack = (severity: "success" | "error" | "info", msg: string) => {
    setSnack({ open: true, severity, msg });
  };
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  // === File select handler (from hidden input) ===
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    // Basic client-side validation (image type & size example: < 5MB)
    if (!file.type.startsWith("image/")) {
      showSnack("error", "Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showSnack("error", "Please select an image smaller than 5MB.");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  // === Upload file to backend (multer endpoint) ===
  const handleUpload = async () => {
    if (!selectedFile) {
      showSnack("info", "Choose an image first.");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const token = JSON.parse(userStr).token;

    const formData = new FormData();
    formData.append("avatar", selectedFile);

    try {
      setUploading(true);
      const res = await fetch(`${API_URL}/api/users/profile/avatar`, {
        method: "PUT", 
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });


      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Upload failed");
      }

      const data = await res.json();
      // Expecting backend to return updated user or avatar URL
      setUser((u) => (u ? { ...u, avatarUrl: data.avatarUrl ?? data.user?.avatarUrl ?? u.avatarUrl } : u));
      setSelectedFile(null);
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
      showSnack("success", "Profile photo updated.");
    } catch (err: any) {
      console.error(err);
      showSnack("error", err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // === Remove profile photo (ask backend to remove or just clear) ===
  const handleRemovePhoto = async () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.push("/");
      return;
    }
    const token = JSON.parse(userStr).token;

    try {
      setUploading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${API_URL}/api/users/profile/avatar`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Could not remove avatar");
      setUser((u) => (u ? { ...u, avatarUrl: null } : u));
      showSnack("success", "Profile photo removed.");
    } catch (err) {
      console.error(err);
      showSnack("error", "Failed to remove photo.");
    } finally {
      setUploading(false);
    }
  };

  // === Update display name example (PUT) ===
  const handleSaveName = async () => {
    if (!nameInput.trim()) {
      showSnack("error", "Name cannot be empty.");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const token = JSON.parse(userStr).token;
    try {
      setUploading(true);

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput }),
      });

      if (!res.ok) throw new Error("Failed to update name");
      const data = await res.json();
      setUser((u) => (u ? { ...u, username: data.user?.username ?? nameInput } : u));
      const storedUser = JSON.parse(localStorage.getItem("user")!);
      storedUser.username = data.user?.username ?? nameInput;
      localStorage.setItem("user", JSON.stringify(storedUser));

      setEditingName(false);
      showSnack("success", "Name updated.");
    } catch (err) {
      console.error(err);
      showSnack("error", "Could not update name.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return null; // already redirected in useEffect, but keep safe
  }

  const initials = user.username
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg,#071013 0%, #0b2436 60%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 920,
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          color: "text.primary",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
          {/* Left: Avatar / Upload */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: { xs: "100%", md: 280 } }}>
            <Box sx={{ position: "relative" }}>
              <Avatar
               src={
                  preview ??
                  (user.avatarUrl
                    ? user.avatarUrl.startsWith("http")
                      ? user.avatarUrl
                      : `${API_URL}${user.avatarUrl}`
                    : undefined)
                }
                alt={user.username}
                sx={{ width: 160, height: 160, fontSize: 48, bgcolor: "#2e7d32" }}
              >
                {initials}
              </Avatar>
              <IconButton
                aria-label="upload picture"
                onClick={() => fileRef.current?.click()}
                sx={{
                  position: "absolute",
                  bottom: 6,
                  right: 6,
                  bgcolor: "rgba(255,255,255,0.9)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                }}
                size="large"
              >
                <CameraAltIcon />
              </IconButton>
            </Box>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                sx={{ textTransform: "none" }}
              >
                {uploading ? <CircularProgress size={20} /> : "Upload"}
              </Button>

              <Button
                variant="outlined"
                onClick={handleRemovePhoto}
                disabled={uploading || (!user.avatarUrl && !preview)}
                startIcon={<DeleteIcon />}
                sx={{ textTransform: "none" }}
              >
                Remove
              </Button>
            </Stack>
          </Box>

          {/* Right: Details */}
          <Box sx={{ flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Profile
              </Typography>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>

                {!editingName ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" sx={{ mt: 0.5 }}>
                      {user.username}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingName(true);
                        setNameInput(user.username);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ) : (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="center">
                    <TextField
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      size="small"
                      sx={{ maxWidth: 360 }}
                    />
                    <Button variant="contained" onClick={handleSaveName} disabled={uploading}>
                      {uploading ? <CircularProgress size={18} /> : "Save"}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setEditingName(false);
                        setNameInput(user.username);
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>


              <Button variant="contained" onClick={() => router.push("/events")} sx={{ textTransform: "none" }}>
                Back to Events
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={closeSnack}>
        <Alert onClose={closeSnack} severity={snack.severity} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
