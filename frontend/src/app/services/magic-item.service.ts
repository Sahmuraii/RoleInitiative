import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class MagicItemService {
  constructor(private http: HttpClient) {}

  createMagicItem(magicItemData: any): Observable<any> {
    return this.http.post(`${API_URL}/magic_items`, magicItemData);
  }

  getMagicItems(): Observable<any> {
    return this.http.get(`${API_URL}/magic_items`);
  }

  getMagicItemsByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/magic_items`, { 
      params: { userID: userId.toString() } 
    });
  }

  getMagicItemById(itemId: number): Observable<any> {
    return this.http.get(`${API_URL}/magic_items/${itemId}`);
  }

  updateMagicItem(itemId: number, magicItemData: any): Observable<any> {
    return this.http.put(`${API_URL}/magic_items/${itemId}`, magicItemData);
  }

  deleteMagicItem(itemId: number): Observable<any> {
    return this.http.delete(`${API_URL}/magic_items/${itemId}`);
  }

  searchMagicItems(query: string): Observable<any> {
    return this.http.get(`${API_URL}/magic_items/search`, { 
      params: { q: query } 
    });
  }

  // Additional methods specific to magic items
  getRarities(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/magic_items/rarities`);
  }

  getItemTypes(): Observable<string[]> {
    return this.http.get<string[]>(`${API_URL}/magic_items/types`);
  }
}