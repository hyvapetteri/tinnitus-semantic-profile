import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';
import { NativeAudio } from '@ionic-native/native-audio';
import { UserProvider } from '../../providers/user/user';

/**
 * Generated class for the SoundEvaluationPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
export const SOUNDS: Array<string> = [
  'noise_0-Hz-AM_1000-Hz',
  'noise_0-Hz-AM_10000-Hz',
  'noise_0-Hz-AM_6000-Hz',
  'noise_0-Hz-AM_8000-Hz',
  'noise_10-Hz-AM_1000-Hz',
  'noise_10-Hz-AM_10000-Hz',
  'noise_10-Hz-AM_6000-Hz',
  'noise_10-Hz-AM_8000-Hz',
  'noise_20-Hz-AM_1000-Hz',
  'noise_20-Hz-AM_10000-Hz',
  'noise_20-Hz-AM_6000-Hz',
  'noise_20-Hz-AM_8000-Hz',
  'noise_30-Hz-AM_1000-Hz',
  'noise_30-Hz-AM_10000-Hz',
  'noise_30-Hz-AM_6000-Hz',
  'noise_30-Hz-AM_8000-Hz',
  'sine_0-Hz-AM_1000-Hz',
  'sine_0-Hz-AM_10000-Hz',
  'sine_0-Hz-AM_6000-Hz',
  'sine_0-Hz-AM_8000-Hz',
  'sine_10-Hz-AM_1000-Hz',
  'sine_10-Hz-AM_10000-Hz',
  'sine_10-Hz-AM_6000-Hz',
  'sine_10-Hz-AM_8000-Hz',
  'sine_20-Hz-AM_1000-Hz',
  'sine_20-Hz-AM_10000-Hz',
  'sine_20-Hz-AM_6000-Hz',
  'sine_20-Hz-AM_8000-Hz',
  'sine_30-Hz-AM_1000-Hz',
  'sine_30-Hz-AM_10000-Hz',
  'sine_30-Hz-AM_6000-Hz',
  'sine_30-Hz-AM_8000-Hz'
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
 {key: 'drumming', name: 'Koliseva'},
 {key: 'tingling', name: 'Kilisevä'},
 {key: 'wailing', name: 'Ulvova'},
 {key: 'rattling', name: 'Rätisevä'},
 {key: 'jingling', name: 'Helisevä'},
 {key: 'crackling', name: 'Raksahteleva'},
 {key: 'crickling', name: 'Ritisevä'}
];

@Component({
  selector: 'page-sound-evaluation',
  templateUrl: 'sound-evaluation.html',
})
export class SoundEvaluationPage {
  private profile: FormGroup;
  private attributes: Array<{key:string, name:string}>;
  //private sound_evaluations: Array<{key:string, name:string}>;
  private submitAttempted: boolean = false;
  private playing: boolean = false;
  private soundId: string;
  private sounds: Array<string>;
  private soundIndex: number;
  private uid: string;

  constructor(private formBuilder: FormBuilder, private nativeAudio: NativeAudio, private userProvider: UserProvider,
              public navCtrl: NavController, public navParams: NavParams) {

    this.uid = this.userProvider.username;

    this.sounds = SOUNDS;
    for (let i = this.sounds.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [this.sounds[i], this.sounds[j]] = [this.sounds[j], this.sounds[i]];
    }
    this.soundIndex = 0;

    this.attributes = SOUND_ATTRIBUTES;

    let form_attributes = {};
    form_attributes['similarity'] = ['', Validators.required];
    for (let sound_attr of SOUND_ATTRIBUTES) {
      form_attributes[sound_attr['key']] = ['', Validators.required]
    }
    this.profile = this.formBuilder.group(form_attributes);

    this.soundId = this.sounds[this.soundIndex];
    this.nativeAudio.preloadComplex(this.soundId, 'assets/audio/' + this.soundId + '.wav', 0.6, 1, 0).then(
      () => console.log('Sound loaded'),
      () => console.log('Error loading sound'));
  }

  startSound() {
    this.nativeAudio.loop(this.soundId).then(
      () => this.playing = true
    );
  }

  pauseSound() {
    this.nativeAudio.stop(this.soundId).then(
      () => this.playing = false
    );
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SoundEvaluationPage');
  }

  evaluate(form_profile) {
    this.submitAttempted = true;
    if (!form_profile.valid) {
      console.log('missing inputs');
    }
    else {
      this.pauseSound();
      this.nativeAudio.unload(this.soundId);

      this.soundIndex += 1;
      this.soundId = this.sounds[this.soundIndex];
      this.nativeAudio.preloadComplex(this.soundId, 'assets/audio/' + this.soundId + '.wav', 0.6, 1, 0);
      this.profile.reset();
      this.submitAttempted = false;
    }
  }
}
