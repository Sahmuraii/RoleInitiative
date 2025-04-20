import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { CapitalizePipe } from '../../capitalize.pipe';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../constants';
import { NONE_TYPE } from '@angular/compiler';
import { catchError, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { of } from 'rxjs';

@Component({
    selector: 'app-character-sheet',
    standalone: true,
    imports: [CommonModule, FormsModule, CapitalizePipe, UpperCasePipe],
    templateUrl: './character-sheet.component.html',
    styleUrls: ['./character-sheet.component.css', '../my-homebrew/my-homebrew.component.css']
})
export class CharacterSheetComponent {
    
    Math: any;
    http = inject(HttpClient);
    char_data: any = {};
    change_hp_amount: number = 0;

    constructor(
        private route: ActivatedRoute
    ) {
        this.Math = Math;
     }

    
    ngOnInit() {
        const char_id: string = this.route.snapshot.paramMap.get('char_id') || "";
        this.getCharacterData(char_id);
        console.log(this.char_data);
    }

    getCharacterData(char_id: string): any {
        this.http.get(`${API_URL}/character/${char_id}`).subscribe((res)=>{
            this.char_data = res;
            console.log(res);
            //return res;
        })
        //console.log(`${API_URL}/character/${char_id}`);
        //return this.http.get<{[key: string]: any}>(`${API_URL}/character/${char_id}`);
    }

    // Check if char_data.char_si.proficiencies exists
    // If yes, then for every proficiency in char_data.char_si.proficiencies:
    //     If proficiency is a saving throw and it involves a provided "stat"
    //     Return true, otherwise if no match is found return false
    checkProficiency(stat: string): boolean {
        if (!this.char_data.char_si || !this.char_data.char_si.proficiencies) {
            return false;
        }

        return this.char_data.char_si?.proficiencies?.some( (proficiency: any) =>
            proficiency.type_name?.toLowerCase().includes('saving-throw') &&
            proficiency.proficiency_name?.toLowerCase().includes(stat.toLowerCase())
        );
    }

    heal_character_hp(amount: number, multiplier: number): void {
        const heal_amount = amount * multiplier;

        if (!this.char_data?.char_si?.char_id) {
            return;
        }
        interface Character_Hit_Points {
            [key: string]: any; // Allows for the extra fields of the Character_Hit_Points table
        }
        const api_heal_url = `${API_URL}/character/${this.char_data.char_si.char_id}/heal_hp/${heal_amount}`
        console.log(api_heal_url);
        this.http.post<any>(`${api_heal_url}`,null).pipe(
            tap((newHitPoint)=>{
                this.char_data.char_si.hit_points = newHitPoint['hit_points'];
                this.char_data.char_si.temp_hit_points = newHitPoint['temp_hit_points'];
                this.change_hp_amount = 0;
                console.log('hp changed');
            }),
            catchError((error)=>{
                console.log("api error healing character");
                return of();
            })
        ).subscribe();
    }

    hiddenTabs = [false, true, true, true]
    public showTab(tabId: string) {
        switch(tabId) {
          case "inventory": {
            this.hiddenTabs = [false, true, true, true]
            break;
          }
          case "spells": {
            this.hiddenTabs = [true, false, true, true]
            break; 
          }
          case "feats": {
            this.hiddenTabs = [true, true, false, true];
            break;
          }
          case "background": {
            this.hiddenTabs = [true, true, true, false]
            break;
          }
        }
        
      }
}
