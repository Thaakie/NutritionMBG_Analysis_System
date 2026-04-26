import "./HeroPanel.css";
import { akgProfiles } from "../data/akgProfiles";
import { formatNumber } from "../utils/formatters";

function HeroPanel({ constraints, currentStatus }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">NutriSafety AI</p>
        <h1>
          TEST MBG meal composition with nutrition, budget, and AI-backed
          recommendations.
        </h1>
        <p className="hero-text">
          Build candidate menus, validate nutritional adequacy, evaluate AKG
          fulfillment, and generate ranked recommendations for Program Makan
          Bergizi Gratis.
        </p>
      </div>
      <div className="hero-stats">
        <article className="stat-card">
          <span>Kelompok usia</span>
          <strong>{akgProfiles[constraints.ageGroup].label}</strong>
        </article>
        <article className="stat-card">
          <span>Budget limit</span>
          <strong>Rp {formatNumber(constraints.budget)}</strong>
        </article>
        <article className="stat-card">
          <span>Jumlah siswa</span>
          <strong>{formatNumber(constraints.studentCount || 1)} siswa</strong>
        </article>
        <article className="stat-card">
          <span>Status evaluasi saat ini</span>
          <strong>{currentStatus}</strong>
        </article>
      </div>
    </section>
  );
}

export default HeroPanel;
