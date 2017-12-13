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

  error(message: string, title: string) {
    this.toastr.error(message, title);
  }

  badge(message: string, img_url: string) {
    // TODO hardcoded image
    this.toastr.custom('<img src="/assets/images/bronze_medal_badge.png" width="25%" height="25%">', 'New Badge!', {enableHTML: true});
  }
}
