/**
 * Íconos de la Librería de Iconos UPME por concepto (UPME-ICO-01, UPME-ICO-03).
 * Se usan siempre por concepto, no por nombre de archivo, para que la asignación sea una sola.
 */
import Home from '../estandares/iconos/home.svg?react';
import Notification from '../estandares/iconos/Notification.svg?react';
import OfertaDemanda from '../estandares/iconos/OfertaDemanda.svg?react';
import Planes from '../estandares/iconos/Planes.svg?react';
import Time from '../estandares/iconos/time.svg?react';
import Download from '../estandares/iconos/download.svg?react';
import Clima from '../estandares/iconos/clima.svg?react';
import Filter from '../estandares/iconos/filter.svg?react';
import Control from '../estandares/iconos/Control.svg?react';
import Lupa from '../estandares/iconos/lupa.svg?react';
import Process from '../estandares/iconos/Process.svg?react';
import Perfil from '../estandares/iconos/perfil.svg?react';
import Alert from '../estandares/iconos/Alert.svg?react';
import Check from '../estandares/iconos/check.svg?react';
import Energia from '../estandares/iconos/Energia.svg?react';
import GasNatural from '../estandares/iconos/gasNatural.svg?react';
// Locales, pendientes de pasar al estándar (src/iconos-locales/LEEME.md, X-17).
import Stop from '../iconos-locales/Stop.svg?react';
import Send from '../iconos-locales/send.svg?react';
import FullScreen from '../iconos-locales/fullScreen.svg?react';
import ChevronLeft from '../iconos-locales/chevron-lef.svg?react';
import ChevronRight from '../iconos-locales/chevron-right.svg?react';

export const icons = {
  home: Home,
  alerts: Notification,
  realVsEstimated: OfertaDemanda,
  documentation: Planes,
  history: Time,
  download: Download,
  exogenous: Clima,
  filter: Filter,
  models: Control,
  search: Lupa,
  run: Process,
  user: Perfil,
  warning: Alert,
  ok: Check,
  ee: Energia,
  gn: GasNatural,
  pauseRotation: Stop, // provisional: la librería no tiene «pausa» (X-17)
  resumeRotation: Send, // provisional: la librería no tiene «reproducir» (X-17)
  fullscreen: FullScreen,
  previous: ChevronLeft,
  next: ChevronRight,
} as const;

export type IconName = keyof typeof icons;
