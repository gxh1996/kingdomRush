import FrameAnimation from "../../../common/frameAnimation";
import MagiclanBullet from "./magiclanBullet";
import Monster from "../../monster/monster";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";

const { ccclass, property } = cc._decorator;

@ccclass("MagiclanFrames")
class MagiclanFrames {
    @property({
        type: [cc.SpriteFrame]
    })
    frames: cc.SpriteFrame[] = [];
}

@ccclass
export default class MagiclanTower extends cc.Component {

    @property({
        type: [cc.Vec2],
        tooltip: "各等级的法师的Y坐标"
    })
    private offsetY: cc.Vec2[] = [];

    @property({
        type: [MagiclanFrames],
        tooltip: "它的帧图片"
    })
    private framesArray: MagiclanFrames[] = [];

    @property({ //0,1为 法师1的朝下和朝上的帧图片
        type: [MagiclanFrames],
        tooltip: "法师的帧图片"
    })
    private magiclanFrames: MagiclanFrames[] = [];

    @property({
        type: cc.Prefab
    })
    private bulletPrefab: cc.Prefab = null;

    @property({
        type: cc.Node,
        displayName: "射击点"
    })
    private PosOfShoot: cc.Node = null;

    /**
     * 法师的 帧动画组件
     */
    private magiclanAF: FrameAnimation = null;
    /**
     * 塔的 帧动画
     */
    private towerAF: FrameAnimation = null;
    private bg: cc.Node = null;
    private monsterArray: Monster[];

    /* 塔的属性 */
    /**
     * 塔的等级
     */
    level: number = 1;
    maxLevel: number = 4;
    private speedOfShoot: number;
    private speedOfBullet: number;
    private attack: number;
    shootRange: number;
    price: number;


    /* 控制 */
    /**
     * false为法师朝下
     */
    private toward: boolean = false;
    private isShoot: boolean = false;

    /* 数据 */
    /**
     * 法球发射点 世界
     */
    private wPOfShoot: cc.Vec2;
    /**
     * 塔的坐标 世界
     */
    private wPos: cc.Vec2 = null;
    /**
     * 发射动画播放时间
     */
    private playTOfShoot: number;
    private poolOfBullet: cc.NodePool = null;
    private dataOfTower: any[];

    onLoad() {
        this.magiclanAF = this.node.getChildByName("magiclan").getComponent("frameAnimation");
        this.towerAF = this.node.getChildByName("bg").getComponent("frameAnimation");
        this.bg = this.node.getChildByName("bg");
        this.monsterArray = Monster.monstersOfAlive;
        let gc: GameConfig = GameDataStorage.getGameConfig();
        this.dataOfTower = gc.getDataOfMagiclan();
        this.createPoolOfBullet();
    }

