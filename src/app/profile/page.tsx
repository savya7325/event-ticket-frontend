"use client";

import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import PhotoCameraRoundedIcon from "@mui/icons-material/PhotoCameraRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import CurrencyRupeeRoundedIcon from "@mui/icons-material/CurrencyRupeeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { useRouter } from "next/navigation";
import UserShell, { useExpireSession } from "../components/UserShell";
import { initialsOf } from "../components/UserNavbar";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAuth } from "../context/AuthContext";
import { useMyBookings } from "../components/useMyBookings";
import { CardSkeleton, ErrorState, StatCard } from "../components/ui";
import {
  AuthError,
  Profile,
  avatarUrlOf,
  bookingTotal,
  formatINR,
  getProfile,
  removeAvatar,
  updateUsername,
  uploadAvatar,
} from "../components/userApi";
import { cardSx, eyebrowSx, ghostButtonSx, primaryButtonSx, ui } from "../components/theme";

type Snack = { severity: "success" | "error" | "info"; msg: string } | null;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: ui.text,
    borderRadius: 2.5,
    bgcolor: "rgba(0,0,0,0.2)",
    "& fieldset": { borderColor: ui.border },
    "&:hover fieldset": { borderColor: "rgba(167,139,250,0.5)" },
    "&.Mui-focused fieldset": { borderColor: ui.accent },
  },
};

