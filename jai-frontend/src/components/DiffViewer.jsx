export const DiffViewer = ({ diff }) => {
  if (!diff || !diff.groups || diff.groups.length === 0) return null;

  return (
    <div className="diff-viewer">
      <div className="diff-label">Prompt Diff</div>
      <div className="diff-text">
        {diff.groups.map((g, i) => {
          if (g.type === "preserved") {
            return <span key={i} className="diff-preserved">{g.text} </span>;
          }
          if (g.type === "removed") {
            return <span key={i} className="diff-removed">{g.text} </span>;
          }
          return <span key={i} className="diff-added">{g.text} </span>;
        })}
      </div>
      <div className="diff-legend">
        <span><i className="diff-dot diff-dot-added" /> Added</span>
        <span><i className="diff-dot diff-dot-removed" /> Removed</span>
        <span><i className="diff-dot diff-dot-preserved" /> Preserved</span>
      </div>
    </div>
  );
};
