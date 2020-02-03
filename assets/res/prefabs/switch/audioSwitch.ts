import SoundsManager from "../../../scripts/common/module/soundsManager";

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

    onLoad() {
    }

    start() {
        this.initSwitch();
    }

    private initSwitch() {
        let isMusicMute: boolean = SoundsManager.ins.IsBGMMute;
        let isEffectMute: boolean = SoundsManager.ins.IsEffectMute;
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
        let state: boolean = SoundsManager.ins.IsBGMMute;
        if (state) {
            SoundsManager.ins.openBGM();
            this.musicSwitch.spriteFrame = this.musicOn;

        }
        else { //有声
            SoundsManager.ins.closeBGM();
            this.musicSwitch.spriteFrame = this.musicOff;

        }
    }

    effecttSwitchButton() {
        let state: boolean = SoundsManager.ins.IsEffectMute;
        if (state) { //无音效
            SoundsManager.ins.openEffect();
            this.effectSwitch.spriteFrame = this.effectOn;

        }
        else {
            SoundsManager.ins.closeEffect()
            this.effectSwitch.spriteFrame = this.effectOff;

        }
    }

    // update (dt) {}
}
