import { useEffect, type ReactNode } from 'react';

type Props = {
  title: string;
  /** Procedencia o contexto de la vista (PRI-02). */
  subtitle?: ReactNode;
  /** Acciones a la derecha; máximo un botón primario (LAY-05). */
  actions?: ReactNode;
  children?: ReactNode;
};

/**
 * Estructura de una vista interna (LAY-05): encabezado con `h1` + subtítulo + acciones; debajo, el contenido
 * (banner, fila de 2 a 4 KPIs, gráfico principal y secundarios, tablas). Pone el título del documento (A11-08).
 */
export function AppPage({ title, subtitle, actions, children }: Props) {
  useEffect(() => {
    document.title = `${title} · Proyecciones de demanda · UPME`;
  }, [title]);
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-h1">{title}</h1>
          {subtitle && <p className="text-body text-ink-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
