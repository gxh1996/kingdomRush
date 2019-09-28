import FrameAnimation from "./frameAnimation";

const { ccclass, property } = cc._decorator;

enum WalkState { Down, left, up, right }

@ccclass
export default class Walk extends cc.Component {

    @property({
        type: [cc.SpriteFrame]
    })
    private downWalkFrames: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame]
    })
    private leftWalkFrames: cc.SpriteFrame[] = [];

    @property({
        type: [cc.SpriteFrame]
    })
    private upWalkFrames: cc.SpriteFrame[] = [];

    /**
     * 移动的路线 节点坐标
     */
    private path: cc.Vec2[];
    /**
     * 每段路需要的时间，[0]:path[0]->path[1]
     */
    private pathTime: number[] = [];
    /**
     * 要移动的目的地的path指针
     */
    private pathIndex: number = 0;
    /**
     * 移动速度
     */
    private speed: number;
    private walkState: WalkState;
    private frameAnim: FrameAnimation;
    /**
     * path移动完后的回调函数
     */
    private backFunc: Function = null;
    private action: cc.ActionInterval = null;

    onLoad() {
        this.frameAnim = this.node.getChildByName("bg").getComponent("frameAnimation");
    }

    start() {
        this.frameAnim.setFrameArray(this.downWalkFrames);
        this.walkState = WalkState.Down;
    }

    /**
     * Starts walk
     * @param path 世界坐标 
     */
    startWalk(path: cc.Vec2[], speed: number, func: Function = null) {
        //世界坐标 转为节点坐标
        let tP: cc.Vec2[] = path.slice(0);
        for (let i = 0; i < tP.length; i++)
            tP[i] = this.node.parent.convertToNodeSpaceAR(tP[i]);

        this.path = tP;
        this.speed = speed;
        this.backFunc = func;
        this.node.setPosition(this.path[this.pathIndex]);
        this.initPathTime();
        this.moveTo(this.path[++this.pathIndex]);
    }

    pauseWalk() {
        this.frameAnim.stop();
        this.node.pauseAllActions();
    }

    continueWalk() {
        this.frameAnim.continue();
        this.node.resumeAllActions();
    }

    /**
     * 停止并移除walkAction
     */
    stopWalk() {
        this.node.stopAction(this.action);
    }

    /**
     * 从现在开始，经time后的坐标
     * @param t 
     * @returns pos 节点坐标
     */
    getPosInTime(t: number): cc.Vec2 {
        let cI: number = this.pathIndex; //当前目的点的path指针
        let cP: cc.Vec2 = this.node.getPosition();
        let ct: number = this.path[cI].sub(cP).mag() / this.speed;
        t -= ct;

        while (true) {
            ct = this.pathTime[cI + 1];
            t -= ct;
            if (t < 0)
                break;
            cI++;
        }

        //多出的一点时间不足以抵达下一个点，就不要了
        return this.path[cI];
    }
    /**
     * 初始化pathTime
     */
    private initPathTime() {
        for (let i = 0; i < this.path.length - 1; i++) {
            let l: number = this.path[i + 1].sub(this.path[i]).mag();
            this.pathTime[i] = l / this.speed;
        }
    }

    /**
     * Moves to
     * @param pos 节点坐标 
     */
    private moveTo(pos: cc.Vec2) {
        let cp: cc.Vec2 = this.node.getPosition();
        let dis: cc.Vec2 = pos.sub(cp);
        let t: number = this.pathTime[this.pathIndex - 1];
        let a: cc.ActionInterval = cc.moveTo(t, pos);
        let func: cc.ActionInstant = cc.callFunc(function () {
            //path路径移动完成
            if (this.pathIndex >= this.path.length - 1) {
                if (this.backFunc === null)
                    return;
                this.backFunc();
                return;
            }

            this.moveTo(this.path[++this.pathIndex]);
        }, this);
        let seq: cc.ActionInterval = cc.sequence(a, func);

        this.playWalk(dis);
        this.node.runAction(seq);
        this.action = seq;
    }

    /**
     * 播放行走动画
     * @param l 行走方向
     */
    private playWalk(l: cc.Vec2) {
        let state: WalkState = this.getWalkState(l);
        if (state === this.walkState)
            return;

        switch (state) {
            case WalkState.Down: {
                this.walkState = WalkState.Down;
                this.frameAnim.setFrameArray(this.downWalkFrames);
                break;
            }
            case WalkState.up: {
                this.walkState = WalkState.up;
                this.frameAnim.setFrameArray(this.upWalkFrames);
                break;
            }
            case WalkState.left: {
                this.walkState = WalkState.left;
                this.frameAnim.setFrameArray(this.leftWalkFrames);
                this.frameAnim.node.scaleX = -1;
                break;
            }
            case WalkState.right: {
                this.walkState = WalkState.right;
                this.frameAnim.setFrameArray(this.leftWalkFrames);
                this.frameAnim.node.scaleX = 1;
            }
        }
        this.frameAnim.play(true);
    }

    /**
     * 得到 人物应该使用哪种行走
     * @param l 移动方向
     * @returns walk state 
     */
    private getWalkState(l: cc.Vec2): WalkState {
        let degree: number = this.getDegree(l);
        if (degree >= 30 && degree <= 150) {
            return WalkState.up;
        }
        else if (degree >= 210 && degree <= 330) {
            return WalkState.Down;
        }
        else if (l.x > 0)
            return WalkState.right;
        else
            return WalkState.left;
    }

    /**
     * Gets degree
     * @param dir 方向向量
     * @returns degree [0,360)
     */
    private getDegree(dir: cc.Vec2): number {
        let rot: number;
        if (dir.x === 0 && dir.y > 0) //y上半轴
            rot = 90;
        else if (dir.x === 0 && dir.y < 0) //y下半轴
            rot = 270;
        else {
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
}
