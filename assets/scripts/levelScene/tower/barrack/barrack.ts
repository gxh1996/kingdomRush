import FrameAnimation from "../../../common/frameAnimation";
import Soldier from "./soldier";
import GameDataStorage from "../../../common/module/gameDataManager";
import LevelDataManager from "../../levelInfo";
import LevelScene from "../../levelScene";
import Utils from "../../../common/module/utils";

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
    private maxNumOfSoldier: number = 3;
    private tOfCreateSoldier: number = 2;

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
    }

    start() {
        this.init();
    }

    /**
     * 根据等级设置 动画。
     */
    init() {
        this.BGFrameAnim.setFrameArray(this.towerFrames[this.level - 1]);
        this.BGFrameAnim.setSpriteFrame(this.towerFrames[this.level - 1][0]);

        this.availableStationNo = [0, 1, 2];
    }

    private createSoldierPool() {
        this.soldierPool = new cc.NodePool();
        for (let i = 0; i < this.maxNumOfSoldier; i++) {
            let n: cc.Node = cc.instantiate(this.soldierPrefab);
            this.soldierPool.put(n);
        }
    }

    /**
     * 士兵被杀
     * @param soldier 
     */
    soldierKilled(soldier: Soldier) {
        this.availableStationNo.push(soldier.stationNo);
        Utils.remvoeItemOfArray(this.createdSoldiers, soldier);
        this.soldierPool.put(soldier.node);
    }

    destroySelf() {
        //删除塔生成的所有士兵
        this.createdSoldiers.forEach((v: Soldier) => {
            v.destroySelf();
        })

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
        this.init();
    }

    private autoOutSoldier() {
        if (this.creSoldEnable && this.createdSoldiers.length < 3) {
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
            s.walkToPos(this.stationOfSoldier[s.stationNo]);

            this.BGFrameAnim.play(false, false, true, function () {
                this.creSoldEnable = true;
            }.bind(this))
        }.bind(this));
    }
    private createSoldier(): Soldier {
        let node: cc.Node = this.getSoldierInPool();
        let s: Soldier = node.getComponent("soldier");
        this.createdSoldiers.push(s);
        this.personMap.addChild(node);

        let outPos: cc.Vec2 = this.node.convertToWorldSpaceAR(this.outSoldierPos);
        outPos = this.personMap.convertToNodeSpaceAR(outPos);
        node.setPosition(outPos);

        s.init(this.level, this, this.availableStationNo.pop());
        return s;
    }
    private getSoldierInPool(): cc.Node {
        let n: cc.Node;
        if (this.soldierPool.size() > 0)
            n = this.soldierPool.get();
        else
            n = cc.instantiate(this.soldierPrefab);
        return n;
    }

    update(dt) {
        this.autoOutSoldier();
    }
}
