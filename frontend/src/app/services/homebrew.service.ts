import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class HomebrewService {
  constructor(private http: HttpClient) {}

  saveHomebrew(type: string, id: number) {
    return this.http.post(`${API_URL}/save-homebrew`, {
      content_type: type,
      content_id: id
    });
  }

  getSavedHomebrew(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/saved-homebrew`, { params: { userID: userId.toString() } });
  }
}
