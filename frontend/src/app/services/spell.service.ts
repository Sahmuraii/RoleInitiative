import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants'; // Assuming you have a constant for the API URL

@Injectable({
  providedIn: 'root'
})
export class SpellService {
  constructor(private http: HttpClient) {}

  // Create a new spell
  createSpell(spellData: any): Observable<any> {
    return this.http.post(`${API_URL}/create_spell`, spellData);
  }

  // Fetch all spells
  getSpells(): Observable<any> {
    return this.http.get(`${API_URL}/homebrew-spells`);
  }

  // Fetch spells by user ID
  getSpellsByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/homebrew-spells`, { params: { userID: userId.toString() } });
  }
  
  // Fetch a single spell by ID
  getSpellById(spellId: number): Observable<any> {
    return this.http.get(`${API_URL}/homebrew-spells/${spellId}`);
  }

  // Update a spell
  updateSpell(spellId: number, spellData: any): Observable<any> {
    return this.http.put(`${API_URL}/homebrew-spells/${spellId}`, spellData);
  }

  // Delete a spell
  deleteSpell(spellId: number): Observable<any> {
    return this.http.delete(`${API_URL}/homebrew-spells/${spellId}`);
  }

  // Search spells by name or other criteria
  searchSpells(query: string): Observable<any> {
    return this.http.get(`${API_URL}/spells/search`, { params: { q: query } });
  }
}