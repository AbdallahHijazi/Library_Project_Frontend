import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy, inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { PermissionService } from '../../core/permissions/permission.service';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnDestroy {
  private perms = inject(PermissionService);
  private key: string | null = null;
  private sub: Subscription;

  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {
    this.sub = this.perms.keys$.subscribe(() => this.render());
  }

  @Input() set hasPermission(key: string) {
    this.key = key;
    this.render();
  }

  private render() {
    this.vcr.clear();
    if (this.key && this.perms.has(this.key)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
