import React, {useEffect, useRef, useState} from "react";
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
    profile_picture_url?: string | null;
    // add any other fields your serializer returns
};

const API_BASE = "https://api.phinma-fes.com"; // adjust if needed

export default function Profile({setActiveView}: ProfileProps) {
    const [me, setMe] = useState<MeResponse | null>(null);
  const [profileData, setProfileData] = useState({
      name: "User",
      email: "",
      first_name: "",
      last_name: "",
      joined: "", // optional
      avatar: "",
  });

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
    const [otp, setOtp] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cacheBust, setCacheBust] = useState<number>(Date.now());

  const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Helpers
    const getToken = () => localStorage.getItem("token");
    const authHeaders = () => ({Authorization: `Token ${getToken()}`});

    // 1) Load current user on mount so avatar persists across routes
    useEffect(() => {
        (async () => {
            const token = getToken();
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/user-profile/`, {headers: authHeaders()});
                if (!res.ok) throw new Error(`GET /user-profile/ failed: ${res.status}`);
                const user: MeResponse = await res.json();
                setMe(user);
                const name =
                    user.full_name ||
                    [user.first_name || "", user.last_name || ""].join(" ").trim() ||
                    "User";
                setProfileData((p) => ({
                    ...p,
                    name,
                    email: user.email || "",
                    first_name: user.first_name || "",
                    last_name: user.last_name || "",
                    avatar: user.profile_picture_url || "",
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
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
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
            if (profileData.first_name !== undefined) body.first_name = profileData.first_name;
            if (profileData.last_name !== undefined) body.last_name = profileData.last_name;
            if (profileData.email !== undefined) body.email = profileData.email;

            if (Object.keys(body).length) {
                const res = await fetch(`${API_BASE}/user-profile/`, {
                    method: "PATCH",
                    headers: {"Content-Type": "application/json", ...authHeaders()},
                    body: JSON.stringify(body),
                });
                if (!res.ok) throw new Error(`PATCH /user-profile/ failed: ${res.status}`);
                const updated: MeResponse = await res.json();
                setMe(updated);
                setProfileData((p) => ({
                    ...p,
                    email: updated.email || p.email,
                    first_name: updated.first_name || p.first_name,
                    last_name: updated.last_name || p.last_name,
                    name: (updated.full_name) || `${updated.first_name || ''} ${updated.last_name || ''}`.trim()
                }));
            }

            // Change password if provided and OTP verified
            if (otpVerified && passwords.new) {
                const res2 = await fetch(`${API_BASE}/user-profile/change-password/`, {
                    method: "POST",
                    headers: {"Content-Type": "application/json", ...authHeaders()},
                    body: JSON.stringify({
                        old_password: passwords.current,
                        new_password: passwords.new,
                        otp
                    })
                });
                const data2 = await res2.json();
                if (!res2.ok) throw new Error(data2?.detail || data2?.message || `Change password failed: ${res2.status}`);
            }

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
        // Local upload via multipart form-data
        const form = new FormData();
        form.append("avatar", file);
        const uploadRes = await fetch(`${API_BASE}/user-profile/upload-avatar/`, {
        method: "POST",
            headers: {...authHeaders()},
            body: form,
      });
        if (!uploadRes.ok) {
            const txt = await uploadRes.text();
            throw new Error(`Upload failed (${uploadRes.status}): ${txt}`);
        }
        const updated: MeResponse = await uploadRes.json();
        setMe(updated);
        // 4) Update UI immediately
        setProfileData((prev) => ({...prev, avatar: updated.profile_picture_url || prev.avatar}));
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
        breadcrumbs={[{label: "Home", view: "home"}, {label: "Profile"}]}
      />

      <div className="profile-page z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-4 md:flex-row md:p-8">
          {/* Profile Card */}
        <div className="flex h-1/2 w-full flex-col items-center justify-center rounded-xl p-6 text-white shadow-2xl backdrop-blur-lg md:h-full md:w-1/2">
          <div className="avatar">
              <div
                  className="ring-primary ring-offset-base-100 w-40 overflow-hidden rounded-full bg-white/5 ring ring-offset-2 md:w-72">
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
            Manage your personal details and preferences so everything stays accurate and tailored
            to you.
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                      <label className="mb-1 block text-sm">First name</label>
                      <input
                          name="first_name"
                          value={profileData.first_name}
                          onChange={handleChange}
                          type="text"
                          className="input input-bordered w-full text-black"
                      />
                  </div>
                  <div>
                      <label className="mb-1 block text-sm">Last name</label>
                      <input
                          name="last_name"
                          value={profileData.last_name}
                          onChange={handleChange}
                          type="text"
                          className="input input-bordered w-full text-black"
                      />
                  </div>
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

              {!otpRequested && (
                  <button
                      type="button"
                      className="btn btn-outline btn-primary mb-2"
                      onClick={async () => {
                          try {
                              const res = await fetch(`${API_BASE}/user-profile/request-otp/`, {
                                  method: "POST",
                                  headers: {"Content-Type": "application/json", ...authHeaders()},
                              });
                              if (!res.ok) throw new Error(`Request OTP failed: ${res.status}`);
                              setOtpRequested(true);
                              alert("OTP sent to your email.");
                          } catch (err: any) {
                              alert(err?.message || "Failed to request OTP");
                          }
                      }}
                  >
                      Request OTP
                  </button>
              )}

              {otpRequested && !otpVerified && (
                  <div className="space-y-2">
                      <label className="mb-1 block text-sm">Enter OTP from your email</label>
                      <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="input input-bordered w-full text-black"
                      />
                      <button
                          type="button"
                          className="btn btn-success"
                          onClick={async () => {
                              try {
                                  const res = await fetch(`${API_BASE}/user-profile/verify-otp/`, {
                                      method: "POST",
                                      headers: {"Content-Type": "application/json", ...authHeaders()},
                                      body: JSON.stringify({otp})
                                  });
                                  const data = await res.json();
                                  if (!res.ok) throw new Error(data?.detail || data?.message || `Verify OTP failed: ${res.status}`);
                                  setOtpVerified(true);
                                  alert("OTP verified. You can now change your password.");
                              } catch (err: any) {
                                  alert(err?.message || "Failed to verify OTP");
                              }
                          }}
                      >
                          Verify OTP
                      </button>
                  </div>
              )}

              {otpVerified && ["current", "new", "confirm"].map((field) => (
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
                      setShowPassword((prev) => ({
                          ...prev,
                          [field]: !prev[field as keyof typeof prev],
                      }))
                  }
                  className="absolute top-9 right-3 -translate-y-1/2 transform text-gray-500"
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
