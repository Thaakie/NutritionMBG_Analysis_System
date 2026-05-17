import "./DatasetPanel.css";

function DatasetPanel({ datasets, activeDatasetId, onLoadDataset, isDatasetLoading }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Dataset Demo (Opsional)</h2>
        <p>Gunakan preset ini hanya untuk demo/testing cepat. Operasional harian tetap disarankan input manual sesuai menu MBG hari itu.</p>
      </div>

      <div className="dataset-grid">
        {datasets.map((dataset) => (
          <article
            className={activeDatasetId === dataset.id ? "dataset-card active" : "dataset-card"}
            key={dataset.id}
          >
            <div>
              <h3>{dataset.name}</h3>
              <p>{dataset.description}</p>
            </div>
            <button
              className="secondary-button"
              onClick={() => onLoadDataset(dataset)}
              type="button"
              disabled={isDatasetLoading}
            >
              {isDatasetLoading && activeDatasetId === dataset.id ? "Memuat..." : "Pakai Dataset Demo"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DatasetPanel;
