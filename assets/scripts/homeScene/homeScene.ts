import SoundsManager from "../common/module/soundsManager"
import StartAnim from "./startAnim";
import GameDataStorage from "../common/module/gameDataManager";
import { User } from "../common/module/gameDataManager"
import LevelDataManager from "../common/module/levelDataManager"
import LoadingDoorAnim from "../../res/prefabs/loadingDoorAnim/loadingDoorAnim";

const { ccclass, property } = cc._decorator;

@ccclass("ConfigFiles")
class ConfigFiles {
    @property({
        type: cc.JsonAsset,
        displayName: "游戏配置"
    })
    gameConfig: cc.JsonAsset = null;

    @property({
        type: cc.JsonAsset,
        displayName: "关卡配置"
    })
    levelConfig: cc.JsonAsset = null;
}

@ccclass
export default class HomeScene extends cc.Component {

    @property({
        type: ConfigFiles,
        displayName: "游戏配置文件"
    })
    private conFigFiles: ConfigFiles = new ConfigFiles();

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
     * 第一次进入游戏
     */
    fristEntry: boolean = true;
    private clips: cc.AnimationClip[] = null;
    onLoad() {
        this.soundsManager = new SoundsManager();
        //初始化 模块
        if (GameDataStorage.getGameConfig() === null) {
            // cc.sys.localStorage.clear();
            GameDataStorage.init(this.conFigFiles.gameConfig.json);
            LevelDataManager.initLevelData(this.conFigFiles.levelConfig.json);
        }

        this.clips = this.startAnim.node.getComponent(cc.Animation).getClips();
    }

    start() {
        console.log("本地数据:", cc.sys.localStorage);

        this.soundsManager.playBGM("sounds/home_scene_bg");
        if (this.fristEntry) {
            this.startAnim.logoDown();
            // this.fristEntry = false;
        }

    }

    /**
     * 点击 开始游戏 按钮
     */
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

        GameDataStorage.preserveGameData();
    }

    /**
     * 跳转到 选关 场景
     */
    selectLevelScene(usersI: number) {
        let users: User[] = GameDataStorage.getUsers();
        GameDataStorage.setCurrentUser(users[usersI])
        this.soundsManager.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("selectLevelScene");
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }
}
