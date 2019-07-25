import LoadingDoorAnim from "../common/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager";
import HomeScene from "../homeScene/homeScene";
import GameDataStorage from "../common/module/gameDataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class AboutScene extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    private isBackButton: boolean = false;
    private soundsManager: SoundsManager = null;
    onLoad() {
        this.soundsManager = new SoundsManager();
    }

    start() {
        this.loadingDoorAnim.setState(false);
        this.loadingDoorAnim.openDoor();
    }

    backButton() {
        if (this.isBackButton) //保证播放开门动画期间，按按钮 不重复开门
            return;
        this.isBackButton = true;

        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("homeScene", function () {
                let loadingDoorAnim: cc.Node = cc.find("Canvas/centerAnchor/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);

                let homeScene: HomeScene = cc.find("Canvas").getComponent("homeScene");
                homeScene.fristEntry = false;
                loadingDoorAnimScr.openDoor();
            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }

}
