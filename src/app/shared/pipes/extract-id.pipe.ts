import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'extractId', standalone: true })
export class ExtractIdPipe implements PipeTransform {
  transform(url: string): string {
    if (!url) return '';
    const parts = url.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  }
}
