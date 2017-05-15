// App
import { ChangeDetectorRef, ChangeDetectionStrategy, Component } from '@angular/core';
import { AlertController, AlertOptions, LoadingController, NavController, Toast, ToastController } from 'ionic-angular';
import { Auth, User } from '@ionic/cloud-angular';

// Pages
import { RegistrationPage } from '../registration/registration';

// Providers
import { AlertService, PictureService } from '../../providers';

@Component({
  selector: 'page-account',
  templateUrl: 'account.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountPage {
  public avatar: string;
  constructor(
    private _alertCtrl: AlertController,
    private _alertSvc: AlertService,
    private _auth: Auth,
    private _detectorRef: ChangeDetectorRef,
    private _loadCtrl: LoadingController,
    private _navCtrl: NavController,
    private _picService: PictureService,
    private _toastCtrl: ToastController,
    private _user: User
  ) {
    this.avatar = _user.details.image;
  }

  private _deleteAccount(): void {
    let loader = this._loadCtrl.create({
      content: 'Deleting account...',
      spinner: 'crescent'
    });

    loader.present();
    this._user.delete();
    this._user.unstore();
    this._auth.logout();
    loader.dismiss();
    this._navCtrl.setRoot(RegistrationPage);
  }

  public deleteAccountRequest(): void {
    let alertOpt: AlertOptions = {
      title: 'Are you sure you want this?',
      message: 'Your account will be permanently erased and all data will be lost',
      buttons: [
        {
          text: 'Maybe not',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: "Yes, I'm sure",
          handler: () => {
            this._deleteAccount();
          }
        }
      ]
    };

    this._alertCtrl.create(alertOpt).present();
  }

  public changeAvatar(inputRef: HTMLInputElement): void {
    let canceledUpload: boolean = false,
      toast: Toast = this._toastCtrl.create({
        message: 'Uploading ... 0%',
        position: 'bottom',
        showCloseButton: true,
        closeButtonText: 'Cancel'
      });

    toast.present();
    toast.onWillDismiss(() => {
      canceledUpload = true;
      this._picService.cancelUpload();
    });
    
    this._picService.uploadImage(inputRef.files[0], 'avatars').subscribe((data: string | number) => {
      console.log(typeof data === 'number');
      if (typeof data === 'number') {
        toast.setMessage(`Uploading ... ${data}%`);
      } else {
        this._user.details.image = data;
        this._user.save();
        this.avatar = data;
      }
    }, (err: Error) => {
      console.log('Error uploading avatar: ', err);
      toast.setMessage('Uhh ohh, something went wrong!');
    },
      () => {
        if (canceledUpload === true) {
          this._alertSvc.showAlert('Your avatar upload has been canceled', '', 'Canceled!');
        } else {
          toast.dismissAll();
          this._alertSvc.showAlert('Your avatar has been updated successfully', '', 'Success!');
          this._detectorRef.markForCheck();
        }
      });
  }

  public signout(): void {
    this._auth.logout();
    this._navCtrl.setRoot(RegistrationPage);
  }

  ionViewWillUnload(): void {
    console.log('Destroying...');
    this._detectorRef.detach();
  }

}
