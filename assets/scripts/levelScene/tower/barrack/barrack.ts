import FrameAnimation from "../../../common/frameAnimation";
import Soldier from "./soldier";
import Utils from "../../../common/module/utils";
import GameDataStorage, { GameConfig } from "../../../common/module/gameDataManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Barrack extends cc.Component {

    @property({
        type: cc.Prefab
    })
    private soldierPrefab: cc.Prefab = null;

    @property({ tooltip: "出兵点, 节点坐标" })
    private outSoldierPos: cc.Vec2 = cc.v2(0, 0);

    @property({
        type: [cc.SpriteFrame]
    })
    private tower1: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame]
    })
    private tower2: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame]
    })
    private tower3: cc.SpriteFrame[] = [];
    @property({
        type: [cc.SpriteFrame]
    })
    private tower4: cc.SpriteFrame[] = [];

    private BGFrameAnim: FrameAnimation = null;
    private personMap: cc.Node = null;


    /* 塔的属性 */
    level: number = 1;
    maxLevel: number = 4;
    private maxNumOfSoldier: number = 3;
    /**
     * 出兵时间
     */
    private tOfCreateSoldier: number;
    price: number;

    /* 数据 */
    /**
     * 可用的驻点编号
     */
    private availableStationNo: number[] = null;
    /**
     * 塔的帧动画图片
     */
    private towerFrames = [];
    stationOfSoldier: cc.Vec2[];
    private soldierPool: cc.NodePool;
    private createdSoldiers: Soldier[] = [];
    private dataOfTower: any[];

    /* 控制 */
    /**
     * 是否在造兵
     */
    private creSoldEnable: boolean = true;

    onLoad() {
        this.towerFrames.push(this.tower1);
        this.towerFrames.push(this.tower2);
        this.towerFrames.push(this.tower3);
        this.towerFrames.push(this.tower4);

        this.BGFrameAnim = this.node.getChildByName("bg").getComponent("frameAnimation");
        this.personMap = cc.find("Canvas/personMap");
        this.createSoldierPool();

        let gc: GameConfig = GameDataStorage.getGameConfig();
        this.dataOfTower = gc.getDataOfBarrack();
    }

    start() {
        this.init();


    }

    /**
     * 根据等级设置 动画。
     */
    init() {
        this.tOfCreateSoldier = this.dataOfTower[this.level - 1].tOfCreateSoldier;
        this.price = this.dataOfTower[this.level - 1].price;
        this.availableStationNo = [0, 1, 2];
        this.refreshFrameAnim();
    }

    /**
     * 更新帧动画
     */
    private refreshFrameAnim() {
        this.BGFrameAnim.setFrameArray(this.towerFrames[this.level - 1]);
        this.BGFrameAnim.setSpriteFrame(this.towerFrames[this.level - 1][0]);
    }

    private createSoldierPool() {
        this.soldierPool = new cc.NodePool();
        for (let i = 0; i < this.maxNumOfSoldier; i++) {
            let n: cc.Node = cc.instantiate(this.soldierPrefab);
            this.soldierPool.put(n);
        }
    }

    /**
     * 释放士兵资源
     * @param soldier 
     */
    releaseSoldier(soldier: Soldier) {
        this.availableStationNo.push(soldier.stationNo);
        Utils.remvoeItemOfArray(this.createdSoldiers, soldier);
        this.soldierPool.put(soldier.node);
    }

    destroySelf() {
        //删除塔生成的所有士兵
        while (this.createdSoldiers.length > 0) {
            let s: Soldier = this.createdSoldiers[0];
            s.die(Soldier.soldiersOfAlive, s);
            s.releaseSelf();
        }

        //清空对象池
        this.soldierPool.clear();

        this.node.destroy();
    }

    /**
     * 升级
     */
    upgrade() {
        if (this.level === 4)
            return;
        this.level++;
        this.tOfCreateSoldier = this.dataOfTower[this.level - 1].tOfCreateSoldier;
        this.price = this.dataOfTower[this.level - 1].price;
        this.refreshFrameAnim();
    }

    getPriceOfUpgrade(): number {
        return this.dataOfTower[this.level].price;
    }

    getDataOfTower(): any[] {
        return this.dataOfTower;
    }

    private autoOutSoldier() {
        if (this.creSoldEnable && this.createdSoldiers.length < this.maxNumOfSoldier) {
            this.creSoldEnable = false;
            this.scheduleOnce(this.outSoldier.bind(this), this.tOfCreateSoldier);
        }
    }
    /**
     * 出兵
     * @param station 兵的驻点 世界坐标
     */
    private outSoldier() {
        this.BGFrameAnim.play(false, false, false, function () {
            let s: Soldier = this.createSoldier();

            this.BGFrameAnim.play(false, false, true, function () {
                this.creSoldEnable = true;
            }.bind(this))
        }.bind(this));
    }
    private createSoldier(): Soldier {
        let node: cc.Node = this.getSoldierInPool();
        let s: Soldier = node.getComponent("soldier");
        this.createdSoldiers.push(s);
        Soldier.soldiersOfAlive.push(s);
        this.personMap.addChild(node);

        let outPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.outSoldierPos);
        outPos = this.personMap.convertToNodeSpaceAR(outPos);
        node.setPosition(outPos);

        let i: number = this.availableStationNo.pop();
        s.init(i, this.stationOfSoldier[i], this.level, this);
        return s;
    }
    private getSoldierInPool(): cc.Node {
        let n: cc.Node;
        if (this.soldierPool.size() > 0) {
            n = this.soldierPool.get();
            n.opacity = 255;
        }
        else
            n = cc.instantiate(this.soldierPrefab);
        return n;
    }

    update(dt) {
        this.autoOutSoldier();
    }
}
