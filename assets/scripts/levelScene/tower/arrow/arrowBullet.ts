import Monster from "../../monster/monster";
import ArrowTower from "./arrowTower";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ArrowBullet extends cc.Component {

    /* 资源 */
    @property({
        type: cc.SpriteFrame,
        tooltip: "半截箭图片"
    })
    private decalArrow: cc.SpriteFrame = null;

    @property({
        type: cc.SpriteFrame,
        tooltip: "完整的箭图片"
    })
    private completedArrow: cc.SpriteFrame = null;

    /* 组件 */
    private sprite: cc.Sprite = null;
    private arrowTower: ArrowTower = null;

    /* 属性 */
    private attack: number = null;

    /* 记录 */
    private lastPos: cc.Vec2 = null;
    private curPos: cc.Vec2 = null;
    /**
     * 修正箭的初始方向为正右
     */
    private readonly offsetDegree: number = 180;

    /* 控制 */
    private isUpdateDir: boolean = true;
    /**
     * 是否落地
     */
    private isFallFloor: boolean = false;

    onLoad() {
        this.sprite = this.node.getComponent(cc.Sprite);
        this.arrowTower = this.node.parent.parent.getComponent("arrowTower");
    }

    start() {
    }

    /**
     * 初始化
     * @param attack 
     * @param dir 箭的朝向，true为左
     */
    init(attack: number, speed: number, dir: boolean) {
        this.attack = attack;
        if (dir)
            this.node.rotation = 50;
        else
            this.node.rotation = -230;

        //显示
        this.sprite.spriteFrame = this.completedArrow;

        //记录
        this.lastPos = null;
        this.curPos = this.node.getPosition();

        //控制
        this.isUpdateDir = true;
        this.isFallFloor = false;

        this.scheduleOnce(this.updateDir, 0.07);
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
            m.injure(this.attack);

            this.destroySelf();
        }
    }

    /**
     * 更新方向
     */
    private updateDir() {
        this.lastPos = this.curPos;
        this.curPos = this.node.getPosition();
        let dir: cc.Vec2 = this.curPos.sub(this.lastPos);
        let degree: number = this.getDegree(dir);
        if (degree === null)
            return;
        this.node.rotation = -(this.offsetDegree + degree);

        if (this.isUpdateDir)
            this.scheduleOnce(this.updateDir.bind(this), 0.07);
    }

    /**
     * Gets degree
     * @param dir 方向向量
     * @returns degree [0,360),null为没有角度变化
     */
    private getDegree(dir: cc.Vec2): number {
        let rot: number;
        if (dir.x === 0 && dir.y === 0)
            return null;
        if (dir.x === 0 && dir.y > 0) //y上半轴
            return 90;
        else if (dir.x === 0 && dir.y < 0) //y下半轴
            return 270;
        else { //不在y轴上
            let r: number = Math.atan(dir.y / dir.x);
            let d: number = r * 180 / Math.PI;
            rot = d;
        }

        if (rot === 0) //在x轴上
            if (dir.x > 0)
                rot = 0;
            else
                rot = 180;
        else if (dir.x < 0 && dir.y > 0 || dir.x < 0 && dir.y < 0) //在第二三象限
            rot += 180;
        else if (dir.x > 0 && dir.y < 0) //在第四象限
            rot += 360;
        return rot;
    }

    private destroySelf() {
        this.arrowTower.releaseArrowBullt(this.node);
    }

}
