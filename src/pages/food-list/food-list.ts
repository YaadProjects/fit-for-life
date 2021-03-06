// App
import { Component } from '@angular/core';
import { ActionSheetController, AlertController, IonicPage, InfiniteScroll, Loading, LoadingController, NavController } from 'ionic-angular';
import { Subscription } from 'rxjs/Subscription';

// Firebase
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

// Models
import { Food } from '../../models';

// Providers
import { FOOD_GROUPS, FoodService } from '../../providers';

@IonicPage({
  name: 'food-list'
})
@Component({
  selector: 'page-food-list',
  templateUrl: 'food-list.html'
})
export class FoodListPage {
  private _dismissedLoader: boolean = false;
  private _foodSubscription: Subscription;
  private _loader: Loading;
  private _nutrients: Array<{ key: string, name: string }>;
  public foods: Array<Food>;
  public limit: number = 50;
  public searchQuery: string = '';
  public selectedGroup: string = FOOD_GROUPS[0];
  public sortOrder = 'desc';
  public sortSelection = '';
  constructor(
    private _actionSheetCtrl: ActionSheetController,
    private _afAuth: AngularFireAuth,
    private _alertCtrl: AlertController,
    private _foodSvc: FoodService,
    private _loadCtrl: LoadingController,
    private _navCtrl: NavController
  ) {
    let food: Food = new Food();
    this._nutrients = Object.keys(food.nutrition).map((nutrientKey: string) => {
      return {
        key: nutrientKey,
        name: food.nutrition[nutrientKey].name
      }
    })
  }

  private _selectGroup(): void {
    this._alertCtrl.create({
      title: 'Filter by groups',
      subTitle: 'Pick a food group',
      inputs: [...FOOD_GROUPS.map((group: string) => {
        return {
          type: 'radio',
          label: group,
          value: group,
          checked: this.selectedGroup === group
        }
      })],
      buttons: [
        {
          text: 'Done',
          handler: (data: string) => {
            this.selectedGroup = data;
            this.sortSelection = '';
            this.sortOrder = 'desc';
            this._dismissedLoader = false;
            this._foodSvc.changeFoodGroup(this.selectedGroup);
            this._loader = this._loadCtrl.create({
              content: 'Loading...',
              spinner: 'crescent'
            });
            this._loader.present();
            setTimeout(() => {
              if (!this._dismissedLoader) {
                this._loader.dismiss();
              }
            }, 30000);
          }
        }
      ]
    }).present();
  }

  private _selectNutrient(): void {
    this._alertCtrl.create({
      title: 'Filter by nutrients',
      subTitle: 'Pick a nutrient',
      inputs: [...this._nutrients.map((nutrient: { key: string, name: string }) => {
        return {
          type: 'radio',
          label: nutrient.name,
          value: nutrient.key,
          checked: this.sortSelection === `nutrition.${nutrient.key}.value`
        }
      })],
      buttons: [
        {
          text: 'Done',
          handler: (data: string) => {
            this.sortSelection = `nutrition.${data}.value`;
            this.sortOrder = 'desc';
          }
        }
      ]
    }).present();
  }

  public clearSearch(ev): void {
    this.searchQuery = '';
  }

  public loadMore(ev: InfiniteScroll) {
    this.limit += 50;
    setTimeout(() => {
      ev.complete();
    }, 1000);
  }

  public showFilter(): void {
    this._actionSheetCtrl.create({
      title: 'Change ingredient',
      buttons: [
        {
          text: 'Change food group',
          handler: () => {
            this._selectGroup();
          }
        }, {
          text: 'Sort by nutrients (high to low)',
          handler: () => {
            this._selectNutrient();
          }
        }, {
          text: 'Sort by alkalinity (alkaline to acid)',
          handler: () => {
            this.sortSelection = 'pral';
            this.sortOrder = 'asc';
          }
        }, {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).present();
  }

  ionViewCanEnter(): void {
    this._afAuth.authState.subscribe((auth: firebase.User) => {
      if (!auth) {
        this._navCtrl.setRoot('registration', {
          history: 'food-list'
        });
      }
    })
  }

  ionViewWillLoad(): void {
    this._loader = this._loadCtrl.create({
      content: 'Loading...',
      spinner: 'crescent'
    });
    this._loader.present();
    setTimeout(() => {
      if (!this._dismissedLoader) {
        this._loader.dismiss();
      }
    }, 30000);
    this._foodSubscription = this._foodSvc.getFoods$(this.selectedGroup).subscribe((data: Array<Food>) => {
      this.foods = [...data];
      if (!this._dismissedLoader) {
        this._loader.dismiss();
      }
    }, (err: { status: string, message: string }) => {
      if (!this._dismissedLoader) {
        this._loader.dismiss();
      }
      this._alertCtrl.create({
        title: 'Uhh ohh...',
        subTitle: 'Something went wrong',
        message: `Error ${err.status}! ${err.message}`,
        buttons: ['OK']
      }).present();
    });
    this._loader.onDidDismiss(() => this._dismissedLoader = true);
  }

  ionViewWillLeave(): void {
    this._foodSubscription.unsubscribe();
  }
}