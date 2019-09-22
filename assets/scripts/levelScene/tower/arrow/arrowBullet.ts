import Monster from "../../monster/monster";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArrowBullet extends cc.Component {

    /* 资源 */
    @property({
        type: cc.SpriteFrame,
        tooltip: "半截箭图片"
    })
    private decalArrow: cc.SpriteFrame = null;

    /* 组件 */
    private sprite: cc.Sprite = null;

    /* 属性 */
    private attack: number = null;

    /* 记录 */
    private lastPos: cc.Vec2 = null;
    private curPos: cc.Vec2 = null;
    /**
     * 修正箭的初始方向为正右
     */
    private offsetDegree: number = 180;

    /* 控制 */
    private isUpdateDir: boolean = true;
    /**
     * 是否落地
     */
    private isFallFloor: boolean = false;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
    }

    start() {
        this.curPos = this.node.getPosition();
        //更新方向
        // this.schedule(this.updateDir, 0.07, cc.macro.REPEAT_FOREVER);
    }

    /**
     * 设置箭的攻击力和速度
     * @param attack 
     * @param dir 箭的朝向，true为左
     */
    init(attack: number, speed: number, dir: boolean) {
        this.attack = attack;
        if (dir)
            this.node.rotation = 50;
        else
            this.node.rotation = -50;
    }

    /**
     * 移动，世界坐标
     * @param start 起点
     * @param end 终点
     * @param time 从起点到终点的时间
     */
    moveTo(start: cc.Vec2, end: cc.Vec2, time: number) {
        let nodeStart: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(start);
        let nodeEnd: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(end);
        let sub: cc.Vec2 = nodeEnd.sub(nodeStart);
        let middle: cc.Vec2 = nodeStart.add(cc.v2(sub.x / 2, sub.y / 2));
        let c: cc.Vec2 = cc.v2(middle.x, nodeEnd.y + 60);
        if (start.x === end.x)
            c.x += 30;

        this.node.setPosition(nodeStart);
        let move: cc.ActionInterval = cc.bezierTo(time, [nodeStart, c, nodeEnd]);

        let func1: cc.ActionInstant = cc.callFunc(function () {
            this.isUpdateDir = false;
            this.isFallFloor = true;
            this.sprite.spriteFrame = this.decalArrow;
        }, this);

        let fade: cc.ActionInterval = cc.fadeOut(2);

        let func2: cc.ActionInstant = cc.callFunc(function () {
            this.destroySelf();
        }, this);

        let seq: cc.ActionInterval = cc.sequence(move, func1, fade, func2);
        this.node.runAction(seq);
    }

    onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.isFallFloor)
            return;

        let node: cc.Node = other.node;
        let group: string = node.group;

        if (group === "Enemy") {
            this.node.stopAllActions();
            let m: Monster = node.getComponent("monster");
            m.subHP(this.attack);

            this.destroySelf();
        }
    }

    /**
     * 更新方向
     */
    private updateDir() {
        this.lastPos = this.curPos;
        this.curPos = this.node.getPosition();
        let dir: cc.Vec2 = this.lastPos.sub(this.curPos);
        let degree: number = this.getDegree(dir);
        this.node.rotation = this.offsetDegree - degree;
    }

    /**
     * 得到方向的度数
     * @param dir 方向向量 
     */
    private getDegree(dir: cc.Vec2): number {
        let rot: number;
        if (dir.x === 0 && dir.y > 0)
            rot = 90;
        else if (dir.x === 0 && dir.y < 0)
            rot = -90;
        else {
            let r: number = Math.atan(dir.y / dir.x);
            let d: number = r * 180 / Math.PI;
            rot = d;
        }
        if (dir.x < 0 && dir.y > 0 || dir.x < 0 && dir.y < 0)
            rot += 180;
        return rot;
    }

    private destroySelf() {
        this.node.removeFromParent();
        this.node.destroy();
    }

    update(dt) {
        if (this.isUpdateDir)
            this.updateDir();
    }

}
