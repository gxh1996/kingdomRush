import GameDataStorage, { GameConfig, User } from "../common/module/gameDataManager";
import MonsterFactory from "./monster/monsterFactory";
import V_gameState from "./V_gameState";
import SettlementFace from "./settlementFace";
import Utils from "../common/module/utils";
import Monster from "./monster/monster";
import Builder from "./builder";
import LevelDataManager, { Level } from "../common/module/levelDataManager";
import LoadingDoorAnim from "../../res/prefabs/loadingDoorAnim/loadingDoorAnim";
import SoundsManager from "../common/module/soundsManager";
import Soldier from "./tower/barrack/soldier";

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

    @property({})
    private isDebug: boolean = false;

    @property({
        type: cc.Sprite,
        displayName: "地图"
    })
    private spriteOfMap: cc.Sprite = null;

    /* 关卡信息 */
    levelNum: number;
    /**
     * 在进行第几波
     */
    private roundIndex;
    /**
     * 最大回合数
     */
    private maxRound: number;
    /**
     * 关卡信息
     */
    levelData: Level;

    /* 玩家信息 */
    private maxHP: number;
    private HP: number;
    /**
     * 金币数
     */
    cash: number;
    /**
     * 游戏得分
     */
    private gameReview: number;
    private user: User = null;

    /* 控制 */
    private isBackButton: boolean = false;
    private isExitButton: boolean = false;
    private startGame: boolean = false;
    /**
     * 计时，用于控制游戏回合阶段
     */
    private cT: number = 0;

    /* 数据 */
    /**
     * 存在的怪物数组
     */
    private monsterArray: Monster[] = null;

    private gameConfig: GameConfig = null;
    private animOfVPMap: cc.Animation = null;
    /**
     * 放置空地的根节点
     */
    private builderMap: cc.Node = null;
    private settlementFace: SettlementFace = null;

    onLoad() {
        this.settlementFace = cc.find("Canvas/centerUI/settlementFace").getComponent("settlementFace");
        this.gameConfig = GameDataStorage.getGameConfig();
        this.animOfVPMap = cc.find("Canvas/VPMap").getComponent(cc.Animation);
        this.builderMap = cc.find("Canvas/builderMap");
        this.monsterArray = Monster.monstersOfAlive;
        this.user = GameDataStorage.getCurrentUser();

        Soldier.soldiersOfAlive = [];
        console.log("士兵数组", Soldier.soldiersOfAlive);
    }

    start() {
        this.buildScene();

        console.log(`#进入关卡${this.levelNum}`);
        SoundsManager.ins.curBGM = "sounds/gameBGM/game_bg" + Utils.getRandomInterger(1, 5);
        SoundsManager.ins.playBGM(SoundsManager.ins.curBGM);

        //打开碰撞检测系统
        let manager: cc.CollisionManager = cc.director.getCollisionManager();
        manager.enabled = true;
        if (this.isDebug) {
            manager.enabledDebugDraw = true;
            manager.enabledDrawBoundingBox = true;
        }
    }

    private buildScene() {
        cc.loader.loadRes("levelData/level" + this.levelNum + "/roadData", cc.AnimationClip, function (e, res: any) {
            //添加移动路径的动画
            this.animOfVPMap.addClip(res);
            this.levelData = LevelDataManager.getLevelData(this.levelNum);

            //添加空地（用于建塔）
            let posArr: cc.Vec2[] = this.levelData.posOfBuilders;
            for (let i = 0; i < posArr.length; i++) {
                let n: cc.Node = cc.instantiate(this.builderPrefab);
                let b: Builder = n.getComponent("builder");
                this.builderMap.addChild(n);
                n.setPosition(posArr[i]);
                b.init(i);
            }

            cc.loader.loadRes("levelData/level" + this.levelNum + "/map" + this.levelNum, cc.SpriteFrame, function (e, res: any) {
                //设置地图
                this.spriteOfMap.spriteFrame = res;

                this.init();
                this.loadingDoorAnim.openDoor();
                this.startGame = true;
            }.bind(this))
        }.bind(this));
    }

    /**
     * 初始化玩家状态，回合数
     */
    private init() {
        //设置玩家和回合信息
        this.HP = this.maxHP = this.gameConfig.getInitBlood();
        this.cash = this.gameConfig.getInitChip();
        this.maxRound = this.levelData.noOfRound.length;
        this.gameReview = 0;

        //更新界面显示
        this.V_gameState.setHP(this.HP);
        this.V_gameState.setGold(this.cash);
        this.V_gameState.setRound(1, this.maxRound);

        //初始化回合控制
        this.roundIndex = 1;
        this.cT = 0;

        //初始化monsterFactory
        this.monsterFactory.init(this.levelData.roadNum);
    }


    subHP() {
        this.HP--;
        this.V_gameState.setHP(this.HP);
        if (this.HP <= 0) {
            this.startGame = false;
            this.settlementFace.outFailFace();
        }
    }

    /**
     * Subs cash
     * @param n 减的数量
     * @returns 不够返回false 
     */
    subCash(n: number): boolean {
        if (this.cash < n)
            return false;
        this.cash -= n;
        this.V_gameState.setGold(this.cash);
        return true;
    }

    addCash(n: number) {
        this.cash += n;
        this.V_gameState.setGold(this.cash);
    }


    /* 按钮绑定 */
    backButton() {
        if (this.isBackButton) //保证播放开门动画期间，按按钮 不重复开门
            return;
        this.isBackButton = true;

        SoundsManager.ins.playEffect("sounds/click");
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

        //判断是在哪个面板点击的按钮，隐藏该面板
        if (this.setFace.active) {
            this.setFace.runAction(cc.fadeOut(0.2));
            this.scheduleOnce(function () {
                this.setFace.active = false;
            }, 0.2)
        }
        else
            this.settlementFace.hiddenSettleFace();

        //重置游戏
        this.monsterFactory.clearMonsters();
        this.monsterFactory.init(this.levelData.roadNum);

        this.resetLand();
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

        SoundsManager.ins.playEffect("sounds/click");
        let func: cc.ActionInstant = cc.callFunc(function () {
            cc.director.loadScene("selectLevelScene");
        }, this);
        this.loadingDoorAnim.closeDoor(func);

        GameDataStorage.preserveGameData();
    }

    /**
     * 重置空地,删除建在上面的塔
     */
    private resetLand() {
        let childre: cc.Node[] = this.builderMap.children;
        childre.forEach(e => {
            let builder: Builder = e.getComponent("builder");
            builder.deleteTower();
            builder.hiddenBuildFaceImmediately();
        });
    }

    /**
     * 刷新回合，生成怪物
     */
    private refreshRound(dt: number) {
        //回合计时控制
        if (this.roundIndex <= this.maxRound) {
            this.cT += dt;
            if (this.cT >= this.levelData.timeOfRound[this.roundIndex - 1]) { //开始进行这一波
                //更新显示的回合数
                this.V_gameState.setRound(this.roundIndex, this.maxRound);

                //生成这一波   
                let no: number[][] = this.levelData.noOfRound;
                let mNums: number[] = no[this.roundIndex - 1];
                for (let i = 0; i < mNums.length; i++) {
                    this.monsterFactory.createMonster(no[this.roundIndex - 1][i]);
                }

                this.cT = 0;
                this.roundIndex++;
            }
        }
        else if (Monster.monstersOfAlive.length === 0 && this.monsterFactory.creMonList.length === 0 && this.HP > 0) { //所有波怪物全部出发，怪物全部被消灭或离开，并且生命不为0。游戏胜利
            if (this.HP === this.maxHP)
                this.gameReview = 3;
            else if (this.HP >= this.maxHP / 2)
                this.gameReview = 2;
            else
                this.gameReview = 1;
            this.settlementFace.outPassFace(this.gameReview);
            this.startGame = false;
            this.user.setLevelReview(this.levelNum - 1, this.gameReview);
        }
    }

    update(dt) {
        if (!this.startGame)
            return;

        this.refreshRound(dt);
    }
}

