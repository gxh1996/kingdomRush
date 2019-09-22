import FrameAnimation from "../../../common/frameAnimation";
import Soldier from "./soldier";
import GameDataStorage from "../../../common/module/gameDataManager";

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

    private level: number = 1;
    /**
     * 塔的帧动画图片
     */
    private towerFrames = [];
    private BGFrameAnim: FrameAnimation = null;
    private soldiers: Soldier[] = [];
    onLoad() {
        this.towerFrames.push(this.tower1);
        this.towerFrames.push(this.tower2);
        this.towerFrames.push(this.tower3);
        this.towerFrames.push(this.tower4);

        this.BGFrameAnim = this.node.getChildByName("bg").getComponent("frameAnimation");
    }

    start() {
        this.init();
    }

    getLevel(): number {
        return this.level;
    }

    init() {
        this.BGFrameAnim.setFrameArray(this.towerFrames[this.level - 1]);
        this.BGFrameAnim.setSpriteFrame(this.towerFrames[this.level - 1][0]);
    }


    /**
     * 出兵
     * @param station 兵的驻点 世界坐标
     */
    private outSoldier(station: cc.Vec2) {
        this.BGFrameAnim.play(false, false);
        this.scheduleOnce(function () {
            let s: Soldier = this.createSoldier();
            this.soldiers.push(s);
            s.setState(this.level, station);
        }.bind(this), 0.8);
    }

    private createSoldier(): Soldier {
        let node: cc.Node = cc.instantiate(this.soldierPrefab);
        let s: Soldier = node.getComponent("soldier");
        this.node.addChild(node);
        node.setPosition(this.outSoldierPos);
        return s;
    }

    destroySelf() {
        this.node.removeFromParent();
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

    // update (dt) {}
}
