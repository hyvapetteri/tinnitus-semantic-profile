import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, Content } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NativeAudio } from '@ionic-native/native-audio';
import { File } from '@ionic-native/file';
import { UserProvider } from '../../providers/user/user';
import { HomePage } from '../home/home';

/**
 * Generated class for the SoundEvaluationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export const SOUNDS: Array<string> = [
  "sine_0-Hz-AM_1000-Hz",
  "norm_noise_0-Hz-AM_1000-Hz",
  "norm_noise_0-Hz-AM_125-Hz",
  "norm_noise_0-Hz-AM_16000-Hz",
  "norm_noise_0-Hz-AM_8000-Hz",
  "norm_noise_10-Hz-AM_1000-Hz",
  "norm_noise_10-Hz-AM_125-Hz",
  "norm_noise_10-Hz-AM_16000-Hz",
  "norm_noise_10-Hz-AM_8000-Hz",
  "norm_pink_noise",
  "norm_sine_0-Hz-AM_125-Hz",
  "norm_sine_0-Hz-AM_16000-Hz",
  "norm_sine_0-Hz-AM_8000-Hz",
  "norm_sine_10-Hz-AM_1000-Hz",
  "norm_sine_10-Hz-AM_125-Hz",
  "norm_sine_10-Hz-AM_16000-Hz",
  "norm_sine_10-Hz-AM_8000-Hz"
];

export const SOUND_ATTRIBUTES: Array<{key: string, name: string}> = [
 {key: 'beeping', name: 'Piippaava'},
 {key: 'hissing', name: 'Sihisevä'},
 {key: 'swooshing', name: 'Suhiseva'},
 {key: 'whistling', name: 'Viheltävä'},
 {key: 'whining', name: 'Vinkuva'},
 {key: 'whining2', name: 'Inisevä'},
 {key: 'tooting', name: 'Tuuttaava'},
 {key: 'honking', name: 'Tööttäävä'},
 {key: 'buzzing', name: 'Suriseva'},
 {key: 'roaring', name: 'Pauhaava'},
 {key: 'humming', name: 'Humiseva'},
 {key: 'water', name: 'Kohiseva'},
 {key: 'pulse', name: 'Jyskyttävä'},
 {key: 'ring', name: 'Pirisevä'},
 {key: 'crickets', name: 'Sirittävä'},
 {key: 'bubbling', name: 'Pulputtava'},
 {key: 'rumbling', name: 'Huriseva'},
 // {key: 'drumming', name: 'Koliseva'},
 // {key: 'tingling', name: 'Kilisevä'},
 {key: 'wailing', name: 'Ulvova'}
 // {key: 'rattling', name: 'Rätisevä'},
 // {key: 'jingling', name: 'Helisevä'},
 // {key: 'crackling', name: 'Raksahteleva'},
 // {key: 'crickling', name: 'Ritisevä'}
];

@Component({
  selector: 'page-sound-evaluation',
  templateUrl: 'sound-evaluation.html',
})
export class SoundEvaluationPage {
  private profile: FormGroup;
  private attributes: Array<{key:string, name:string}>;
  private outputFile: string;
  private output: Array<string> = [];
  private submitAttempted: boolean = false;
  private playing: boolean = false;
  private soundId: string;
  private sounds: Array<string>;
  private soundIndex: number;
  private uid: string;
  private volume: number;
  private vol_icon: string;
  private tinnitus_trial: boolean;
  @ViewChild(Content) content: Content;

  constructor(private formBuilder: FormBuilder, private nativeAudio: NativeAudio,
              private file: File,
              private userProvider: UserProvider, public navCtrl: NavController,
              public navParams: NavParams, public alertCtrl: AlertController) {

    console.log('SoundEvaluationPage constructor!');
    this.uid = this.userProvider.username;
    this.tinnitus_trial = true;
    this.soundId = 'tinnitus';

    this.outputFile = 'ratings-' + this.uid + '.txt';
    let basic_info_text = 'uid: ' + this.uid + ', age: ' + this.userProvider.age + ', gender: ' + this.userProvider.gender + '\n';
    this.file.checkDir(this.file.dataDirectory, 'tinnitus-semantics-experiment')
      .then(
        _ => console.log('App directory found.'),
        err => this.file.createDir(this.file.dataDirectory, 'tinnitus-semantics-experiment', false)
      )
      .then(_ => this.file.writeFile(this.file.dataDirectory, 'tinnitus-semantics-experiment/' + this.outputFile, basic_info_text, true))
      .catch(err => this.showError('Could not create log file: ' + err));

    this.sounds = SOUNDS;
    for (let i = this.sounds.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.sounds[i], this.sounds[j]] = [this.sounds[j], this.sounds[i]];
    }
    this.soundIndex = -1;

    this.attributes = SOUND_ATTRIBUTES;

    let form_attributes = {};
    form_attributes['similarity'] = ['', Validators.required];
    for (let sound_attr of SOUND_ATTRIBUTES) {
      form_attributes[sound_attr['key']] = ['', Validators.required]
    }
    this.profile = this.formBuilder.group(form_attributes);

    if (!this.tinnitus_trial) {
      this.loadSound(this.soundIndex);
    } else {
      let tmp_similarity_ctrl = this.profile.controls['similarity'];
      tmp_similarity_ctrl.markAsDirty();
      tmp_similarity_ctrl.markAsTouched();
      tmp_similarity_ctrl.setValue(50);
    }
  }

  loadSound(snd_idx) {
    this.soundId = this.sounds[snd_idx];
    this.volume = 0.6;
    this.vol_icon = 'volume-down';
    return this.nativeAudio.preloadComplex(this.soundId, 'assets/audio/' + this.soundId + '.wav', this.volume, 1, 0).then(
      () => console.log('Sound loaded'),
      err => console.log('Error loading sound: ' + err));
  }

  startSound() {
    if (this.playing) {
      return new Promise((resolve, reject) => resolve('playing'));
    }
    return this.nativeAudio.loop(this.soundId).then(
      () => this.playing = true
    );
  }

  pauseSound() {
    if (!this.playing) {
      return new Promise((resolve, reject) => resolve('paused'));
    }
    return this.nativeAudio.stop(this.soundId).then(
      () => this.playing = false
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoundEvaluationPage');
  }

  volumeDown() {
    if (this.volume > 0.1) {
      this.volume -= 0.1;
    }
    this.updateVolumeIcon();
    return this.nativeAudio.setVolumeForComplexAsset(this.soundId, this.volume);
  }

  volumeUp() {
    if (this.volume <= 0.9) {
      this.volume += 0.1;
    }
    this.updateVolumeIcon();
    return this.nativeAudio.setVolumeForComplexAsset(this.soundId, this.volume);
  }

  updateVolumeIcon() {
    if (this.volume <= 0.2) {
      this.vol_icon = 'volume-mute';
    } else if (this.volume <= 0.7) {
      this.vol_icon = 'volume-down';
    } else {
      this.vol_icon = 'volume-up';
    }
  }

  evaluate(form_profile) {
    this.submitAttempted = true;
    if (!form_profile.valid) {
      console.log('missing inputs');
    } else {
      this.pauseSound().then(() => {
        if (!this.tinnitus_trial) {
          return this.nativeAudio.unload(this.soundId);
        }
      }).then(() => {
        let tmp_profile = Object.assign({}, this.profile.value);
        tmp_profile.sound_id = this.soundId;
        tmp_profile.volume = this.volume;
        this.output.push(JSON.stringify(tmp_profile));
        return this.file.writeExistingFile(this.file.dataDirectory, 'tinnitus-semantics-experiment/' + this.outputFile, this.output.join('\n'));
      }).then(() => {
        this.soundIndex += 1;
        if (this.soundIndex == this.sounds.length) {
          this.allDone();
          return;
        }
        return this.loadSound(this.soundIndex);
      }).then(() => {
        this.content.scrollToTop();
        this.profile.reset();
        this.submitAttempted = false;
        if (this.tinnitus_trial) {
          this.tinnitus_trial = false;
          this.content.resize();
          this.showInstructions();
        }
      }).catch(err => this.showError('error while moving to the next sound: ' + err));
    }
  }

  showError(message:string) {
    let alert = this.alertCtrl.create({
      title: 'Virhe',
      subTitle: 'Tapahtui virhe: ' + message,
      buttons: [
        {
          text: 'OK'
        }
      ]
    });
    alert.present();
  }

  showInstructions() {
    let alert = this.alertCtrl.create({
      title: 'Seuraava vaihe',
      subTitle: `Nyt tehtävänä
      on arvioida kuulokkeista soitettavia ääniä samalla tavalla kuin äsken
      tinnitusäänen osalta. Aloita painamalla play-nappia alapalkista`,
      buttons: [
        {
          text: 'OK'
        }
      ]
    });
    alert.present();
  }

  finish() {
    let alert = this.alertCtrl.create({
      title: 'Lopeta tutkimus',
      subTitle: `Olet lopettamassa tutkimuksen. Tutkimusta ei voi enää jatkaa
      samasta kohdasta. Haluatko lopettaa? Varmistathan että
      osallistujatunnisteesi ` + this.uid + ` on merkitty suostumuslomakkeeseen.`,
      buttons: [
        {
          text: 'Kyllä',
          handler: () => {
            this.userProvider.age = 0;
            this.userProvider.username = '';
            this.navCtrl.setRoot(HomePage);
          }
        },
        {
          text: 'Peruuta',
          role: 'cancel'
        }
      ]
    });
    alert.present();
  }

  allDone() {
    let alert = this.alertCtrl.create({
      title: 'Kiitos!',
      subTitle: `Kiitos osallistumisestanne tutkimukseen! Varmistathan että
      osallistujatunnisteesi ` + this.uid + ` on merkitty suostumuslomakkeeseen.`,
      buttons: [
        {
          text: 'Sulje',
          handler: () => {
            this.userProvider.age = 0;
            this.userProvider.username = '';
            this.navCtrl.setRoot(HomePage);
          }
        }
      ]
    });
    alert.present();
  }
}
