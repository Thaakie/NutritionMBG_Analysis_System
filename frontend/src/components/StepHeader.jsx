import { Link } from "react-router-dom";

function StepHeader({ step, totalSteps = 4, title, description, actionLabel, actionTo, variant = "default" }) {
  return (
    <section className={`step-header ${variant === "warning" ? "step-header-warning" : ""}`}>
      <div className="step-header-copy">
        <span className="step-chip">Tahap {step}/{totalSteps}</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actionLabel && actionTo ? (
        <Link className="step-header-action" to={actionTo}>
          {actionLabel}
        </Link>
      ) : null}
    </section>
  );
}

export default StepHeader;
