import FrameAnimation from "../../../common/frameAnimation";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";
import Walk from "../../../common/walk";
import Monster from "../../monster/monster";
import Barrack from "./barrack";
import MonsterFactory from "../../monster/monsterFactory";

const { ccclass, property } = cc._decorator;

enum State { attack, dead, walk, idle };

@ccclass
export default class Soldier extends cc.Component {

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

    @property({ type: cc.ProgressBar })
    private bloodBar: cc.ProgressBar = null;

    /**
     * [等级][攻击，死亡，行走][图片]
     */
    private frames = [];
    private BGFrameAnim: FrameAnimation = null;
    private gameConfig: GameConfig = null;
    private barrack: Barrack = null;

    /* 属性 */
    private level: number = 1;
    private attack;
    private cHP;
    private maxHP;
    /**
     * 动画组件里当前存放的是什么动画
     */
    private curAnimState: State = State.idle;
    //一出生就会走向驻点
    // private playerState: State = State.walk;
    private speed: number;
    /**
     * 视野范围
     */
    private rangeOfVision: number = 40;
    private intervalOfThink: number = 2;
    private intervalOfAttack: number = 2;

    /* 数据 */
    /**
     * 属于几号驻点
     */
    stationNo: number;
    /**
     * 驻点 世界坐标
     */
    private station: cc.Vec2 = null;
    private soldierData;
    /**
     * 攻击目标
     */
    private attackTarget: Monster = null;
    private monsters: Monster[] = null;


    /* 控制 */
    // private isFindEnemy: boolean = false;
    // private isTouchEnemy: boolean = false;
    // private isWalkToEnemy: boolean = false;
    /**
     * 是否在驻点
     */
    // private inStation: boolean = false;
    // private enableScan: boolean = true;
    private thinkEnable: boolean = false;
    private attackEnable: boolean = true;

    onLoad() {
        this.BGFrameAnim = this.node.getChildByName("bg").getComponent("frameAnimation");

        this.frames.push([this.soldier1Attack, this.soldier1Dead, this.soldier1Walk]);
        this.frames.push([this.soldier2Attack, this.soldier2Dead, this.soldier2Walk]);
        this.frames.push([this.soldier3Attack, this.soldier3Dead, this.soldier3Walk]);

        this.gameConfig = GameDataStorage.getGameConfig();
        this.soldierData = this.gameConfig.getSoldierData();
        let mf: MonsterFactory = cc.find("Canvas/personMap").getComponent("monsterFactory");
        this.monsters = mf.getMonsterArray();
    }

    // /**
    //  * Sets State
    //  * @param level  
    //  * @param station 驻点 世界坐标
    //  */
    // setState(level: number, station: cc.Vec2) {
    //     this.level = level;
    //     this.station = station;
    // }

    subHP(n: number) {
        this.cHP -= n;
        this.updateBloodBar();
    }

    private updateBloodBar() {
        let p: number = this.cHP / this.maxHP;
        this.bloodBar.progress = p;
    }

    /**
     * Inits soldier
     * @param level 根据等级初始化 动画、血量、攻击力、速度
     * @param barrack 
     * @param stationNo 驻点编号
     */
    init(level: number, barrack: Barrack, stationNo: number) {
        this.level = level;

        let frames: cc.SpriteFrame[] = this.frames[this.level - 1][State.walk];
        this.BGFrameAnim.setIdle(frames[0]);
        this.BGFrameAnim.setSpriteFrame(frames[0]);

        this.curAnimState = State.idle;
        this.cHP = this.maxHP = this.soldierData[this.level - 1].HP;
        this.attack = this.soldierData[this.level - 1].attack;
        this.speed = this.soldierData[this.level - 1].speed;

        this.rangeOfVision = this.soldierData[this.level - 1].rangeOfScan;

        this.barrack = barrack;
        this.stationNo = stationNo;
        this.station = this.barrack.stationOfSoldier[this.stationNo];

        this.thinkEnable = true;
    }

    private playWalk() {
        if (this.curAnimState !== State.walk) {
            this.setAnimState(State.walk)
        }
        this.BGFrameAnim.play(true, true);
    }

    /**
     * Walks to pos
     * @param pos 世界坐标
     * @param func 回调函数 
     */
    walkToPos(pos: cc.Vec2) {
        let cp: cc.Vec2 = this.node.getPosition();
        pos = this.node.parent.convertToNodeSpaceAR(pos);
        let dis: cc.Vec2 = pos.sub(cp);
        let t: number = dis.mag() / this.speed;

        let a: cc.ActionInterval = cc.moveTo(t, pos);
        let back: cc.ActionInstant = cc.callFunc(() => {
            this.BGFrameAnim.stop();
            // this.playerState = State.idle;
        }, this);
        this.node.runAction(cc.sequence(a, back));
        this.playWalk();
        // this.playerState = State.walk;
    }


