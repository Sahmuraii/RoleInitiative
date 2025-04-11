import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../constants';
import { DND_Class } from '../models/dnd_class.type';
import { DND_Race } from '../models/dnd_race.type';
import { Class_Proficiency_Option } from '../models/class_proficiency_option.type';
import { DND_Spell } from '../models/dnd_spell.type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CreateCharacterService {
  http = inject(HttpClient)
  constructor() { }
  
  getRaceData() {
    return this.http.get<Array<DND_Race>>(`${API_URL}/json/races`)
  }

  getClassData() {
    return this.http.get<Array<DND_Class>>(`${API_URL}/json/classes`)
  }

  getClassProficiencyData() {
    return this.http.get<Array<Class_Proficiency_Option>>(`${API_URL}/json/classproficiencies`)
  }

  getSpellData() {
    return this.http.get<Array<DND_Spell>>(`${API_URL}/json/dnd_spells`)
  }

  createCharacter(characterData: any): Observable<any> {
    return this.http.post(`${API_URL}/character/create`, characterData);
  }
  
}
