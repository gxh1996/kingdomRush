import FrameAnimation from "../common/frameAnimation";
import CombatLogic from "./combatLogic";
import Move from "../common/move";
import Utils from "../common/module/utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default abstract class Creature extends cc.Component {

    /* 属性 */
    protected cHP: number = null;
    protected maxHp: number = null;
    protected speedOfMove: number = null;
    protected intervalOfAttack: number = null;
    protected aggressivity: number = null;
    rangeOfAttack: number = null;
    rangeOfInvestigate: number = null;
    protected intervalOfThink: number = 1;

    /* 引用对象 */
    @property({ type: cc.ProgressBar })
    protected bloodBar: cc.ProgressBar = null;

    @property({ type: FrameAnimation })
    protected frameAnim: FrameAnimation = null;

    protected combatLogic: CombatLogic = null;
    protected _move: Move = null;


    /* 控制 */
    protected isAlive: boolean = false;
    isTracking: boolean = false;
    isAttacking: boolean = false;
    isNonComState: boolean = false;

    protected initCreature() {
        this.isTracking = false;
        this.isAttacking = false;
        //刚出生，还没执行非战斗行为
        this.isNonComState = null;
        this.isAlive = true;
    }

    protected abstract walk(des: cc.Vec2, func: Function);
    protected abstract stopWalk();
    /**
     * 只进行移动,移除其他Action
     * @param des 世界
     * @returns 方向
     */
    protected move(des: cc.Vec2, func: Function = null, t: number = null) {
        let dnp: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(des);
        let cnp: cc.Vec2 = this.node.getPosition();
        let dis: cc.Vec2 = dnp.sub(cnp);
        if (t === null) {
            let l: number = dis.mag();
            t = l / this.speedOfMove;
        }


        this._move.moveTo(dis, t, func);
    }


    /**
     * 播放死亡动画,会移除当前的所有行为
     */
    protected playDie(frames: cc.SpriteFrame[], func: Function = null) {
        if (this.isNonComState)
            this.stopNonComLogic();
        else if (this.isAttacking)
            this.frameAnim.stop();
        else if (this.isTracking)
            this.stopTrack();

        this.frameAnim.setFrameArray(frames);
        this.frameAnim.play(false, false, false, function () {
            let fOut: cc.ActionInterval = cc.fadeOut(1);
            let f: cc.ActionInstant = cc.callFunc(func);
            this.node.runAction(cc.sequence(fOut, f));
        }.bind(this));
    }

    /**
     * 设置该生物死亡并从存活记录集中移除
     * @param creatures 该生物存在的集
     */
    die(creatures: any[], self) {
        this.isAlive = false;
        Utils.remvoeItemOfArray(creatures, self);
    }

    /**
     * @param des 目的地 世界 
     */
    protected updateDir(des: cc.Vec2) {
        let cwp: cc.Vec2 = this.getWPos();
        if (des.x > cwp.x)
            this.node.scaleX = 1;
        else
            this.node.scaleX = -1;
    }

    /**
     * 得到其世界坐标
     */
    public getWPos(): cc.Vec2 {
        return this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
    }

    /**
     * 受到伤害
     */
    injure(v: number) {
        if (this.cHP === 0)
            return;

        this.cHP -= v;
        if (this.cHP < 0)
            this.cHP = 0;
    }

    /**
     * 更新血条显示
     */
    protected refreshBloodBar() {
        let r: number = this.cHP / this.maxHp;
        this.bloodBar.progress = r;
    }

    protected abstract refreshState();

    abstract releaseSelf();

    /**
     * Tracks creature
     * @param pos  世界
     */
    abstract track(pos: cc.Vec2);
    abstract stopTrack();
    abstract refreshTrackTarget(pos: cc.Vec2);
    abstract attack(m: Creature);
    abstract nonComLogic();
    abstract stopNonComLogic();

    update(dt) {
        if (!this.isAlive)
            return;

        this.combatLogic.think();
        this._move.refreshMove(dt);
        this.refreshState();
    }
}
