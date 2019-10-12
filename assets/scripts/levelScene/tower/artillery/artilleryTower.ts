import FrameAnimation from "../../../common/frameAnimation";
import ArtilleryBullet from "./artilleryBullet";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";
import Monster from "../../monster/monster";

const { ccclass, property } = cc._decorator;

@ccclass("ArtilleryFrames")
class ArtilleryFrames {
    @property({
        type: [cc.SpriteFrame]
    })
    frames: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame],
        tooltip: "炮弹的图片"
    })
    bullet: cc.SpriteFrame[] = [];
}

@ccclass
export default class Artillery extends cc.Component {

    @property({
        type: ArtilleryFrames,
        tooltip: "塔的图片资源"
    })
    private towers: ArtilleryFrames[] = [];

    @property({
        type: [cc.Node],
        tooltip: "填弹动画的子弹的节点"
    })
    private addBulletNodes: cc.Node[] = [];

    @property({
        type: [cc.Prefab],
    })
    private bulletPrefab: cc.Prefab[] = [];

    private frameAnimation: FrameAnimation = null;
    private gameConfig: GameConfig;
    private monsterArray: Monster[];
    private bg: cc.Node = null;


    /* 数据 */
    private addBulletData = [
        {
            startPos: cc.v2(-20, 10), //bg下的节点坐标
            ctrlPos: cc.v2(-11, 55),
            endPos: cc.v2(3, 20),
            shootDelay: 0.9,
            addBulletDelay: 1.4
        },
        {
            startPos: cc.v2(-22, 16),
            ctrlPos: cc.v2(-12, 55),
            endPos: cc.v2(3, 25),
            shootDelay: 1.1,
            addBulletDelay: 1.8

        },
        {
            startPos: cc.v2(-22, 16),
            ctrlPos: cc.v2(-13, 55),
            endPos: cc.v2(4, 25),
            shootDelay: 0.9,
            addBulletDelay: 1.4

        },
    ]
    /**
     * 塔的世界坐标
     */
    private wPos: cc.Vec2 = null;
    private poolsOfBullet: cc.NodePool[] = [];
    private dataOfTower: any[];

    /* 塔的属性 */
    level: number = 1;
    maxLevel: number = 3;
    private speedOfBullet: number;
    /**
     * 炸弹爆炸范围
     */
    private bombRange: number;
    shootRange: number;
    /**
     * 攻击力
     */
    attack: number;
    private intervalOfShoot: number;
    price: number;

    /* 控制 */
    private shootable: boolean = false;

    onLoad() {
        this.bg = this.node.getChildByName("bg");
        this.frameAnimation = this.bg.getComponent("frameAnimation");
        this.gameConfig = GameDataStorage.getGameConfig();
        this.dataOfTower = this.gameConfig.getDataOfArtillery();
        this.monsterArray = Monster.monstersOfAlive;

        this.createPoolsOfBullet();
    }

    start() {
        this.init();
    }

    /**
     * 初始化攻击力、动画、
     * @returns  
     */
    init() {
        this.attack = this.dataOfTower[this.level - 1].attack;
        this.speedOfBullet = this.dataOfTower[this.level - 1].speedOfBullet;
        this.bombRange = this.dataOfTower[this.level - 1].bombRange;
        this.shootRange = this.dataOfTower[this.level - 1].shootRange;
        this.intervalOfShoot = this.dataOfTower[this.level - 1].intervalOfShoot;
        this.price = this.dataOfTower[this.level - 1].price;

        this.frameAnimation.setFrameArray(this.towers[this.level - 1].frames);
        this.frameAnimation.setSpriteFrame(this.towers[this.level - 1].frames[0]);
        this.wPos = this.node.parent.convertToWorldSpaceAR(this.node.getPosition());

        this.addBulletNodes[0].getComponent(cc.Sprite).spriteFrame = this.towers[this.level - 1].bullet[0];

        this.addBulletAnim();
        this.scheduleOnce((() => { this.shootable = true; }).bind(this), this.intervalOfShoot);
    }

