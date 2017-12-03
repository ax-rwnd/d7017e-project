import { ToastOptions } from 'ng2-toastr/ng2-toastr';

export class CustomOptions extends ToastOptions {
  toastLife = 5000; // Milliseconds
  dismiss = 'auto';
  newestOnTop = false;
  showCloseButton = true;
  maxShown = 5;
  positionClass = 'toast-top-right';
  messageClass = ''; // CSS class for message
  titleClass = ''; // CSS class for title
  animate: 'flyRight';
  enableHTML = false;
}
