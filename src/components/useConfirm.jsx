/**
 * useConfirm — Promise-based Bootstrap confirmation dialog.
 *
 * Usage:
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   // in JSX: <ConfirmDialog />
 *   // trigger (must be awaited):
 *   if (await confirm("Delete this item?")) {
 *     // user confirmed
 *   }
 */
import { useCallback, useState } from "react";
import { Button, Modal } from "react-bootstrap";

export function useConfirm() {
  const [state, setState] = useState({
    open: false, message: "", confirmLabel: "Confirm", variant: "danger", resolve: null,
  });

  const confirm = useCallback((message, { confirmLabel = "Confirm", variant = "danger" } = {}) => {
    return new Promise((resolve) => {
      setState({ open: true, message, confirmLabel, variant, resolve });
    });
  }, []);

  const handle = (result) => {
    state.resolve?.(result);
    setState(s => ({ ...s, open: false, resolve: null }));
  };

  const ConfirmDialog = () =>
    state.open ? (
      <Modal show onHide={() => handle(false)} centered size="sm">
        <Modal.Body className="text-center py-4" style={{ fontSize: 14 }}>
          {state.message}
        </Modal.Body>
        <Modal.Footer className="justify-content-center border-0 pt-0 pb-3 gap-2">
          <Button variant="secondary" size="sm" onClick={() => handle(false)}>
            Cancel
          </Button>
          <Button variant={state.variant} size="sm" onClick={() => handle(true)}>
            {state.confirmLabel}
          </Button>
        </Modal.Footer>
      </Modal>
    ) : null;

  return { confirm, ConfirmDialog };
}
