import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class FeatService {
  constructor(private http: HttpClient) {}

  createFeat(featData: any): Observable<any> {
    return this.http.post(`${API_URL}/create_feat`, featData);
  }

  getFeatsByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/feats`, { params: { userID: userId.toString() } });
  }
}