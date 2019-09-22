import SoundsManager from "../common/module/soundsManager";
import GameDataStorage, { GameConfig, User } from "../common/module/gameDataManager";
import LoadingDoorAnim from "../common/loadingDoorAnim";
import MonsterFactory from "./monster/monsterFactory";
import Level from "./levelInfo";
import V_gameState from "./V_gameState";
import SettlementFace from "./settlementFace";
import Utils from "../common/module/utils";
import Monster from "./monster/monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelScene extends cc.Component {

    @property({ type: LoadingDoorAnim })
    private loadingDoorAnim: LoadingDoorAnim = null;

    @property({ type: cc.Node })
    private pauseFace: cc.Node = null;

    @property({ type: cc.Node })
    private setFace: cc.Node = null;

    @property({ type: MonsterFactory })
    private monsterFactory: MonsterFactory = null;

    @property({ type: cc.Prefab })
    private builderPrefab: cc.Prefab = null;

    @property({ type: V_gameState })
    private V_gameState: V_gameState = null;



    levelNum: number = 1;

    //玩家信息
    private maxHP: number;
    private HP: number = 1;
    private cash: number = 1;
    private maxRound: number = 0;
    /**
     * 在进行第几波
     */
    private roundIndex = 1;

    private gameConfig: GameConfig = null;
    private isBackButton: boolean = false;
    private soundsManager: SoundsManager = null;
    private isExitButton: boolean = false;
    private VPMap: cc.Node = null;
    private builderMap: cc.Node = null;
    private startGame: boolean = false;
    private levelData: Level;
    private cT: number = 0;
    private settlementFace: SettlementFace = null;
    /**
     * 怪物列表
     */
    private monsterArray: Monster[];
    /**
     * 游戏得分
     */
    private gameReview: number = 0;
    private user: User = null;
    onLoad() {
        // cc.sys.localStorage.clear();
        // GameDataStorage.init();

        this.settlementFace = cc.find("Canvas/centerUI/settlementFace").getComponent("settlementFace");
        this.soundsManager = new SoundsManager();
        this.gameConfig = GameDataStorage.getGameConfig();
        this.VPMap = cc.find("Canvas/VPMap");
        this.builderMap = cc.find("Canvas/builderMap");
        cc.loader.loadResDir("levelInfo/level" + this.levelNum + "/VPMap", cc.Prefab, function (e, res: any[]) {
            //添加地图路径
            for (let i = 0; i < res.length; i++) {
                this.VPMap.addChild(cc.instantiate(res[i]));
            }
            this.levelData = Level.getLevelData(this.levelNum);

            //添加空地（用于建塔）
            let posArr: cc.Vec2[] = this.levelData.getBuilders();
            for (let i = 0; i < posArr.length; i++) {
                let n: cc.Node = cc.instantiate(this.builderPrefab);
                this.builderMap.addChild(n);
                n.setPosition(posArr[i]);
            }

            this.init();

            this.loadingDoorAnim.openDoor();
            this.startGame = true;
        }.bind(this));
        this.monsterArray = this.monsterFactory.getMonsterArray();
        this.user = GameDataStorage.getCurrentUser();
    }

    start() {
        this.soundsManager.playBGM("sounds/gameBGM/game_bg" + Utils.getRandomInterger(1, 5));
        console.log(this.levelNum);

        //打开碰撞检测系统
        let manager: cc.CollisionManager = cc.director.getCollisionManager();
        manager.enabled = true;
    }

    private init() {
        //设置玩家信息
        this.HP = this.maxHP = this.gameConfig.getInitBlood();
        this.cash = this.gameConfig.getInitChip();
        this.maxRound = this.levelData.getRound();

        //更新界面显示
        this.V_gameState.setHP(this.HP);
        this.V_gameState.setGold(this.cash);
        this.V_gameState.setRound(1, this.maxRound);

        this.roundIndex = 1;
        this.cT = 0;
    }


    subHP() {
        this.HP--;
        this.V_gameState.setHP(this.HP);
        if (this.HP <= 0) {
            this.startGame = false;
            this.settlementFace.outFailFace();
        }
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
        this.scheduleOnce(function () {
            cc.director.pause();
        }, 0.2)
    }

    /**
     * 游戏暂停后继续
     */
    resumeButton() {
        cc.director.resume();
        this.pauseFace.runAction(cc.fadeOut(0.2))
        this.scheduleOnce(function () {
            this.pauseFace.active = false;
        }.bind(this), 0.2);
    }

    setButton() {
        this.setFace.active = true;
        this.setFace.runAction(cc.fadeIn(0.2));
        this.scheduleOnce(function () {
            cc.director.pause();
        }, 0.2)
    }

    closeButton() {
        cc.director.resume();
        this.setFace.runAction(cc.fadeOut(0.2))
        this.scheduleOnce(function () {
            this.setFace.active = false;
        }.bind(this), 0.2);
    }

    resetButton() {
        cc.director.resume();

        if (this.setFace.active) {
            this.setFace.runAction(cc.fadeOut(0.2));
            this.scheduleOnce(function () {
                this.setFace.active = false;
            }, 0.2)
        }
        this.settlementFace.hiddenSettleFace();

        this.monsterFactory.clearMonsters();
        this.init();
        this.startGame = true;
    }

    /**
     * 离开游戏
     * @returns  
     */
    exitButton() {
        cc.director.resume();
        this.settlementFace.hiddenSettleFace();

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

    update(dt) {

        if (!this.startGame)
            return;

        if (this.roundIndex <= this.levelData.getRound()) {
            this.cT += dt;
            if (this.cT >= this.levelData.getTimeOfRound()[this.roundIndex - 1]) { //开始进行这一波
                //更新显示的回合数
                this.V_gameState.setRound(this.roundIndex, this.maxRound);

                //生成这一波   
                let no: number[][] = this.levelData.getNoOfRound();
                let mNums: number[] = no[this.roundIndex - 1];
                for (let i = 0; i < mNums.length; i++) {
                    this.monsterFactory.createMonster(no[this.roundIndex - 1][i]);
                }

                this.cT = 0;
                this.roundIndex++;
            }
        }
        else if (this.monsterArray.length === 0 && this.HP > 0) { //所有波怪物全部出发，怪物全部被消灭或离开，并且生命不为0。游戏胜利
            if (this.HP === this.maxHP)
                this.gameReview = 3;
            else if (this.HP >= this.maxHP / 2)
                this.gameReview = 2;
            else
                this.gameReview = 1;
            this.settlementFace.outPassFace(this.gameReview);
            this.startGame = false;
            // this.user.setLevelReview(this.levelNum - 1, this.gameReview);
        }
    }
}
