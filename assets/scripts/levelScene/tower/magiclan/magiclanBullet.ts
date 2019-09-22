import FrameAnimation from "../../../common/frameAnimation";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MagiclanBullet extends cc.Component {

    @property({
        type: [cc.SpriteFrame]
    })
    private bombFrames: cc.SpriteFrame[] = [];

    private speed: number = 0;
    private attrack: number = 0;
    private frameAnimation: FrameAnimation = null;
    onLoad() {
        this.frameAnimation = this.node.getComponent("frameAnimation");
    }

    start() {

    }

    init(speed: number, attrack: number) {
        this.speed = speed;
        this.attrack = attrack;
    }

    /**
     * 移动，世界坐标
     * @param start 起点
     * @param end 终点
     * 
     */
    moveTo(start: cc.Vec2, end: cc.Vec2) {
        let nodeStart: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(start);
        let nodeEnd: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(end);
        let sub: cc.Vec2 = nodeEnd.sub(nodeStart);
        let middle: cc.Vec2 = cc.v2(sub.x / 2, sub.y / 2);
        let c: cc.Vec2 = cc.v2(middle.x, nodeEnd.y + 60);
        if (start.x === end.x)
            c.x += 30;
        let time: number = sub.mag() / this.speed;

        this.node.setPosition(nodeStart);
        let move: cc.ActionInterval = cc.bezierTo(time, [nodeStart, c, nodeEnd]);

        let func1: cc.ActionInstant = cc.callFunc(function () {
            this.frameAnimation.play(false, function () {
                this.destroySelf();
            }.bind(this));
        }.bind(this))


        let seq: cc.ActionInterval = cc.sequence(move, func1);
        this.node.runAction(seq);
    }

    private destroySelf() {
        this.node.removeFromParent();
        this.node.destroy();
    }

    // update (dt) {}
}
