import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentType, type ReactNode, type SVGProps } from 'react';
import logoDarkUrl from '../../estandares/logos/upme-horizontal-blanco.svg';
import { ILLUSTRATIVE_LABEL } from '../Badge/Badge';
import { cn } from '../../lib/cn';
import { icons } from '../../lib/icons';
import { exitFullscreen, useFullscreen } from '../../lib/useFullscreen';
import {
  goTo, initialRotation, interact, INTERVALS, pauseSecondsLeft, progress, swipeDirection, tick, togglePause,
} from './rotation';

export type KioskBoard = {
  key: string;
  /** Título del tablero, para los puntos de navegación. */
  title: string;
  /** Parte izquierda del encabezado: ícono de contexto y título (TV-05). */
  header: ReactNode;
  /** Filtros, KPIs y gráficos del tablero. */
  body: ReactNode;
  /** Fuente de los datos del tablero. */
  source: string;
  /** Fecha de corte ya formateada: «sep-2026». */
  cutoff?: string;
  illustrative?: boolean;
};

type Props = {
  boards: KioskBoard[];
  intervalSeconds: number;
  onIntervalChange: (seconds: number) => void;
  /** Estado de los datos: «Actualizado hace 2 h» o «Sin conexión · …» (TV-07). */
  status: string;
  /** A dónde lleva «Volver al inicio»: toda vista ofrece una salida clara. */
  exitHref?: string;
};

const STAGE_W = 1920;
const STAGE_H = 1080;

