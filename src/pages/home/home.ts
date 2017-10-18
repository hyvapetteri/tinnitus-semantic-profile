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
      age: ['', Validators.required],
      gender: ['']
    });
  }

  startEvaluation(info_form) {
    let tmp_age = info_form.value.age
    this.userProvider.age = tmp_age;
    let rightnow = new Date();
    let ref_date = new Date(2017,8,1);
    let uid = Math.floor((rightnow.valueOf() - ref_date.valueOf())/1000).toString(32);
    this.userProvider.username = uid;
    console.log('age: ' + this.userProvider.age + ', uid: ' + uid);
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
