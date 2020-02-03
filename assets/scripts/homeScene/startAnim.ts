import SoundsManager from "../common/module/soundsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class StartAnim extends cc.Component {

    private animation: cc.Animation = null;
    private isButtonDown: boolean = false;
    private clips: cc.AnimationClip[] = null;
    onLoad() {
        this.animation = this.node.getComponent(cc.Animation);
        this.clips = this.animation.getClips();
    }

    start() {
    }

    /**
     * startAnim下落的动画
     */
    logoDown() {
        this.animation.play("homeSceneStart");
    }

    /**
     * 播放按钮上收的动画 
     */
    buttonUp() {
        this.animation.play("buttonUp");
    }

    buttonDown() {
        if (this.isButtonDown)
            return;
        this.isButtonDown = true;

        SoundsManager.ins.playEffect("sounds/click");
        this.animation.play("buttonDown");

        let d: cc.ActionInterval = cc.delayTime(this.clips[2].duration);
        let func: cc.ActionInstant = cc.callFunc(function () {
            this.isButtonDown = false;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(d, func);
        this.node.runAction(seq);
    }




    // update (dt) {}
}
