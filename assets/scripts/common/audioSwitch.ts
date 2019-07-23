import SoundsManager from "./module/soundsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AudioSwitch extends cc.Component {

    @property({
        type: cc.SpriteFrame
    })
    private musicOff: cc.SpriteFrame = null;
    @property({
        type: cc.SpriteFrame
    })
    private musicOn: cc.SpriteFrame = null;
    @property({
        type: cc.SpriteFrame
    })
    private effectOff: cc.SpriteFrame = null;
    @property({
        type: cc.SpriteFrame
    })
    private effectOn: cc.SpriteFrame = null;

    @property({
        type: cc.Sprite
    })
    private musicSwitch: cc.Sprite = null;

    @property({
        type: cc.Sprite
    })
    private effectSwitch: cc.Sprite = null;

    private soundsManager: SoundsManager = null;
    onLoad() {
        this.soundsManager = new SoundsManager();
    }

    start() {
        this.initSwitch();
    }

    private initSwitch() {
        let isMusicMute: boolean = this.soundsManager.getIsBGMMute();
        let isEffectMute: boolean = this.soundsManager.getIsEffectMute();
        if (isMusicMute)
            this.musicSwitch.spriteFrame = this.musicOff;
        else
            this.musicSwitch.spriteFrame = this.musicOn;

        if (isEffectMute)
            this.effectSwitch.spriteFrame = this.effectOff;
        else
            this.effectSwitch.spriteFrame = this.effectOn;
    }

    musicSwitchButton() {
        let state: boolean = this.soundsManager.getIsBGMMute();
        if (state) {
            this.soundsManager.setIsBGMMute(false);
            this.musicSwitch.spriteFrame = this.musicOn;

        }
        else { //有声
            this.soundsManager.setIsBGMMute(true);
            this.musicSwitch.spriteFrame = this.musicOff;

        }
    }

    effecttSwitchButton() {
        let state: boolean = this.soundsManager.getIsEffectMute();
        if (state) { //无音效
            this.soundsManager.setIsEffectMute(false);
            this.effectSwitch.spriteFrame = this.effectOn;

        }
        else {
            this.soundsManager.setIsEffectMute(true);
            this.effectSwitch.spriteFrame = this.effectOff;

        }
    }

    // update (dt) {}
}
