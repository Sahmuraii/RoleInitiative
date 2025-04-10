import { Component } from '@angular/core';

@Component({
  selector: 'spell-display',
  standalone: true,
  imports: [],
  templateUrl: './spell-display.component.html',
  styleUrl: './spell-display.component.css'
})
export class SpellDisplayComponent {
  onMouseEnter() {
    console.log("test")
  }
}
