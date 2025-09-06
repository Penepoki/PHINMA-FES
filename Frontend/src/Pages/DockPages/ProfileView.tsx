import React, { useEffect, useRef, useState } from "react";
import BreadAndLogout from "../../Components/Bread and Logout";

interface ProfileProps {
  setActiveView: (view: string) => void;
}

type MeResponse = {
  id: number;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string | null;
  // add any other fields your serializer returns
};

const API_BASE = "https://api.phinma-fes.com"; // adjust if needed

export default function Profile({ setActiveView }: ProfileProps) {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [profileData, setProfileData] = useState({
    name: "User",
    email: "",
    joined: "", // optional
    avatar: "",
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState<number>(Date.now());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Helpers
  const getToken = () => localStorage.getItem("token");
  const authHeaders = () => ({ Authorization: `Token ${getToken()}` });

  // 1) Load current user on mount so avatar persists across routes
  useEffect(() => {
    (async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await fetch(`${API_BASE}/user-dashboard/`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`GET /user-dashboard/ failed: ${res.status}`);
        const user: MeResponse = await res.json();
        setMe(user);
        const name =
          user.full_name ||
          [user.first_name || "", user.last_name || ""].join(" ").trim() ||
          "User";
        setProfileData(p => ({
          ...p,
          name,
          email: user.email || "",
          avatar: user.profile_image || "",
        }));
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || "Failed to load profile.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new && passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }

    try {
      // OPTIONAL: if you allow editing name or password here, PATCH those endpoints
      // Example (name fields):
      const body: Record<string, any> = {};
      // If you keep a name field editable, split to first/last or send full_name if your serializer supports it
      // body.first_name = ...
      // body.last_name = ...

      if (Object.keys(body).length) {
        const res = await fetch(`${API_BASE}/user-dashboard/`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error(`PATCH /user-dashboard/ failed: ${res.status}`);
        const updated: MeResponse = await res.json();
        setMe(updated);
      }

      // OPTIONAL: change password endpoint (not shown here)
      alert("Profile changes saved!");
    } catch (err: any) {
      console.error(err);
      alert(err?.message || "Failed to save changes");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg(null);
    const file = e.target.files?.[0];
    if (!file || !me) return;

    // basic client-side validation
    if (!/^image\/(png|jpe?g|webp|avif)$/.test(file.type)) {
      setErrorMsg("Please upload a PNG, JPG, WEBP, or AVIF image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File too large. Max 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setUploading(true);
      setProgress(5);

      // Decide a stable logical path; backend appends a uuid
      // Example: users/<id>/profile
      const logicalPath = `users/${me.id}/profile`;

      // 1) get presigned URL
      const presignRes = await fetch(`${API_BASE}/api/uploads/presign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ path: logicalPath, contentType: file.type }),
      });
      if (!presignRes.ok) {
        const txt = await presignRes.text();
        throw new Error(`Presign failed (${presignRes.status}): ${txt}`);
      }
      const { uploadUrl, fileUrl } = await presignRes.json();
      setProgress(25);

      // 2) PUT directly to storage (track progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = evt => {
          if (evt.lengthComputable) {
            const pct = 25 + Math.round((evt.loaded / evt.total) * 70);
            setProgress(Math.min(95, pct));
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(100);
            resolve();
          } else {
            reject(new Error(`Upload failed (${xhr.status})`));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      // 3) Persist to user record so it survives navigation
      const patchRes = await fetch(`${API_BASE}/user-dashboard/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ profile_image: fileUrl }),
      });
      if (!patchRes.ok) {
        const txt = await patchRes.text();
        throw new Error(`Saving avatar failed (${patchRes.status}): ${txt}`);
      }
      const updated: MeResponse = await patchRes.json();
      setMe(updated);

      // 4) Update UI immediately
      setProfileData(prev => ({ ...prev, avatar: fileUrl }));
      setCacheBust(Date.now());
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="custom-container">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[{ label: "Home", view: "home" }, { label: "Profile" }]}
      />

      <div className="profile-page z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-4 md:flex-row md:p-8">
        {/* Profile Card */}
        <div className="flex h-1/2 w-full flex-col items-center justify-center rounded-xl p-6 text-white shadow-2xl backdrop-blur-lg md:h-full md:w-1/2">
          <div className="avatar">
            <div className="ring-primary ring-offset-base-100 w-40 rounded-full ring ring-offset-2 md:w-72 overflow-hidden bg-white/5">
              {profileData.avatar ? (
                <img
                  src={`${profileData.avatar}?v=${cacheBust}`}
                  alt="User Avatar"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-300">
                  No photo
                </div>
              )}
            </div>
          </div>

          <h2 className="mt-4 text-4xl font-bold">{profileData.name}</h2>
          <p className="text-gray-300">Dean View</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={handleFileChange}
            className="file-input file-input-md file-input-primary file-input-ghost mt-4 file:text-white"
          />

          {/* Upload progress / errors */}
          {uploading && (
            <div className="mt-3 w-full max-w-xs">
              <progress className="progress progress-primary w-full" value={progress} max={100} />
              <div className="mt-1 text-center text-sm text-gray-300">{progress}%</div>
            </div>
          )}
          {errorMsg && <div className="mt-3 text-sm text-red-300">{errorMsg}</div>}
        </div>

        {/* Profile Details */}
        <div className="h-full w-full overflow-x-clip overflow-y-auto rounded-xl p-12 text-white shadow-2xl backdrop-blur-lg md:w-1/2">
          <h3 className="mb-4 text-2xl font-bold">Profile Information</h3>
          <span className="mb-6 block font-thin text-[#888888]">
            Manage your personal details and preferences so everything stays accurate and tailored to you.
          </span>

          <form onSubmit={handleSave} className="space-y-4 text-lg">
            <div>
              <label className="mb-1 block text-sm">Email</label>
              <input
                name="email"
                value={profileData.email}
                onChange={handleChange}
                type="email"
                className="input input-bordered w-full text-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm">Joined</label>
              <input
                value={profileData.joined}
                type="text"
                disabled
                className="input input-bordered w-full cursor-not-allowed bg-gray-100 text-gray-500"
              />
            </div>

            <hr className="my-4 border-gray-500" />

            <h4 className="text-xl font-semibold">Change Password</h4>
            {["current", "new", "confirm"].map(field => (
              <div key={field} className="relative">
                <label className="mb-1 block text-sm capitalize">
                  {field === "confirm" ? "Confirm New Password" : `${field} Password`}
                </label>
                <input
                  type={showPassword[field as keyof typeof showPassword] ? "text" : "password"}
                  name={field}
                  value={passwords[field as keyof typeof passwords]}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full pr-10 text-black"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(prev => ({ ...prev, [field]: !prev[field as keyof typeof prev] }))
                  }
                  className="absolute right-3 top-9 -translate-y-1/2 transform text-gray-500"
                >
                  {showPassword[field as keyof typeof showPassword] ? "🙈" : "👁️"}
                </button>
              </div>
            ))}

            <button type="submit" className="btn btn-primary mt-4 w-full text-white md:w-auto">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