    /* 炮弹对象池 */
    private createPoolsOfBullet() {
        for (let i = 0; i < this.bulletPrefab.length; i++) {
            this.poolsOfBullet.push(new cc.NodePool());
            let p: cc.Prefab = this.bulletPrefab[i];
            this.poolsOfBullet[i].put(cc.instantiate(p));
        }
    }
    getBullet(level: number): cc.Node {
        let r: cc.Node = null;
        if (this.poolsOfBullet[level - 1].size() > 0)
            r = this.poolsOfBullet[level].get();
        else
            r = cc.instantiate(this.bulletPrefab[level - 1]);
        r.opacity = 255;
        return r;
    }
    releaseBullt(level: number, n: cc.Node) {
        this.poolsOfBullet[level - 1].put(n);
    }
    private clearPoolsOfBullet() {
        for (let i = 0; i < this.poolsOfBullet.length; i++)
            this.poolsOfBullet[i].clear();
    }

    /**
     * 射击
     * @param des 世界坐标
     * @param time 子弹到des的时间
     */
    private shoot(des: cc.Vec2, time: number = null) {
        if (!this.shootable)
            return;
        this.shootable = false;

        if (time === null) {
            let l: number = this.wPos.sub(des).mag();
            let time = l / this.speedOfBullet;
        }

        this.frameAnimation.play(false, false, false, function () {
            this.shootBullet(des, time);
            this.addBulletAnim();
            this.scheduleOnce((() => {
                this.shootable = true;
            }).bind(this), this.intervalOfShoot);
        }.bind(this));
    }

    /**
     * 射出子弹
     */
    private shootBullet(des: cc.Vec2, time: number) {
        let a: ArtilleryBullet = this.createBullet();
        let wPos: cc.Vec2 = this.bg.convertToWorldSpaceAR(this.addBulletData[this.level - 1].endPos);
        a.moveTo(wPos, des, time);
    }

    private createBullet(): ArtilleryBullet {
        let artillery: ArtilleryBullet = cc.instantiate(this.bulletPrefab[this.level - 1]).getComponent("artilleryBullet");
        this.node.addChild(artillery.node);
        artillery.init(this.level, this.attack, this.bombRange);
        let bg: cc.Node = this.node.getChildByName("bg");
        return artillery;
    }

    /**
     * 根据怪物此时的位置，预判子弹到达后，怪物的新位置
     * @param monster 
     * @param cP 此时怪物的坐标 世界坐标
     * @returns 怪物预测位置,世界; 子弹达到预测位置的时间
     */
    private forecastMovePos(monster: Monster, cP: cc.Vec2): number[] {
        //从填弹到子弹飞行到cP的时间
        let bulletStartPos: cc.Vec2 = this.bg.convertToWorldSpaceAR(this.addBulletData[this.level - 1].endPos);
        let time: number = cP.sub(bulletStartPos).mag() / this.speedOfBullet + this.addBulletData[this.level - 1].shootDelay;

        let mWP: cc.Vec2 = monster.getPosInTime(time);
        if (!this.inShootRange(mWP))
            return null;
        return [mWP.x, mWP.y, time - this.addBulletData[this.level - 1].shootDelay];
    }

    /**
     * 播放填弹动画
     */
    private addBulletAnim() {
        this.addBulletNodes[0].scale = 1;
        this.addBulletNodes[0].setPosition(this.addBulletData[this.level - 1].startPos);
        let a: cc.ActionInterval = cc.bezierTo(0.5, [this.addBulletData[this.level - 1].startPos, this.addBulletData[this.level - 1].ctrlPos, this.addBulletData[this.level - 1].endPos]);
        let func: cc.ActionInstant = cc.callFunc(function () {
            this.addBulletNodes[0].scale = 0;
        }, this);
        let seq: cc.ActionInterval = cc.sequence(a, func);
        this.addBulletNodes[0].runAction(seq);
    }

    destroySelf() {
        this.clearPoolsOfBullet();
        this.node.destroy();
    }

    /**
     * 升级
     */
    upgrade() {
        if (this.level === this.maxLevel)
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

    update(dt) {
        if (this.shootable) {
            for (let i = 0; i < this.monsterArray.length; i++) {
                let m: Monster = this.monsterArray[i];
                let mP: cc.Vec2 = m.getWPos();
                if (this.inShootRange(mP)) {
                    if (m.swiOfRecursionInPW) {
                        let d: number[] = this.forecastMovePos(m, mP);
                        if (d !== null) {
                            this.shoot(cc.v2(d[0], d[1]), d[2]);
                            return;
                        }
                    }
                    else {
                        this.shoot(m.getWPos());
                        return;
                    }
                }
            }
        }
    }
}
