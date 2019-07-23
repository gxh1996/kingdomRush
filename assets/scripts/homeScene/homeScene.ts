import LoadingDoorAnim from "../common/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager"
import StartAnim from "./startAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HomeScene extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    @property({ type: StartAnim })
    private startAnim: StartAnim = null;

    private isStartGame: boolean = false;
    /**
     * 是否点击了这个按钮
     */
    private isAboutButton: boolean = false;
    private soundsManager: SoundsManager = null;
    /**
     * 刚进入游戏播放logoDown动画
     */
    playLogoDown: boolean = true;
    private clips: cc.AnimationClip[] = null;
    onLoad() {
        this.soundsManager = new SoundsManager();
        this.clips = this.startAnim.node.getComponent(cc.Animation).getClips();
    }

    start() {
        this.soundsManager.playBGM("sounds/home_scene_bg");
        if (this.playLogoDown)
            this.startAnim.logoDown();

    }

    startGame() {
        if (this.isStartGame) //保证播放开门动画期间，按开始游戏按钮 不重复开门
            return;
        this.isStartGame = true;
        this.soundsManager.playEffect("sounds/click");
        this.startAnim.buttonUp();

        let d: cc.ActionInterval = cc.delayTime(this.clips[1].duration);
        let func: cc.ActionInstant = cc.callFunc(function () {
            this.isStartGame = false;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(d, func);
        this.node.runAction(seq);
    }

    aboutButton() {
        if (this.isAboutButton) //保证播放开门动画期间，按开始游戏按钮 不重复开门
            return;
        this.isAboutButton = true;

        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("aboutScene");
        }, this);
        this.loadingDoorAnim.closeDoor(func);

    }
}
