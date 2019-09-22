//animationPath.ts
const { ccclass, property } = cc._decorator;

// 贝塞尔曲线段类
export class BezierPart {
    startPos: cc.Vec2;
    cPos1: cc.Vec2;
    cPos2: cc.Vec2;
    endPos: cc.Vec2;
    /**
     * 将贝塞尔曲线分成多个点，不包含开始端点
     */
    posArray: cc.Vec2[] = [];
    lenght: number = null;

    /**
     * 贝塞尔曲线段类
     * @param startP 开始点坐标 
     * @param cP1 控制点1
     * @param cP2 控制点2
     * @param endP 结束点
     */
    constructor(startP: cc.Vec2, cP1: cc.Vec2, cP2: cc.Vec2, endP: cc.Vec2) {
        this.startPos = startP;
        this.cPos1 = cP1;
        this.cPos2 = cP2;
        this.endPos = endP;

        this.lenght = this.getBezierLen();
    }

    /**
     * 每隔len个像素生成一个点,曲线开始的端点不生成点
     * @param len 
     */
    createPosArray(len: number) {
        let fn: number = Math.floor(this.lenght / len);
        let i: number = 1 / fn;
        for (let t = i; t <= 1; t += i) {
            let x: number = this.bezier(this.startPos.x, this.cPos1.x, this.cPos2.x, this.endPos.x, t);
            let y: number = this.bezier(this.startPos.y, this.cPos1.y, this.cPos2.y, this.endPos.y, t);
            this.posArray.push(cc.v2(x, y));
        }
        if (this.posArray.length < fn) { //补上结束端点
            this.posArray.push(this.endPos);
        }
    }

    /**
     * 获得曲线长度
     * @param f 将一段曲线分为多少份来求长度,默认20
     */
    private getBezierLen(f: number = 20): number {
        let t: number = 1 / 20;
        let l: number = 0;
        let i: number;
        let cP: cc.Vec2;
        let lastP: cc.Vec2 = cc.v2(0, 0);
        for (i = 0; i <= 1; i += t) {
            let x: number = this.bezier(this.startPos.x, this.cPos1.x, this.cPos2.x, this.endPos.x, i);
            let y: number = this.bezier(this.startPos.y, this.cPos1.y, this.cPos2.y, this.endPos.y, i);
            cP = cc.v2(x, y);
            l += (cP.sub(lastP)).mag();
            lastP = cP;
        }
        return l;
    }

    private bezier(v1: number, v2: number, v3: number, v4: number, t: number): number {
        return v1 * Math.pow(1 - t, 3) + 3 * v2 * t * Math.pow(1 - t, 2) + 3 * v3 * t * t * (1 - t) + v4 * Math.pow(t, 3);
    }
}

@ccclass
export default class AnimationPath extends cc.Component {


    private animation: cc.Animation = null;
    private griphics: cc.Graphics = null;
    onLoad() {
        this.animation = this.node.getComponent(cc.Animation);
    }

    start() {
        // this.drawPath(this.getNodePath("road1"));
        // this.drawPath(this.getNodePath("road2"));
        // this.drawPath(this.getNodePath("road3"));
    }

    /**
     * Gets world path
     * @param pathName 
     * @returns world path 
     */
    getWorldPath(pathName: string): cc.Vec2[] {
        let path = this.getNodePath(pathName);
        for (let i = 0; i < path.length; i++)
            path[i] = this.node.convertToWorldSpaceAR(path[i]);
        return path;
    }

    /**
     * @param pathName 
     * @returns 节点坐标
     */
    private getNodePath(pathName: string): cc.Vec2[] {
        let clips: cc.AnimationClip[] = this.animation.getClips();
        let clip: cc.AnimationClip = clips[0];
        let paths = clip.curveData.paths; //动画路径数组
        let frameArray = paths[pathName].props.position; //关键帧数组即为一条路径            
        let bezierPartArray: BezierPart[] = this.getBezierPartArray(frameArray);
        let path: cc.Vec2[] = this._getPath(bezierPartArray);

        return path;
    }

    /**
     * 得到点路径
     * @param bezierPartArray 曲线数组 
     * @returns path 不含路径起点坐标
     */
    private _getPath(bezierPartArray: BezierPart[]): cc.Vec2[] {
        let pArray: cc.Vec2[] = [];
        let bezier: BezierPart;
        for (let i = 0; i < bezierPartArray.length; i++) {
            bezier = bezierPartArray[i];
            bezier.createPosArray(16);
            pArray = pArray.concat(bezier.posArray);

        }
        return pArray;
    }

