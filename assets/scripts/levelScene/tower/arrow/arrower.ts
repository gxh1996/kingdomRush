import ArrowBullet from "./arrowBullet";
import FrameAnimation from "../../../common/frameAnimation";
import Monster from "../../monster/monster";
import Walk from "../../../common/walk";
import ArrowTower from "../magiclan/magiclanTower";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Arrower extends cc.Component {

    @property({
        type: cc.Prefab
    })
    private arrowPrefab: cc.Prefab = null;

    private frameAnimation: FrameAnimation = null;

    /**
     * 是否正在射击
     */
    private shooting: boolean = false;
    /**
     * 塔的世界坐标
     */
    private wPosOfTower: cc.Vec2;
    /**
     * 箭的射出点 世界坐标
     */
    private wPosOfArrower: cc.Vec2;
    private speedOfArrow: number;
    /**
     * 射箭动画播放时间
     */
    private playTimeOfshootArrow: number;
    // private arrowTower: ArrowTower = null;
    private shootRange: number;
    private speedOfShoot: number;
    private monsterArray: Monster[];

    onLoad() {
        this.frameAnimation = this.node.getComponent("frameAnimation");
        // this.arrowTower = this.node.parent.getComponent("arrowTower");
        this.monsterArray = cc.find("Canvas/towerMap").getComponent("monsterFactory").getMonsterArray();
    }

    start() {
        //初始化数据
        this.wPosOfArrower = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.playTimeOfshootArrow = this.frameAnimation.getDuration();
    }

    /**
     * Inits arrower
     * @param wPosOfTower 塔的世界坐标
     * @param speedOfArrow 箭的移动速度
     * @param shootRange 射程
     * @param speedOfShoot 射速
     */
    init(wPosOfTower: cc.Vec2, speedOfArrow: number, shootRange: number, speedOfShoot: number) {
        this.wPosOfTower = wPosOfTower;
        this.speedOfArrow = speedOfArrow;
        this.shootRange = shootRange;
        this.speedOfShoot = speedOfShoot;
    }

    /**
     * Shoots arrower
     * @param des 射击目标，世界坐标
     * @param time 射到目的地的时间
     */
    private shoot(des: cc.Vec2, time: number) {
        if (this.shooting)
            return;
        this.shooting = true;

        //播放动作后射箭
        this.frameAnimation.play(false, false, false, function () {
            let arrowBullet: ArrowBullet = this.createArrow();
            let dir: boolean;
            if (this.wPosOfTower.x > des.x)
                dir = true;
            else
                dir = false;
            arrowBullet.init(10, 100, dir);
            arrowBullet.moveTo(this.wPosOfArrower, des, time);
            this.coolingShoot();
        }.bind(this));
    }

    /**
     * 冷却 射击
     */
    private coolingShoot() {
        this.scheduleOnce(function () {
            this.shooting = false;
        }.bind(this), this.speedOfShoot);
    }

    /**
     * Creates arrow
     * @returns arrow ArrowBullet
     */
    private createArrow(): ArrowBullet {
        let arrow: cc.Node = cc.instantiate(this.arrowPrefab);
        this.node.addChild(arrow);
        let script: ArrowBullet = arrow.getComponent("arrowBullet");
        return script;
    }

    /**
     * 根据怪物此时的位置，预判子弹到达后，怪物的新位置
     * @param monster 
     * @param cP 此时怪物的坐标 世界坐标
     * @returns null表示超出射程;[怪物预测位置,世界; 子弹达到预测位置的时间]
     */
    private forecastMovePos(monster: Monster, cP: cc.Vec2): number[] {
        let walk: Walk = monster.getWalkScript();

        //箭飞行到cP的时间
        let time: number = cP.sub(this.wPosOfArrower).mag() / this.speedOfArrow;

        let mP: cc.Vec2 = walk.getPosInTime(time + this.playTimeOfshootArrow);
        let mWP: cc.Vec2 = monster.node.parent.convertToWorldSpaceAR(mP);
        if (!this.inShootRange(mWP))
            return null;
        return [mWP.x, mWP.y, time];
    }

    private inShootRange(wP: cc.Vec2): boolean {
        let l: number = this.wPosOfTower.sub(wP).mag();
        if (l <= this.shootRange)
            return true;
        return false;
    }

    update(dt) {
        if (!this.shooting) {
            for (let i = 0; i < this.monsterArray.length; i++) {
                let m: Monster = this.monsterArray[i];
                let mP: cc.Vec2 = m.node.parent.convertToWorldSpaceAR(m.node.getPosition());

                if (this.inShootRange(mP)) {
                    let d: number[] = this.forecastMovePos(m, mP);
                    if (d === null)
                        continue;
                    this.shoot(cc.v2(d[0], d[1]), d[2]);
                }
            }
        }
    }

}
