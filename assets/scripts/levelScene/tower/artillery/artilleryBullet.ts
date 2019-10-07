import FrameAnimation from "../../../common/frameAnimation";
import Monster from "../../monster/monster";
import Artillery from "./artilleryTower";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArtilleryBullet extends cc.Component {

    private level: number = null;
    private attack: number = 0;
    private harmRadian: number;
    private frameAnim: FrameAnimation = null;
    private artilleryTower: Artillery = null;

    onLoad() {
        this.frameAnim = this.node.getComponent("frameAnimation");
        this.artilleryTower = this.node.parent.getComponent("artilleryTower");
    }

    start() {

    }

    /**
     * 设置炮的攻击力和速度
     * @param attack 
     * @param bombRange 炸弹爆炸范围
     */
    init(l: number, attack: number, bombRange: number) {
        this.level = l;
        this.attack = attack;
        this.harmRadian = bombRange;
    }

    /**
     * 移动，世界坐标
     * @param start 起点
     * @param end 终点
     * @param time 移动时间
     * 
     */
    moveTo(start: cc.Vec2, end: cc.Vec2, time: number) {
        let nodeStart: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(start);
        let nodeEnd: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(end);
        let sub: cc.Vec2 = nodeEnd.sub(nodeStart);
        let middle: cc.Vec2 = cc.v2(nodeStart.x + sub.x / 2, nodeStart.y + sub.y / 2);
        let c: cc.Vec2 = cc.v2(middle.x, nodeEnd.y + 60);
        if (start.x === end.x)
            c.x += 30;

        this.node.setPosition(nodeStart);
        let move: cc.ActionInterval = cc.bezierTo(time, [nodeStart, c, nodeEnd]);

        let func: cc.ActionInstant = cc.callFunc(function () {
            this.frameAnim.play(false, true, false, function () {
                this.causeHarm(end);
                this.destroySelf();
            }.bind(this));
        }, this);

        let seq: cc.ActionInterval = cc.sequence(move, func);
        this.node.runAction(seq);
    }

    /**
     * Causes harm
     * @param pos 爆炸点 世界坐标
     */
    private causeHarm(pos: cc.Vec2) {
        for (let i = 0; i < Monster.monstersOfAlive.length; i++) {
            let mScr: Monster = Monster.monstersOfAlive[i];
            if (this.isInjuredInScope(pos, mScr.getWPos()))
                mScr.injure(this.attack);
        }
    }
    /**
     * @param pos 爆炸点 世界 
     */
    private isInjuredInScope(pos: cc.Vec2, mwp: cc.Vec2): boolean {
        let l: number = mwp.sub(pos).mag();
        if (l <= this.harmRadian)
            return true;
        return false;
    }

    private destroySelf() {
        this.artilleryTower.releaseBullt(this.level, this.node);
    }

    // update (dt) {}
}
