import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants'; 

@Injectable({
  providedIn: 'root'
})
export class MonsterService {
  constructor(private http: HttpClient) {}

  createMonster(monsterData: any): Observable<any> {
    return this.http.post(`${API_URL}/create_monster`, monsterData);
  }

  getMonsters(): Observable<any> {
    return this.http.get(`${API_URL}/monsters`);
  }

  getMonstersByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/monsters`, { params: { userID: userId.toString() } });
  }

  getMonsterById(monsterId: number): Observable<any> {
    return this.http.get(`${API_URL}/monsters/${monsterId}`);
  }

  updateMonster(monsterId: number, monsterData: any): Observable<any> {
    return this.http.put(`${API_URL}/monsters/${monsterId}`, monsterData);
  }

  deleteMonster(monsterId: number): Observable<any> {
    return this.http.delete(`${API_URL}/delete_monster/${monsterId}`);
  }
  
  searchMonsters(query: string): Observable<any> {
    return this.http.get(`${API_URL}/monsters/search`, { params: { q: query } });
  }
}