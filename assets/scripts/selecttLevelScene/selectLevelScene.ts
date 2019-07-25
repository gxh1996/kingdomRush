import LoadingDoorAnim from "../common/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager";
import GameDataStorage, { User, GameConfig } from "../common/module/gameDataManager";
import HomeScene from "../homeScene/homeScene";
import LevelManager from "./levelManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectLevelScene extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    @property({ type: cc.Label })
    private scoreLabel: cc.Label = null;

    @property({ type: LevelManager })
    private levelManager: LevelManager = null;


    private user: User = null;
    private soundsManager: SoundsManager = null;
    private isBackButton: boolean = false;
    private gameConfig: GameConfig = null;
    private isLevelButton: boolean = false;
    onLoad() {
        this.soundsManager = new SoundsManager();
        this.gameConfig = GameDataStorage.getGameConfig();

    }

    start() {
        this.user = GameDataStorage.getCurrentUser();
        this.loadingDoorAnim.setState(false);
        this.loadingDoorAnim.openDoor();
        this.soundsManager.playBGM("sounds/selectLevelsceneBGM");

        this.updateScoreLabel();
        this.levelManager.updateLevelMap(this.user);
    }

    /**
     * 更新成绩板 
     */
    private updateScoreLabel() {
        let max: number = this.gameConfig.getStarSum();
        let num: number = this.user.getStartSum();
        this.scoreLabel.string = num.toString() + "/" + max.toString();
    }

    backButton() {
        if (this.isBackButton) //保证播放开门动画期间，按开始游戏按钮 不重复开门
            return;
        this.isBackButton = true;

        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("homeScene", function () {
                let homeScene: HomeScene = cc.find("Canvas").getComponent("homeScene");
                homeScene.fristEntry = false;

                let loadingDoorAnim: cc.Node = cc.find("Canvas/centerAnchor/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);
                loadingDoorAnimScr.openDoor();
            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);
    }

    toLevelScene() {
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("levelScene", function () {
                let loadingDoorAnim: cc.Node = cc.find("Canvas/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);

                //传入关卡数

                loadingDoorAnimScr.openDoor();
            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }
    // update (dt) {}
}