    /**
     * 由关键帧数组 得到 曲线段数组
     * @param frameArray 关键帧数组
     */
    private getBezierPartArray(frameArray): BezierPart[] {
        let bezierPartArray: BezierPart[] = [];

        //两个关键帧组成一条路径
        for (let j = 0; j < frameArray.length - 1; j++) {
            let arr: BezierPart[] = this.createBezierPartArray(frameArray[j], frameArray[j + 1]);
            bezierPartArray = bezierPartArray.concat(arr);
        }

        return bezierPartArray;
    }

    /**
     * 由两个关键帧 生成 它们构成的贝塞尔曲线段数组
     * @param startKeyFrame 开始关键帧
     * @param endKeyFrame 结束关键帧
     */
    private createBezierPartArray(startKeyFrame, endKeyFrame): BezierPart[] {
        let bezierPartArray: BezierPart[] = [];
        let startP: cc.Vec2, cP1: cc.Vec2, cP2: cc.Vec2, endP: cc.Vec2;
        let motionPath = startKeyFrame.motionPath; //移动路径数组即主控制点数组
        let moPathSP, moPathEP; //一段曲线上的首尾端主控制点

        //第一段
        startP = cc.v2(startKeyFrame.value[0], startKeyFrame.value[1]);
        moPathEP = motionPath[0];
        cP1 = cP2 = cc.v2(moPathEP[2], moPathEP[3]);
        endP = cc.v2(moPathEP[0], moPathEP[1]);
        bezierPartArray.push(new BezierPart(startP, cP1, cP2, endP));

        for (let i = 0; i < motionPath.length - 1; i++) { //0 - len - 1, len - 3 len - 2 len -1
            moPathSP = motionPath[i];
            moPathEP = motionPath[i + 1]
            startP = cc.v2(moPathSP[0], moPathSP[1]);
            cP1 = cc.v2(moPathSP[4], moPathSP[5]);
            cP2 = cc.v2(moPathEP[2], moPathEP[3]);
            endP = cc.v2(moPathEP[0], moPathEP[1]);
            bezierPartArray.push(new BezierPart(startP, cP1, cP2, endP));
        }

        //最后一段
        moPathSP = motionPath[motionPath.length - 1];
        startP = cc.v2(moPathSP[0], moPathSP[1]);
        cP1 = cP2 = cc.v2(moPathSP[4], moPathSP[5]);
        endP = cc.v2(endKeyFrame.value[0], endKeyFrame.value[1]);
        bezierPartArray.push(new BezierPart(startP, cP1, cP2, endP));

        return bezierPartArray;
    }

    private drawPath(pointArray: cc.Vec2[]) {
        this.griphics.moveTo(pointArray[0].x, pointArray[0].y);
        for (let i = 1; i < pointArray.length; i++)
            this.griphics.lineTo(pointArray[i].x, pointArray[i].y);

        this.griphics.stroke();
    }

    /**
     * 画出曲线的控制点
     * @param bezierPartArray 曲线数组
     */
    private drawContrlPoint(bezierPartArray: BezierPart[]) {
        for (let i = 0; i < bezierPartArray.length; i++) {
            this.drawPoint(bezierPartArray[i].startPos);
            this.drawPoint(bezierPartArray[i].cPos1, cc.Color.BLUE);
            this.drawPoint(bezierPartArray[i].cPos2, cc.Color.BLUE);
            this.drawPoint(bezierPartArray[i].endPos);
        }
    }

    /**
     * Draws point
     * @param point 点坐标 
     * @param color 默认颜色为红色
     */
    private drawPoint(point: cc.Vec2 | cc.Vec2[], color: cc.Color = null) {
        if (color === null)
            this.griphics.strokeColor = cc.Color.RED;
        else
            this.griphics.strokeColor = color;

        if ((<cc.Vec2[]>point).length) {
            for (let i = 0; i < (<cc.Vec2[]>point).length; i++) {
                this.griphics.circle(point[i].x, point[i].y, 2);
                this.griphics.stroke();
            }
        }
        else {
            this.griphics.circle((<cc.Vec2>point).x, (<cc.Vec2>point).y, 2);
            this.griphics.stroke();
        }

    }
}