/** Escala el escenario de 1920 × 1080 a la ventana, sin deformarlo (TV-01, LAY-08). */
function useStage() {
  const [size, setSize] = useState({ w: STAGE_W, h: STAGE_H });
  useLayoutEffect(() => {
    const update = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const scale = Math.min(size.w / STAGE_W, size.h / STAGE_H);
  return { scale, left: (size.w - STAGE_W * scale) / 2, top: (size.h - STAGE_H * scale) / 2 };
}

function useNow(ms: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

type IconButtonProps = {
  label: string; // nombre accesible y texto al pasar el cursor (A11-03)
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onClick?: () => void;
  href?: string;
  pressed?: boolean;
};

/** Botón redondo de solo ícono, 44 px (A11-07), con nombre accesible. */
function IconButton({ label, icon: Icon, onClick, href, pressed }: IconButtonProps) {
  const className = 'w-11 h-11 inline-flex items-center justify-center rounded-pill border border-line-strong text-ink hover:bg-surface-raised';
  const content = <Icon width={24} height={24} aria-hidden="true" />;
  if (href) {
    return <a href={href} onClick={onClick} aria-label={label} title={label} className={className}>{content}</a>;
  }
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} aria-pressed={pressed} className={className}>
      {content}
    </button>
  );
}

/**
 * Contenedor del modo pantalla (CMP: KioskShell, TV-01 a TV-08): tema oscuro, escenario de 1920 × 1080,
 * rotación con barra de progreso, flechas, puntos, arrastre, pausa, pantalla completa, reloj, salida y pie.
 */
export function KioskShell({ boards, intervalSeconds, onIntervalChange, status, exitHref = '/' }: Props) {
  const { scale, left, top } = useStage();
  const now = useNow(250);
  const [rot, setRot] = useState(() => initialRotation(Date.now()));
  const pointerX = useRef<number | null>(null);
  const intervalId = useId();
  const [isFullscreen, toggleFullscreen] = useFullscreen();
  const count = boards.length;
  const intervalMs = intervalSeconds * 1000;

  // Tema oscuro obligatorio en el modo pantalla (TOK-04).
  useEffect(() => {
    const html = document.documentElement;
    const previous = html.dataset.theme;
    html.dataset.theme = 'dark';
    return () => { if (previous) html.dataset.theme = previous; else delete html.dataset.theme; };
  }, []);

  useEffect(() => { setRot((s) => tick(s, now, count, intervalMs)); }, [now, count, intervalMs]);

  const touch = () => setRot((s) => interact(s, Date.now()));
  const go = (index: number) => setRot((s) => goTo(s, index, Date.now(), count));
  const board = boards[rot.index] ?? boards[0];
  const secondsLeft = pauseSecondsLeft(rot, now);
  const paused = rot.userPaused || secondsLeft > 0;
  const pct = progress(rot, now, intervalMs) * 100;
  const clock = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false }).format(now);
  const date = capitalize(new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' }).format(now));

  const stateText = rot.userPaused
    ? 'Rotación detenida'
    : secondsLeft > 0
      ? `Pausa por interacción · continúa en ${secondsLeft} s`
      : status;

  return (
    <div className="fixed inset-0 bg-surface overflow-hidden">
      <div
        data-zone="pantalla"
        className="absolute bg-surface text-ink select-none touch-pan-y"
        style={{ width: STAGE_W, height: STAGE_H, left, top, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        onPointerDown={(e) => { pointerX.current = e.clientX; touch(); }}
        onPointerUp={(e) => {
          if (pointerX.current === null) return;
          const dir = swipeDirection((e.clientX - pointerX.current) / scale);
          pointerX.current = null;
          if (dir) go(rot.index + dir);
        }}
        onKeyDown={touch}
      >
        <div className="h-full flex flex-col gap-6 px-12 pt-10 pb-6">
          <header className="flex items-center gap-8">
            <div className="flex flex-col gap-3">
              <img src={logoDarkUrl} alt="UPME" className="h-16 w-auto" />
              {/* Acento de marca bajo el logo, como en el mockup aprobado (LAY-04). */}
              <span className="block h-1 w-full rounded-pill bg-brand" aria-hidden="true" />
            </div>
            <span className="h-16 border-l border-line" aria-hidden="true" />
            <div className="flex-1 min-w-0">{board?.header}</div>
            <div className="text-right">
              <p className="text-kpi-small tabular" aria-label={`Hora ${clock}`}>{clock}</p>
              <p className="text-body text-ink-muted">{date}</p>
            </div>
            <label htmlFor={intervalId} className="sr-only">Intervalo de rotación</label>
            <select
              id={intervalId}
              value={intervalSeconds}
              onChange={(e) => { onIntervalChange(Number(e.target.value)); touch(); }}
              className="h-11 px-3 rounded-md border border-line-strong bg-surface-raised text-ink text-body"
            >
              {INTERVALS.map((s) => <option key={s} value={s}>Cada {s} s</option>)}
            </select>
            <IconButton
              label={rot.userPaused ? 'Reanudar rotación' : 'Detener rotación'}
              icon={rot.userPaused ? icons.resumeRotation : icons.pauseRotation}
              pressed={rot.userPaused}
              onClick={() => setRot((s) => togglePause(s, Date.now()))}
            />
            <IconButton
              label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              icon={icons.fullscreen}
              pressed={isFullscreen}
              onClick={toggleFullscreen}
            />
            <IconButton label="Volver al inicio" icon={icons.home} href={exitHref} onClick={exitFullscreen} />
          </header>

          <main className="flex-1 min-h-0 relative">
            {/* La clave con resetKey vuelve los filtros a sus valores tras 5 min sin interacción (TV-04). */}
            <Fragment key={`${board?.key}-${rot.resetKey}`}>{board?.body}</Fragment>

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Tablero anterior"
                  onClick={() => go(rot.index - 1)}
                  className="absolute -left-10 top-1/2 -translate-y-1/2 w-11 h-20 inline-flex items-center justify-center rounded-md bg-surface-raised opacity-60 hover:opacity-100 text-ink"
                >
                  <icons.previous width={28} height={28} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Tablero siguiente"
                  onClick={() => go(rot.index + 1)}
                  className="absolute -right-10 top-1/2 -translate-y-1/2 w-11 h-20 inline-flex items-center justify-center rounded-md bg-surface-raised opacity-60 hover:opacity-100 text-ink"
                >
                  <icons.next width={28} height={28} aria-hidden="true" />
                </button>
              </>
            )}
          </main>

          <footer className="grid grid-cols-[2fr_1fr_2fr] items-center gap-6 text-small text-ink-muted">
            <div>
              <p>Fuente: {board?.source}</p>
              <p>
                {board?.cutoff && <>Datos a {board.cutoff}</>}
                {board?.cutoff && board?.illustrative && ' · '}
                {board?.illustrative && <strong className="text-ink">{ILLUSTRATIVE_LABEL}</strong>}
              </p>
            </div>
            <nav aria-label="Tableros" className="flex items-center justify-center gap-3">
              {boards.map((b, i) => (
                <button
                  key={b.key}
                  type="button"
                  aria-label={`Ir al tablero ${i + 1}: ${b.title}`}
                  aria-current={i === rot.index ? 'true' : undefined}
                  onClick={() => go(i)}
                  className="h-11 px-1 flex items-center"
                >
                  <span className={cn('block h-3 rounded-pill', i === rot.index ? 'w-10 bg-brand' : 'w-3 bg-line-strong')} />
                </button>
              ))}
              <span className="tabular">{rot.index + 1} / {count}</span>
            </nav>
            <p className="justify-self-end" role="status">
              <span className={cn('inline-block px-4 py-2 rounded-pill', paused ? 'bg-surface-raised text-ink' : '')}>{stateText}</span>
            </p>
          </footer>
        </div>

        {/* Barra de progreso de 6 px en `brand` (TV-02); en pausa queda congelada y atenuada. */}
        <div
          className={cn('absolute left-0 bottom-0 h-[6px] bg-brand', paused && 'opacity-60')}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
