import LoadingDoorAnim from "../common/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager"
import StartAnim from "./startAnim";
import GameDataStorage from "../common/module/gameDataManager";
import { User } from "../common/module/gameDataManager"

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
     * 第一次进入游戏
     */
    fristEntry: boolean = true;
    private clips: cc.AnimationClip[] = null;
    onLoad() {
        this.soundsManager = new SoundsManager();
        this.clips = this.startAnim.node.getComponent(cc.Animation).getClips();
    }

    start() {
        console.log(cc.sys.localStorage, GameDataStorage.getGameConfig(), GameDataStorage.getUsers());
        this.soundsManager.playBGM("sounds/home_scene_bg");
        if (this.fristEntry) {
            this.startAnim.logoDown();
            GameDataStorage.init();

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
