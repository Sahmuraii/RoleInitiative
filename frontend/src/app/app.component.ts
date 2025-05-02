import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HttpClientModule,
    CommonModule,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend';

  showNavbar = true;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      this.showNavbar = !(['/login', '/register', '/inactive', '/forgot-password'].includes(this.router.url)
      || this.router.url.startsWith('/reset-password')); // DO NOT show the navbar on auth pages
    });
  }
}
