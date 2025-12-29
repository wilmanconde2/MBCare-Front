import { useEffect } from 'react';
import '../../styles/UI/confirmModal.scss';

export default function ConfirmModal({
  open,
  title = 'Confirmar',
  subtitle = 'Esta acción no se puede deshacer.',
  message = '¿Deseas continuar?',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  confirmIconClass = 'bi bi-trash3',
  onConfirm,
  onClose,
  children,
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className='confirm-modal' role='dialog' aria-modal='true' aria-labelledby='confirm-title'>
      <div
        className='cm-overlay'
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className='cm-box cm-pop' role='document'>
          <div className='cm-header'>
            <div className='cm-header-left'>
              <span className='cm-icon' aria-hidden='true'>
                <i className='bi bi-exclamation-triangle-fill'></i>
              </span>

              <div>
                <h3 id='confirm-title' className='cm-title'>
                  {title}
                </h3>
                <p className='cm-subtitle'>{subtitle}</p>
              </div>
            </div>

            <button className='cm-close' onClick={onClose} aria-label='Cerrar' type='button'>
              <i className='bi bi-x'></i>
            </button>
          </div>

          <div className='cm-body'>
            <div className='cm-callout'>
              <div className='cm-dot' />
              <div>
                <p style={{ margin: 0 }}>{message}</p>
                {children ? <div style={{ marginTop: '0.5rem' }}>{children}</div> : null}
              </div>
            </div>
          </div>

          <div className='cm-footer'>
            <button className='cm-btn cm-btn-ghost' onClick={onClose} type='button'>
              {cancelText}
            </button>

            <button className='cm-btn cm-btn-danger' onClick={onConfirm} type='button'>
              <i className={confirmIconClass}></i>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
