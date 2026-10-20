import { Dialog } from 'radix-ui';
export default function Sheet({ title, description, onClose, children }) {
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal>
    <Dialog.Overlay className="miwi-overlay" />
    <Dialog.Content className="miwi-sheet"><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description>
      <Dialog.Close className="miwi-close" aria-label="Close">×</Dialog.Close>{children}
    </Dialog.Content></Dialog.Portal></Dialog.Root>;
}