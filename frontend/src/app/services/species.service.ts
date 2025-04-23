import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../constants';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {

  constructor(private http: HttpClient) { }

  createSpecies(speciesData: any): Observable<any> {
    return this.http.post(`${API_URL}/create_species`, speciesData);
  }

  getSpeciesByUser(userId: number): Observable<any> {
    return this.http.get(`${API_URL}/species`, { params: { userID: userId.toString() } });
  }
}