    /**
     * 设置动画组件 的动画
     * @param as 
     */
    private setAnimState(as: number) {
        let frame: cc.SpriteFrame[] = this.frames[this.level - 1][as];
        this.BGFrameAnim.setFrameArray(frame);
        this.BGFrameAnim.setSpriteFrame(frame[0]);
        this.BGFrameAnim
        this.curAnimState = State.walk;

    }

    /**
     * 攻击一次
     * @param m 
     */
    private attackOnce(m: Monster) {
        if (this.curAnimState !== State.attack)
            this.setAnimState(State.attack);
        this.BGFrameAnim.play(false, true, false, function () {
            if (m === null)
                return;
            m.subHP(this.attack);
            // this.playerState = State.idle;
        }.bind(this));
        // this.playerState = State.attack;
    }

    /**
     * 死亡
     */
    private dead() {
        this.thinkEnable = false;

        if (this.curAnimState !== State.dead)
            this.setAnimState(State.dead);

        this.BGFrameAnim.play(false, false, false, function () {
            let a: cc.ActionInterval = cc.fadeOut(1);
            let func: cc.ActionInstant = cc.callFunc(function () {
                this.destroySelf();
            }, this);
            let seq: cc.ActionInterval = cc.sequence(a, func);
            this.node.runAction(seq);
        }.bind(this));

    }

    destroySelf() {
        this.barrack.soldierKilled(this);
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.attackTarget !== null)
            return;

        let node: cc.Node = other.node;
        let group: string = node.group;
        if (group !== "Enemy")
            return;

        let m: Monster = node.getComponent("monster");
        this.attackTarget = m;
    }

    onCollisionEnd(other: cc.Collider, self: cc.Collider) {
        let node: cc.Node = other.node;
        let group: string = node.group;

        if (group !== "Enemy")
            return;

        let m: Monster = node.getComponent("monster");
        if (this.attackTarget === m)
            this.attackTarget = null;
    }

    private AIThink() {
        if (this.thinkEnable) {
            this.thinkEnable = false;
            this.scheduleOnce(function () { this.thinkEnable = true; }.bind(this), this.intervalOfThink);

            if (this.attackTarget) {
                if (this.attackEnable) {
                    this.attackEnable = false;
                    this.scheduleOnce(function () { this.attackEnable = true; }.bind(this), this.intervalOfAttack);

                    this.attackOnce(this.attackTarget);
                }
            }
            else {
                let m: Monster = this.findMonInVision();
                if (m === null) { //没有敌人在可视范围内
                    if (!this.inStation())
                        this.walkToPos(this.station);
                }
                else
                    this.walkToPos(m.getPosInWorld());
            }
        }


    }
    /**
     * @returns 没有返回null 
     */
    private findMonInVision(): Monster {
        let t: any = this.getMonsterOfMinDistance();
        let m: Monster = t[0];
        let l: number = t[1];

        //不在视野内
        if (l > this.rangeOfVision)
            return null;
        return m;
    }
    /**
     * 获得离士兵距离最短的怪物和其距离
     * @returns [Monster, number]
     */
    private getMonsterOfMinDistance(): any {
        if (this.monsters.length <= 0)
            return;

        let sp: cc.Vec2 = this.node.getPosition();
        let minL: number = this.getDisWithMonster(sp, this.monsters[0]);
        let ret: Monster = this.monsters[0];

        let l: number;
        for (let i = 1; i < this.monsters.length; i++) {
            l = this.getDisWithMonster(sp, this.monsters[i]);
            if (l < minL) {
                minL = l;
                ret = this.monsters[i];
            }
        }

        return [ret, minL];
    }
    /**
     * 得到与怪物的距离
     * @param sp 当前节点坐标
     * @param m 
     * @returns dis with monster 
     */
    private getDisWithMonster(sp: cc.Vec2, m: Monster): number {
        let mp: cc.Vec2 = m.node.getPosition();
        let l: number = mp.sub(sp).mag();
        return l;
    }
    private inStation(): boolean {
        let swp: cc.Vec2 = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        let l: number = swp.sub(this.station).mag();
        if (l < 2)
            return true;
        return false;
    }

    update(dt) {
        this.AIThink();
    }
}
