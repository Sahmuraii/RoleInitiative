import { Component, Input, } from '@angular/core';

@Component({
  selector: 'spell-display',
  standalone: true,
  imports: [],
  templateUrl: './spell-display.component.html',
  styleUrl: './spell-display.component.css'
})
export class SpellDisplayComponent {
  hideDesc: boolean = true;
  @Input() spellId: number = 0;
  @Input() spellName: string = "Default Name";
  @Input() spellLevel: number = 0;
  @Input() spellSchool: string = "Default School";
  @Input() castingTime: string = "Default Time";
  @Input() duration: string = "Default Duration";
  @Input() spellRange: string = "Default Range";
  @Input() spellDesc: string = "Default Description";
  @Input() buttonText: string = "Add";
  @Input() spellsArray: Array<number> = [];
  @Input() buttonFunc: (inputArray: Array<number>, inputID: number) => void = () => {};

  toggleDesc() {
    if(this.hideDesc == false) {
      this.hideDesc = true
    } else {
      this.hideDesc = false
    }
  }
}
