import GameDataStorage, { User, GameConfig } from "../common/module/gameDataManager";
import HomeScene from "../homeScene/homeScene";
import LevelManager from "./levelManager";
import LevelScene from "../levelScene/levelScene";
import LoadingDoorAnim from "../../res/prefabs/loadingDoorAnim/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SelectLevelScene extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    @property({ type: cc.Label })
    private scoreLabel: cc.Label = null;

    @property({ type: LevelManager })
    private levelManager: LevelManager = null;

    @property({ type: cc.Animation })
    private skillsBoardAnimation: cc.Animation = null;


    private user: User = null;
    private isBackButton: boolean = false;
    private gameConfig: GameConfig = null;
    onLoad() {
        this.gameConfig = GameDataStorage.getGameConfig();
    }

    start() {
        this.user = GameDataStorage.getCurrentUser();
        this.loadingDoorAnim.setState(false);
        this.loadingDoorAnim.openDoor();
        SoundsManager.ins.curBGM = "sounds/selectLevelsceneBGM";
        SoundsManager.ins.playBGM(SoundsManager.ins.curBGM);

        this.updateScoreLabel();
        this.levelManager.updateLevelMap(this.user);
    }

    /**
     * 更新成绩板 
     */
    updateScoreLabel() {
        let max: number = this.gameConfig.getStarSum();
        let num: number = this.user.getCurrentHaveStarNum();
        this.scoreLabel.string = num.toString() + "/" + max.toString();
    }

    backButton() {
        if (this.isBackButton) //保证播放开门动画期间，按开始游戏按钮 不重复开门
            return;
        this.isBackButton = true;

        SoundsManager.ins.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("homeScene", function () {
                // let homeScene: HomeScene = cc.find("Canvas").getComponent("homeScene");
                // homeScene.fristEntry = false;

                let loadingDoorAnim: cc.Node = cc.find("Canvas/centerAnchor/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);
                loadingDoorAnimScr.openDoor();
            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);
        GameDataStorage.preserveGameData();
    }

    toLevelScene(level) {
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("levelScene", function () {
                let loadingDoorAnim: cc.Node = cc.find("Canvas/loadingDoorAnim");
                let loadingDoorAnimScr: LoadingDoorAnim = loadingDoorAnim.getComponent("loadingDoorAnim");
                loadingDoorAnimScr.setState(false);

                //传入关卡数
                let levelScene: LevelScene = cc.find("Canvas").getComponent("levelScene");
                levelScene.levelNum = Number(level);

            });
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }

    upgradeButton() {
        this.skillsBoardAnimation.play("skillsBoardDown");
    }

    // update (dt) {}
}
