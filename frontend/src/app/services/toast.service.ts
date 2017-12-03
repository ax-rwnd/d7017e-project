import { Injectable } from '@angular/core';
import { ToastsManager } from 'ng2-toastr/ng2-toastr';

@Injectable()
export class ToastService {

  constructor(private toastr: ToastsManager) { }

  success(message: string) {
    this.toastr.success(message, 'Success!');
  }

  info(message: string) {
    this.toastr.info(message);
  }

  warning(message: string) {
    this.toastr.warning(message, 'Warning!');
  }

  error(message: string) {
    this.toastr.error(message, 'Oops!');
  }
}
