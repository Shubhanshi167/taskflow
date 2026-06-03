import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "axios";

function Section({ title, desc, children }) {
  return (
    <div style={{background:"var(--bg-card)",border:"1px solid var(--border-subtle)",borderRadius:"var(--radius-xl)",overflow:"hidden",marginBottom:"16px"}}>
      <div style={{padding:"20px 24px",borderBottom:"1px solid var(--border-subtle)"}}>
        <h3 style={{fontSize:"15px",fontWeight:700,fontFamily:"var(--font-display)",letterSpacing:"-0.01em",marginBottom:"3px"}}>{title}</h3>
        {desc && <p style={{fontSize:"13px",color:"var(--text-muted)",fontFamily:"var(--font-body)"}}>{desc}</p>}
      </div>
      <div style={{padding:"24px"}}>{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useContext(AuthContext);
  const { toast } = useToast();
  const [profile, setProfile] = useState({ username: user?.username || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ current:"", newPass:"", confirm:"" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    if (!profile.username.trim()) { toast("Username is required","error"); return; }
    setSavingProfile(true);
    try {
      await axios.put("/api/users/profile", { username: profile.username });
      toast("Profile updated!", "success");
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to update profile","error");
    } finally { setSavingProfile(false); }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.newPass) { toast("All fields required","error"); return; }
    if (passwords.newPass !== passwords.confirm)   { toast("Passwords don't match","error"); return; }
    if (passwords.newPass.length < 6) { toast("Password must be at least 6 characters","error"); return; }
    setSavingPass(true);
    try {
      await axios.put("/api/users/password", { currentPassword: passwords.current, newPassword: passwords.newPass });
      toast("Password updated!","success");
      setPasswords({ current:"", newPass:"", confirm:"" });
    } catch (err) {
      toast(err?.response?.data?.message || "Failed to update password","error");
    } finally { setSavingPass(false); }
  };

  const avatarLetter = user?.username?.[0]?.toUpperCase() || "?";

  return (
    <div style={{minHeight:"100vh",background:"var(--bg-primary)",paddingTop:"64px"}}>
      <div style={{maxWidth:"720px",margin:"0 auto",padding:"40px 24px"}}>
        <div className="animate-fade-up" style={{marginBottom:"32px"}}>
          <h1 style={{fontSize:"28px",fontWeight:800,fontFamily:"var(--font-display)",letterSpacing:"-0.03em",marginBottom:"6px"}}>
            Settings
          </h1>
          <p style={{fontSize:"14px",color:"var(--text-secondary)",fontFamily:"var(--font-body)"}}>
            Manage your account and preferences
          </p>
        </div>

        {/* Profile avatar */}
        <div className="animate-fade-up" style={{marginBottom:"24px",animationDelay:"60ms"}}>
          <Section title="Profile" desc="Your public identity on TaskFlow">
            <div style={{display:"flex",alignItems:"center",gap:"16px",marginBottom:"24px"}}>
              <div style={{
                width:"64px",height:"64px",borderRadius:"50%",
                background:"linear-gradient(135deg,#3b82f6,#8b5cf6)",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontFamily:"var(--font-display)",fontWeight:800,fontSize:"24px",color:"#fff",
                flexShrink:0,
              }}>{avatarLetter}</div>
              <div>
                <p style={{fontWeight:700,fontSize:"15px",fontFamily:"var(--font-display)",marginBottom:"3px"}}>{user?.username}</p>
                <p style={{fontSize:"13px",color:"var(--text-muted)",fontFamily:"var(--font-body)"}}>{user?.email}</p>
              </div>
            </div>
            <form onSubmit={saveProfile} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:600,color:"var(--text-secondary)",marginBottom:"7px",fontFamily:"var(--font-body)"}}>Username</label>
                <input type="text" value={profile.username} onChange={e => setProfile(p => ({...p,username:e.target.value}))}
                  className="input-field" />
              </div>
              <div>
                <label style={{display:"block",fontSize:"13px",fontWeight:600,color:"var(--text-secondary)",marginBottom:"7px",fontFamily:"var(--font-body)"}}>Email</label>
                <input type="email" value={profile.email} disabled className="input-field"
                  style={{opacity:0.6,cursor:"not-allowed"}} />
                <p style={{fontSize:"11px",color:"var(--text-muted)",marginTop:"5px",fontFamily:"var(--font-body)"}}>Email cannot be changed yet</p>
              </div>
              <button type="submit" className="btn-primary" disabled={savingProfile}
                style={{alignSelf:"flex-start",padding:"10px 24px",opacity:savingProfile?0.7:1}}>
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          </Section>
        </div>

        {/* Password */}
        <div className="animate-fade-up" style={{marginBottom:"24px",animationDelay:"100ms"}}>
          <Section title="Change password" desc="Use a strong password with at least 6 characters">
            <form onSubmit={savePassword} style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {[
                { key:"current",  label:"Current password",  ph:"Your current password" },
                { key:"newPass",  label:"New password",       ph:"Min. 6 characters" },
                { key:"confirm",  label:"Confirm new password",ph:"Repeat new password" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{display:"block",fontSize:"13px",fontWeight:600,color:"var(--text-secondary)",marginBottom:"7px",fontFamily:"var(--font-body)"}}>{f.label}</label>
                  <input type="password" placeholder={f.ph} value={passwords[f.key]}
                    onChange={e => setPasswords(p => ({...p,[f.key]:e.target.value}))}
                    className="input-field" />
                </div>
              ))}
              <button type="submit" className="btn-primary" disabled={savingPass}
                style={{alignSelf:"flex-start",padding:"10px 24px",opacity:savingPass?0.7:1}}>
                {savingPass ? "Updating..." : "Update password"}
              </button>
            </form>
          </Section>
        </div>

        {/* Danger zone */}
        <div className="animate-fade-up" style={{animationDelay:"140ms"}}>
          <div style={{background:"rgba(244,63,94,0.04)",border:"1px solid rgba(244,63,94,0.15)",borderRadius:"var(--radius-xl)",padding:"24px"}}>
            <h3 style={{fontSize:"15px",fontWeight:700,fontFamily:"var(--font-display)",color:"#f43f5e",marginBottom:"6px"}}>Danger zone</h3>
            <p style={{fontSize:"13px",color:"var(--text-muted)",fontFamily:"var(--font-body)",marginBottom:"16px"}}>
              These actions are irreversible. Proceed with caution.
            </p>
            <button onClick={logout} className="btn-danger" style={{fontSize:"13px"}}>
              ↩ Sign out of all devices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}