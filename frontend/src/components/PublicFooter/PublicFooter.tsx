import logoUrl from '../../estandares/logos/upme-horizontal-amarillo.svg';
import { cn } from '../../lib/cn';
import { GOVCO_URL } from '../PublicHeader/PublicHeader';

/**
 * Pie del portal (UPME-LEG-02): datos de la entidad, enlaces legales y barra inferior GOV.CO.
 * Los datos de contacto, las direcciones de los enlaces legales y las redes están por completar (X-11):
 * se muestran como marcadores entre corchetes para que no pasen desapercibidos.
 */
export function PublicFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('bg-surface-raised border-t border-line', className)}>
      <div className="max-w-[1200px] mx-auto px-6 py-8 grid gap-8 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <img src={logoUrl} alt="UPME" className="h-10 w-auto self-start" />
          <p className="text-h3">Unidad de Planeación Minero Energética</p>
          <p className="text-small text-ink-muted">[Dirección, teléfono y horario de atención]</p>
          <p className="text-small text-ink-muted">[Correo de notificaciones judiciales]</p>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-h3">Enlaces</h2>
          <ul className="flex flex-col gap-1 text-small text-ink-muted">
            <li>Política de tratamiento de datos [enlace por definir]</li>
            <li>Términos de uso y licencia de datos [enlace por definir]</li>
            <li>Accesibilidad [enlace por definir]</li>
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-h3">Redes</h2>
          <p className="text-small text-ink-muted">[Redes sociales de la UPME]</p>
        </div>
      </div>
      <div className="bg-govco text-on-primary">
        <div className="max-w-[1200px] mx-auto px-6 h-12 flex items-center gap-2 text-small">
          <span>GOV.CO · Marca País CO ·</span>
          <a href={GOVCO_URL} className="underline text-on-primary">Conoce a GOV.CO</a>
        </div>
      </div>
    </footer>
  );
}
