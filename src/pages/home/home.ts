import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { SoundEvaluationPage } from '../sound-evaluation/sound-evaluation';
import { UserProvider } from '../../providers/user/user';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private info: FormGroup;

  constructor(private formBuilder: FormBuilder, private userProvider: UserProvider,
      public navCtrl: NavController, public alertCtrl: AlertController) {

    this.info = this.formBuilder.group({
      age: ['', Validators.required]
    });
  }

  startEvaluation(info_form) {
    this.userProvider.age = info_form.age;
    let rightnow = new Date();
    let ref_date = new Date(2017,8,1);
    let uid = (rightnow.valueOf() - ref_date.valueOf()).toString(32);
    this.userProvider.username = uid;
    let alert = this.alertCtrl.create({
      title: 'Osallistujatunniste',
      subTitle: 'Osallistujatunnisteesi on ' + uid + '. Kirjaa tämä tunniste suostumuslomakkeeseen!',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.setRoot(SoundEvaluationPage);
          }
        }
      ]
    });
    alert.present();
  }

}
