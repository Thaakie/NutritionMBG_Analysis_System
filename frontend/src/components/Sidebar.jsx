import { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { to: "/", label: "1. Dashboard", hint: "Set target dan lihat ringkasan" },
  { to: "/database", label: "2. Input Manual", hint: "Isi dan centang kandidat menu" },
  { to: "/optimize", label: "3. Jalankan Optimasi", hint: "Kirim ke AI engine" },
  { to: "/results", label: "4. Hasil & Analisis", hint: "Bandingkan output" },
];

function Sidebar({ foodsCount, resultReady, dashboardUpdatePending, onDashboardSeen }) {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/" && dashboardUpdatePending) {
      onDashboardSeen?.();
    }
  }, [location.pathname, dashboardUpdatePending, onDashboardSeen]);

  const hasSelectedFoods = foodsCount > 0;
  const progressSteps = [true, hasSelectedFoods, resultReady, resultReady];
  const completedCount = progressSteps.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / progressSteps.length) * 100);

  function getStepStatus(pathname) {
    if (pathname === "/") return "Siap";
    if (pathname === "/database") return hasSelectedFoods ? "Selesai" : "Perlu input";
    if (pathname === "/optimize") return resultReady ? "Selesai" : hasSelectedFoods ? "Siap jalan" : "Tunggu bahan";
    if (pathname === "/results") return resultReady ? "Siap dilihat" : "Belum ada hasil";
    return "";
  }

  function isStepDisabled(pathname) {
    if (pathname === "/") return false;
    if (pathname === "/database") return false;
    if (pathname === "/optimize") return !hasSelectedFoods;
    if (pathname === "/results") return !resultReady;
    return false;
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo"></span>
        <div>
          <h1 className="sidebar-title">NUTRI SAFETY</h1>
          <span className="sidebar-subtitle">apalah itu pokoknya</span>
        </div>
      </div>
      <div className="sidebar-progress">
        <div className="sidebar-progress-label">
          <span>Progress Tahapan</span>
          <strong>{completedCount}/4</strong>
        </div>
        <div className="sidebar-progress-track">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) =>
          (() => {
            const disabled = isStepDisabled(item.to);
            return (
              <NavLink
                key={item.to}
                to={disabled ? "#" : item.to}
                end={item.to === "/"}
                className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}${disabled ? " disabled" : ""}`}
                onClick={(event) => {
                  if (disabled) {
                    event.preventDefault();
                  }
                }}
                aria-disabled={disabled ? "true" : "false"}
                tabIndex={disabled ? -1 : 0}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label-wrap">
                  <span className="sidebar-label">{item.label}</span>
                  <span className="sidebar-hint">{item.hint}</span>
                </span>
                <span className="sidebar-step-state">{getStepStatus(item.to)}</span>
                {item.to === "/database" && foodsCount > 0 && <span className="sidebar-badge">{foodsCount}</span>}
                {item.to === "/" && dashboardUpdatePending && <span className="sidebar-dot" />}
                {item.to === "/results" && resultReady && <span className="sidebar-dot" />}
              </NavLink>
            );
          })(),
        )}
      </nav>

      <div className="sidebar-footer">
        <p>SEMOGA BENAR</p>
        <p className="sidebar-version"></p>
      </div>
    </aside>
  );
}

export default Sidebar;
