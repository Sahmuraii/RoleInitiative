import { Routes } from '@angular/router';
import { CreateBackgroundComponent } from './components/create-background/create-background.component';
import { HomeComponent } from './components/home/home.component';
import { CharacterSheetComponent } from './components/character-sheet/character-sheet.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { InactiveComponent } from './components/inactive/inactive.component';
import { CreateCharacterComponent } from './components/create-character/create-character.component';
import { CreateSpellComponent } from './components/create-spell/create-spell.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditSpellComponent } from './components/edit-spell/edit-spell.component';
import { EditBackgroundComponent } from './components/edit-background/edit-background.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'create/background', component: CreateBackgroundComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'inactive', component: InactiveComponent },
  { path: 'create/character', component: CreateCharacterComponent},
  { path: 'create/spell', component: CreateSpellComponent},
  { path: 'character-sheet', component: CharacterSheetComponent},
  { path: 'character-sheet/:char_id', component: CharacterSheetComponent},
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'edit-spell/:id', component: EditSpellComponent },
  { path: 'edit-background/:id', component: EditBackgroundComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
