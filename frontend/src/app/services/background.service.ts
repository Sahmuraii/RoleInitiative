import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root' 
})
export class BackgroundService {

  constructor(private http: HttpClient) { }

  getBackgrounds(): Observable<any> {
    return this.http.get(API_URL);
  }

  getBackgroundsByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/backgrounds`, { params: { userID: userId.toString() } });
  }

  createBackground(backgroundData: any): Observable<any> {
    return this.http.post(`${API_URL}/create_background`, backgroundData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  getBackgroundById(id: number): Observable<any> {
    return this.http.get(`${API_URL}/background/${id}`);
  }

  updateBackground(id: number, backgroundData: any): Observable<any> {
    return this.http.put(`${API_URL}/update_background/${id}`, backgroundData, {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deleteBackground(id: string): Observable<any> {
    return this.http.delete(`${API_URL}/${id}`);
  }
}