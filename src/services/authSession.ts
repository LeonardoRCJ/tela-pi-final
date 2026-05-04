type InvalidateHandler = () => void | Promise<void>;

let onInvalidate: InvalidateHandler | null = null;

/** Registrado pelo AuthProvider para reagir a 401 com token enviado. */
export function setSessionInvalidateHandler(handler: InvalidateHandler | null) {
  onInvalidate = handler;
}

export function invalidateSession() {
  void onInvalidate?.();
}
