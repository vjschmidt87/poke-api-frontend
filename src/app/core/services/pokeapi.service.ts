import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NamedAPIResourceList, APIResourceList } from '../models/common.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PokeApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  getResourceList(endpoint: string, limit = 20, offset = 0): Observable<NamedAPIResourceList> {
    return this.http.get<NamedAPIResourceList>(`${this.baseUrl}/${endpoint}`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
  }

  getUnnamedResourceList(endpoint: string, limit = 20, offset = 0): Observable<APIResourceList> {
    return this.http.get<APIResourceList>(`${this.baseUrl}/${endpoint}`, {
      params: { limit: limit.toString(), offset: offset.toString() },
    });
  }

  getResource<T>(endpoint: string, idOrName: string | number): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${idOrName}`);
  }

  getByUrl<T>(url: string): Observable<T> {
    return this.http.get<T>(url);
  }

  getIdFromUrl(url: string): string {
    const parts = url.replace(/\/$/, '').split('/');
    return parts[parts.length - 1];
  }

  getAllResources(endpoint: string): Observable<NamedAPIResourceList> {
    return this.getResourceList(endpoint, 10000, 0);
  }
}
