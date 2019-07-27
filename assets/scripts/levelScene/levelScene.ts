import SoundsManager from "../common/module/soundsManager";
import GameDataStorage from "../common/module/gameDataManager";
import LoadingDoorAnim from "../common/loadingDoorAnim";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    @property({ type: cc.Node })
    private pauseFace: cc.Node = null;

    @property({ type: cc.Node })
    private setFace: cc.Node = null;


    private levelNum: number = null;
    private isBackButton: boolean = false;
    private soundsManager: SoundsManager = null;
    private isExitButton: boolean = false;
    onLoad() {
        this.soundsManager = new SoundsManager();
    }

    start() {

    }

    backButton() {
        if (this.isBackButton) //保证播放开门动画期间，按按钮 不重复开门
            return;
        this.isBackButton = true;

        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("selectLevelScene", function () {
                let loadingDoorAnim: cc.Node = cc.find("Canvas/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);

                loadingDoorAnimScr.openDoor();
            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }

    pauseButton() {
        this.pauseFace.active = true;
        this.pauseFace.runAction(cc.fadeIn(0.2));
    }

    /**
     * 游戏暂停后继续
     */
    resumeButton() {
        this.pauseFace.runAction(cc.fadeOut(0.2))
        this.scheduleOnce(function () {
            this.pauseFace.active = false;
        }.bind(this), 0.2);
    }

    setButton() {
        this.setFace.active = true;
        this.setFace.runAction(cc.fadeIn(0.2));
    }

    closeButton() {
        this.setFace.runAction(cc.fadeOut(0.2))
        this.scheduleOnce(function () {
            this.setFace.active = false;
        }.bind(this), 0.2);
    }

    resetButton() {

    }

    /**
     * 离开游戏
     * @returns  
     */
    exitButton() {
        if (this.isExitButton) //保证播放开门动画期间，按开始游戏按钮 不重复开门
            return;
        this.isExitButton = true;

        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("selectLevelScene");
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }
    // update (dt) {}
}
