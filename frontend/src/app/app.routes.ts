import { Routes } from '@angular/router';
import { CreateBackgroundComponent } from './components/create-background/create-background.component';
import { HomeComponent } from './components/home/home.component';
import { CharacterSheetComponent } from './components/character-sheet/character-sheet.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { InactiveComponent } from './components/inactive/inactive.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CreateCharacterComponent } from './components/create-character/create-character.component';
import { CreateSpellComponent } from './components/create-spell/create-spell.component';
import { ProfileComponent } from './components/profile/profile.component';
import { CreateMonsterComponent } from './components/create-monster/create-monster.component';
import { CreateMagicItemComponent } from './components/create-magic-item/create-magic-item.component';
import { CreateFeatComponent } from './components/create-feat/create-feat.component';
import { CreateSpeciesComponent } from './components/create-species/create-species.component';
import { SearchComponent } from './components/search/search.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent},
  { path: 'search', component: SearchComponent },
  { path: 'create/background', component: CreateBackgroundComponent },
  { path: 'backgrounds/edit/:id', component: CreateBackgroundComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'inactive', component: InactiveComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'create/character', component: CreateCharacterComponent},
  { path: 'create/spell', component: CreateSpellComponent},
  { path: 'create/monster', component: CreateMonsterComponent},
  { path: 'create/magic-item', component: CreateMagicItemComponent},
  { path: 'create/feat', component: CreateFeatComponent },
  { path: 'create/species', component: CreateSpeciesComponent },
  { path: 'character-sheet', component: CharacterSheetComponent},
  { path: 'character-sheet/:char_id', component: CharacterSheetComponent},
  { path: 'profile/:username', component: ProfileComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' },
];