    start() {
        this.wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());
        this.wPOfShoot = this.PosOfShoot.parent.convertToWorldSpaceAR(this.PosOfShoot.getPosition());
        this.init();
    }

    /**
     * 根据塔的等级 设置塔的图片和骨骼动画
     */
    private init() {
        this.attack = this.dataOfTower[this.level - 1].attack;
        this.speedOfShoot = this.dataOfTower[this.level - 1].speedOfShoot;
        this.speedOfBullet = this.dataOfTower[this.level - 1].speedOfBullet;
        this.shootRange = this.dataOfTower[this.level - 1].shootRange;
        this.price = this.dataOfTower[this.level - 1].price;

        this.initMagiclanAF();
        this.initTowerAF();
    }

    /* 对象池 */
    private createPoolOfBullet() {
        if (this.poolOfBullet !== null)
            return;
        this.poolOfBullet = new cc.NodePool();
        for (let i = 0; i < 1; i++) {
            this.poolOfBullet.put(cc.instantiate(this.bulletPrefab));
        }
    }
    getBullet(): cc.Node {
        let r: cc.Node = null;
        if (this.poolOfBullet.size() > 0)
            r = this.poolOfBullet.get();
        else
            r = cc.instantiate(this.bulletPrefab);
        r.opacity = 255;
        return r;
    }
    releaseBullt(n: cc.Node) {
        this.poolOfBullet.put(n);
    }
    private clearPoolOfBullet() {
        this.poolOfBullet.clear();
    }

    /**
     * 初始化法师，更新帧动画和位置，发射动画播放时间
     */
    private initMagiclanAF() {
        let i: number;
        if (this.level === 4) {
            i = 2;
        }
        else {
            i = 0;
        }
        if (this.toward)
            i++;
        this.magiclanAF.setFrameArray(this.magiclanFrames[i].frames);
        this.magiclanAF.setSpriteFrame(this.magiclanFrames[i].frames[0]);
        this.playTOfShoot = this.magiclanAF.getDuration();

        this.magiclanAF.node.setPosition(this.offsetY[this.level - 1]);
    }

    /**
     * 改变法师的朝向
     * @param toward false为 朝下
     */
    private changeToward(toward: boolean) {
        if (toward === this.toward)
            return;
        this.toward = toward;
        this.initMagiclanAF();
    }

    /**
     * 初始化塔，更新帧动画
     */
    private initTowerAF() {
        this.towerAF.setFrameArray(this.framesArray[this.level - 1].frames);
        this.towerAF.setSpriteFrame(this.framesArray[this.level - 1].frames[0]);
    }

    /**
     * Shoots arrow tower
     * @param des 世界坐标
     * @param time 子弹到des的时间
     */
    private shoot(des: cc.Vec2, time: number = null) {
        if (this.isShoot)
            return;
        this.isShoot = true;

        if (time === null) {
            let l: number = this.wPos.sub(des).mag();
            let time = l / this.speedOfBullet;
        }

        //更新法师方向
        let wPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.magiclanAF.node.getPosition());
        if (wPos.y > des.y && this.toward === true)
            this.toward = false;
        else if (wPos.y < des.y && this.toward === false)
            this.toward = true;
        this.initMagiclanAF();

        this.towerAF.play(false);
        this.magiclanAF.play(false, true, false, function () {
            let bulletScr: MagiclanBullet = this.createBullet();
            bulletScr.moveTo(this.wPOfShoot, des, time);
            this.coolingShoot();
        }.bind(this));

    }

    /**
     * 冷却 射击
     */
    private coolingShoot() {
        this.scheduleOnce(function () {
            this.isShoot = false;
        }.bind(this), this.speedOfShoot);
    }

    private createBullet(): MagiclanBullet {
        let bullet: cc.Node = this.getBullet();
        let script: MagiclanBullet = bullet.getComponent("magiclanBullet");
        this.node.addChild(bullet);
        script.init(this.attack);
        return script;
    }

    destroySelf() {
        this.clearPoolOfBullet();
        this.node.destroy();
    }

    /**
     * 升级
     */
    upgrade() {
        if (this.level === 4)
            return;
        this.level++;
        this.init();
    }

    getPriceOfUpgrade(): number {
        return this.dataOfTower[this.level].price;
    }

    getDataOfTower(): any[] {
        return this.dataOfTower;
    }

    /**
     * 判断该点是否在射程内
     * @param pos 世界坐标
     */
    private inShootRange(pos: cc.Vec2): boolean {
        let l: number = this.wPos.sub(pos).mag();
        if (l <= this.shootRange)
            return true;
        return false;
    }

    /**
     * 根据怪物此时的位置，预判子弹到达后，怪物的新位置
     * @param monster 
     * @param cP 此时怪物的坐标 世界坐标
     * @returns 怪物预测位置,世界; 子弹达到预测位置的时间
     */
    private forecastMovePos(monster: Monster, cP: cc.Vec2): number[] {
        //法球飞行到cP的时间
        let time: number = cP.sub(this.wPOfShoot).mag() / this.speedOfBullet;

        let mWP: cc.Vec2 = monster.getPosInTime(time + this.playTOfShoot);
        if (!this.inShootRange(mWP))
            return null;
        return [mWP.x, mWP.y, time];
    }

    update(dt) {
        if (!this.isShoot) {
            for (let i = 0; i < this.monsterArray.length; i++) {
                let m: Monster = this.monsterArray[i];
                let mP: cc.Vec2 = m.node.parent.convertToWorldSpaceAR(m.node.getPosition());

                if (this.inShootRange(mP)) {
                    if (m.swiOfRecursionInPW) {

                        let d: number[] = this.forecastMovePos(m, mP);
                        if (d === null)
                            continue;
                        this.shoot(cc.v2(d[0], d[1]), d[2]);
                        break;
                    }
                    else {
                        this.shoot(m.getWPos());
                        break;
                    }
                }
            }
        }

    }
}
