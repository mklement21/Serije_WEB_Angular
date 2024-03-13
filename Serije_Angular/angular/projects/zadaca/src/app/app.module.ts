import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { PrijavaComponent } from './prijava/prijava.component';
import { RegistracijaComponent } from './registracija/registracija.component';
import { ProfilComponent } from './profil/profil.component';
import { SerijePretrazivanjeComponent } from './serije/serije-pretrazivanje/serije-pretrazivanje.component';
import { SerijeDetaljiComponent } from './serije/serije-detalji/serije-detalji.component';
import { KorisniciComponent } from './korisnici/korisnici.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  { path: 'prijava', component: PrijavaComponent },
  { path: 'registracija', component: RegistracijaComponent },
  { path: 'profil', component: ProfilComponent },
  { path: 'serijePretrazivanje', component: SerijePretrazivanjeComponent },
  { path: 'korisnici', component: KorisniciComponent },
  { path: 'serijaDetalji/:id', component: SerijeDetaljiComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    PrijavaComponent,
    RegistracijaComponent,
    ProfilComponent,
    SerijePretrazivanjeComponent,
    KorisniciComponent,
    SerijeDetaljiComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RecaptchaModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forRoot(routes),
    RecaptchaV3Module,
  ],
  exports: [RouterModule],
  providers: [
    {
      provide: RECAPTCHA_V3_SITE_KEY,
      useValue: environment.recaptcha.siteKey,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}