import Btn from "./Btn";

export default function Pagination({ page, totalPages, total, onPage, unit = "registros" }) {
  if (!total) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 12 }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>
        {total} {unit} · página {page + 1} de {totalPages}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn variant="ghost" onClick={() => onPage(page - 1)} disabled={page === 0} style={{ fontSize: 13, padding: "8px 16px" }}>
          Anterior
        </Btn>
        <Btn variant="ghost" onClick={() => onPage(page + 1)} disabled={page >= totalPages - 1} style={{ fontSize: 13, padding: "8px 16px" }}>
          Próxima
        </Btn>
      </div>
    </div>
  );
}
