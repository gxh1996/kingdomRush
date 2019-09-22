const { ccclass, property } = cc._decorator;

@ccclass
export default class Move extends cc.Component {

    speed: number = 50;
    /**
     * 实现移动的控制数据
     */
    private moveControl = {
        isMove: false, //是否移动
        timeC: 0, //记时器
        needT: 0, //到下一个点需要的时间
        speedX: 0,
        speedY: 0,
    }
    private path: cc.Vec2[] = null;
    private curPathIndex: number = 0;
    /**
     * 角色 朝左为true;
     */
    private toward: boolean = false;
    private backFunc: Function = null;
    onLoad() {

    }

    start() {

    }

    /**
     * Starts move
     * @param path [pos]/[...pos] 节点坐标
     * @param func 回调函数
     */
    startMove(path: cc.Vec2[], func: Function = null) {
        this.path = path;
        this.backFunc = func;
        if (this.path.length > 1) {
            this.node.setPosition(this.path[0]); //设置初始位置
            this.curPathIndex++;
        }
        this.moveTo(this.path[this.curPathIndex]);
    }

    stopMove() {
        this.moveControl.isMove = false;
    }

    continueMove() {
        this.moveControl.isMove = true;
    }

    /**
     * 移动是否结束
     * @returns true if move end 
     */
    isMoveEnd(): boolean {
        if (this.node.getPosition() === this.path[this.path.length - 1])
            return true;
        return false;
    }

    /**
     * 修正角色朝向
     */
    private reviseToward() {
        let des: cc.Vec2 = this.path[this.curPathIndex];
        let cur: cc.Vec2 = this.node.getPosition();
        if (des.x > cur.x && this.toward === true) {
            this.node.scaleX = 1;
            this.toward = false;
        }
        else if (des.x < cur.x && this.toward === false) {
            this.node.scaleX = -1;
            this.toward = true;
        }
    }

    /**
     * 向pos移动
     * @param pos 节点坐标
     */
    private moveTo(pos: cc.Vec2) {
        let cp: cc.Vec2 = this.node.getPosition();
        let dis: cc.Vec2 = pos.sub(cp);
        let l: number = dis.mag();

        this.reviseToward();

        this.moveControl.needT = l / this.speed;
        this.moveControl.speedX = this.speed * dis.x / l;
        this.moveControl.speedY = this.speed * dis.y / l;
        this.moveControl.timeC = 0;

        this.moveControl.isMove = true;
    }

    update(dt) {
        if (this.moveControl.isMove) { //需要移动
            this.moveControl.timeC += dt;
            if (this.moveControl.timeC >= this.moveControl.needT)
                dt = dt - (this.moveControl.timeC - this.moveControl.needT);

            let cp: cc.Vec2 = this.node.getPosition();
            let x: number = cp.x + this.moveControl.speedX * dt;
            let y: number = cp.y + this.moveControl.speedY * dt;
            this.node.setPosition(cc.v2(x, y));

            if (this.moveControl.timeC >= this.moveControl.needT) { //已到达目的点
                this.curPathIndex++;

                if (this.curPathIndex >= this.path.length) { //路径已移动完毕
                    this.moveControl.isMove = false;

                    if (this.backFunc !== null)
                        this.backFunc();

                    return;
                }

                //移动向 路径中的下一个点
                this.moveTo(this.path[this.curPathIndex]);
            }
        }
    }
}
