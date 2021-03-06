// App
import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';

// Components
import { ErrorMessageComponentModule } from '../../components';

// Page
import { LoginPage } from './login';

// Providers
import { AuthValidationServiceModule } from '../../providers';

@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage),
    AuthValidationServiceModule,
    ErrorMessageComponentModule
  ],
  exports: [
    LoginPage
  ]
})
export class LoginPageModule {}