function ProfileContent() {
  const { user, isAdmin, logout, updateUser } = useAuth();
  const router = useRouter();
  const expireSession = useExpireSession();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { bookings, loading: bookingsLoading } = useMyBookings();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [snack, setSnack] = useState<Snack>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const token = user?.token ?? "";

  const fail = (err: unknown, fallback: string) => {
    if (err instanceof AuthError) return expireSession();
    setSnack({ severity: "error", msg: err instanceof Error ? err.message : fallback });
  };

  const loadProfile = () => {
    setError(null);
    getProfile(token)
      .then(p => {
        setProfile(p);
        setNameInput(p.username);
        setAvatarUrl(avatarUrlOf(p.avatar));
      })
      .catch(err => (err instanceof AuthError ? expireSession() : setError(err.message)));
  };

  useEffect(() => {
    if (token) loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setSnack({ severity: "error", msg: "Please choose an image file." });
    if (file.size > 5 * 1024 * 1024) return setSnack({ severity: "error", msg: "Image must be smaller than 5 MB." });
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const cancelPreview = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setBusy(true);
    try {
      const data = await uploadAvatar(token, selectedFile);
      setAvatarUrl(data.avatarUrl);
      cancelPreview();
      setSnack({ severity: "success", msg: "Profile photo updated." });
    } catch (err) {
      fail(err, "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemovePhoto = async () => {
    setBusy(true);
    try {
      await removeAvatar(token);
      setAvatarUrl(undefined);
      setSnack({ severity: "success", msg: "Profile photo removed." });
    } catch (err) {
      fail(err, "Could not remove photo.");
    } finally {
      setBusy(false);
    }
  };

  const handleSaveName = async () => {
    const username = nameInput.trim();
    if (!username) return setSnack({ severity: "error", msg: "Name cannot be empty." });
    setBusy(true);
    try {
      const updated = await updateUsername(token, username);
      setProfile(p => (p ? { ...p, username: updated.username } : p));
      updateUser({ username: updated.username });
      setEditingName(false);
      setSnack({ severity: "success", msg: "Name updated." });
    } catch (err) {
      fail(err, "Could not update name.");
    } finally {
      setBusy(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={loadProfile} />;

  if (!profile) {
    return (
      <Box sx={{ display: "grid", gap: 3 }}>
        <CardSkeleton height={240} />
        <CardSkeleton height={200} />
      </Box>
    );
  }

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : null;
  const totalSeats = bookings.reduce((n, b) => n + b.seats.length, 0);
  const totalSpent = bookings.reduce((n, b) => n + bookingTotal(b), 0);

  return (
    <>
      {/* Identity card */}
      <Box sx={{ ...cardSx, overflow: "hidden", mb: 3 }}>
        <Box
          sx={{
            height: { xs: 110, md: 140 },
            background:
              "radial-gradient(500px 200px at 80% 0%, rgba(236,72,153,0.35), transparent 70%), linear-gradient(120deg, #4c1d95, #312e81 60%, #1e1b4b)",
          }}
        />
        <Box
          sx={{
            px: { xs: 2.5, md: 4 },
            pb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "flex-end" },
            gap: { xs: 2, sm: 3 },
            mt: { xs: -6, md: -7 },
          }}
        >
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={preview ?? avatarUrl}
              alt={profile.username}
              sx={{
                width: { xs: 104, md: 124 },
                height: { xs: 104, md: 124 },
                fontSize: 40,
                fontWeight: 800,
                background: ui.gradient,
                border: "4px solid #0d0a14",
                boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
              }}
            >
              {initialsOf(profile.username)}
            </Avatar>
            <IconButton
              aria-label="Change profile photo"
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              sx={{
                position: "absolute",
                right: 2,
                bottom: 2,
                width: 36,
                height: 36,
                color: "#fff",
                background: ui.gradient,
                border: "3px solid #0d0a14",
                "&:hover": { background: "linear-gradient(135deg, #a78bfa, #7c3aed)" },
              }}
            >
              <PhotoCameraRoundedIcon sx={{ fontSize: 17 }} />
            </IconButton>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileSelect} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 800, lineHeight: 1.2 }} noWrap>
              {profile.username}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.25, mt: 0.75 }}>
              <Box
                sx={{
                  px: 1.1,
                  py: 0.25,
                  borderRadius: 1.5,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  color: isAdmin ? ui.gold : ui.accentSoft,
                  bgcolor: isAdmin ? "rgba(252,211,77,0.12)" : "rgba(139,92,246,0.16)",
                }}
              >
                {isAdmin ? "ADMIN" : "MEMBER"}
              </Box>
              {memberSince && <Typography sx={{ fontSize: "0.82rem", color: ui.faint }}>Joined {memberSince}</Typography>}
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {selectedFile ? (
              <>
                <Button onClick={handleUpload} disabled={busy} sx={primaryButtonSx}>
                  {busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save photo"}
                </Button>
                <Button onClick={cancelPreview} disabled={busy} sx={ghostButtonSx}>
                  Cancel
                </Button>
              </>
            ) : (
              avatarUrl && (
                <Button onClick={handleRemovePhoto} disabled={busy} sx={{ ...ghostButtonSx, color: ui.danger }}>
                  Remove photo
                </Button>
              )
            )}
          </Box>
        </Box>
      </Box>

      {/* Stats (users only) */}
      {!isAdmin && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", sm: "repeat(3, minmax(0,1fr))" }, gap: 2, mb: 3 }}>
          {bookingsLoading ? (
            Array.from({ length: 3 }, (_, i) => <CardSkeleton key={i} height={92} />)
          ) : (
            <>
              <StatCard label="Bookings" value={bookings.length} icon={<ConfirmationNumberRoundedIcon />} />
              <StatCard label="Seats booked" value={totalSeats} icon={<EventSeatRoundedIcon />} />
              <StatCard label="Total spent" value={formatINR(totalSpent)} icon={<CurrencyRupeeRoundedIcon />} />
            </>
          )}
        </Box>
      )}

      {/* Account details */}
      <Box sx={{ ...cardSx, p: { xs: 2.5, md: 4 } }}>
        <Typography sx={eyebrowSx}>Account</Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", mt: 0.5, mb: 3 }}>Personal details</Typography>

        <DetailRow icon={<BadgeRoundedIcon />} label="Display name">
          {editingName ? (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.5 }}>
              <TextField
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSaveName()}
                size="small"
                autoFocus
                sx={{ ...fieldSx, minWidth: 240 }}
              />
              <Button onClick={handleSaveName} disabled={busy} sx={primaryButtonSx}>
                {busy ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setEditingName(false);
                  setNameInput(profile.username);
                }}
                sx={ghostButtonSx}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography sx={{ fontWeight: 600 }}>{profile.username}</Typography>
              <IconButton aria-label="Edit name" size="small" onClick={() => setEditingName(true)} sx={{ color: ui.accentSoft }}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
        </DetailRow>

        <DetailRow icon={<MailOutlineRoundedIcon />} label="Email address">
          <Typography sx={{ fontWeight: 600 }}>{profile.email}</Typography>
        </DetailRow>

        {memberSince && (
          <DetailRow icon={<CalendarTodayRoundedIcon />} label="Member since" last>
            <Typography sx={{ fontWeight: 600 }}>{memberSince}</Typography>
          </DetailRow>
        )}

        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${ui.border}`, display: "flex", justifyContent: "flex-end" }}>
          <Button
            startIcon={<LogoutRoundedIcon />}
            onClick={() => setConfirmLogout(true)}
            sx={{ ...ghostButtonSx, color: ui.danger, borderColor: "rgba(248,113,113,0.3)" }}
          >
            Log out
          </Button>
        </Box>
      </Box>

      <ConfirmDialog
        open={confirmLogout}
        tone="neutral"
        icon="logout"
        title="Log out of Evenza?"
        message="You'll need to sign in again to book tickets or see your bookings."
        confirmLabel="Log out"
        cancelLabel="Stay signed in"
        onConfirm={() => {
          logout();
          router.replace("/");
        }}
        onClose={() => setConfirmLogout(false)}
      />

      <Snackbar
        open={!!snack}
        autoHideDuration={3500}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snack ? (
          <Alert onClose={() => setSnack(null)} severity={snack.severity} variant="filled" sx={{ borderRadius: 2.5 }}>
            {snack.msg}
          </Alert>
        ) : undefined}
      </Snackbar>
    </>
  );
}

function DetailRow({ icon, label, children, last }: { icon: React.ReactNode; label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <Box sx={{ display: "flex", gap: 2, py: 2, borderBottom: last ? "none" : `1px solid ${ui.border}` }}>
      <Box sx={{ color: ui.accentSoft, mt: 0.25, "& svg": { fontSize: 21 } }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: "0.75rem", color: ui.faint, mb: 0.25 }}>{label}</Typography>
        {children}
      </Box>
    </Box>
  );
}

export default function ProfilePage() {
  return (
    <UserShell allowAdmin>
      <ProfileContent />
    </UserShell>
  );
}
