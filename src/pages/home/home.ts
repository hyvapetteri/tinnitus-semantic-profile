import { Component } from '@angular/core';
import { NavController, AlertController, ActionSheetController, LoadingController, Platform } from 'ionic-angular';
import { SQLite, SQLiteObject, SQLiteDatabaseConfig } from '@ionic-native/sqlite';
import { SocialSharing } from '@ionic-native/social-sharing';

import { SoundEvaluationPage } from '../sound-evaluation/sound-evaluation';
import { UserProvider } from '../../providers/user/user';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private info: FormGroup;
  private db_settings: SQLiteDatabaseConfig;

  constructor(private formBuilder: FormBuilder, private userProvider: UserProvider,
      private sqlite: SQLite, private socialSharing: SocialSharing,
      public platform: Platform, public actionsheetCtrl: ActionSheetController,
      public navCtrl: NavController, public alertCtrl: AlertController,
      public loadingCtrl: LoadingController) {

    this.info = this.formBuilder.group({
      age: ['', Validators.required],
      gender: ['', Validators.required]
    });

    this.db_settings = {
      name: 'users',
      location: 'default'
    };

    this.platform.ready().then(() => {
      this.sqlite.create(this.db_settings).then((db: SQLiteObject) => {
        return db.executeSql('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, uid STRING)', {});
      }).catch(err => console.log('error with database: ' + err));
    });
  }

  startEvaluation(info_form) {
    let tmp_age = info_form.value.age;
    this.userProvider.age = tmp_age;

    let tmp_gender = info_form.value.gender;
    this.userProvider.gender = tmp_gender;

    let rightnow = new Date();
    let ref_date = new Date(2017,8,1);
    let uid = Math.floor((rightnow.valueOf() - ref_date.valueOf())/1000).toString(32);
    this.userProvider.username = uid;
    console.log('age: ' + this.userProvider.age + ', uid: ' + uid);
    let alert = this.alertCtrl.create({
      title: 'Osallistujatunniste',
      message: 'Osallistujatunnisteesi on <b>' + uid + '</b>. Kirjaa tämä tunniste suostumuslomakkeeseen!',
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.navCtrl.setRoot(SoundEvaluationPage);
          }
        }
      ]
    });
    this.sqlite.create(this.db_settings).then((db: SQLiteObject) => {
      return db.executeSql('INSERT INTO users (uid) VALUES (?)', [this.userProvider.username]);
    }).then(() => alert.present(), err => console.log('could not start: ' + err));
  }

  showActionSheet() {
    let actionSheet = this.actionsheetCtrl.create({
      title: 'Send the results',
      subTitle: 'Version 0.0.20',
      buttons: [
        {
          text: 'Send mail',
          handler: () => {
            this.sendResults();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    });
    actionSheet.present();
  }

  sendResults() {
    const loading = this.loadingCtrl.create({
      content: 'Please wait, gathering data and composing mail.'
    });
    loading.present();

    var users:string[] = [];
    var message:string = '';

    this.sqlite.create(this.db_settings).then((db: SQLiteObject) => {
      return db.executeSql('SELECT * FROM users', {}).then(data => {
        let tmp_user_string = '';
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            users.push(data.rows.item(i).uid);
            tmp_user_string.concat(data.rows.item(i).uid + ' ');
          }
        }
        console.log('We got ' + users.length + ' users: '+ tmp_user_string + '. Starting data fetch');
      }).then(() => {
        return Promise.all(users.map((id => {
          let tmp_datastring:string = '';
          return this.sqlite.create({name: id + '.db', iosDatabaseLocation: 'Documents'})
            .then((user_db: SQLiteObject) => {
              console.log('db ' + id + '.db open.');
              return user_db.executeSql('SELECT * FROM info', {}).then(data => {
                console.log('for ' + id + ' got ' + data.rows.length + ' rows info');
                if (data.rows.length > 0) {
                  let r = data.rows.item(0);
                  tmp_datastring = tmp_datastring.concat('id: ' + id + ', age: ' + r.age + ', gender: ' + r.gender + '\n');
                }
              }).then(() => {
                return user_db.executeSql('SELECT * FROM ratings ORDER BY id', {}).then(data => {
                  console.log('for ' + id + ' got ' + data.rows.length + ' rows ratings');
                  if (data.rows.length > 0) {
                    for (let i = 0; i < data.rows.length; i++) {
                      let r = data.rows.item(i);
                      tmp_datastring = tmp_datastring.concat(r.answer + '\n');
                    }
                  }
                  console.log('for user ' + id + ', we got data: ' + tmp_datastring);
                });
              }).then(() => {
                return user_db.close();
              }).catch(err => console.log('Error while reading from user db ' + id + '.db'));
            }).then(() => {
              return new Promise(resolve => resolve(tmp_datastring));
            });
        }))).then(results => {
          console.log('***** got ' + results.length + ' results!!!');
          for (let i = 0; i < results.length; i++) {
            message = message.concat(results[i] + '\n*******\n\n');
          }
          console.log('***** the full message: ' + message);
        });
      }).then(() => {
        return db.close();
      });
    }).catch(err => console.log('db error: ' + err)).then(() => {
      return this.socialSharing.shareViaEmail(message, 'Tinnitus data', ['petteri.hyvarinen@iki.fi'])
        .catch(err => console.log('Could not send mail: ' + err));
    }).then(() => loading.dismiss());

  }

}
