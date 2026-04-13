import "./DatasetPanel.css";

function DatasetPanel({ datasets, activeDatasetId, onLoadDataset }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Sample Datasets</h2>
        <p>Load realistic MBG menu presets to test the optimizer with one click.</p>
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
            <button className="secondary-button" onClick={() => onLoadDataset(dataset)} type="button">
              Load Dataset
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default DatasetPanel;
