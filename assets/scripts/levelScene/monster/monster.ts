import Creature from "../creature";
import CombatLogic from "../combatLogic";
import Soldier from "../tower/barrack/soldier";
import GameDataStorage, { GameConfig } from "../../common/module/gameDataManager";
import Utils from "../../common/module/utils";
import MonsterFactory from "./monsterFactory";
import LevelScene from "../levelScene";
import Move from "../../common/move";
const { ccclass, property } = cc._decorator;

enum WalkState { Down, left, up, right }

@ccclass
export default class Monster extends Creature {

    @property({
        type: [cc.SpriteFrame],
        tooltip: "怪物攻击帧动画图片"
    })
    private attackFrame: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "怪物死亡帧动画图片"
    })
    private deadFrame: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame]
    })
    private downWalkFrames: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame]
    })
    private rightWalkFrames: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame]
    })
    private upWalkFrames: cc.SpriteFrame[] = [];


    /* 引用对象 */
    private monsterFactory: MonsterFactory = null;
    private levelScene: LevelScene = null;

    /* 属性 */
    monsterNo: number = null;

    /* 数据 */
    public static monstersOfAlive: Monster[] = null;
    /**
     * [怪物编号]{HP,speedOfMove,intervalOfAttack,aggressivity,rangeOfAttack,rangeOfInvestigate,price}
     */
    private monsterData: any[] = null;
    /**
     * 移动路径 世界
     */
    private path: cc.Vec2[] = null;
    /**
     * 每段路需要的时间，[0]:path[0]->path[1]
     */
    private pathTime: number[] = [];

    /* 控制 */
    /**
     * 要移动的目的地的path指针
     */
    private pathIndex: number = 0;
    /**
     * 路径移动的递归开关
     * 控制递归与对外说明
     */
    swiOfRecursionInPW: boolean = false;
    /**
     * 是否在路径上移动
     * 控制 是否需要回归路径点上S
     */
    private moveInPath: boolean = true;
    private stateOfFA: WalkState = null;

    onLoad() {
        //对象/组件的赋值
        this.combatLogic = new CombatLogic(this, Soldier.soldiersOfAlive);
        this.monsterFactory = cc.find("Canvas/personMap").getComponent("monsterFactory");
        this.levelScene = cc.find("Canvas").getComponent("levelScene");
        this._move = new Move(this.node);

        //怪物数据
        let gameConfig: GameConfig = GameDataStorage.getGameConfig();
        this.monsterData = gameConfig.getMonsterData();
    }

    init(monsterNo: number, path: cc.Vec2[]) {
        //初始化属性
        this.monsterNo = monsterNo;
        let md: any = this.monsterData[monsterNo];
        this.maxHp = this.cHP = md.HP;
        this.speedOfMove = md.speedOfMove;
        this.intervalOfAttack = md.intervalOfAttack;
        this.aggressivity = md.aggressivity;
        this.rangeOfAttack = md.rangeOfAttack;
        this.rangeOfInvestigate = md.rangeOfInvestigate;
        this.intervalOfThink = md.intervalOfThink;

        //初始化数据
        this.path = path;
        this.initPathTime();

        //初始化视图
        this.frameAnim.setSpriteFrame(this.downWalkFrames[0]);
        this.refreshBloodBar();
        this.node.setPosition(this.node.parent.convertToNodeSpaceAR(this.path[0]));

        //初始化控制参数
        this.pathIndex = 1;
        this.swiOfRecursionInPW = false;
        this.moveInPath = true;
        this.stateOfFA = null;
        this.initCreature();
    }

    /**
     * 从现在开始，经time后的坐标
     * @param t 
     * @returns pos 世界
     */
    getPosInTime(t: number): cc.Vec2 {
        let cI: number = this.pathIndex; //当前目的点的path指针
        let cP: cc.Vec2 = this.getWPos();
        let ct: number = this.path[cI].sub(cP).mag() / this.speedOfMove;
        t -= ct;

        while (true) {
            ct = this.pathTime[cI + 1];
            t -= ct;
            if (t < 0)
                break;
            cI++;
        }

        //多出的一点时间不足以抵达下一个点，就不要了
        return this.path[cI];
    }
    /**
     * 初始化pathTime
     */
    private initPathTime() {
        for (let i = 0; i < this.path.length - 1; i++) {
            let l: number = this.path[i + 1].sub(this.path[i]).mag();
            this.pathTime[i] = l / this.speedOfMove;
        }
    }

    /**
     * 不会自动停止播放行走动画
     * @param des 世界
     */
    walk(des: cc.Vec2, func: Function = null, t: number = null) {
        let dis: cc.Vec2 = des.sub(this.getWPos());
        this.playWalk(dis);

        this.move(des, func, t);
    }

    protected stopWalk() {
        this.frameAnim.stop();
        this.stateOfFA = null;
        this._move.stopMove();
    }

    /**
     * 播放行走动画,自动判断是否需要重置动画
     * @param l 行走方向
     */
    private playWalk(l: cc.Vec2) {
        let state: WalkState = this.getWalkState(l);
        if (state === this.stateOfFA)
            return;

        this.stateOfFA = state;
        switch (state) {
            case WalkState.Down: {
                this.frameAnim.setFrameArray(this.downWalkFrames);
                break;
            }
            case WalkState.up: {
                this.frameAnim.setFrameArray(this.upWalkFrames);
                break;
            }
            case WalkState.left: {
                this.frameAnim.setFrameArray(this.rightWalkFrames);
                this.node.scaleX = -1;
                break;
            }
            case WalkState.right: {
                this.frameAnim.setFrameArray(this.rightWalkFrames);
                this.node.scaleX = 1;
            }
        }
        this.frameAnim.play(true);
    }
    /**
     * 得到 人物应该使用哪种行走
     * @param l 移动方向
     * @returns walk state 
     */
    private getWalkState(l: cc.Vec2): WalkState {
        let degree: number = this.getDegree(l);
        if (degree >= 30 && degree <= 150) {
            return WalkState.up;
        }
        else if (degree >= 210 && degree <= 330) {
            return WalkState.Down;
        }
        else if (l.x > 0)
            return WalkState.right;
        else
            return WalkState.left;
    }
    /**
     * Gets degree
     * @param dir 方向向量
     * @returns degree [0,360)
     */
    private getDegree(dir: cc.Vec2): number {
        let rot: number;
        if (dir.x === 0 && dir.y > 0) //y上半轴
            rot = 90;
        else if (dir.x === 0 && dir.y < 0) //y下半轴
            rot = 270;
        else {
            let r: number = Math.atan(dir.y / dir.x);
            let d: number = r * 180 / Math.PI;
            rot = d;
        }

        if (rot === 0) //在x轴上
            if (dir.x > 0)
                rot = 0;
            else
                rot = 180;
        else if (dir.x < 0 && dir.y > 0 || dir.x < 0 && dir.y < 0) //在第二三象限
            rot += 180;
        else if (dir.x > 0 && dir.y < 0) //在第四象限
            rot += 360;
        return rot;
    }

    protected refreshState() {
        this.refreshBloodBar();

        //死亡    
        if (this.cHP === 0) {
            this.die(Monster.monstersOfAlive, this);
            this.playDie(this.deadFrame, this.releaseSelf.bind(this));
            this.levelScene.addCash(this.monsterData[this.monsterNo].price);
        }
    }

    releaseSelf() {
        this.monsterFactory.destroyMonster(this);
    }

    /**
     * 使用前需 this.swiOfRecursionInPW = true
     * @returns  
     */
    protected walkInPath() {
        if (!this.swiOfRecursionInPW)
            return;

        if (!this.moveInPath) { //回归路径点
            this.pathIndex = this.getPosOfMinDisWithPath();
            this.walk(this.path[this.pathIndex], this.walkCallBack.bind(this));
            this.moveInPath = true;
        }
        else //从路径点移动到路径点
            this.walk(this.path[this.pathIndex], this.walkCallBack.bind(this), this.pathTime[this.pathIndex - 1])

    }
    private walkCallBack() {
        if (this.pathIndex === this.path.length - 1) {
            console.log("怪物跳脱");
            this.levelScene.subHP();
            this.stopWalkInPath();
            this.die(Monster.monstersOfAlive, this);
            this.releaseSelf();
        }
        this.pathIndex++;
        this.walkInPath();
    }
    /**
     * 得到离路径上最近的路径点指针
     */
    private getPosOfMinDisWithPath(): number {
        let cwp: cc.Vec2 = this.getWPos();
        let l: number = Utils.getDisOfTwoPos(cwp, this.path[this.pathIndex]);
        let j: number = this.pathIndex;
        for (let i = this.pathIndex + 1; i < this.path.length; i++) {
            let tl: number = Utils.getDisOfTwoPos(cwp, this.path[i]);
            if (tl < l) {
                l = tl;
                j = i;
            }
            else
                break;
        }
        return j;
    }

    /**
     * 关闭walkInPath()的递归移动，停止行走
     */
    private stopWalkInPath() {
        this.swiOfRecursionInPW = false;
        this.moveInPath = false;
        this.stopWalk();
    }


    track(pos: cc.Vec2) {
        this.isTracking = true;
        this.walk(pos, function () {
            this.isTracking = true;
            this.stopWalk();
        }.bind(this))
    }
    stopTrack() {
        this.isTracking = false;
        this.stopWalk();
    }
    refreshTrackTarget(pos: cc.Vec2) {
        this.walk(pos, function () {
            this.isTracking = true;
            this.stopWalk();
        }.bind(this))
    }

    attack(m: Creature) {
        this.isAttacking = true;

        this.frameAnim.setFrameArray(this.attackFrame);
        this.frameAnim.play(false, false, false, function () {
            m.injure(this.aggressivity);
            this.isAttacking = false;
        }.bind(this));

    }

    nonComLogic() {
        this.isNonComState = true;
        //已经在执行路径上行走了
        if (this.swiOfRecursionInPW)
            return;
        this.swiOfRecursionInPW = true;
        this.walkInPath();
    }
    stopNonComLogic() {
        this.stopWalkInPath();
        this.isNonComState = false;
    }


}
