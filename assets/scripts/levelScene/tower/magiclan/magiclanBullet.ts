import Monster from "../../monster/monster";
import MagiclanTower from "./magiclanTower";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MagiclanBullet extends cc.Component {

    private attack: number;
    private isFallFloor: boolean = false;
    private tower: MagiclanTower = null;

    onLoad() {
        this.tower = this.node.parent.getComponent("magiclanTower");
    }

    start() {

    }

    init(attack: number) {
        this.attack = attack;
    }

    /**
     * 移动，世界坐标
     * @param start 起点
     * @param end 终点
     * @param time 移动时间
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

        let func1: cc.ActionInstant = cc.callFunc(function () {
            this.destroySelf();
        }.bind(this))

        let seq: cc.ActionInterval = cc.sequence(move, func1);
        this.node.runAction(seq);
    }

    private destroySelf() {
        this.tower.releaseBullt(this.node);
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.isFallFloor)
            return;

        let node: cc.Node = other.node;
        let group: string = node.group;

        if (group === "Enemy") {
            this.node.stopAllActions();
            let m: Monster = node.getComponent("monster");
            m.injure(this.attack);

            this.destroySelf();
        }
    }

    // update (dt) {}
}
