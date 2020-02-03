import Creature from "../../creature";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";
import CombatLogic from "../../combatLogic";
import Barrack from "./barrack";
import Monster from "../../monster/monster";
import Move from "../../../common/move";
import Utils from "../../../common/module/utils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Soldier extends Creature {

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵攻击帧动画图片"
    })
    private soldier1Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵死亡帧动画图片"
    })
    private soldier1Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级1的士兵行走帧动画图片"
    })
    private soldier1Walk: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵攻击帧动画图片"
    })
    private soldier2Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵死亡帧动画图片"
    })
    private soldier2Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级2的士兵行走帧动画图片"
    })
    private soldier2Walk: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵攻击帧动画图片"
    })
    private soldier3Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵死亡帧动画图片"
    })
    private soldier3Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级3的士兵行走帧动画图片"
    })
    private soldier3Walk: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级4的士兵攻击帧动画图片"
    })
    private soldier4Attack: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级4的士兵死亡帧动画图片"
    })
    private soldier4Dead: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame],
        tooltip: "等级4的士兵行走帧动画图片"
    })
    private soldier4Walk: cc.SpriteFrame[] = [];

    /* 属性 */
    private level: number = null;

    /* 数据 */
    /**
     * 动画的帧集 [level][attck, die, walk] [cc.SpriteFrame]
     */
    private framesOfAnim: cc.SpriteFrame[][][] = null;
    /**
     * 驻点坐标 世界
     */
    private station: cc.Vec2 = null;
    stationNo: number = null;
    /**
     * {HP,speedOfMove,intervalOfAttack,aggressivity,rangeOfAttack,rangeOfInvestigate}
     */
    private soldierData: any = null;

    /* 记录 */
    /**
     * 用于给敌人遍历场上士兵用
     * 士兵加到节点上时push,士兵死亡时pop
     */
    static soldiersOfAlive: Soldier[] = null;

    /* 引用对象 */
    private barrack: Barrack = null;

    /* 控制 */
    private isToStation: boolean = false;
    private isPlayingWalk: boolean = false;
    /**
     * 士兵攻击图片少，攻速太快，控制速度
     */
    private attackEnable: boolean = true;

    onLoad() {
        //整理帧动画集
        this.framesOfAnim = [[this.soldier1Attack, this.soldier1Dead, this.soldier1Walk], [this.soldier2Attack, this.soldier2Dead, this.soldier2Walk], [this.soldier3Attack, this.soldier3Dead, this.soldier3Walk], [this.soldier4Attack, this.soldier4Dead, this.soldier4Walk]];

        //士兵数据
        let gameConfig: GameConfig = GameDataStorage.getGameConfig();
        this.soldierData = gameConfig.getSoldierData();

        //节点/组件赋值
        this.combatLogic = new CombatLogic(this, Monster.monstersOfAlive);
        this._move = new Move(this.node);
    }

    init(stationNo: number, station: cc.Vec2, level: number, barrack: Barrack) {
        //初始化属性
        this.level = level;
        let sd: any = this.soldierData[this.level];
        this.maxHp = this.cHP = sd.HP;
        this.speedOfMove = sd.speedOfMove;
        this.intervalOfAttack = sd.intervalOfAttack;
        this.aggressivity = sd.aggressivity;
        this.rangeOfAttack = sd.rangeOfAttack;
        this.rangeOfInvestigate = sd.rangeOfInvestigate;
        this.intervalOfThink = sd.intervalOfThink;

        //初始化数据
        this.stationNo = stationNo;
        this.station = station;

        //初始化视图
        this.frameAnim.setSpriteFrame(this.framesOfAnim[level][2][0]);
        this.refreshBloodBar();

        //初始化引用对象
        this.barrack = barrack;

        //初始化控制参数
        this.isPlayingWalk = false;
        this.isToStation = false;
        this.attackEnable = true;
        this.initCreature();
    }

    /**
     * @param des 世界
     */
    protected walk(des: cc.Vec2, func: Function = null) {
        this.updateDir(des);
        if (!this.isPlayingWalk) {
            this.frameAnim.setFrameArray(this.framesOfAnim[this.level][2]);
            this.frameAnim.play(true);
            this.isPlayingWalk = true;
        }
        this.move(des, function () {
            this.frameAnim.stop();
            this.isPlayingWalk = false;
            if (func !== null)
                func();
        }.bind(this))
    }

    protected stopWalk() {
        this.frameAnim.stop();
        this.isPlayingWalk = false;
        this._move.stopMove();
    }

    protected refreshState() {
        this.refreshBloodBar();

        //死亡    
        if (this.cHP === 0) {
            this.die(Soldier.soldiersOfAlive, this);
            this.playDie(this.framesOfAnim[this.level][1], this.releaseSelf.bind(this));
        }
    }

    /**
     * 释放自身资源
     */
    releaseSelf() {
        this.barrack.releaseSoldier(this);
    }

    /**
     * 向驻点移动
     */
    private toStation() {
        this.isToStation = true;
        this.walk(this.station, function () {
            this.isToStation = false;
        }.bind(this));
    }

    private inStation(): boolean {
        let cwp: cc.Vec2 = this.getWPos();
        let l: number = cwp.sub(this.station).mag();
        if (l < 2)
            return true;
        return false;
    }

    /**
     * Tracks soldier
     * @param pos 世界
     */
    track(pos: cc.Vec2) {
        this.isTracking = true;
        this.walk(pos, function () {
            this.isTracking = false;
        }.bind(this));
    }
    stopTrack() {
        this.stopWalk();
        this.isTracking = false;
    }
    refreshTrackTarget(pos: cc.Vec2) {
        this.walk(pos, function () {
            this.isTracking = false;
        }.bind(this));
    }

    attack(m: Creature) {
        if (this.isAttacking)
            return;
        if (!this.attackEnable)
            return;
        this.attackEnable = false;
        this.scheduleOnce(function () { this.attackEnable = true; }.bind(this), 1);

        this.isAttacking = true;
        this.frameAnim.setFrameArray(this.framesOfAnim[this.level][0]);
        this.frameAnim.play(false, false, false, function () {
            m.injure(this.aggressivity);
            this.isAttacking = false;
        }.bind(this));
    }

    nonComLogic() {
        this.isNonComState = true;
        if (this.inStation())
            return;
        if (this.isToStation)
            return;

        this.toStation();
    }
    stopNonComLogic() {
        this.isNonComState = false;
        if (this.isToStation) {
            this.stopWalk();
            this.isToStation = false;
        }
    }


}
