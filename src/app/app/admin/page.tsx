"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  status: string | null;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState<number>(0);
  const [activeUserCount, setActiveUserCount] = useState<number>(0);
  const [adminCount, setAdminCount] = useState<number>(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setIsAdmin(!!data?.is_admin));
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      supabase
        .from("profiles")
        .select("id, email, name, is_admin, status")
        .then(({ data }) => {
          setProfiles(data || []);
          setLoading(false);
          if (data) {
            setUserCount(data.length);
            setActiveUserCount(data.filter((p) => p.status !== "banned").length);
            setAdminCount(data.filter((p) => p.is_admin).length);
          }
        });
    }
  }, [isAdmin]);

  const toggleAdmin = async (id: string, current: boolean) => {
    await supabase.from("profiles").update({ is_admin: !current }).eq("id", id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, is_admin: !current } : p)));
  };

  const banUser = async (id: string) => {
    await supabase.from("profiles").update({ status: "banned" }).eq("id", id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status: "banned" } : p)));
  };

  if (isAdmin === null) return <div style={{ padding: 32 }}>Loading...</div>;
  if (!isAdmin) return <div style={{ padding: 32, color: "red" }}>Access Denied</div>;

  return (
    <div style={{ padding: 32 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Admin Dashboard</h1>
      <p>Welcome, admin! Here you can manage users, content, and view analytics.</p>
      <div style={{ margin: '24px 0', display: 'flex', gap: 32 }}>
        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 12, minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Total Users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{userCount}</div>
        </div>
        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 12, minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Active Users</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{activeUserCount}</div>
        </div>
        <div style={{ background: '#f7fafc', padding: 16, borderRadius: 12, minWidth: 120, textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Admins</div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{adminCount}</div>
        </div>
      </div>
      <h2 style={{ marginTop: 32, fontSize: 24 }}>User Management</h2>
      {loading ? (
        <div>Loading users...</div>
      ) : (
        <table style={{ width: "100%", marginTop: 16, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f7fafc" }}>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Email</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Name</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Admin</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Status</th>
              <th style={{ padding: 8, border: "1px solid #eee" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => (
              <tr key={profile.id} style={{ background: profile.status === "banned" ? "#ffeaea" : "#fff" }}>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{profile.email}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{profile.name}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{profile.is_admin ? "Yes" : "No"}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>{profile.status || "active"}</td>
                <td style={{ padding: 8, border: "1px solid #eee" }}>
                  <button
                    onClick={() => toggleAdmin(profile.id, profile.is_admin)}
                    style={{ marginRight: 8, padding: "4px 12px", borderRadius: 6, background: profile.is_admin ? "#eee" : "#FFD600", color: profile.is_admin ? "#333" : "#1A2A4F", border: "none", fontWeight: 600 }}
                  >
                    {profile.is_admin ? "Revoke Admin" : "Make Admin"}
                  </button>
                  <button
                    onClick={() => banUser(profile.id)}
                    disabled={profile.status === "banned"}
                    style={{ padding: "4px 12px", borderRadius: 6, background: "#ff4d4f", color: "#fff", border: "none", fontWeight: 600, opacity: profile.status === "banned" ? 0.5 : 1 }}
                  >
                    Ban
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 