// App
import { Component } from '@angular/core';
import { AlertController, IonicPage, Loading, LoadingController, NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

// Models
import { SleepHabit, SleepPlan } from '../../models';

// Providers
import { FitnessService, SleepService } from '../../providers';

@IonicPage({
  name: 'sleep-plan'
})
@Component({
  selector: 'page-sleep-plan',
  templateUrl: 'sleep-plan.html'
})
export class SleepPlanPage {
  private _sleepPlanSubscription: Subscription;
  public currentSleep: SleepHabit = new SleepHabit();
  public sleepPlan: SleepPlan;
  public sleepPlanDetails: string = 'guidelines';
  constructor(
    private _afAuth: AngularFireAuth,
    private _alertCtrl: AlertController,
    private _fitSvc: FitnessService,
    private _loadCtrl: LoadingController,
    private _navCtrl: NavController,
    private _sleepSvc: SleepService
  ) { }

  public changedTime(): void {
    if (this.currentSleep.bedTime !== this.sleepPlan.sleepPattern[0].bedTime || this.currentSleep.wakeUpTime !== this.sleepPlan.sleepPattern[0].wakeUpTime) {
      this.currentSleep.duration = this._sleepSvc.getSleepDuration(this.currentSleep);
      this._sleepSvc.saveSleep(this.sleepPlan, this.currentSleep);
    }
  }

  ionViewCanEnter(): void {
    this._afAuth.authState.subscribe((auth: firebase.User) => {
      if (!auth) {
        this._navCtrl.setRoot('registration', {
          history: 'sleep-plan'
        });
      }
    })
  }

  ionViewWillEnter(): void {
    let loader: Loading = this._loadCtrl.create({
      content: 'Loading...',
      spinner: 'crescent',
      duration: 30000
    });
    loader.present();
    this._sleepPlanSubscription = this._sleepSvc.getSleepPlan$().subscribe((sleepPlan: SleepPlan) => {
      this.sleepPlan = Object.assign({}, sleepPlan);
      this.currentSleep = Object.assign({}, this._sleepSvc.getCurrentSleep(this.sleepPlan));
      loader.dismiss();
    }, (err: firebase.FirebaseError) => {
      this._alertCtrl.create({
        title: 'Uhh ohh...',
        subTitle: 'Something went wrong',
        message: err.message,
        buttons: ['OK']
      }).present();
    });
  }

  ionViewWillLeave(): void {
    this._sleepPlanSubscription.unsubscribe();
  }
}
