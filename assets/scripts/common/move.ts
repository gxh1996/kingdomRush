export default class Move {

    private host: cc.Node = null;

    /* 数据 */
    private distance: cc.Vec2 = null;
    private duration: number = null;
    private callBack: Function = null;

    /**
     * 计时
     */
    private ct: number = 0;

    /* 控制 */
    private startMove: boolean = false;

    /**
     * 移动组件。必须将refrshMove()在update()中调用
     */
    constructor(host: cc.Node) {
        this.host = host;
    }

    /**
     * @param distance 移动相对距离
     * @param t 时间
     * @param callBack 回调函数
     */
    moveTo(distance: cc.Vec2, t: number, callBack: Function = null) {
        this.distance = distance
        this.duration = t;
        this.callBack = callBack;
        this.ct = 0;
        this.startMove = true;
    }

    stopMove() {
        this.startMove = false;
    }

    /**
     * 需在update()里调用
     */
    refreshMove(dt: number) {
        if (!this.startMove)
            return;
        //到达目的地
        if (this.ct >= this.duration) {
            this.stopMove();
            if (this.callBack !== null)
                this.callBack();
            return;
        }

        let rate: number = dt / this.duration;
        let l: cc.Vec2 = cc.v2(this.distance.x * rate, this.distance.y * rate);
        let newP: cc.Vec2 = this.host.getPosition().add(l);
        this.host.setPosition(newP);

        this.ct += dt;
    }
}
